"""
Path B — RAG + LLM parameter extraction.

All parameters to extract are driven by the ABB filterSelector API via
ParameterDefinition objects passed from main.py.  Nothing here is hardcoded
to switchgear; the same code works for Circuit Breakers, Transformers, etc.
"""
from __future__ import annotations

import asyncio
import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

from openai import OpenAI
from pydantic import BaseModel, create_model
from langchain_community.vectorstores.azuresearch import AzureSearch

from config import settings
from models.request import PageData, InstanceData
from models.response import ExtractedParameterResult
from services.abb_configurator import ParameterDefinition
from services.path_b.normalizer import normalize_enum_value
from services.path_b.vector_index import retrieve_chunks_with_scores, get_knowledge_store

logger = logging.getLogger(__name__)

_MAX_CONTEXT_CHARS     = 60_000
_MAX_DIRECT_CALL_CHARS = 60_000  # GPT-4o-mini handles 128k tokens — send all pages that fit

# Terms that indicate a page contains extractable electrical parameters
_TECH_SCORE_TERMS: list[str] = [
    "kv", "ka", " hz", "va ",
    "rated voltage", "rated current", "rated frequency",
    "withstand", "impulse", "short-circuit", "short circuit",
    "internal arc", "degree of protection", "auxiliary voltage",
    "insulation level", "busbar", "circuit breaker", "nominal current",
    # System-level params found on intro/cover pages
    "ambient temperature", "ip2", "ip3", "ip4", "ip5", "ip6",
    "lsc2", "service continuity", "warranty", "delivery",
    "single busbar", "single bus bar", "double busbar", "double bus bar",
    "enclosure type", "busbar arrangement",
    # French
    "tension nominale", "courant nominal", "court-circuit", "fréquence",
    "degré de protection", "tension auxiliaire", "jeu de barres",
    "neutre compensé", "neutre isolé", "résistance de mise",
    # Italian
    "tensione", "corrente", "tensione nominale", "corrente nominale",
    "tensione di esercizio", "corrente di cortocircuito",
    "grado di protezione", "tensione ausiliaria",
    "esercizio del neutro", "neutro compensato", "neutro isolato",
    "frequenza", "sbarre", "quadro", "dati impianto",
    # Italian CT/VT metering panel terms (§5.2.x)
    "trasformatore di corrente", "trasformatori di corrente",
    "trasformatore di tensione", "trasformatori di tensione",
    "classe di precisione", "onere", "scomparto misura",
    "rapporto di trasformazione", " ta ", " tv ",
    # German
    "spannung", "strom", "nennspannung", "kurzschlussstrom",
    "schutzart", "hilfssspannung",
]
# Administrative pages get a score penalty
_ADMIN_TERMS: list[str] = [
    "table of contents", "modifications list", "reference document",
    "scale:", "discipline:", "sommaire", "liste des modifications",
    "........",  # TOC dot leaders
]


def _score_page_for_params(text: str) -> int:
    lower = text.lower()
    score = sum(lower.count(t) for t in _TECH_SCORE_TERMS)
    if any(t in lower for t in _ADMIN_TERMS):
        score = score // 2
    return score


# Extra Italian/multilingual search terms for parameters that are commonly missing.
# The default search_query (from English label) often fails to retrieve Italian spec pages.
_EXTRA_SEARCH_TERMS: dict[str, list[str]] = {
    "CtMeteringRatio":   ["trasformatore di corrente", "rapporto ta", "ct ratio metering"],
    "CtMeteringClass":   ["classe di precisione", "accuracy class ct", "trasformatori di corrente"],
    "CtMeteringBurden":  ["onere ta", "ct burden", "carico ta", "classe di precisione"],
    "CtProtectionRatio": ["trasformatore di corrente protezione", "ct protection ratio"],
    "VtRatio":           ["trasformatore di tensione", "rapporto tv", "tensione secondaria", "voltage transformer ratio"],
    "VtClass":           ["classe di precisione tv", "vt accuracy class", "onere tv"],
    "VtBurden":          ["onere tv", "carico tv", "vt burden", "classe di precisione"],
}

# ── Dynamic builders ───────────────────────────────────────────────────────────

