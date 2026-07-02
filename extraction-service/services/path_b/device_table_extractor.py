"""
Path B — Level 2 extraction.

Identifies CB schedule / equipment list pages in the specification document
and extracts per-cubicle device data as CubicleDeviceResult objects.
"""
import asyncio
import json as _json
import logging
import re
import time

from pydantic import BaseModel, ValidationError

from config import settings
from models.request import PageData, InstanceData
from models.response import CubicleDeviceResult

logger = logging.getLogger(__name__)

_LLM_MIN_CONFIDENCE = 0.3   # rows below this are kept but flagged_for_review
_MAX_RETRIES = 1
_RETRY_DELAY_S = 1

# Patterns that signal a CB schedule table header (EN/FR/IT/DE).
# Accent-stripped variants are included alongside accented originals so OCR
# output that drops diacritics (common with Azure DI on some fonts) still matches.
_HEADER_PATTERNS: list[str] = [
    # Position / reference column
    r"functional.?position|position fonctionnelle|posizione funzionale|funktionsstelle"
    r"|pos\.?\s|repere|rep[eè]re|position\b|poste\b",
    # Circuit breaker
    r"circuit.?breaker|cb.?type|disjoncteur|interruttore|leistungsschalter|cb.?model|dj\b",
    # Rated current
    r"rated.?current|courant.?nominal|corrente.?nominale|nennstrom|rated.?amp|intensite|intensité",
    # Current / voltage transformer
    r"ct.?ratio|transformateur.?courant|rapporto.?ta|stromwandler|current.?transformer|tc\b|ta\b",
    # Protection / relay
    r"protection|relay|relais|rel[eè]|schutzrelais|protection.?function|protection.?relay",
    # Panel function / type (accented and stripped variants)
    r"panel.?type|function|incomer|feeder|coupler|arrivee|arrivée|depart|départ|accoupleur",
]

# Require 2 distinct header patterns — reduces false positives on spec/cover pages
# that mention "rated current" or "protection" without being actual schedule tables.
_MIN_HEADER_MATCHES = 2

MAX_CONTEXT_CHARS = 16_000

_JSON_SCHEMA_HINT = """\
Return ONLY a JSON object with this exact schema (no markdown, no extra keys):
{
  "rows": [
    {
      "functional_position": "<string>",
      "instance_name": "<string or empty>",
      "row_instance_index": "<integer instance index from provided candidates or null>",
      "panel_type": "<Incomer|Feeder|Coupler|Metering|Transformer|VT|BusSection|Other>",
      "cb_model": "<string or empty>",
      "cb_rating": "<string e.g. 630A or empty>",
      "cb_breaking_capacity": "<string e.g. 25kA or empty>",
      "cb_making_capacity": "<string e.g. 63kA or empty>",
      "cb_mechanism_type": "<string e.g. Spring or empty>",
      "cb_number_of_poles": "<string e.g. 3 or empty>",
      "ct_ratio": "<string e.g. 400/5 or empty>",
      "ct_accuracy_class": "<string e.g. 5P20 or empty>",
      "ct_burden": "<string e.g. 15VA or empty>",
      "ct_core_type": "<string e.g. Protection/Metering or empty>",
      "vt_ratio": "<string e.g. 22000/110 or empty>",
      "vt_accuracy_class": "<string e.g. 0.5 or empty>",
      "vt_burden": "<string e.g. 50VA or empty>",
      "vt_insulation_level": "<string e.g. 28kV or empty>",
      "relay_model": "<string or empty>",
      "protection_functions": ["<ANSI code>", ...],
      "relay_aux_voltage": "<string e.g. 110VDC or empty>",
      "relay_comm_protocol": ["<protocol>", ...],
      "ds_count": "<string e.g. 2 or empty>",
      "ds_operating_mode": "<string e.g. Manual or empty>",
      "es_present": "<true|false or empty>",
      "es_id": "<string e.g. QZ1 or empty>",
      "sa_present": "<true|false or empty>",
      "aux_control_voltage": "<string e.g. 110VDC or empty>",
      "confidence": <0.0–1.0>
    }
  ]
}
Return only rows where functional_position is not empty."""


def _resolve_instance_index(page: PageData, instances: list[InstanceData]) -> int:
    if page.instance_index is not None and page.instance_index > 0:
        return page.instance_index
    if not instances:
        return 1
    if len(instances) == 1:
        return instances[0].instance_index

    text = (page.text or "").lower()
    for inst in instances:
        name = (inst.instance_name or "").strip().lower()
        if name and name in text:
            return inst.instance_index
    return instances[0].instance_index


def _is_device_schedule_page(text: str) -> bool:
    text_lower = text.lower()
    matches = sum(
        1 for pattern in _HEADER_PATTERNS if re.search(pattern, text_lower)
    )
    logger.debug(f"[PathB] page header pattern matches: {matches}/{len(_HEADER_PATTERNS)}")
    return matches >= _MIN_HEADER_MATCHES


