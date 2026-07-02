import logging
from dataclasses import dataclass, field

from services.path_c.sld_ocr_service import OcrTextBlock

logger = logging.getLogger(__name__)


@dataclass
class SldRegions:
    title_block: list[OcrTextBlock] = field(default_factory=list)
    panel_headers: list[OcrTextBlock] = field(default_factory=list)
    annotations: list[OcrTextBlock] = field(default_factory=list)
    title_strategy: str = "none"        # diagnostic — which strategy found the title block


# Candidate strategies for title block location, ordered by ABB prevalence.
# Each entry is (label, x_min, x_max, y_min, y_max) in normalised 0–1 coordinates.
_TITLE_STRATEGIES: list[tuple[str, float, float, float, float]] = [
    ("bottom-right",  0.55, 1.00, 0.75, 1.00),   # standard ABB / Schneider
    ("bottom-left",   0.00, 0.45, 0.75, 1.00),   # some European formats
    ("right-band",    0.80, 1.00, 0.00, 1.00),   # portrait / narrow-margin SLDs
    ("top-right",     0.55, 1.00, 0.00, 0.25),   # less common; top title blocks
]


def _blocks_in_region(
    blocks: list[OcrTextBlock],
    x_min: float, x_max: float,
    y_min: float, y_max: float,
) -> list[OcrTextBlock]:
    return [
        b for b in blocks
        if x_min <= b.x <= x_max and y_min <= b.y <= y_max
    ]


def _detect_title_block(
    blocks: list[OcrTextBlock],
) -> tuple[list[OcrTextBlock], str]:
    """Try each title-block strategy; return the region with the most blocks."""
    best: list[OcrTextBlock] = []
    best_label = "none"
    for label, x_min, x_max, y_min, y_max in _TITLE_STRATEGIES:
        candidates = _blocks_in_region(blocks, x_min, x_max, y_min, y_max)
        if len(candidates) > len(best):
            best = candidates
            best_label = label
    # If all strategies find nothing, fall back: treat everything as annotations
    return best, best_label


def classify_regions(blocks: list[OcrTextBlock]) -> SldRegions:
    title, strategy = _detect_title_block(blocks)
    logger.debug(f"[PathC] title-block strategy={strategy} ({len(title)} blocks)")

    # Panel headers: repeating column pattern in the top 30%, excluding title area
    title_ids = {id(b) for b in title}
    top_area = [b for b in blocks if b.y < 0.30 and id(b) not in title_ids]
    panel_hdrs = _detect_column_pattern(top_area)

    classified = title_ids | {id(b) for b in panel_hdrs}
    annotations = [b for b in blocks if id(b) not in classified]

    return SldRegions(
        title_block=title,
        panel_headers=panel_hdrs,
        annotations=annotations,
        title_strategy=strategy,
    )


def _detect_column_pattern(blocks: list[OcrTextBlock]) -> list[OcrTextBlock]:
    if not blocks:
        return []
    # Group by x-position buckets of width 0.04 (finer than original 0.05)
    buckets: dict[int, list[OcrTextBlock]] = {}
    for b in blocks:
        key = int(b.x / 0.04)
        buckets.setdefault(key, []).append(b)
    # Require >= 3 items in a bucket to qualify as a panel header column
    result: list[OcrTextBlock] = []
    for items in buckets.values():
        if len(items) >= 3:
            result.extend(items)
    return result
