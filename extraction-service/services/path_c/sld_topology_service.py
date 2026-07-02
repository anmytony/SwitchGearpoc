import logging

from models.response import CubicleDeviceResult, TopologySummary

logger = logging.getLogger(__name__)

PANEL_TYPE_KEYWORDS: dict[str, list[str]] = {
    "Incomer":     ["arriv", "incom", "arrivée", "arrivo", "einspeise", "incoming", "source"],
    "Feeder":      ["départ", "feeder", "sortie", "partenza", "abgang", "outgoing", "load"],
    "Coupler":     ["couplage", "coupler", "bus-tie", "accoppiatore", "kupplung", "bustie", "tie"],
    "Metering":    ["comptage", "metering", "mesure", "misura", "messung", "meter"],
    "Transformer": ["transfo", "transformer", "trasformatore", "transformateur", "trafo"],
    "VT":          ["vt panel", "voltage transformer", "pt panel", "transformateur de tension",
                    "trasformatore tensione", "spannungswandler", "vt feeder"],
    "BusRiser":    ["remontée", "bus riser", "risalita", "riser"],
}


def classify_panel_type(text: str) -> str:
    lower = text.lower()
    for panel_type, keywords in PANEL_TYPE_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return panel_type
    return "Unknown"


def _deduplicate(devices: list[CubicleDeviceResult]) -> list[CubicleDeviceResult]:
    """
    Keep the highest-confidence device when multiple paths report the same
    functional_position on the same source page.
    """
    seen: dict[tuple[str, int], CubicleDeviceResult] = {}
    for d in devices:
        key = (d.functional_position.strip().lower(), d.source_page)
        existing = seen.get(key)
        if existing is None or d.confidence > existing.confidence:
            seen[key] = d
    return list(seen.values())


def build_topology(devices: list[CubicleDeviceResult]) -> TopologySummary:
    # Reclassify Unknown panels without mutating the originals
    reclassified: list[CubicleDeviceResult] = []
    for d in devices:
        if not d.panel_type or d.panel_type == "Unknown":
            guessed = classify_panel_type(d.functional_position)
            if guessed != "Unknown":
                d = d.model_copy(update={"panel_type": guessed})
        reclassified.append(d)

    # Deduplicate before counting — prevents double-counting when
    # Path B and Path C both extract the same device
    unique = _deduplicate(reclassified)

    counts = {
        t: sum(1 for d in unique if d.panel_type == t)
        for t in ["Incomer", "Feeder", "Coupler", "Metering", "Transformer", "VT"]
    }

    # Each coupler splits the busbar into one additional section
    busbar_sections = max(1, counts["Coupler"] + 1)

    parts = [f"{counts['Incomer']} incomer(s)"]
    if counts["Coupler"]:
        parts.append(f"{counts['Coupler']} coupler(s)")
    parts.append(f"{counts['Feeder']} feeder(s)")
    if counts["Metering"]:
        parts.append(f"{counts['Metering']} metering panel(s)")
    if counts["Transformer"]:
        parts.append(f"{counts['Transformer']} transformer(s)")
    if counts["VT"]:
        parts.append(f"{counts['VT']} VT panel(s)")
    parts.append(f"{busbar_sections} busbar section(s)")
    desc = " + ".join(parts)

    logger.info(f"[PathC-SF3] Topology: {desc} (from {len(unique)} unique panels)")

    return TopologySummary(
        total_panels=len(unique),
        incomers=counts["Incomer"],
        feeders=counts["Feeder"],
        couplers=counts["Coupler"],
        metering=counts["Metering"],
        transformers=counts["Transformer"],
        busbar_sections=busbar_sections,
        description=desc,
    )
