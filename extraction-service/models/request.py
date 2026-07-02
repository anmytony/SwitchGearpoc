from pydantic import BaseModel
from typing import Optional


class PageData(BaseModel):
    page_number: int
    text: str = ""
    page_type: str = "text"                   # "text" | "sld"
    sld_image_base64: Optional[str] = None    # base64 PNG at 300 DPI, sent by .NET for SLD pages
    instance_index: Optional[int] = None


class InstanceData(BaseModel):
    instance_index: int
    instance_name: str


class ExtractionRequest(BaseModel):
    product_name: str = "Switchgear"   # drives parameter discovery via ABB filterSelector API
    document_id: int
    pages: list[PageData]
    instances: list[InstanceData]
    run_path_b: bool = True
    run_path_c: bool = True
    run_level2: bool = True  # False on 2nd multi-instance call — device schedules already extracted in pass 1
    pdf_base64: Optional[str] = None  # raw PDF bytes (base64) — used when .NET text extraction returns 0 pages