def _build_llm_model(param_defs: list[ParameterDefinition]) -> type[BaseModel]:
    """Create a Pydantic model at runtime with one str field per parameter."""
    fields = {p.key: (str, "") for p in param_defs}
    return create_model("ExtractedParams", **fields)


def _build_system_prompt(product_name: str, param_defs: list[ParameterDefinition]) -> str:
    """Build a fully dynamic extraction prompt from the parameter definitions."""
    lines = [
        f"You are an expert in {product_name} technical specifications and RFQ documents.",
        f"Extract the following {len(param_defs)} parameters from the provided document text.",
        "The document may be in English, French, Italian, or German.",
        "ALWAYS return values in English canonical form — translate from any language.",
        "",
        "General rules:",
        "  - Return numeric values as numbers only — no unit suffix (e.g. '12' not '12 kV').",
        "  - For enum parameters: return the canonical English form listed; translate if needed.",
        "  - Return empty string '' for any parameter not found in the document.",
        "  - If document says 'VTS' (Vendor To Specify) for a parameter, return empty string ''.",
        "  - Never invent or estimate values.",
        "  - OCR corrections: 'lEC'→'IEC', '5F6'→'SF6', 'lP'→'IP'.",
        "",
        "Multilingual translation rules (apply regardless of document language):",
        "  NeutralEarthing:",
        "    COMPENSATO / COMPENSÉ / KOMPENSIERT / neutro compensato → 'Petersen coil'",
        "    ISOLATO / ISOLÉ / ISOLIERT / neutro isolato / neutre isolé → 'Isolated'",
        "    DIRETTO / SOLIDE / DIREKT / messa a terra diretta / directement mis à la terre → 'Solid'",
        "    RESISTENZA / RÉSISTANCE / WIDERSTAND / tramite resistenza → 'NGR'",
        "  IpDegree / IngressProtection:",
        "    IP3X → 'IP31'; IP4X → 'IP41'; IP5X → 'IP54'",
        "    GRADO DI PROTEZIONE IP31 → 'IP31'; DEGRÉ DE PROTECTION IP54 → 'IP54'",
        "  AuxVoltage:",
        "    '230 V c.a.' → '230 VAC'; '110 V c.c.' → '110 VDC'  (c.a.=AC, c.c.=DC in Italian)",
        "    'c.a.' = alternating current (AC); 'c.c.' = direct current (DC)",
        "  Standard:",
        "    'CEI EN 62271-200' or 'CEI/IEC 62271' → 'IEC 62271-200'",
        "    'NF C 13-200' or 'NFC13' → 'IEC 62271-200'",
        "  BusBbarArrangement:",
        "    sbarra semplice / jeu de barres simple / einfachsammelschiene → 'Single busbar'",
        "    doppia sbarra / double jeu de barres / doppelsammelschiene → 'Double busbar'",
        "  InternalArc:",
        "    IAC A F-R-L / IAC A frontale-retro-laterale / F-L-R → 'AFLR'",
        "    IAC A F-L / IAC A frontale-laterale → 'AFL'",
        "    IAC A F-R / IAC A frontale-retro → 'AB'",
        "    IAC A / IAC class A → 'IAC A'",
        "    Return ONLY the letters (e.g. 'AFLR') — NOT 'None' unless explicitly not classified.",
        "  Insulation (CRITICAL):",
        "    RETURN 'AIS' for ANY metal-enclosed switchgear, even if the CB uses SF6 or vacuum.",
        "    'GIS' is ONLY for switchgear where the BUSBAR ENCLOSURE itself is gas-insulated.",
        "    Metal-enclosed / quadro blindato / scomparto metallico + SF6 CB → Insulation = 'AIS'",
        "    Do NOT confuse CB insulation type (SF6/vacuum) with switchgear insulation type.",
        "  Market:",
        "    If document references IEC / CEI / EN 62271 standards → 'IEC'",
        "    If document references ANSI / IEEE standards → 'ANSI'",
        "    Do NOT return 'All' — choose 'IEC' or 'ANSI' based on standards cited.",
        "  OperatingVoltage vs RatedVoltage:",
        "    OperatingVoltage = switchgear nominal voltage Um (e.g. 24 kV for a 23 kV system).",
        "    If document gives BOTH system voltage (e.g. 23 kV) and switchgear Um (e.g. 24 kV),",
        "    return the switchgear Um (24 kV) as OperatingVoltage.",
        "    Standard IEC Um values: 7.2, 12, 17.5, 24, 36 kV.",
        "  Product: return the commercial product name/model from the document.",
        "    (e.g. 'SM6', 'SM AirSet', 'UniGear ZS1', 'SafeRing', 'NXPLUS C', 'XIRIA', 'FORESIX', 'QMT')",
        "    Do NOT return location labels like 'Main Switchgear', 'Central Panel', 'Distribution Board'.",
        "    If the spec defines a switchboard designation code (e.g. 'QMT-CAB1'), return that.",
        "  RelayModel: return the relay brand + model exactly as printed.",
        "    (e.g. 'REF615', 'PowerLogic P3U30', 'Sepam 40', 'MiCOM P127', '7SJ85')",
        "",
        "Additional rules:",
        "  - 'internal heating resistors' or 'anti-condensation heaters' → Heaters: 'Yes'.",
        "  - WarrantyMonths: find warranty duration. 'two years'/'24 months' = 24. Years × 12. Design life ≠ warranty.",
        "  - Enclosure type (CRITICAL — IEC 62271-200 distinction):",
        "    'metal-enclosed' / 'involucro metallico' / LSC2A-PM / PM classification → 'Metal-enclosed AIS'",
        "    'metal-clad' / 'metallicamente suddiviso' / MC classification → 'Metal-clad AIS'",
        "    These are DIFFERENT IEC classes — do NOT substitute one for the other.",
        "    'metal-enclosed' is NOT 'metal-clad'. The Italian 'involucro metallico' = metal-enclosed.",
        "  - CB Breaking vs Making capacity (CRITICAL):",
        "    CbBreakingCapacity = potere di interruzione = Icc = short-circuit BREAKING current (e.g. 16 kA).",
        "    'potere di chiusura' / 'making capacity' / 'Ip' = peak MAKING current (e.g. 40 kA) — DO NOT use this for CbBreakingCapacity.",
        "    In IEC: making current ≈ 2.5 × breaking current (e.g. 40 kA making = 16 kA breaking).",
        "    ALWAYS extract the lower value (breaking) for CbBreakingCapacity.",
        "  - InternalArc value MUST be a classification STRING only (e.g. 'AFLR', 'AFL', 'IAC A').",
        "    NEVER return a numeric kA value as InternalArc — that is the arc withstand current, not the class.",
        "    Look for text like 'IAC A (F-R-L)' or 'classificazione IAC' — the class is the letters, not the number.",
        "  - 'Spring Charging' mechanism → CbMechanism: 'Spring (manual)'.",
        "  - Degree of Protection: extract full IP code (e.g. 'IP21', 'IP54', 'IP3X').",
        "  - For NumberOfPanels/Cubicles: prefer explicit 'No. of Panels' value; only count if not given.",
        "  - CT Metering Ratio: MUST be in transformer ratio format 'X/YA' (e.g. '100/1A', '400/5A', '1250/1A').",
        "    NEVER return a dimensionless fraction (e.g. '3/5', '0.6') — that is NOT a CT ratio.",
        "    If no valid CT ratio found, return empty string ''.",
        "  - CT Protection Ratio: same format 'X/YA'. Common secondary: 1A (IEC) or 5A (ANSI/older IEC).",
        "    Italian '3 trasformatori di corrente / 5A' means CT secondary = 5A — still need primary from drawings.",
        "  CT/VT Italian terminology (CRITICAL for extracting metering panel §5.2.x data):",
        "    'trasformatore di corrente' / 'TA' = Current Transformer (CT)",
        "    'trasformatore di tensione' / 'TV' = Voltage Transformer (VT)",
        "    'classe di precisione' = accuracy class (e.g. '0.5', '5P20', '0.2S')",
        "    'onere' = burden (e.g. '15 VA', '50 VA', '3 VA')",
        "    'rapporto' or 'rapporto di trasformazione' = transformation ratio",
        "    'scomparto misura' = metering panel — look here for CT/VT spec data",
        "  CT Metering Ratio (CRITICAL disambiguation):",
        "    Italian '3 trasformatori di corrente / 5A' or 'n.3 TA / 5A' means 3 CTs with 5A secondary.",
        "    '3' here is the COUNT of CTs — NOT the primary current. Return empty string for CtMeteringRatio.",
        "    Only return a CT ratio if BOTH primary current (e.g. 400A) AND secondary (e.g. 5A) are stated.",
        "    Valid examples: '400/5A', '630/5A', '200/1A' — NEVER '3/5' or '5/1' without primary context.",
        "  VT Ratio format:",
        "    Italian VT ratio: '23000/√3 : 100/√3 V' → return as '23000/√3 : 100/√3 V'",
        "    Also accept: '23000:√3 / 100:√3 V', '13279/57.7 V' (decimal equivalent)",
        "    For dual-secondary VT (e.g. sec1: 100/√3 V cl.0.5; sec2: 100/3 V cl.3), use first secondary.",
        "  - VT Ratio: full ratio as written (e.g. '(20:sqrt3)/(0.11:sqrt3)/(0.11:3) kV'). Prefer LINE PT.",
        "  - When CT class is 'X/Y' (e.g. '5P10/0.5-FS-5'): X=protection class, Y prefix=metering class.",
        "  - Power Frequency Withstand is a kV value (28/38/50/70 kV) — NOT Hz.",
        "  - EarthingSwitch is the PHYSICAL cubicle switch, NOT the system neutral earthing method.",
        "    'motor operated ES' / 'motorized earth switch' → 'Motor operated'",
        "    'manual earth switch' → 'Manual'",
        "  - CT Metering Ratio for incomer takes priority when multiple feeders listed.",
        "",
        "Parameters to extract:",
    ]
    for p in param_defs:
        if p.unit and not p.is_enum:
            hint = f" [numeric, in {p.unit} — return number only]"
        elif p.is_enum and p.allowed_values:
            vals = ", ".join(f'"{v}"' for v in p.allowed_values[:14])
            hint = f" [canonical English — e.g. {vals}]"
        elif not p.is_enum and p.allowed_values:
            vals = ", ".join(f'"{v}"' for v in p.allowed_values[:8])
            hint = f" [e.g. {vals} — or any equivalent, return as seen]"
        else:
            hint = " [free text]"
        lines.append(f"  - {p.key}: {p.label}{hint}")
    return "\n".join(lines)


