import asyncio
import logging

from fastapi import FastAPI, HTTPException

from models.request import ExtractionRequest, PageData, InstanceData
from models.response import ExtractionResponse, ExtractedParameterResult, CubicleDeviceResult, TopologySummary
from services.abb_configurator import (
    fetch_product_filters, fetch_product_variants, fetch_product_matches,
    ParameterDefinition,
)
from services.bom_parameters import get_bom_param_defs
from services.path_b.rag_extractor import run_path_b
from services.path_b.device_table_extractor import extract_device_schedules
from services.path_c.sld_vision_analyzer import analyze_sld_image
from services.path_c.sld_topology_service import build_topology
from ensemble.voting import vote
from ensemble.device_voting import vote_devices
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ABB Product Extraction Service", version="2.0.0")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/products")
async def list_products() -> list[dict]:
    families = ["Switchgear", "UniSec", "SafeRing"]
    try:
        all_variants = await asyncio.gather(
            *[asyncio.to_thread(fetch_product_variants, f) for f in families]
        )
    except Exception as exc:
        logger.error(f"[/products] ABB API error: {exc}")
        raise HTTPException(status_code=502, detail=f"ABB API error: {exc}")
    results = []
    for family, variants in zip(families, all_variants):
        for v in variants:
            results.append({
                "name": v.name,
                "value": v.value,
                "family": family,
                "description": v.description,
                "image_url": v.image_url,
                "doc_url": v.doc_url,
            })
    return results


@app.get("/parameter-definitions/{product_name}")
async def get_parameter_definitions(product_name: str) -> list[dict]:
    """Return BOM parameter definitions — all params needed to generate a BOM from an RFQ."""
    defs = get_bom_param_defs(product_name, "all")
    return [
        {
            "key": d.key,
            "prop_name": d.prop_name,
            "label": d.label,
            "label_without_unit": d.label_without_unit,
            "unit": d.unit,
            "allowed_values": d.allowed_values,
            "is_enum": d.is_enum,
        }
        for d in defs
    ]


@app.post("/product-matches")
async def get_product_matches(body: dict) -> list[dict]:
    """Find matching ABB products given extracted RFQ parameters.

    Request body:
      { "product_name": "Switchgear", "extracted_params": {"Market": "IEC", "RatedVoltage": "12", ...} }
    extracted_params keys are ParameterDefinition.key (PascalCase).
    They are mapped to prop_name (e.g. 'varMarkets') internally before calling materials API.
    """
    product_name: str = body.get("product_name", "")
    extracted_params: dict = body.get("extracted_params", {})
    if not product_name:
        raise HTTPException(status_code=400, detail="product_name is required")
    try:
        # Resolve PascalCase keys → prop_name keys required by materials API
        defs = await asyncio.to_thread(fetch_product_filters, product_name)
        key_to_prop = {d.key: d.prop_name for d in defs}
        prop_params = {
            key_to_prop[k]: v
            for k, v in extracted_params.items()
            if k in key_to_prop and v
        }
        matches = await asyncio.to_thread(fetch_product_matches, product_name, prop_params)
    except Exception as exc:
        logger.error(f"[/product-matches] ABB API error: {exc}")
        raise HTTPException(status_code=502, detail=f"ABB API error: {exc}")
    return [
        {
            "name": m.name,
            "display_name": m.display_name,
            "description": m.description,
            "image_url": m.image_url,
            "doc_url": m.doc_url,
        }
        for m in matches
    ]


# ── Path B — two-pass BOM extraction ─────────────────────────────────────────
# Pass 1 (system): global electrical/commercial params from early pages (page 1)
# Pass 2 (panel):  per-panel component params from panel-schedule pages (page 2+)
# Running both in parallel keeps wall-clock time under 2× a single call.


def _resolve_instance_index_for_page(page: PageData, instances: list[InstanceData]) -> int:
    if page.instance_index is not None and page.instance_index > 0:
        return page.instance_index
    if not instances:
        return 1
    if len(instances) == 1:
        return instances[0].instance_index

    content = (page.text or "").lower()
    for inst in instances:
        name = (inst.instance_name or "").strip().lower()
        if name and name in content:
            return inst.instance_index

    return instances[0].instance_index


