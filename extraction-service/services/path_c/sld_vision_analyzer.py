"""
Path C  —  single-shot GPT-4o vision analysis of SLD pages.

Replaces the 5-step pipeline:
    OCR (Azure AI Vision) → region classifier → param mapper
    → panel segmenter → device extractor

with ONE GPT-4o call that reads the SLD image directly.
Azure AI Vision is NOT required.
"""

from __future__ import annotations

import base64
import io
import json as _json
import logging
from typing import TYPE_CHECKING

from pydantic import BaseModel, ValidationError

from config import settings
from ensemble.voting import ALLOWED_VALUES
from models.response import CubicleDeviceResult, ExtractedParameterResult
from services.path_b.normalizer import normalize_enum_value

if TYPE_CHECKING:
    from services.abb_configurator import ParameterDefinition

logger = logging.getLogger(__name__)

_UNIT_MAP: dict[str, str] = {
    "OperatingVoltage":          "kV",
    "ShortCircuitLevel":         "kA",
    "RatedBusbarCurrent":        "A",
    "PanelRatedCurrent":         "A",
    "Frequency":                 "Hz",
    "Market":                    "",
    "BusbarArrangement":         "",
    "Insulation":                "",
    "Distribution":              "",
    "IngressProtection":         "",
    "InternalArcClassification": "",
    "NeutralEarthingMethod":     "",
}

_ENUM_PARAMS = {
    "Market", "BusbarArrangement", "Insulation",
    "Distribution", "IngressProtection", "InternalArcClassification",
    "NeutralEarthingMethod",
}

_MIN_DEVICE_CONFIDENCE = 0.25