def _compute_confidence(param_def: ParameterDefinition, value: str) -> float:
    allowed = param_def.allowed_values
    if not allowed:
        return 0.75
    try:
        num = float(value.replace(",", "."))
        numeric_allowed = [float(str(a).replace(",", ".")) for a in allowed
                           if re.match(r"^[\d.,]+$", str(a))]
        return 0.85 if any(abs(num - a) < 0.01 for a in numeric_allowed) else 0.60
    except ValueError:
        return 0.85 if any(str(a).lower() == value.strip().lower() for a in allowed) else 0.60


# ── RAG retrieval (dynamic queries) ───────────────────────────────────────────

def _retrieve_combined_context(
    instance_name: str,
    vectorstore: AzureSearch,
    param_defs: list[ParameterDefinition],
) -> tuple[str, float, int]:
    """
    Run one vector search per parameter in parallel, deduplicate chunks,
    and return (combined_context, avg_score, best_source_page).
    """
    seen: set[str] = set()
    all_chunks: list[tuple[object, float]] = []
    knowledge_store = get_knowledge_store()

    def fetch(p: ParameterDefinition) -> list[tuple]:
        extra = " ".join(_EXTRA_SEARCH_TERMS.get(p.key, []))
        query = f"{p.search_query} {extra} {instance_name}".strip()
        results = retrieve_chunks_with_scores(vectorstore, query, k=1)
        if knowledge_store:
            try:
                results += retrieve_chunks_with_scores(knowledge_store, query, k=1)
            except Exception as exc:
                logger.debug(f"[PathB] knowledge index query failed for '{p.key}': {exc}")
        return results

    with ThreadPoolExecutor(max_workers=max(len(param_defs), 4)) as pool:
        futures = {pool.submit(fetch, p): p for p in param_defs}
        for future in as_completed(futures):
            try:
                for doc, score in future.result():
                    if doc.page_content not in seen:
                        seen.add(doc.page_content)
                        all_chunks.append((doc, score))
            except Exception as exc:
                logger.warning(f"[PathB] retrieval error for '{futures[future].key}': {exc}")

    if not all_chunks:
        return "", 0.5, 0

    all_chunks.sort(key=lambda x: x[1], reverse=True)
    parts: list[str] = []
    total = 0
    for doc, _ in all_chunks:
        if total + len(doc.page_content) > _MAX_CONTEXT_CHARS:
            break
        parts.append(doc.page_content)
        total += len(doc.page_content)

    scores = [s for _, s in all_chunks]
    avg_score = sum(scores) / len(scores)
    best_page = int(all_chunks[0][0].metadata.get("page", 0))
    return "\n---\n".join(parts), avg_score, best_page