def _pages_from_pdf_base64(pdf_base64: str) -> list[PageData]:
    """Extract text pages from a base64-encoded PDF using pdfplumber.
    Used as fallback when the .NET backend returns 0 text pages (custom font encoding issue).
    """
    import base64, io
    try:
        import pdfplumber
    except ImportError:
        logger.warning("[PathB] pdfplumber not installed — cannot use PDF fallback extraction")
        return []
    try:
        pdf_bytes = base64.b64decode(pdf_base64)
        pages: list[PageData] = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                if text.strip():
                    pages.append(PageData(page_number=i, page_type="text", text=text))
        logger.info(f"[PathB] pdfplumber fallback: extracted {len(pages)} text pages from PDF")
        return pages
    except Exception as exc:
        logger.warning(f"[PathB] pdfplumber fallback failed: {exc}")
        return []


async def _exec_path_b(
    document_id: int,
    pages: list[PageData],
    instances: list[InstanceData],
    errors: list[str],
    product_name: str,
    run_level2: bool = True,
    pdf_base64: str | None = None,
) -> tuple[list[ExtractedParameterResult], list[CubicleDeviceResult]]:
    """Two-pass BOM extraction — system params then panel/component params."""
    all_params: list[ExtractedParameterResult] = []
    all_devices: list[CubicleDeviceResult] = []

    text_pages = sorted(
        [p for p in pages if p.page_type == "text" and p.text.strip()],
        key=lambda p: p.page_number,
    )

    # If .NET extracted no text (custom font encoding issue), fall back to pdfplumber
    if not text_pages and pdf_base64:
        logger.info(f"[PathB] doc={document_id}: no text pages from backend — trying pdfplumber fallback")
        text_pages = _pages_from_pdf_base64(pdf_base64)

    if not text_pages:
        return all_params, all_devices

    system_defs = get_bom_param_defs(product_name, "system")
    panel_defs  = get_bom_param_defs(product_name, "panel")

    # Pages 2+ for panel-schedule data; fall back to all pages if only 1 page.
    panel_pages = text_pages[1:] if len(text_pages) > 1 else text_pages

    async def _run_system() -> list[ExtractedParameterResult]:
        try:
            return await run_path_b(
                document_id, text_pages, instances, None, system_defs, product_name
            )
        except Exception as exc:
            logger.warning(f"[PathB] system pass failed for doc={document_id}: {exc}")
            errors.append(f"BOM system extraction: {exc}")
            return []

    async def _run_panel() -> list[ExtractedParameterResult]:
        if not panel_defs:
            return []
        try:
            return await run_path_b(
                document_id, panel_pages, instances, None, panel_defs, product_name
            )
        except Exception as exc:
            logger.warning(f"[PathB] panel pass failed for doc={document_id}: {exc}")
            errors.append(f"BOM panel extraction: {exc}")
            return []

    async def _run_devices() -> list[CubicleDeviceResult]:
        if not run_level2:
            return []
        try:
            return await extract_device_schedules(text_pages, instances)
        except Exception as exc:
            logger.warning(f"[PathB] device extraction failed for doc={document_id}: {exc}")
            errors.append(f"Device extraction: {exc}")
            return []

    system_params, panel_params, all_devices = await asyncio.gather(
        _run_system(), _run_panel(), _run_devices()
    )
    all_params = system_params + panel_params

    logger.info(
        f"[PathB] doc={document_id} system={len(system_params)} "
        f"panel={len(panel_params)} devices={len(all_devices)}"
    )
    return all_params, all_devices


# ── Path C ────────────────────────────────────────────────────────────────────
# Uses single-shot GPT-4o vision (sld_vision_analyzer) — no Azure AI Vision
# dependency required. Each SLD page is read directly by the model.

async def _exec_path_c(
    pages: list[PageData],
    instances: list[InstanceData],
    errors: list[str],
    param_defs: list[ParameterDefinition] | None = None,
) -> tuple[list[ExtractedParameterResult], list[CubicleDeviceResult]]:
    params: list[ExtractedParameterResult] = []
    devices: list[CubicleDeviceResult] = []

    sld_pages = [p for p in pages if p.page_type == "sld" and p.sld_image_base64]
    if not sld_pages:
        logger.info("[PathC] No SLD pages found — skipping vision analysis")
        return params, devices

    logger.info(f"[PathC] Analysing {len(sld_pages)} SLD page(s) with GPT-4o vision (parallel)")

    async def _analyse_one(page):
        instance_idx = _resolve_instance_index_for_page(page, instances)
        return await asyncio.to_thread(
            analyze_sld_image,
            page.sld_image_base64,
            page.page_number,
            instance_idx,
            param_defs,
        )

    results = await asyncio.gather(
        *[_analyse_one(p) for p in sld_pages],
        return_exceptions=True,
    )

    for page, result in zip(sld_pages, results):
        if isinstance(result, Exception):
            logger.error(f"[PathC] Vision analysis failed page={page.page_number}: {result}")
            errors.append(f"PathC page {page.page_number}: {result}")
        else:
            page_params, page_devices = result
            params.extend(page_params)
            devices.extend(page_devices)
            logger.info(f"[PathC] page={page.page_number} → {len(page_params)} params, {len(page_devices)} devices")

    return params, devices


