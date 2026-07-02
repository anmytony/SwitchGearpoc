import base64
import io
import json
import logging
import time
import urllib.request
import urllib.error
from dataclasses import dataclass

from config import settings

logger = logging.getLogger(__name__)

_MAX_IMAGE_BYTES = 4_000_000
_MAX_DIMENSION_PX = 4096
_POLL_INTERVAL_S = 2
_POLL_MAX_ATTEMPTS = 20   # 40 s max — Azure DI SLD analysis rarely exceeds 30 s


@dataclass
class OcrTextBlock:
    text: str
    x: float        # normalised 0–1
    y: float
    width: float
    height: float
    confidence: float
    page: int


def _resize_if_needed(image_bytes: bytes) -> bytes:
    if len(image_bytes) <= _MAX_IMAGE_BYTES:
        return image_bytes
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))
        ratio = min(_MAX_DIMENSION_PX / img.width, _MAX_DIMENSION_PX / img.height, 1.0)
        if ratio < 1.0:
            new_w = int(img.width * ratio)
            new_h = int(img.height * ratio)
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            logger.warning(f"[PathC-OCR] Image resized to {new_w}x{new_h}")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        return buf.getvalue()
    except ImportError:
        logger.warning("[PathC-OCR] Pillow not available — sending image as-is")
        return image_bytes


def run_sld_ocr(image_base64: str, page_number: int) -> list[OcrTextBlock]:
    if not settings.azure_di_endpoint or not settings.azure_di_api_key:
        logger.warning("[PathC-OCR] Azure DI not configured — skipping OCR")
        return []

    raw_bytes = base64.b64decode(image_base64)
    image_bytes = _resize_if_needed(raw_bytes)

    endpoint = settings.azure_di_endpoint.rstrip("/")
    analyze_url = (
        f"{endpoint}/documentintelligence/documentModels/prebuilt-read:analyze"
        f"?api-version=2024-02-29-preview"
    )

    # Step 1: Submit the image for analysis
    try:
        req = urllib.request.Request(
            analyze_url,
            data=image_bytes,
            headers={
                "Ocp-Apim-Subscription-Key": settings.azure_di_api_key,
                "Content-Type": "application/octet-stream",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            operation_url = resp.headers.get("Operation-Location")
        if not operation_url:
            logger.error("[PathC-OCR] No Operation-Location header in DI response")
            return []
    except Exception as exc:
        logger.error(f"[PathC-OCR] DI submit failed: {exc}")
        return []

    # Step 2: Poll until succeeded or failed
    result: dict = {}
    for attempt in range(_POLL_MAX_ATTEMPTS):
        time.sleep(_POLL_INTERVAL_S)
        try:
            poll_req = urllib.request.Request(
                operation_url,
                headers={"Ocp-Apim-Subscription-Key": settings.azure_di_api_key},
            )
            with urllib.request.urlopen(poll_req, timeout=30) as resp:
                result = json.loads(resp.read().decode())
            status = result.get("status", "")
            if status == "succeeded":
                break
            if status == "failed":
                logger.error(f"[PathC-OCR] DI analysis failed: {result}")
                return []
            logger.debug(f"[PathC-OCR] DI status={status} attempt={attempt + 1}")
        except Exception as exc:
            logger.error(f"[PathC-OCR] DI poll error: {exc}")
            return []
    else:
        logger.error("[PathC-OCR] DI analysis timed out after polling")
        return []

    # Step 3: Map DI lines → OcrTextBlock
    # DI polygon is a flat array [x0,y0,x1,y1,x2,y2,x3,y3] in page units (pixels for images)
    pages = result.get("analyzeResult", {}).get("pages", [])
    if not pages:
        return []

    page_data = pages[0]
    img_w = page_data.get("width", 1) or 1
    img_h = page_data.get("height", 1) or 1

    blocks: list[OcrTextBlock] = []
    for line in page_data.get("lines", []):
        polygon = line.get("polygon", [])
        if len(polygon) < 8:
            continue
        xs = polygon[0::2]
        ys = polygon[1::2]
        words = line.get("words", [])
        conf = (
            sum(w.get("confidence", 0.9) for w in words) / len(words)
            if words else 0.9
        )
        blocks.append(OcrTextBlock(
            text=line["content"],
            x=min(xs) / img_w,
            y=min(ys) / img_h,
            width=(max(xs) - min(xs)) / img_w,
            height=(max(ys) - min(ys)) / img_h,
            confidence=conf,
            page=page_number,
        ))

    logger.info(f"[PathC-OCR] page={page_number}: {len(blocks)} text blocks extracted")
    return blocks
