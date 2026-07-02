import asyncio
import re
import logging

from openai import OpenAI
from pydantic import BaseModel

from config import settings
from models.response import CubicleDeviceResult
from services.path_c.sld_panel_segmenter import PanelColumn

logger = logging.getLogger(__name__)


class _PanelDeviceData(BaseModel):
    panel_type: str = ""              # Incomer/Feeder/Coupler/Metering/Transformer/VT — empty if not determined
    functional_position: str = ""
    cb_model: str = ""
    cb_rating: str = ""
    cb_breaking_capacity: str = ""
    ct_ratio: str = ""                # format: "100/1A"
    ct_accuracy_class: str = ""
    vt_ratio: str = ""                # format: "22000/110V"
    vt_accuracy_class: str = ""
    relay_model: str = ""
    protection_functions: list[str] = []
    confidence: float


def _col_has_device_content(col: PanelColumn) -> bool:
    """Return True if the column is worth an LLM call."""
    # Accept any column with a header text OR at least 2 OCR blocks
    if col.header_text.strip():
        return True
    if len(col.blocks) >= 2:
        return True
    # Also accept if CT ratio or relay pattern present anywhere
    col_text = col.all_text
    has_ct = bool(re.search(r'\d+/\d+\s*[Aa]', col_text))
    has_relay = bool(re.search(r'REF|P1\d\d|MiCOM|SEL|7S[JKL]', col_text, re.IGNORECASE))
    return has_ct or has_relay


def _extract_one_column(
    col: PanelColumn,
    page_number: int,
    instance_index: int,
    client: OpenAI,
) -> CubicleDeviceResult | None:
    col_text = col.all_text
    if not col_text.strip():
        return None

    try:
        completion = client.beta.chat.completions.parse(
            model=settings.azure_openai_text_deployment,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You receive text from one panel column of an electrical SLD diagram. "
                        "Extract device data for this single panel/cubicle:\n"
                        "- panel_type: one of Incomer / Feeder / Coupler / Metering / Transformer / VT / Unknown\n"
                        "- functional_position: bay reference e.g. B01, F01, I01 (empty if not found)\n"
                        "- cb_model: circuit breaker model designation (empty if absent)\n"
                        "- cb_rating: rated current with unit e.g. '630A' (empty if absent)\n"
                        "- cb_breaking_capacity: short-circuit breaking capacity e.g. '25kA' (empty if absent)\n"
                        "- ct_ratio: CT ratio string e.g. '400/5A' (empty if absent)\n"
                        "- ct_accuracy_class: CT accuracy class e.g. '5P20' (empty if absent)\n"
                        "- vt_ratio: VT ratio string e.g. '22000/110V' (empty if absent)\n"
                        "- vt_accuracy_class: VT accuracy class e.g. '0.5' (empty if absent)\n"
                        "- relay_model: protection relay model e.g. 'REF630' (empty if absent)\n"
                        "- protection_functions: ANSI code list e.g. ['50/51','27'] (empty list if absent)\n"
                        "- confidence: 0.0–1.0 based on data clarity\n"
                        "The text may be in English, French, Italian, or German. Never invent values."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Panel header: {col.header_text}\n\nAll panel text: {col_text}",
                },
            ],
            response_format=_PanelDeviceData,
        )
        data = completion.choices[0].message.parsed
        if not data:
            return None

        return CubicleDeviceResult(
            functional_position=data.functional_position or col.bay_label,
            panel_type=data.panel_type,
            cb_model=data.cb_model,
            cb_rating=data.cb_rating,
            cb_breaking_capacity=data.cb_breaking_capacity,
            ct_ratio=data.ct_ratio,
            ct_accuracy_class=data.ct_accuracy_class,
            vt_ratio=data.vt_ratio,
            vt_accuracy_class=data.vt_accuracy_class,
            relay_model=data.relay_model,
            protection_functions=data.protection_functions,
            confidence=data.confidence,
            extraction_path="PathC",
            source_page=page_number,
            instance_index=instance_index,
        )
    except Exception as exc:
        logger.warning(
            f"[PathC-SF2] column {col.column_index} page={page_number} failed: {exc}"
        )
        return None


async def extract_devices_from_panels(
    columns: list[PanelColumn],
    page_number: int,
    instance_index: int = 1,
) -> list[CubicleDeviceResult]:

    client = settings.make_openai_client()

    eligible = [col for col in columns if _col_has_device_content(col)]
    logger.info(
        f"[PathC-SF2] page={page_number}: {len(eligible)}/{len(columns)} columns eligible"
    )

    if not eligible:
        return []

    tasks = [
        asyncio.to_thread(_extract_one_column, col, page_number, instance_index, client)
        for col in eligible
    ]
    raw_results = await asyncio.gather(*tasks, return_exceptions=True)

    results: list[CubicleDeviceResult] = []
    for r in raw_results:
        if isinstance(r, Exception):
            logger.warning(f"[PathC-SF2] page={page_number} task error: {r}")
        elif r is not None:
            results.append(r)

    logger.info(f"[PathC-SF2] page={page_number}: {len(results)} panels extracted")
    return results