# ── Panel param synthesis from cubicle devices ───────────────────────────────

def _synthesize_panel_params_from_devices(
    devices: list[CubicleDeviceResult],
    all_bom_defs: list[ParameterDefinition],
    system_params: list[ExtractedParameterResult] | None = None,
) -> list[ExtractedParameterResult]:
    """Promote cubicle device fields → _SW_PANEL ExtractedParameterResult entries.

    Uses the incomer panel as the representative source (highest-rated CB/CT).
    Falls back to the first device when no incomer is found.
    """
    import re

    if not devices:
        return []

    panel_keys = {d.key for d in all_bom_defs}

    # Priority: Incomer > first device (for CB/CT data)
    src = next(
        (d for d in devices if (d.panel_type or "").lower() in ("incomer", "ring incomer", "main incomer")),
        devices[0],
    )

    # For relay data: use whichever panel has a relay_model, falling back to src
    relay_src = next(
        (d for d in devices if d.relay_model),
        src,
    )

    results: list[ExtractedParameterResult] = []

    def _add(key: str, value: str, unit: str = "", conf: float = 0.85, from_dev: CubicleDeviceResult | None = None) -> None:
        if not value or key not in panel_keys:
            return
        dev = from_dev or src
        results.append(ExtractedParameterResult(
            name=key,
            value=value,
            unit=unit,
            confidence=conf,
            extraction_path="PathC",
            source_text=f"SLD cubicle: {dev.functional_position}",
            source_page=dev.source_page,
            instance_index=dev.instance_index,
            flagged_for_review=conf < 0.80,
        ))

    def _numeric(raw: str) -> str:
        m = re.match(r"([\d]+(?:[.,]\d+)?)", raw.strip())
        return m.group(1).replace(",", ".") if m else ""

    # Panel function / type
    if src.panel_type:
        _add("PanelFunction", src.panel_type, conf=0.90)

    # Functional unit — infer withdrawable vs fixed from CB model name
    if src.cb_model:
        withdrawable_hints = ("vd4/r", "withdrawable", "draw-out", "truck")
        fu = "Withdrawable CB" if any(h in src.cb_model.lower() for h in withdrawable_hints) else "Fixed CB"
        _add("FunctionalUnit", fu, conf=0.75)

    # CB ratings
    if src.cb_rating:
        _add("CbRatedCurrent", _numeric(src.cb_rating), "A", conf=0.88)
    if src.cb_breaking_capacity:
        _add("CbBreakingCapacity", _numeric(src.cb_breaking_capacity), "kA", conf=0.88)

    # CT
    if src.ct_ratio:
        _add("CtProtectionRatio", src.ct_ratio, conf=0.88)
    if src.ct_accuracy_class:
        _add("CtProtectionClass", src.ct_accuracy_class, conf=0.85)
    if src.ct_burden:
        _add("CtProtectionBurden", _numeric(src.ct_burden), "VA", conf=0.80)

    # VT
    if src.vt_ratio:
        _add("VtRatio", src.vt_ratio, conf=0.88)
    if src.vt_accuracy_class:
        _add("VtClass", src.vt_accuracy_class, conf=0.85)
    if src.vt_burden:
        _add("VtBurden", _numeric(src.vt_burden), "VA", conf=0.80)

    # Relay — use whichever panel has relay data
    if relay_src.relay_model:
        _add("RelayModel", relay_src.relay_model, conf=0.90, from_dev=relay_src)
    # Collect protection functions from ALL panels (relay may be on a different panel than incomer)
    all_funcs: list[str] = []
    seen: set[str] = set()
    for dev in devices:
        for fn in (dev.protection_functions or []):
            if fn not in seen:
                all_funcs.append(fn)
                seen.add(fn)
    if all_funcs:
        _add("RelayFunctions", ", ".join(all_funcs), conf=0.88, from_dev=relay_src)

    # Earthing switch
    if src.es_present and src.es_present.lower() == "true":
        es_mode = "Motor operated" if src.ds_operating_mode and "motor" in src.ds_operating_mode.lower() else "Manual"
        _add("EarthingSwitch", es_mode, conf=0.75)
    elif src.es_present and src.es_present.lower() == "false":
        _add("EarthingSwitch", "None", conf=0.80)

    # CB mechanism
    if src.cb_mechanism_type:
        _add("CbMechanism", src.cb_mechanism_type, conf=0.80)

    # Motor / coil voltage — panel device first, then fall back to system AuxVoltage
    if src.aux_control_voltage:
        _add("MotorVoltage", src.aux_control_voltage, conf=0.80)
    elif src.relay_aux_voltage:
        _add("MotorVoltage", src.relay_aux_voltage, conf=0.75)
    elif system_params:
        aux = next((p.value for p in system_params if p.name == "AuxVoltage" and p.value), None)
        if aux:
            _add("MotorVoltage", aux, conf=0.65)  # lower conf: inferred from system voltage

    logger.info(
        f"[PanelSynth] {len(results)} panel params synthesised from device "
        f"'{src.functional_position}' (type={src.panel_type})"
    )
    return results