class _DeviceRow(BaseModel):
    functional_position: str = ""
    instance_name: str = ""
    row_instance_index: int | None = None
    panel_type: str = ""
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
    confidence: float = 0.5


class _DeviceTableResult(BaseModel):
    rows: list[_DeviceRow] = []


def _extract_schedule_page(
    page: PageData,
    instances: list[InstanceData],
    default_instance_index: int,
    client,
) -> list[CubicleDeviceResult]:
    text = page.text[:MAX_CONTEXT_CHARS]

    last_exc: Exception | None = None
    for attempt in range(_MAX_RETRIES + 1):
        try:
            # Use json_object mode instead of beta structured-output .parse():
            # json_object works with all GPT-4o / GPT-4o-mini deployments regardless
            # of model snapshot version, avoiding structured-output compatibility issues.
            completion = client.chat.completions.create(
                model=settings.azure_openai_text_deployment,
                temperature=0,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are extracting switchgear cubicle data from an equipment schedule table. "
                            "The table may be in English, French, Italian, or German. "
                            "Extract ALL data rows from the table (skip only headers, footers, and totals). "
                            "Return one JSON row per cubicle/device row. Do not merge rows.\n"
                            "Instance assignment rules:\n"
                            "- Use row_instance_index when the row clearly maps to one provided switchgear instance.\n"
                            "- If the row contains an instance/switchboard name, copy it to instance_name exactly as seen.\n"
                            "- If instance is unclear, set row_instance_index to null and instance_name to ''.\n"
                            "Field extraction rules:\n"
                            "- functional_position: bay reference e.g. B01, F01, I01, or repère value\n"
                            "- panel_type: one of Incomer / Feeder / Coupler / Metering / Transformer / VT / BusSection / Other\n"
                            "  French: Arrivée→Incomer, Départ→Feeder, Couplage→Coupler, Comptage→Metering\n"
                            "- cb_model: circuit breaker model designation (empty string if absent)\n"
                            "- cb_rating: rated current with unit e.g. '630A' (empty if absent)\n"
                            "- cb_breaking_capacity: short-circuit breaking capacity e.g. '25kA' (empty if absent)\n"
                            "- cb_making_capacity: making capacity peak e.g. '63kA' (empty if absent)\n"
                            "- cb_mechanism_type: operating mechanism e.g. 'Spring' (empty if absent)\n"
                            "- cb_number_of_poles: number of poles e.g. '3' (empty if absent)\n"
                            "- ct_ratio: CT ratio string e.g. '400/5' (empty if absent)\n"
                            "- ct_accuracy_class: CT accuracy class e.g. '5P20' (empty if absent)\n"
                            "- ct_burden: CT burden e.g. '15VA' (empty if absent)\n"
                            "- ct_core_type: CT core designation e.g. 'Protection/Metering' (empty if absent)\n"
                            "- vt_ratio: VT ratio string e.g. '22000/110' (empty if absent)\n"
                            "- vt_accuracy_class: VT accuracy class e.g. '0.5' (empty if absent)\n"
                            "- vt_burden: VT burden e.g. '50VA' (empty if absent)\n"
                            "- vt_insulation_level: VT insulation level e.g. '28kV' (empty if absent)\n"
                            "- relay_model: protection relay model e.g. 'REF630' (empty if absent)\n"
                            "- protection_functions: list of ANSI code strings e.g. ['50','51','27'] (empty list if absent)\n"
                            "- relay_aux_voltage: relay auxiliary voltage e.g. '110VDC' (empty if absent)\n"
                            "- relay_comm_protocol: communication protocols list e.g. ['IEC61850','Modbus'] (empty list if absent)\n"
                            "- ds_count: number of disconnectors e.g. '2' (empty if absent)\n"
                            "- ds_operating_mode: disconnector operating mode e.g. 'Manual' (empty if absent)\n"
                            "- es_present: earthing switch present 'true' or 'false' (empty if not determinable)\n"
                            "- es_id: earthing switch label e.g. 'QZ1' (empty if absent)\n"
                            "- sa_present: surge arrester present 'true' or 'false' (empty if not determinable)\n"
                            "- aux_control_voltage: auxiliary/control supply voltage e.g. '110VDC' (empty if absent)\n"
                            "- confidence: 0.0–1.0 reflecting how clearly the row data is readable\n"
                            "Always emit all listed keys for every row. Use empty strings/lists for missing values; never invent values.\n"
                            "Do not infer from neighboring rows unless that value is explicitly a merged/table-spanning header applying to the current row.\n"
                            "\n" + _JSON_SCHEMA_HINT
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            "Instance candidates:\n"
                            + "\n".join(
                                f"- {inst.instance_index}: {inst.instance_name}" for inst in instances
                            )
                            + "\n\nTable text:\n"
                            + text
                        ),
                    },
                ],
            )
            raw = completion.choices[0].message.content or ""
            if not raw.strip():
                logger.warning(f"[PathB] device_schedule page={page.page_number} LLM returned empty content")
                return []

            try:
                data = _json.loads(raw)
                parsed = _DeviceTableResult.model_validate(data)
            except (_json.JSONDecodeError, ValidationError) as parse_err:
                logger.warning(
                    f"[PathB] device_schedule page={page.page_number} JSON parse error: {parse_err} | raw={raw[:300]}"
                )
                return []

            results = []
            for row in parsed.rows:
                if not row.functional_position.strip():
                    continue

                resolved_instance_index = default_instance_index
                if row.row_instance_index is not None:
                    candidate = int(row.row_instance_index)
                    if any(inst.instance_index == candidate for inst in instances):
                        resolved_instance_index = candidate

                results.append(
                    CubicleDeviceResult(
                        functional_position=row.functional_position,
                        panel_type=row.panel_type,
                        cb_model=row.cb_model,
                        cb_rating=row.cb_rating,
                        cb_breaking_capacity=row.cb_breaking_capacity,
                        cb_making_capacity=row.cb_making_capacity,
                        cb_mechanism_type=row.cb_mechanism_type,
                        cb_number_of_poles=row.cb_number_of_poles,
                        ct_ratio=row.ct_ratio,
                        ct_accuracy_class=row.ct_accuracy_class,
                        ct_burden=row.ct_burden,
                        ct_core_type=row.ct_core_type,
                        vt_ratio=row.vt_ratio,
                        vt_accuracy_class=row.vt_accuracy_class,
                        vt_burden=row.vt_burden,
                        vt_insulation_level=row.vt_insulation_level,
                        relay_model=row.relay_model,
                        protection_functions=row.protection_functions,
                        relay_aux_voltage=row.relay_aux_voltage,
                        relay_comm_protocol=row.relay_comm_protocol,
                        ds_count=row.ds_count,
                        ds_operating_mode=row.ds_operating_mode,
                        es_present=row.es_present,
                        es_id=row.es_id,
                        sa_present=row.sa_present,
                        aux_control_voltage=row.aux_control_voltage,
                        confidence=row.confidence,
                        extraction_path="PathB",
                        source_page=page.page_number,
                        instance_index=resolved_instance_index,
                        flagged_for_review=row.confidence < _LLM_MIN_CONFIDENCE,
                        deviation_reason=(
                            f"Low-confidence row ({row.confidence:.2f})"
                            if row.confidence < _LLM_MIN_CONFIDENCE
                            else ""
                        ),
                    )
                )
            logger.info(
                f"[PathB] device_schedule page={page.page_number} → {len(results)} row(s) extracted"
            )
            return results

        except Exception as exc:
            last_exc = exc
            exc_str = str(exc)
            # Daily quota exhausted — no point retrying until tomorrow
            if "UserByModelByDay" in exc_str or "per 86400s" in exc_str:
                logger.warning(
                    f"[PathB] device_schedule page={page.page_number} "
                    f"daily rate limit hit — skipping: {exc}"
                )
                return []
            # Retry on transient per-minute rate-limit or server errors only
            is_transient = any(
                marker in exc_str.lower()
                for marker in ("rate limit", "429", "503", "timeout", "connection")
            )
            if is_transient and attempt < _MAX_RETRIES:
                logger.warning(
                    f"[PathB] device_schedule page={page.page_number} "
                    f"transient error attempt {attempt+1}: {exc} — retrying"
                )
                time.sleep(_RETRY_DELAY_S)
            else:
                break

    logger.warning(f"[PathB] device_schedule page={page.page_number} failed: {last_exc}")
    return []


async def extract_device_schedules(
    pages: list[PageData],
    instances: list[InstanceData],
) -> list[CubicleDeviceResult]:
    """
    Scan all text pages for CB schedule tables and extract device rows in parallel.
    """
    text_pages = [p for p in pages if p.page_type != "sld" and p.text.strip()]
    schedule_pages = [p for p in text_pages if _is_device_schedule_page(p.text)]
    logger.info(
        f"[PathB] Scanned {len(text_pages)} text page(s), "
        f"found {len(schedule_pages)} device schedule page(s)"
    )

    if not schedule_pages:
        return []

    client = settings.make_openai_client()
    tasks = [
        asyncio.to_thread(
            _extract_schedule_page,
            page,
            instances,
            _resolve_instance_index(page, instances),
            client,
        )
        for page in schedule_pages
    ]
    batches = await asyncio.gather(*tasks, return_exceptions=True)

    results: list[CubicleDeviceResult] = []
    for batch in batches:
        if isinstance(batch, Exception):
            logger.warning(f"[PathB] device_schedule task error: {batch}")
        elif batch:
            results.extend(batch)

    logger.info(f"[PathB] Extracted {len(results)} device rows from schedule pages")
    return results