# ── LLM call (dynamic schema + prompt) ────────────────────────────────────────

def _call_llm(
    instance_name: str,
    context: str,
    source_page: int,
    client: OpenAI,
    product_name: str,
    param_defs: list[ParameterDefinition],
) -> list[ExtractedParameterResult]:
    system_prompt = _build_system_prompt(product_name, param_defs)
    llm_model    = _build_llm_model(param_defs)

    completion = client.beta.chat.completions.parse(
        model=settings.azure_openai_text_deployment,
        temperature=0,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": f"Installation: {instance_name}\n\nDocument text:\n{context}"},
        ],
        response_format=llm_model,
    )

    raw = completion.choices[0].message.parsed
    if not raw:
        return []

    results: list[ExtractedParameterResult] = []

    for p in param_defs:
        val = getattr(raw, p.key, "").strip()
        if not val:
            continue
        if p.is_enum:
            val = normalize_enum_value(p.key, val)
            if not val:
                continue
        confidence = _compute_confidence(p, val)
        results.append(ExtractedParameterResult(
            name=p.key,
            value=val,
            unit=p.unit,
            confidence=confidence,
            extraction_path="PathB",
            source_page=source_page,
            source_text=_find_source_text(val, context),
            flagged_for_review=confidence < 0.80,
        ))
    return results