def _build_prompt(param_defs: list[ParameterDefinition]) -> str:
    """Build the full SLD analysis prompt dynamically from ParameterDefinition list."""
    param_lines = [
        "",
        "IMPORTANT: Always return values in English canonical form regardless of document language.",
        "Translate Italian/French/German terms to their English equivalents as listed below.",
        "Allowed parameter names (use exact spelling):",
    ]
    for p in param_defs:
        if p.unit and not p.is_enum:
            ex = next(
                (str(v) for v in p.allowed_values[:1] if v),
                "return number only",
            )
            hint = f"{p.label_without_unit}, numeric only in {p.unit} (e.g. \"{ex}\")"
        elif p.is_enum and p.allowed_values:
            vals = ", ".join(f'"{v}"' for v in p.allowed_values[:10])
            hint = f"canonical English — e.g. {vals}"
        elif not p.is_enum and p.allowed_values:
            vals = ", ".join(f'"{v}"' for v in p.allowed_values[:8])
            hint = f"e.g. {vals} — or any equivalent, return as seen in document"
        else:
            hint = p.label
        param_lines.append(f"  {p.key:<28} – {hint}")

    # Section 2 (cubicle devices) is SLD-specific and product-independent —
    # the cubicle structure (CB, CT, VT, relay) is the same for all MV products.
    section2_and_tail = _SYSTEM_PROMPT[_SYSTEM_PROMPT.index("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n2."):]

    italian_hints = (
        "\n\nItalian SLD field name translations (DATI IMPIANTO / DATI QUADRO block — often on LEFT side):\n"
        "  TENSIONE DI ESERCIZIO / TENSIONE NOMINALE  →  RatedVoltage (kV, numeric)\n"
        "  CORRENTE DI CORTOCIRCUITO / ICC             →  ShortCircuit (kA, numeric)\n"
        "  CORRENTE NOMINALE SBARRE / CORR. NOMINALE  →  BusBbarCurrent (A, numeric)\n"
        "  FREQUENZA                                   →  Frequency (50 or 60)\n"
        "  GRADO DI PROTEZIONE                        →  IpDegree (e.g. 'IP31', 'IP3X'→'IP31')\n"
        "  ESERCIZIO DEL NEUTRO / NEUTRO              →  NeutralEarthing:\n"
        "      COMPENSATO → 'Petersen coil'\n"
        "      ISOLATO    → 'Isolated'\n"
        "      DIRETTO / SOLIDO → 'Solid'\n"
        "      RESISTENZA → 'NGR'\n"
        "  TENSIONE AUSILIARIA / TENSIONE DI COMANDO  →  AuxVoltage\n"
        "      'c.a.' means AC (e.g. '230 V c.a.' → '230 VAC')\n"
        "      'c.c.' means DC (e.g. '110 V c.c.' → '110 VDC')\n"
        "  TEMPERATURA AMBIENTE                        →  AmbientTemp\n"
        "  TIPO SBARRE / CONFIGURAZIONE SBARRE        →  BusBbarArrangement\n"
        "  CLASSIFICAZIONE ARCO INTERNO               →  InternalArc\n"
        "  TIPO / QUADRO                               →  Product (e.g. 'SM6', 'SM AirSet', 'UniGear')\n"
        "  CLASSIFICAZIONE ARCO INTERNO / ARCO INTERNO →  InternalArc (e.g. 'AFLR', 'AFL', 'AB', 'A')\n"
        "      IAC A F-R-L / frontale-retro-laterale → 'AFLR'\n"
        "      IAC A F-L / frontale-laterale → 'AFL'\n"
        "      IAC A F-R → 'AB'\n"
        "      IAC A / IAC class A (front only) → 'IAC A'\n"
        "      Return ONLY the access letters (e.g. 'AFLR'), NOT 'None' unless document explicitly states no arc class.\n"
        "  TIPO INVOLUCRO / INVOLUCRO                  →  Enclosure (e.g. 'Metal-enclosed fixed', 'Metal-clad withdrawable')\n"
        "  Insulation type (CRITICAL): RETURN 'AIS' for metal-enclosed switchgear EVEN IF CB is SF6 or vacuum.\n"
        "      'GIS' = only if the BUSBAR COMPARTMENT is gas-insulated (e.g. UniGear ZS2, SafeRing).\n"
        "      Metal-enclosed + SF6 CB → 'AIS'; Metal-enclosed + Vacuum CB → 'AIS'.\n"
        "  NUMERO DI SCOMPARTI / N. SCOMPARTI          →  NumberOfPanels (count visible panel columns)\n"
        "  MERCATO / NORMA DI RIFERIMENTO              →  Market ('IEC' if standard is IEC/CEI; 'ANSI' if IEEE/ANSI)\n"
        "      Do NOT return 'All' — return 'IEC' or 'ANSI'.\n"
        "  TIPO INTERRUTTORE / INTERRUTTORE            →  CbType (e.g. 'VD4', 'EcoVac'→'Vacuum CB', 'HVX')\n"
        "  CB Breaking vs Making capacity:\n"
        "      CbBreakingCapacity = potere di interruzione = Icc (LOWER value, e.g. 16 kA).\n"
        "      'potere di chiusura' / making capacity = Ip (HIGHER value, e.g. 40 kA) — DO NOT use for CbBreakingCapacity.\n"
        "      If both appear, use the LOWER one for breaking capacity.\n"
        "  InternalArc: return ONLY the classification letters (e.g. 'AFLR', 'AFL').\n"
        "      NEVER return a kA number as InternalArc — that is the arc current withstand, not the class.\n"
        "  Enclosure type:\n"
        "      'involucro metallico' / PM classification → 'Metal-enclosed AIS' (NOT metal-clad)\n"
        "      'metallicamente suddiviso' / MC classification → 'Metal-clad AIS'\n"
        "  Product: return the switchboard designation code or commercial product name.\n"
        "      Do NOT return generic labels like 'Main Switchgear' or 'Distribution Panel'.\n"
        "  CT Ratio (CRITICAL): must be in format 'X/YA' (e.g. '100/1A', '400/5A', '1250/1A').\n"
        "      Do NOT return dimensionless fractions like '3/5' or '0.6' — those are NOT CT ratios.\n"
        "      If no CT ratio visible in the diagram, return empty string.\n"
    )

    header = (
        "You are an expert electrical engineer reading a Single Line Diagram (SLD).\n"
        "The image may be a technical drawing, CAD export, or scanned page.\n"
        "Text may be in English, French, Italian, or German.\n\n"
        "Extract TWO categories of data and return ONLY a JSON object — no markdown, no commentary.\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "1. SYSTEM PARAMETERS (from the title block or data panel — usually bottom-right, top-right,\n"
        "   side band, or on Italian SLDs: a DATI IMPIANTO / DATI QUADRO block on the LEFT side)\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "Return only the parameters you can clearly see. Omit any that are absent or illegible."
    )
    return header + "\n".join(param_lines) + italian_hints + section2_and_tail


# ── Structured output models ─────────────────────────────────────────────────

class _ExtractedParam(BaseModel):
    name: str
    value: str


class _DeviceRow(BaseModel):
    functional_position: str = ""
    panel_type: str = ""          # Incomer/Feeder/Coupler/Metering/Transformer/VT/Other
    cb_model: str = ""
    cb_rating: str = ""
    cb_breaking_capacity: str = ""
    cb_making_capacity: str = ""
    cb_mechanism_type: str = ""
    cb_number_of_poles: str = ""
    ct_ratio: str = ""
    ct_accuracy_class: str = ""
    ct_burden: str = ""
    ct_core_type: str = ""
    vt_ratio: str = ""
    vt_accuracy_class: str = ""
    vt_burden: str = ""
    vt_insulation_level: str = ""
    relay_model: str = ""
    protection_functions: list[str] = []
    relay_aux_voltage: str = ""
    relay_comm_protocol: list[str] = []
    ds_count: str = ""
    ds_operating_mode: str = ""
    es_present: str = ""
    es_id: str = ""
    sa_present: str = ""
    aux_control_voltage: str = ""
    confidence: float


class _SldAnalysis(BaseModel):
    system_params: list[_ExtractedParam] = []
    cubicle_devices: list[_DeviceRow] = []


# ── GPT-4o prompt ────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are an expert electrical engineer reading a switchgear
Single Line Diagram (SLD). The image may be a technical drawing, CAD export, or
scanned page. Text may be in English, French, Italian, or German.

Extract TWO categories of data and return ONLY a JSON object — no markdown, no commentary.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SYSTEM PARAMETERS (from the title block or data panel — usually bottom-right, top-right,
   side band, or on Italian SLDs: a DATI IMPIANTO / DATI QUADRO block on the LEFT side)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return only the parameters you can clearly see. Omit any that are absent or illegible.
Italian field names: TENSIONE DI ESERCIZIO=OperatingVoltage, CORRENTE DI CORTOCIRCUITO=ShortCircuitLevel,
  CORRENTE NOMINALE SBARRE=RatedBusbarCurrent, GRADO DI PROTEZIONE=IngressProtection,
  ESERCIZIO DEL NEUTRO=NeutralEarthingMethod, TENSIONE AUSILIARIA=aux_control_voltage,
  "c.a."=AC "c.c."=DC (e.g. "230 V c.a."→"230 VAC", "110 V c.c."→"110VDC").
Allowed parameter names (use exact spelling):
  OperatingVoltage      – rated voltage in kV, numeric only (e.g. "24")
  ShortCircuitLevel     – short-circuit level in kA, numeric only (e.g. "25")
  RatedBusbarCurrent    – busbar rated current in A, numeric only (e.g. "2000")
  PanelRatedCurrent     – panel/feeder rated current in A, numeric only
  Frequency             – 50 or 60, numeric only
  Market                – "IEC" or "ANSI"
  BusbarArrangement     – "Single busbar", "Double busbar", or "Double Level"
  Insulation            – "AIS", "GIS (SF6)", "GIS (Dry Air)", or "GIS (SF6-free)"
  Distribution          – "Primary" or "Secondary"
  IngressProtection     – include IP prefix, e.g. "IP31", "IP54". IP3X means IP31.
  InternalArcClassification – e.g. "IAC A", "IAC AFL", "IAC AFLR". Italian: "CLASSIFICAZIONE ARCO INTERNO" → return letter code (e.g. "AFLR", "AFL"). Do NOT return "None" unless explicitly stated.
  NeutralEarthingMethod     – neutral earthing: "Solid", "NGR", "Petersen coil", "Isolated", "TN-S", "TN-C-S", "TT", or "IT"
                              Italian: COMPENSATO = "Petersen coil", ISOLATO = "Isolated", DIRETTO = "Solid", RESISTENZA = "NGR"
                              French: COMPENSÉ = "Petersen coil", ISOLÉ = "Isolated", SOLIDE = "Solid"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. CUBICLE DEVICES (one entry per panel / bay / cubicle)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Look for vertical columns hanging from the main busbar — each column is one cubicle.
A typical MV switchgear has 4–20 panels: incomers at the ends, feeders in the middle,
couplers linking busbar sections.

For each cubicle:
  functional_position   – bay reference like "-UC1", "F03", "I01", or label such as "INCOMER"
  panel_type            – Incomer / Feeder / Coupler / Metering / Transformer / VT / Other
  cb_model              – circuit breaker model. ABB: VD4, HD4, VM1, VD4/R, SafePlus, SafeRing. Schneider: HVX, CVX, Evolis. Siemens: 3AH, 3AE, 3AF. Eaton: XIRIA, FORESIX. GE: VB, Powervac. (e.g. "VD4-1250", "HD4-630", "3AH3", "XIRIA-E")
  cb_rating             – rated current with unit (e.g. "630A", "1250A", "2000A")
  cb_breaking_capacity  – short-circuit breaking capacity (e.g. "25kA", "31.5kA", "40kA/3s")
  cb_making_capacity    – short-circuit making capacity peak (e.g. "63kA", "52.5kA")
  cb_mechanism_type     – operating mechanism (e.g. "Spring", "Motor", "Manual")
  cb_number_of_poles    – number of poles (e.g. "3")
  ct_ratio              – current transformer ratio. Standard IEC ratios: 50/1A, 100/1A, 200/1A, 400/1A, 600/1A, 800/1A, 1000/1A, 1250/1A, 1600/1A, 2000/1A. Dual-ratio format: "400-800/1A". Also look for: "TC" (FR/IT), "TA" (IT), "Stromwandler" (DE). (e.g. "400/5A", "100/1A", "400-800/1A")
  ct_accuracy_class     – CT accuracy class (e.g. "5P20", "0.5S", "10VA 5P20", "0.2S", "5P10")
  ct_burden             – CT burden (e.g. "15VA", "10VA", "5VA")
  ct_core_type          – CT core designation or sensor type. CSH 120/160/200/300 = Schneider residual current sensor (put it here). (e.g. "Protection", "Metering", "CSH 160", "CSH 200")
  vt_ratio              – voltage transformer ratio. Common formats: "11000/√3/110/√3V", "22000/110V", "33000/√3/110/√3V". An open-delta (residual) third winding for earth-fault detection often appears as a separate winding marked "da/dn" or "0.11/3kV". (e.g. "21/√3 - 0.11/√3kV", "22000/110V", "33kV/√3/100V")
  vt_accuracy_class     – VT accuracy class (e.g. "0.5", "10VA/0.5", "0.5/3P")
  vt_burden             – VT burden (e.g. "50VA", "25VA")
  vt_insulation_level   – VT insulation level (e.g. "28kV", "36kV")
  relay_model           – protection relay model. CRITICAL: if protection_functions is non-empty, a relay IS present — you MUST find its model label. IMPORTANT: CSH 120/160/200/300 are Schneider residual current SENSORS (CTs), NOT relays — never put CSH in relay_model; put it in ct_core_type instead. The relay model is a separate label: ABB REF615/REF630/REM615; Schneider Sepam 10/20/40/80, PowerLogic P3U30/P5/P6, Easergy P3/P5, MiCOM P127/P141; Siemens 7SJ/7SD/7UT. Italian: box labeled "RELÈ" or "RELÈ DI PROTEZIONE" with a code beside it (e.g. "P3U30", "Sepam 40"). (e.g. "REF615", "PowerLogic P3U30", "P3U30", "Sepam 40", "P127")
  protection_functions  – ANSI code list read from relay box. Common codes: 27 (undervoltage), 50/51 (overcurrent), 51N (earth fault), 59 (overvoltage), 67 (directional OC), 79 (auto-reclose), 86 (lockout), 87T (transformer diff). (e.g. ["50/51", "51N", "27"])
  relay_aux_voltage     – relay auxiliary supply voltage (e.g. "110VDC", "24VDC")
  relay_comm_protocol   – communication protocols (e.g. ["IEC61850", "Modbus"])
  ds_count              – number of disconnectors / isolators visible in this panel (e.g. "2")
  ds_operating_mode     – disconnector operating mode (e.g. "Manual", "Motorized")
  es_present            – earthing switch present in this panel ("true" / "false")
  es_id                 – earthing switch label visible in diagram (e.g. "QZ1", "QE1")
  sa_present            – surge arrester present in this panel ("true" / "false")
  aux_control_voltage   – auxiliary / control supply voltage (e.g. "110VDC", "48VDC")
  confidence            – 0.0–1.0 how clearly this cubicle's data is readable

Rules:
  • Never invent values. Use empty string / empty list when not visible.
  • Return every cubicle you can identify from the diagram.
  • Read ALL annotations inside each panel column carefully (CT box, VT box, relay box, labels).
  • For relay_model: MANDATORY when protection_functions is non-empty — the relay model label is somewhere in or beside the panel. Scan every text label: small print on the relay rectangle, a "RELÈ DI PROTEZIONE" box, a nameplate code like "P3U30", "Sepam 40", "REF615". Only leave empty if you truly see no text near any relay symbol in the entire diagram.
  • Italian panel type labels: "GENERALE MT" or "GENERALE" = general/protection panel (extract as separate cubicle); "ARRIVO MT" = incomer; "PARTENZA MT" / "USCITA MT" = outgoing feeder; "MISURA" = metering. Each distinct label in the SLD header row = one cubicle entry.
  • For cb_mechanism_type: look for "molle" / "a molla" (Italian for spring), "manuele" (manual), "motorizzato" (motorised). If not visible, leave empty.
  • For es_present and sa_present: set "true" if the corresponding symbol (ES, QZ, SA, LA) is visible.
  • A confidence below 0.30 means the panel is barely legible.
  • Topology rules: incomer panels are at the ends of the lineup; coupler panels sit between busbar sections; feeder/outgoer panels fill the middle. A panel with CT + protection relay is almost certainly a Feeder, not a Coupler.
  • Multilingual labels: CT may appear as "TC"/"transformateur de courant" (FR), "TA"/"trasformatore di corrente" (IT), "SW"/"Stromwandler" (DE). VT may appear as "TP"/"transformateur de tension" (FR), "TV"/"trasformatore di tensione" (IT), "SpW"/"Spannungswandler" (DE). Relay: "RELÈ"/"relè di protezione" (IT), "relais de protection" (FR), "Schutzrelais" (DE). Disconnector/isolator: "sectionneur" (FR), "sezionatore" (IT), "Trennschalter" (DE).

Return ONLY this JSON structure (no markdown fences):
{
  "system_params": [{"name": "<AllowedParamName>", "value": "<string>"}],
  "cubicle_devices": [
    {
      "functional_position": "", "panel_type": "", "cb_model": "", "cb_rating": "",
      "cb_breaking_capacity": "", "cb_making_capacity": "", "cb_mechanism_type": "",
      "cb_number_of_poles": "", "ct_ratio": "", "ct_accuracy_class": "",
      "ct_burden": "", "ct_core_type": "", "vt_ratio": "", "vt_accuracy_class": "",
      "vt_burden": "", "vt_insulation_level": "", "relay_model": "",
      "protection_functions": [], "relay_aux_voltage": "", "relay_comm_protocol": [],
      "ds_count": "", "ds_operating_mode": "", "es_present": "", "es_id": "",
      "sa_present": "", "aux_control_voltage": "", "confidence": 0.0
    }
  ]
}"""


# ── Helpers ──────────────────────────────────────────────────────────────────

def _detect_mime(image_base64: str) -> str:
    """Detect image MIME type from base64 header bytes."""
    try:
        header = base64.b64decode(image_base64[:16])
        if header[:2] == b'\xff\xd8':
            return "image/jpeg"
        if header[:8] == b'\x89PNG\r\n\x1a\n':
            return "image/png"
    except Exception:
        pass
    return "image/jpeg"   # safe default


def _resize_if_needed(image_base64: str, max_bytes: int = 4_000_000) -> str:
    """Shrink image to ≤ max_bytes so the API doesn't reject it."""
    raw = base64.b64decode(image_base64)
    if len(raw) <= max_bytes:
        return image_base64
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(raw))
        ratio = min(2048 / img.width, 2048 / img.height, 1.0)
        if ratio < 1.0:
            img = img.resize(
                (int(img.width * ratio), int(img.height * ratio)),
                Image.Resampling.LANCZOS,
            )
            logger.info(f"[PathC-Vision] Image resized to {img.width}x{img.height}")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return base64.b64encode(buf.getvalue()).decode()
    except ImportError:
        logger.warning("[PathC-Vision] Pillow not available — sending image as-is")
        return image_base64