# CB model name → canonical CbType allowed value
_CB_MODEL_TO_TYPE: dict[str, str] = {
    "vd4/r":   "VD4/R",
    "vd4":     "VD4",
    "hd4":     "HD4",
    "vm1":     "VM1",
    "ecovac":  "Vacuum CB",    # Schneider SM6 / SM AirSet
    "evopact": "Vacuum CB",    # Schneider SM6 / SM AirSet
    "ecopact": "Vacuum CB",    # Schneider
    "hvx":     "HVX",
    "cvx":     "CVX",
    "evolis":  "Evolis",
    "3ah":     "3AH5",
    "3ae":     "3AH5",
    "xiria":   "Vacuum CB",    # Eaton
    "foresix": "Vacuum CB",    # Eaton
    "vacuum":  "Vacuum CB",
    "sf6":     "SF6 CB",
}

# Partial product name → canonical Enclosure value
_PRODUCT_TO_ENCLOSURE: list[tuple[str, str]] = [
    ("sm6",     "Metal-enclosed fixed"),
    ("sm air",  "Metal-enclosed fixed"),
    ("rm6",     "Metal-enclosed fixed"),
    ("pix",     "Metal-enclosed fixed"),
    ("unigear", "Metal-clad withdrawable"),
    ("unisec",  "Metal-clad withdrawable"),
    ("zs1",     "Metal-clad withdrawable"),
    ("zs2",     "Metal-clad withdrawable"),
    ("zx",      "Metal-clad withdrawable"),
    ("hax",     "Metal-clad withdrawable"),
    ("safering","GIS"),
    ("safeplus","GIS"),
    ("nxplus",  "GIS"),
    ("8djh",    "GIS"),
    ("8da10",   "GIS"),
    ("xiria",   "Metal-enclosed fixed"),
    ("foresix", "Metal-enclosed fixed"),
]


