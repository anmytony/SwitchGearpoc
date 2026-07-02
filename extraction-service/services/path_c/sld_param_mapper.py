import logging

from openai import OpenAI
from pydantic import BaseModel

from config import settings
from ensemble.voting import ALLOWED_VALUES
from models.response import ExtractedParameterResult
from services.path_b.normalizer import normalize_enum_value
from services.path_c.sld_region_classifier import SldRegions

logger = logging.getLogger(__name__)


class _SldSystemParams(BaseModel):
    OperatingVoltage: str = ""
    ShortCircuitLevel: str = ""
    RatedBusbarCurrent: str = ""
    PanelRatedCurrent: str = ""
    Frequency: str = ""
    Market: str = ""
    BusbarArrangement: str = ""
    Insulation: str = ""
    Distribution: str = ""
    IngressProtection: str = ""
    InternalArcClassification: str = ""


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
}

# Enum params that need multilingual → canonical normalization
_ENUM_PARAMS = {"Market", "BusbarArrangement", "Insulation", "Distribution"}


def _compute_confidence(param_name: str, value: str) -> float:
    allowed = ALLOWED_VALUES.get(param_name, [])
    if not allowed:
        return 0.80
    try:
        num = float(value.replace(",", "."))
        return 0.90 if num in allowed else 0.60
    except ValueError:
        match = any(str(a).lower() == value.strip().lower() for a in allowed)
        return 0.90 if match else 0.60


def extract_system_params_from_sld(
    regions: SldRegions,
    page_number: int,
    instance_index: int = 1,
) -> list[ExtractedParameterResult]:

    client = settings.make_openai_client()

    title_text = "\n".join(
        f"  [{b.x:.2f},{b.y:.2f}] {b.text}" for b in regions.title_block
    )
    annot_text = "\n".join(
        f"  [{b.x:.2f},{b.y:.2f}] {b.text}" for b in regions.annotations[:80]
    )

    completion = client.beta.chat.completions.parse(
        model=settings.azure_openai_vision_deployment,
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": (
                    "You receive text extracted from an electrical switchgear SLD diagram "
                    "title block and annotations. Each line is: [x,y] text.\n"
                    "Extract these electrical parameters (return empty string if not found, never invent):\n"
                    "- OperatingVoltage: rated voltage in kV (numeric only, e.g. '24')\n"
                    "- ShortCircuitLevel: short-circuit current in kA (numeric only, e.g. '25')\n"
                    "- RatedBusbarCurrent: busbar rated current in A (numeric only, e.g. '2000')\n"
                    "- PanelRatedCurrent: feeder / panel rated current in A (numeric only)\n"
                    "- Frequency: 50 or 60 (numeric only)\n"
                    "- Market: 'IEC' or 'ANSI' (look for IEC/ANSI/IEEE/NEMA standard references)\n"
                    "- BusbarArrangement: e.g. 'Single busbar', 'Double busbar', 'Double Level', "
                    "or multilingual equivalents (simple/simple jeu de barres/doppelt)\n"
                    "- Insulation: e.g. 'AIS', 'GIS (SF6)', 'GIS (Dry Air)', 'GIS (SF6-free)', "
                    "or multilingual equivalents\n"
                    "- Distribution: 'Primary' or 'Secondary' (or multilingual equivalents)\n"
                    "- IngressProtection: IP degree e.g. 'IP31', 'IP54'\n"
                    "- InternalArcClassification: IAC class e.g. 'IAC A', 'ClassA', 'IAC_AFL'\n"
                    "The document may be in English, French, Italian, or German."
                ),
            },
            {
                "role": "user",
                "content": f"TITLE BLOCK TEXT:\n{title_text}\n\nANNOTATION TEXT:\n{annot_text}",
            },
        ],
        response_format=_SldSystemParams,
    )

    raw = completion.choices[0].message.parsed
    if not raw:
        return []

    results: list[ExtractedParameterResult] = []
    for param_name, unit in _UNIT_MAP.items():
        val = getattr(raw, param_name, "").strip()
        if not val:
            continue

        # Normalise multilingual enum strings to canonical ABB values
        if param_name in _ENUM_PARAMS:
            val = normalize_enum_value(param_name, val)

        confidence = _compute_confidence(param_name, val)
        results.append(
            ExtractedParameterResult(
                name=param_name,
                value=val,
                unit=unit,
                confidence=confidence,
                extraction_path="PathC",
                source_text=f"SLD title block page {page_number}",
                source_page=page_number,
                instance_index=instance_index,
                flagged_for_review=confidence < 0.80,
            )
        )

    logger.info(f"[PathC-SF1] page={page_number}: {len(results)} system params extracted")
    return results