def _confidence(param_name: str, value: str, allowed: list | None = None) -> float:
    if allowed is None:
        allowed = ALLOWED_VALUES.get(param_name, [])
    if not allowed:
        return 0.82
    try:
        num = float(value.replace(",", "."))
        return 0.92 if num in allowed else 0.62
    except ValueError:
        matched = any(str(a).lower() == value.strip().lower() for a in allowed)
        return 0.92 if matched else 0.62


# ── Public API ───────────────────────────────────────────────────────────────

def analyze_sld_image(
    image_base64: str,
    page_number: int,
    instance_index: int = 1,
    param_defs: list[ParameterDefinition] | None = None,
) -> tuple[list[ExtractedParameterResult], list[CubicleDeviceResult]]:
    """
    Analyse one SLD page with GPT-4o vision.
    Returns (system_params, cubicle_devices).
    No Azure AI Vision required — GPT-4o reads the image directly.
    When param_defs is provided, system parameters and prompt are built dynamically.
    """
    if not image_base64:
        return [], []

    # Build lookup maps from param_defs when provided; fall back to hardcoded maps.
    if param_defs:
        unit_map = {p.key: p.unit for p in param_defs}
        enum_set = {p.key for p in param_defs if p.is_enum}
        allowed_map = {p.key: p.allowed_values for p in param_defs}
        prompt = _build_prompt(param_defs)
    else:
        unit_map = _UNIT_MAP
        enum_set = _ENUM_PARAMS
        allowed_map = {k: ALLOWED_VALUES.get(k, []) for k in _UNIT_MAP}
        prompt = _SYSTEM_PROMPT

    client  = settings.make_openai_client()
    b64     = _resize_if_needed(image_base64)
    mime    = _detect_mime(b64)
    data_url = f"data:{mime};base64,{b64}"

    try:
        completion = client.chat.completions.create(
            model=settings.azure_openai_vision_deployment,   # gpt-4o
            temperature=0,
            max_tokens=4096,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": data_url, "detail": "high"},
                        },
                        {
                            "type": "text",
                            "text": (
                                "Analyse this SLD. "
                                "For every cubicle where protection_functions is non-empty, "
                                "you MUST populate relay_model — scan all text near the relay "
                                "symbol, RELÈ box, or any nameplate in that panel column. "
                                "Also extract every distinct panel column (GENERALE MT, ARRIVO MT, "
                                "PARTENZA MT, TRAFO, etc.) as a separate cubicle_devices entry. "
                                "Return all system parameters and cubicle data."
                            ),
                        },
                    ],
                },
            ],
        )
    except Exception as exc:
        logger.error(f"[PathC-Vision] GPT-4o call failed page={page_number}: {exc}")
        return [], []

    raw_text = (completion.choices[0].message.content or "").strip()
    if not raw_text:
        logger.warning(f"[PathC-Vision] Empty response for page={page_number}")
        return [], []

    try:
        data = _json.loads(raw_text)
        raw = _SldAnalysis.model_validate(data)
    except (_json.JSONDecodeError, ValidationError) as parse_err:
        logger.warning(f"[PathC-Vision] JSON parse error page={page_number}: {parse_err} | raw={raw_text[:300]}")
        return [], []

    # ── System parameters ─────────────────────────────────────────────────
    valid_names = set(unit_map.keys())
    system_params: list[ExtractedParameterResult] = []

    for p in raw.system_params:
        if p.name not in valid_names or not p.value.strip():
            continue
        val = p.value.strip()
        if p.name in enum_set:
            val = normalize_enum_value(p.name, val)
        conf = _confidence(p.name, val, allowed_map.get(p.name))
        system_params.append(ExtractedParameterResult(
            name=p.name,
            value=val,
            unit=unit_map[p.name],
            confidence=conf,
            extraction_path="PathC",
            source_text=f"SLD page {page_number} — GPT-4o vision",
            source_page=page_number,
            instance_index=instance_index,
            flagged_for_review=conf < 0.80,
        ))

    # ── Relay model fix-up: CSH is a sensor not a relay; try targeted call ─
    _csh_pattern = lambda s: s.upper().startswith("CSH")
    needs_relay_lookup = any(
        d.protection_functions and (not d.relay_model or _csh_pattern(d.relay_model))
        for d in raw.cubicle_devices
    )
    if needs_relay_lookup:
        all_funcs = next(
            (d.protection_functions for d in raw.cubicle_devices if d.protection_functions),
            [],
        )
        resolved_model = _ask_relay_model_targeted(image_base64, all_funcs)
        for d in raw.cubicle_devices:
            if d.protection_functions and (not d.relay_model or _csh_pattern(d.relay_model)):
                d.relay_model = resolved_model
            elif _csh_pattern(d.relay_model):
                d.relay_model = ""

    # ── Cubicle devices ───────────────────────────────────────────────────
    cubicle_devices: list[CubicleDeviceResult] = []

    for i, d in enumerate(raw.cubicle_devices):
        if d.confidence < _MIN_DEVICE_CONFIDENCE:
            logger.debug(
                f"[PathC-Vision] dropped low-confidence device "
                f"pos={d.functional_position} conf={d.confidence:.2f}"
            )
            continue
        cubicle_devices.append(CubicleDeviceResult(
            functional_position=d.functional_position or f"Panel-{i + 1}",
            panel_type=d.panel_type,
            cb_model=d.cb_model,
            cb_rating=d.cb_rating,
            cb_breaking_capacity=d.cb_breaking_capacity,
            cb_making_capacity=d.cb_making_capacity,
            cb_mechanism_type=d.cb_mechanism_type,
            cb_number_of_poles=d.cb_number_of_poles,
            ct_ratio=d.ct_ratio,
            ct_accuracy_class=d.ct_accuracy_class,
            ct_burden=d.ct_burden,
            ct_core_type=d.ct_core_type,
            vt_ratio=d.vt_ratio,
            vt_accuracy_class=d.vt_accuracy_class,
            vt_burden=d.vt_burden,
            vt_insulation_level=d.vt_insulation_level,
            relay_model=d.relay_model,
            protection_functions=d.protection_functions,
            relay_aux_voltage=d.relay_aux_voltage,
            relay_comm_protocol=d.relay_comm_protocol,
            ds_count=d.ds_count,
            ds_operating_mode=d.ds_operating_mode,
            es_present=d.es_present,
            es_id=d.es_id,
            sa_present=d.sa_present,
            aux_control_voltage=d.aux_control_voltage,
            confidence=d.confidence,
            extraction_path="PathC",
            source_page=page_number,
            instance_index=instance_index,
        ))

    logger.info(
        f"[PathC-Vision] page={page_number}: "
        f"{len(system_params)} params, {len(cubicle_devices)} devices extracted"
    )
    return system_params, cubicle_devices


