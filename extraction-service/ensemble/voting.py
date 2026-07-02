from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from services.abb_configurator import ParameterDefinition

from models.response import ExtractedParameterResult

ALLOWED_VALUES: dict[str, list] = {
    # IEC 62271-1 Table 1 — standard rated voltages (Um)
    "OperatingVoltage":          [3.6, 6, 7.2, 10, 12, 15, 17.5, 20, 24, 33, 36, 40.5, 52],
    # IEC 62271-100 — standard short-circuit breaking currents
    "ShortCircuitLevel":         [12.5, 16, 20, 25, 31.5, 40, 50, 63],
    # IEC 62271-200 Table 1 standard busbar currents (1000 is IEC standard; 1200 tolerated in practice)
    "RatedBusbarCurrent":        [630, 800, 1000, 1200, 1250, 1600, 2000, 2500, 3150, 4000],
    # IEC 62271-200 standard panel/feeder currents (1000 tolerated for older specs)
    "PanelRatedCurrent":         [400, 630, 800, 1000, 1200, 1250, 1600, 2000, 2500],
    "Frequency":                 [50, 60],
    "Market":                    ["IEC", "ANSI"],
    "BusbarArrangement":         ["Single busbar", "Double busbar", "Double Level"],
    "Insulation":                ["AIS", "GIS (Dry Air)", "GIS (SF6)", "GIS (SF6-free)"],
    "Distribution":              ["Primary", "Secondary"],
    "IngressProtection":         ["IP31", "IP33", "IP41", "IP43", "IP44", "IP54", "IP55", "IP65"],
    "InternalArcClassification": ["IAC A", "IAC B", "IAC AB", "IAC AFL", "IAC AFLR"],
    "NeutralEarthingMethod":     ["Solid", "NGR", "Petersen coil", "Isolated", "TN-S", "TN-C-S", "TT", "IT"],
}

ALL_PARAMETER_NAMES: list[str] = [
    "OperatingVoltage",
    "ShortCircuitLevel",
    "RatedBusbarCurrent",
    "PanelRatedCurrent",
    "Frequency",
    "Market",
    "BusbarArrangement",
    "Insulation",
    "Distribution",
    "IngressProtection",
    "InternalArcClassification",
    "TotalCubicles",
    "NumberOfIncomers",
    "NumberOfFeeders",
    "NumberOfBusCouplers",
    "NeutralEarthingMethod",
]


def vote(
    path_b: list[ExtractedParameterResult],
    path_c: list[ExtractedParameterResult],
    param_defs: list[ParameterDefinition] | None = None,
) -> list[ExtractedParameterResult]:
    # Build dynamic allowed values and parameter name list from param_defs when provided.
    # Falls back to the hardcoded ALLOWED_VALUES / ALL_PARAMETER_NAMES for backward compat.
    if param_defs:
        active_allowed  = {p.key: [v for v in p.allowed_values] for p in param_defs}
        active_names    = [p.key for p in param_defs]
        active_name_set = set(active_names)
    else:
        active_allowed  = ALLOWED_VALUES
        active_names    = ALL_PARAMETER_NAMES
        active_name_set = set(active_names)

    # Collect (name, instance_index) pairs — when param_defs are provided, restrict to
    # the product's filter-API keys so Path C's hardcoded Switchgear names (OperatingVoltage,
    # Frequency, Insulation, Distribution …) do not pollute non-Switchgear products.
    all_keys = set(
        (p.name, p.instance_index)
        for p in path_b + path_c
        if p.name in active_name_set
    )

    results: list[ExtractedParameterResult] = []

    for name, instance_idx in all_keys:
        b = next((p for p in path_b if p.name == name and p.instance_index == instance_idx), None)
        c = next((p for p in path_c if p.name == name and p.instance_index == instance_idx), None)

        if b and c:
            if _values_agree(b.value, c.value):
                winner = b if (b.confidence or 0) >= (c.confidence or 0) else c
                winner.confidence = min(0.99, (winner.confidence or 0.75) + 0.10)
                winner.flagged_for_review = winner.confidence < 0.75
                results.append(winner)
            else:
                # Contradiction — only real reason to lower confidence.
                b.confidence = 0.50
                b.flagged_for_review = True
                b.deviation_reason = (
                    f"Contradiction: PathB={b.value}, PathC={c.value}"
                )
                results.append(b)
        elif b:
            b.flagged_for_review = (b.confidence or 0) < 0.75
            results.append(b)
        elif c:
            c.flagged_for_review = (c.confidence or 0) < 0.75
            results.append(c)

    results = _validate(results, active_allowed)

    # Determine all instance indices that produced results.
    active_instances = {r.instance_index for r in results if r.status != "not_extracted"}
    if not active_instances:
        active_instances = {1}

    # Per-instance: infer Distribution from OperatingVoltage when missing
    # (only if Distribution and OperatingVoltage are both in the active parameter set).
    dist_key    = next((k for k in active_names if k.lower() == "distribution"), None)
    voltage_key = next((k for k in active_names if "voltage" in k.lower() or k.lower() in ("operatingvoltage", "ratedvoltage")), None)
    for inst_idx in active_instances:
        inst_names = {r.name for r in results
                      if r.instance_index == inst_idx and r.status != "not_extracted"}
        if dist_key and dist_key not in inst_names and voltage_key:
            voltage = next(
                (r for r in results
                 if r.name == voltage_key and r.value and r.instance_index == inst_idx),
                None,
            )
            if voltage:
                try:
                    kv = float(voltage.value)
                    inferred = "Secondary" if kv <= 36 else "Primary"
                    results.append(ExtractedParameterResult(
                        name=dist_key,
                        value=inferred,
                        unit="",
                        confidence=0.50,
                        extraction_path="Inferred",
                        source_text=f"Inferred from {voltage_key}={kv} kV",
                        source_page=voltage.source_page,
                        instance_index=inst_idx,
                        flagged_for_review=True,
                    ))
                except (ValueError, TypeError):
                    pass

    # Per-instance: emit explicit not_extracted entries for any missing parameter.
    for inst_idx in active_instances:
        inst_names = {r.name for r in results if r.instance_index == inst_idx}
        for name in active_names:
            if name not in inst_names:
                results.append(ExtractedParameterResult(
                    name=name,
                    status="not_extracted",
                    value=None,
                    confidence=None,
                    extraction_path="",
                    instance_index=inst_idx,
                ))

    return results


def _values_agree(a: str | None, b: str | None) -> bool:
    if a is None or b is None:
        return False
    try:
        return abs(float(a) - float(b)) < 0.01
    except ValueError:
        return a.strip().lower() == b.strip().lower()


def _validate(
    params: list[ExtractedParameterResult],
    allowed_values_map: dict | None = None,
) -> list[ExtractedParameterResult]:
    av = allowed_values_map if allowed_values_map is not None else ALLOWED_VALUES
    for p in params:
        if p.status == "not_extracted" or p.value is None:
            continue
        allowed = av.get(p.name)
        if not allowed:
            continue
        try:
            num = float(p.value)
            if num not in allowed:
                p.flagged_for_review = True
                p.deviation_reason = (
                    (p.deviation_reason + " " if p.deviation_reason else "")
                    + f"NonStandardValue={p.value}"
                )
        except ValueError:
            if p.value not in allowed:
                p.flagged_for_review = True
    return params