def _find_source_text(value: str, context: str, window: int = 150) -> str:
    """Return the sentence/phrase in *context* that contains *value*."""
    if not value or not context:
        return ""
    idx = context.lower().find(value.lower())
    if idx == -1:
        return ""
    start = max(0, context.rfind("\n", 0, idx) + 1)
    end   = context.find("\n", idx + len(value))
    end   = end if end != -1 else min(len(context), idx + len(value) + window)
    return context[start:end].strip()


# ── RAG path (vectorstore + LLM) ──────────────────────────────────────────────

def _extract_all_params(
    instance_name: str,
    vectorstore: AzureSearch,
    client: OpenAI,
    product_name: str,
    param_defs: list[ParameterDefinition],
) -> list[ExtractedParameterResult]:
    context, avg_score, source_page = _retrieve_combined_context(
        instance_name, vectorstore, param_defs
    )
    if not context:
        logger.warning(f"[PathB] No context retrieved for '{instance_name}' — skipping")
        return []

    results = _call_llm(instance_name, context, source_page, client, product_name, param_defs)
    logger.info(
        f"[PathB] instance='{instance_name}': {len(results)}/{len(param_defs)} params "
        f"extracted via RAG (score={avg_score:.2f})"
    )
    return results


_SOURCE_PAGE_ALIASES: dict[str, list[str]] = {
    # Normalized enum → raw phrases found in documents
    "single busbar":       ["single bus bar", "single busbar"],
    "double busbar":       ["double bus bar", "double busbar"],
    "motor operated":      ["closing power", "motorized earth", "motor operated", "earth motor"],
    "manual":              ["manually operated", "manual earth", "hand operated"],
    "spring (manual)":     ["spring charging", "spring charge"],
    "spring (motor)":      ["motorized spring", "motor spring"],
    "resistor-grounded":   ["resistor-grounded", "resistor grounded"],
    "metal-clad ais":      ["metal casing", "metal clad ais", "metal-clad ais"],
    "aflr":                ["internal arc", "aflr"],
    "withdrawable cb":     ["withdrawable", "draw-out"],
}