def _ask_relay_model_targeted(image_base64: str, protection_funcs: list[str]) -> str:
    """Focused secondary call to extract relay model when structured extraction returns CSH or empty."""
    client = settings.make_openai_client()
    b64 = _resize_if_needed(image_base64)
    mime = _detect_mime(b64)
    data_url = f"data:{mime};base64,{b64}"
    funcs_str = ", ".join(protection_funcs) if protection_funcs else "overcurrent"
    try:
        completion = client.chat.completions.create(
            model=settings.azure_openai_vision_deployment,
            temperature=0,
            max_tokens=50,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": data_url, "detail": "high"}},
                    {
                        "type": "text",
                        "text": (
                            f"This SLD has a protection relay with ANSI functions {funcs_str}. "
                            "What is the RELAY MODEL NAME? Look for a brand+model label on the "
                            "relay rectangle or RELÈ box — e.g. 'PowerLogic P3U30', 'Sepam 40', "
                            "'REF615', 'P3U30'. "
                            "CSH 120/160/200 is a CURRENT SENSOR not a relay — ignore it. "
                            "Reply with ONLY the relay model name, or 'unknown' if not visible."
                        ),
                    },
                ],
            }],
        )
        answer = (completion.choices[0].message.content or "").strip()
        if not answer or answer.lower() in ("unknown", "not visible", "none", "n/a"):
            return ""
        logger.info(f"[PathC-Vision] Relay targeted call returned: {answer!r}")
        return answer
    except Exception as exc:
        logger.warning(f"[PathC-Vision] Relay targeted call failed: {exc}")
        return ""
