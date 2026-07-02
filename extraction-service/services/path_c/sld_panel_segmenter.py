import re
import statistics
from dataclasses import dataclass, field

from services.path_c.sld_ocr_service import OcrTextBlock

# Regex for bay reference labels like B01, F01, I01, A1, BC2
_BAY_LABEL_RE = re.compile(r'^[A-Z]{1,2}\d{1,3}[A-Z]?$')


@dataclass
class PanelColumn:
    column_index: int
    x_start: float
    x_end: float
    blocks: list[OcrTextBlock] = field(default_factory=list)

    @property
    def header_text(self) -> str:
        top_blocks = sorted(
            [b for b in self.blocks if b.y < 0.35], key=lambda b: b.y
        )
        return " ".join(b.text for b in top_blocks[:3])

    @property
    def all_text(self) -> str:
        return " | ".join(b.text for b in sorted(self.blocks, key=lambda b: b.y))

    @property
    def bay_label(self) -> str:
        """Best-effort bay reference extracted from top-20% blocks (e.g. 'B01', 'F03')."""
        top = [b for b in self.blocks if b.y < 0.20]
        for b in sorted(top, key=lambda b: b.y):
            if _BAY_LABEL_RE.match(b.text.strip()):
                return b.text.strip()
        return f"Panel-{self.column_index + 1}"


def _adaptive_gap_threshold(blocks: list[OcrTextBlock]) -> float:
    """Derive column-break threshold from the median x-gap between adjacent blocks."""
    if len(blocks) < 2:
        return 0.04
    sorted_x = sorted(b.x for b in blocks)
    gaps = [sorted_x[i + 1] - sorted_x[i] for i in range(len(sorted_x) - 1) if sorted_x[i + 1] - sorted_x[i] > 0]
    if not gaps:
        return 0.04
    median_gap = statistics.median(gaps)
    # Use 1.5× median, clamped to a reasonable range
    return max(0.03, min(0.12, median_gap * 1.5))


def segment_panels(blocks: list[OcrTextBlock], min_panels: int = 1) -> list[PanelColumn]:
    # Exclude title block region (bottom-right quadrant)
    diagram_blocks = [b for b in blocks if not (b.x > 0.55 and b.y > 0.75)]

    if not diagram_blocks:
        return []

    gap_threshold = _adaptive_gap_threshold(diagram_blocks)
    sorted_blocks = sorted(diagram_blocks, key=lambda b: b.x)

    raw_columns: list[PanelColumn] = []
    current_col_blocks: list[OcrTextBlock] = []
    current_x_start = sorted_blocks[0].x

    for i, block in enumerate(sorted_blocks):
        if i > 0:
            prev = sorted_blocks[i - 1]
            gap = block.x - prev.x - prev.width
            if gap > gap_threshold and current_col_blocks:
                x_end = prev.x + prev.width
                raw_columns.append(PanelColumn(
                    column_index=len(raw_columns),
                    x_start=current_x_start,
                    x_end=x_end,
                    blocks=current_col_blocks.copy(),
                ))
                current_col_blocks = []
                current_x_start = block.x
        current_col_blocks.append(block)

    if current_col_blocks:
        last = sorted_blocks[-1]
        raw_columns.append(PanelColumn(
            column_index=len(raw_columns),
            x_start=current_x_start,
            x_end=last.x + last.width,
            blocks=current_col_blocks,
        ))

    # Merge adjacent columns with negligible gap (< 0.01) — likely one panel split by a line
    merged = _merge_adjacent_columns(raw_columns, merge_gap=0.01)

    # Re-index after merging
    for idx, col in enumerate(merged):
        col.column_index = idx

    return merged if len(merged) >= min_panels else merged  # always return what we have


def _merge_adjacent_columns(
    columns: list[PanelColumn], merge_gap: float = 0.01
) -> list[PanelColumn]:
    if not columns:
        return []
    result: list[PanelColumn] = [columns[0]]
    for col in columns[1:]:
        prev = result[-1]
        gap = col.x_start - prev.x_end
        if gap < merge_gap:
            # Merge into previous
            merged = PanelColumn(
                column_index=prev.column_index,
                x_start=prev.x_start,
                x_end=col.x_end,
                blocks=prev.blocks + col.blocks,
            )
            result[-1] = merged
        else:
            result.append(col)
    return result