# For purely numeric / short values: also search for the associated keyword near the value
_PARAM_CONTEXT_HINTS: dict[str, list[str]] = {
    "WarrantyMonths":      ["warranty"],
    "DeliveryWeeks":       ["delivery", "lead time"],
    "RatedVoltage":        ["rated voltage", "nominal voltage", "system voltage",
                            "tensione nominale", "tensione di esercizio", "tension nominale"],
    "ShortCircuit":        ["short-circuit", "short circuit", "rated breaking",
                            "corrente di cortocircuito", "courant de court-circuit", "icc"],
    "BusBbarCurrent":      ["busbar current", "bus current", "main bus current",
                            "corrente nominale sbarre", "courant nominal jeu de barres"],
    "Frequency":           ["frequency", "rated frequency",
                            "frequenza", "fréquence"],
    "PowerFreqWithstand":  ["power frequency", "withstand voltage",
                            "tensione di tenuta", "tension de tenue"],
    "LightningImpulse":    ["lightning impulse", "impulse withstand",
                            "tensione di tenuta ad impulso", "tension de tenue aux chocs"],
    "IpDegree":            ["degree of protection", "ip2", "ip3", "ip4", "ip5", "ip6",
                            "grado di protezione", "degré de protection", "schutzart"],
    "NeutralEarthing":     ["neutral earthing", "neutral grounding", "earthing method",
                            "esercizio del neutro", "neutro", "mise à la terre du neutre",
                            "erdung", "neutralpunkt"],
    "AuxVoltage":          ["auxiliary voltage", "control voltage", "aux voltage",
                            "tensione ausiliaria", "tensione di comando", "tension auxiliaire",
                            "c.a.", "c.c.", "vac", "vdc"],
    "AmbientTemp":         ["ambient temperature", "ambient air temperature",
                            "temperatura ambiente", "température ambiante"],
    "NumberOfPanels":      ["no. of feeders", "no. of panels", "number of panels", "no.of feeders",
                            "numero di scomparti", "nombre de cellules"],
    "Product":             ["product", "switchgear type", "quadro", "cellule", "gamme", "type"],
    "NeutralEarthing":     ["neutral", "neutro", "neutre", "earthing", "terre", "terra"],
    "CtMeteringRatio":   ["ct metering", "trasformatore di corrente", "ta", "rapporto ta", "scomparto misura"],
    "CtMeteringClass":   ["classe di precisione", "ct accuracy", "metering class", "cl.0", "0.2s", "0.5s"],
    "CtMeteringBurden":  ["onere ta", "ct burden", "carico ta", "scomparto misura"],
    "CtProtectionRatio": ["trasformatore di corrente", "protection ct", "ct protection"],
    "VtRatio":           ["trasformatore di tensione", "rapporto tv", "tv ratio", "voltage transformer", "tensione secondaria"],
    "VtClass":           ["classe di precisione tv", "vt accuracy", "cl.0", "0.5", "scomparto misura"],
    "VtBurden":          ["onere tv", "carico tv", "vt burden", "classe di precisione"],
}


def _find_source_page(value: str, pages: list[PageData], param_key: str = "") -> int:
    """Return the page_number of the first page that contains *value*."""
    if not value:
        return 0
    val_lower = value.lower().strip()
    sorted_pages = sorted(pages, key=lambda p: p.page_number)

    # Strategy 1: exact value (skip very short tokens — too ambiguous)
    if len(val_lower) >= 4:
        for page in sorted_pages:
            if val_lower in page.text.lower():
                return page.page_number

    # Strategy 2: alias phrases for normalized enum values
    for canonical, aliases in _SOURCE_PAGE_ALIASES.items():
        if val_lower == canonical or val_lower.startswith(canonical):
            for page in sorted_pages:
                if any(a in page.text.lower() for a in aliases):
                    return page.page_number

    # Strategy 3: for numeric / short values, find page that has both the value
    #             and a parameter-specific context keyword
    hints = _PARAM_CONTEXT_HINTS.get(param_key, [])
    if hints:
        for page in sorted_pages:
            lower = page.text.lower()
            if any(h in lower for h in hints) and val_lower in lower:
                return page.page_number
        # Fallback: just the hint keyword, ignore the value
        for page in sorted_pages:
            if any(h in page.text.lower() for h in hints):
                return page.page_number

    return 0


