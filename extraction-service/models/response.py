from pydantic import BaseModel, Field
from typing import Literal, Optional


class ExtractedParameterResult(BaseModel):
    name: str
    status: Literal["extracted", "not_extracted"] = "extracted"
    value: Optional[str] = None         # None when status == "not_extracted"
    unit: str = ""
    confidence: Optional[float] = None  # None when status == "not_extracted"
    extraction_path: str = ""           # "" when status == "not_extracted"
    source_text: str = ""
    source_page: int = 0
    source_bounding_box: str = ""
    instance_index: int = 1
    flagged_for_review: bool = False
    deviation_reason: str = ""


class CubicleDeviceResult(BaseModel):
    functional_position: str
    panel_type: str = ""               # empty when panel type could not be determined
    # Circuit Breaker
    cb_model: str = ""
    cb_rating: str = ""
    cb_breaking_capacity: str = ""
    cb_making_capacity: str = ""       # e.g. "63kA"
    cb_mechanism_type: str = ""        # e.g. "Spring"
    cb_number_of_poles: str = ""       # e.g. "3"
    # Current Transformer
    ct_ratio: str = ""
    ct_accuracy_class: str = ""
    ct_burden: str = ""                # e.g. "15VA"
    ct_core_type: str = ""             # e.g. "Protection/Metering"
    # Voltage Transformer
    vt_ratio: str = ""
    vt_accuracy_class: str = ""
    vt_burden: str = ""                # e.g. "50VA"
    vt_insulation_level: str = ""      # e.g. "28kV"
    # Protection Relay
    relay_model: str = ""
    protection_functions: list[str] = Field(default_factory=list)
    relay_aux_voltage: str = ""        # e.g. "110VDC"
    relay_comm_protocol: list[str] = Field(default_factory=list)  # e.g. ["IEC61850","Modbus"]
    # Disconnector
    ds_count: str = ""                 # e.g. "2"
    ds_operating_mode: str = ""        # e.g. "Manual"
    # Earthing Switch
    es_present: str = ""               # "true" / "false"
    es_id: str = ""                    # e.g. "QZ1"
    # Surge Arrester
    sa_present: str = ""               # "true" / "false"
    # Auxiliary / Control
    aux_control_voltage: str = ""      # e.g. "110VDC"
    # Metadata
    confidence: float
    extraction_path: str = "PathC"
    source_page: int = 0
    instance_index: int = 1
    flagged_for_review: bool = False
    deviation_reason: str = ""
    source_bounding_box: str = ""


class TopologySummary(BaseModel):
    total_panels: int = 0
    incomers: int = 0
    feeders: int = 0
    couplers: int = 0
    metering: int = 0
    transformers: int = 0
    busbar_sections: int = 1
    description: str = ""


class ExtractionResponse(BaseModel):
    document_id: int
    parameters: list[ExtractedParameterResult] = Field(default_factory=list)
    cubicle_devices: list[CubicleDeviceResult] = Field(default_factory=list)
    topology_summary: TopologySummary = Field(default_factory=TopologySummary)
    errors: list[str] = Field(default_factory=list)