def _derive_missing_system_params(
    params: list[ExtractedParameterResult],
    devices: list[CubicleDeviceResult],
    all_bom_defs: list[ParameterDefinition],
) -> list[ExtractedParameterResult]:
    """Derive system parameters that can be inferred from already-extracted data.

    Covers parameters that rarely appear explicitly in SLD data blocks but can be
    deduced from other extracted values or from the cubicle device list.
    """
    existing = {p.name for p in params if p.value}
    param_keys = {d.key for d in all_bom_defs}
    derived: list[ExtractedParameterResult] = []

    def _add(key: str, value: str, unit: str = "", conf: float = 0.75, source: str = "") -> None:
        if not value or key not in param_keys or key in existing:
            return
        derived.append(ExtractedParameterResult(
            name=key, value=value, unit=unit, confidence=conf,
            extraction_path="Derived",
            source_text=source,
            source_page=0,
            instance_index=1,
            flagged_for_review=conf < 0.80,
        ))

    # ── Market from Standard ───────────────────────────────────────────────────
    standard = next((p.value for p in params if p.name == "Standard" and p.value), "")
    if standard:
        s_up = standard.upper()
        if any(x in s_up for x in ("IEC", "CEI", "NF C")):
            _add("Market", "IEC", source=f"Derived from Standard: {standard}")
        elif any(x in s_up for x in ("ANSI", "IEEE", "NEMA")):
            _add("Market", "ANSI", source=f"Derived from Standard: {standard}")

    # ── NumberOfPanels from device count ──────────────────────────────────────
    if devices:
        _add("NumberOfPanels", str(len(devices)), source=f"Counted {len(devices)} panels in SLD")

    # ── Enclosure from Product ─────────────────────────────────────────────────
    product = next((p.value for p in params if p.name == "Product" and p.value), "").lower()
    if product:
        for fragment, enc_value in _PRODUCT_TO_ENCLOSURE:
            if fragment in product:
                _add("Enclosure", enc_value, source=f"Derived from Product: {product}")
                break

    # ── CbType from cubicle device CB models (incomer first) ──────────────────
    incomer = next(
        (d for d in devices if (d.panel_type or "").lower() in ("incomer", "main incomer", "ring incomer")),
        devices[0] if devices else None,
    )
    if incomer and incomer.cb_model:
        raw_lower = incomer.cb_model.lower()
        for fragment, type_value in _CB_MODEL_TO_TYPE.items():
            if fragment in raw_lower:
                _add("CbType", type_value, source=f"Derived from CB model: {incomer.cb_model}")
                break

    if derived:
        logger.info(f"[Derive] {len(derived)} system params derived: {[d.name for d in derived]}")
    return derived


# ── Endpoint ──────────────────────────────────────────────────────────────────

@app.post("/extract", response_model=ExtractionResponse)
async def extract(request: ExtractionRequest) -> ExtractionResponse:
    logger.info(
        f"Extract request: product='{request.product_name}' doc={request.document_id}, "
        f"pages={len(request.pages)}, instances={len(request.instances)}"
    )

    errors: list[str] = []

    # ── BOM parameter schema (replaces ABB filterSelector for extraction) ─────
    all_bom_defs = get_bom_param_defs(request.product_name, "all")
    logger.info(
        f"[Extract] BOM schema: {len(all_bom_defs)} parameters for '{request.product_name}'"
    )

    # ── Run Path B (two-pass BOM) and Path C (SLD vision) concurrently ────────
    run_b = _exec_path_b(
        request.document_id, request.pages, request.instances, errors,
        request.product_name, request.run_level2, request.pdf_base64,
    ) if request.run_path_b else None
    run_c = _exec_path_c(request.pages, request.instances, errors, all_bom_defs) \
        if request.run_path_c else None

    if run_b and run_c:
        (path_b_params, path_b_devices), (path_c_params, path_c_devices) = \
            await asyncio.gather(run_b, run_c)
    elif run_b:
        path_b_params, path_b_devices = await run_b
        path_c_params, path_c_devices = [], []
    elif run_c:
        path_c_params, path_c_devices = await run_c
        path_b_params, path_b_devices = [], []
    else:
        path_b_params = path_b_devices = path_c_params = path_c_devices = []

    all_devices = vote_devices(path_b_devices, path_c_devices)

    # ── Synthesise panel params from cubicle devices (SLD-only docs) ──────────
    # When Path B has no text (image-only SLD), cubicle devices are the only
    # source of panel-level data. Promote CB/CT/relay fields into param results
    # so they appear in the parameter table alongside the system params.
    synth_panel = _synthesize_panel_params_from_devices(
        all_devices, all_bom_defs, system_params=path_c_params + path_b_params
    )
    path_c_params = path_c_params + synth_panel

    # ── Derive system params not directly visible in SLD/text ─────────────────
    # Market from Standard, NumberOfPanels from device count,
    # Enclosure and CbType from product / CB model.
    all_extracted = path_c_params + path_b_params
    derived_system = _derive_missing_system_params(all_extracted, all_devices, all_bom_defs)
    path_c_params = path_c_params + derived_system

    # ── Topology ──────────────────────────────────────────────────────────────
    topology = TopologySummary()
    if all_devices:
        topology = build_topology(all_devices)

    # ── Ensemble Voting ───────────────────────────────────────────────────────
    final_params = vote(path_b_params, path_c_params, all_bom_defs)

    logger.info(
        f"[Extract] doc={request.document_id} "
        f"params={len(final_params)} devices={len(all_devices)} errors={len(errors)}"
    )

    return ExtractionResponse(
        document_id=request.document_id,
        parameters=final_params,
        cubicle_devices=all_devices,
        topology_summary=topology,
        errors=errors,
    )