def _full_text_from_pages(pages: list[PageData]) -> str:
    text_pages = [p for p in pages if p.page_type != "sld" and p.text.strip()]
    if not text_pages:
        return ""
    # Score pages by electrical-parameter keyword density so that technical spec
    # pages (kV, kA, rated voltage, etc.) are selected regardless of their position
    # in the document. Cover pages, TOC, and revision history score near 0 and are
    # skipped. Selected pages are re-sorted by page number for coherent LLM context.
    scored = [(p, _score_page_for_params(p.text)) for p in text_pages]
    max_score = max(s for _, s in scored)
    if max_score > 0:
        scored.sort(key=lambda x: (-x[1], x[0].page_number))
    else:
        scored.sort(key=lambda x: x[0].page_number)
    selected: list[PageData] = []
    total = 0
    for page, _ in scored:
        chunk = page.text.strip()
        if total + len(chunk) > _MAX_DIRECT_CALL_CHARS and selected:
            break
        selected.append(page)
        total += len(chunk)
    selected.sort(key=lambda p: p.page_number)
    return "\n---\n".join(p.text.strip() for p in selected)


# ── Public entry point ─────────────────────────────────────────────────────────

async def run_path_b(
    document_id: int,
    pages: list[PageData],
    instances: list[InstanceData],
    vectorstore: AzureSearch | None,
    param_defs: list[ParameterDefinition],
    product_name: str = "Switchgear",
) -> list[ExtractedParameterResult]:

    text_pages = [p for p in pages if p.page_type != "sld" and p.text.strip()]
    if not text_pages:
        logger.info(f"[PathB] doc={document_id}: no text pages — skipping (image-only)")
        return []

    if not param_defs:
        logger.warning(f"[PathB] doc={document_id}: no parameter definitions — nothing to extract")
        return []

    client = settings.make_openai_client()
    total_chars = sum(len(p.text) for p in text_pages)
    use_direct  = vectorstore is None or total_chars <= _MAX_CONTEXT_CHARS

    if use_direct:
        logger.info(
            f"[PathB] doc={document_id}: {total_chars} chars — using full-text direct extraction "
            f"({len(param_defs)} params for product='{product_name}')"
        )

    async def _extract_one(instance: InstanceData) -> list[ExtractedParameterResult]:
        try:
            if use_direct:
                context = _full_text_from_pages(text_pages)
                fallback_page = text_pages[0].page_number if text_pages else 0
                results = await asyncio.to_thread(
                    _call_llm, instance.instance_name, context, fallback_page,
                    client, product_name, param_defs,
                )
                # Replace the shared fallback page with the actual page each value was found on
                for r in results:
                    actual = _find_source_page(r.value, text_pages, param_key=r.name)
                    if actual:
                        r.source_page = actual
                return results
            else:
                return await asyncio.to_thread(
                    _extract_all_params,
                    instance.instance_name, vectorstore, client, product_name, param_defs,
                )
        except Exception as exc:
            exc_str = str(exc)
            if "UserByModelByDay" in exc_str or "per 86400s" in exc_str:
                logger.warning(f"[PathB] doc={document_id}: daily rate limit — skipping '{instance.instance_name}'")
            else:
                logger.warning(f"[PathB] doc={document_id} instance='{instance.instance_name}': {exc}")
            return []

    all_results = await asyncio.gather(*[_extract_one(inst) for inst in instances])
    results = [r for batch in all_results for r in batch]

    for inst, batch in zip(instances, all_results):
        for r in batch:
            r.instance_index = inst.instance_index

    logger.info(f"[PathB] doc={document_id}: {len(results)} parameters extracted for '{product_name}'")
    return results
