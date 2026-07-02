"""
BOM-oriented parameter definitions — one comprehensive schema per product family.

Replaces the ABB filterSelector API as the source of what to extract.
filterSelector returns ~13 ABB-configurator fields; a BOM requires ~40
electrical / mechanical / commercial parameters.

Two groups per product:
  "system" — global parameters on system-requirements pages (page 1–2)
  "panel"  — per-panel component parameters on panel-schedule / SLD pages (page 2+)

Usage:
  from services.bom_parameters import get_bom_param_defs
  system_defs = get_bom_param_defs("SafeRing", "system")
  panel_defs  = get_bom_param_defs("SafeRing", "panel")
"""
from __future__ import annotations
from services.abb_configurator import ParameterDefinition


def _p(
    key: str,
    label: str,
    unit: str = "",
    allowed_values: list[str] | None = None,
    is_enum: bool | None = None,
) -> ParameterDefinition:
    avs = allowed_values or []
    ie  = is_enum if is_enum is not None else bool(avs)
    return ParameterDefinition(
        key=key,
        identifier=f"BOM.{key}",
        prop_name=key,
        label=label,
        unit=unit,
        allowed_values=avs,
        is_enum=ie,
    )


# ── SafeRing / SafePlus ───────────────────────────────────────────────────────

_SR_SYSTEM: list[ParameterDefinition] = [
    _p("Market",              "Market",
       allowed_values=["All", "Europe", "Asia Pacific", "Americas", "MEA", "Global"]),
    _p("Product",             "Product Variant",
       allowed_values=["SafeRing (GIS)", "SafePlus (GIS)"], is_enum=False),
    _p("Standard",            "Applicable Standard",
       allowed_values=["IEC 62271-200", "IEC 62271-100", "ANSI/IEEE C37.20.2"]),
    _p("RatedVoltage",        "Rated Voltage [kV]",               unit="kV",
       allowed_values=["12", "17.5", "24"]),
    _p("PowerFreqWithstand",  "Power Frequency Withstand [kV]",   unit="kV",
       allowed_values=["28", "38", "50"]),
    _p("LightningImpulse",    "Lightning Impulse BIL [kV]",       unit="kV",
       allowed_values=["75", "95", "125"]),
    _p("ShortCircuit",        "Short-Circuit Current [kA]",       unit="kA",
       allowed_values=["16", "20", "25"]),
    _p("ShortCircuitDuration","Short-Circuit Duration [s]",       unit="s",
       allowed_values=["1", "3"]),
    _p("BbCurrent",           "Busbar Continuous Current [A]",    unit="A",
       allowed_values=["630", "1250"]),
    _p("NumberOfPanels",      "Number of Panels",                 is_enum=False),
    _p("InternalArc",         "Internal Arc Classification",
       allowed_values=["AFL", "AB", "A", "None"]),
    _p("IpDegree",            "Degree of Protection",
       allowed_values=["IP 65", "IP 54", "IP 44"]),
    _p("InsulatingMedium",    "Insulating Medium",
       allowed_values=["SF6", "SF6-free", "Air"]),
    _p("Frequency",           "System Frequency [Hz]",            unit="Hz",
       allowed_values=["50", "60"]),
    _p("AmbientTemp",         "Ambient Temperature Range",        is_enum=False),
    _p("Application",         "Application",
       allowed_values=["With MV metering", "Without MV metering", "Standard"]),
    _p("InternalLighting",    "Internal Lighting",
       allowed_values=["Yes", "No"]),
    _p("Heaters",             "Anti-condensation Heaters",
       allowed_values=["Yes", "No"]),
    _p("MotorizedCB",         "Motorized Circuit Breaker",
       allowed_values=["Yes", "No"]),
    _p("CableEntry",          "Cable Entry Direction",
       allowed_values=["Bottom", "Top", "Front", "Rear", "Both"]),
    _p("AuxVoltage",          "Auxiliary / Control Voltage",
       allowed_values=["24 VDC", "48 VDC", "110 VDC", "220 VDC", "230 VAC", "110 VAC"]),
    _p("DeliveryWeeks",       "Delivery Lead Time [weeks]",       unit="weeks", is_enum=False),
    _p("WarrantyMonths",      "Warranty Period [months]",         unit="months", is_enum=False),
]

_SR_PANEL: list[ParameterDefinition] = [
    _p("PanelFunction",       "Panel Function",
       allowed_values=["Ring Incomer", "Ring Through", "Outgoing Feeder",
                       "Bus Section Coupler", "Metering", "Bus VT"]),
    _p("PanelType",           "Panel Type",
       allowed_values=["Circuit Breaker (Feeder)", "LBS", "Coupler",
                       "Metering", "Bus VT Panel"]),
    _p("Configuration",       "Configuration Code",               is_enum=False),
    _p("CtProtectionRatio",   "CT Protection Ratio",              is_enum=False),
    _p("CtProtectionClass",   "CT Protection Accuracy Class",
       allowed_values=["5P10", "5P20", "10P10", "10P20"]),
    _p("CtProtectionBurden",  "CT Protection Burden [VA]",        unit="VA", is_enum=False),
    _p("CtMeteringRatio",     "CT Metering Ratio",                is_enum=False),
    _p("CtMeteringClass",     "CT Metering Accuracy Class",
       allowed_values=["0.2S", "0.5S", "0.2", "0.5", "1"], is_enum=False),
    _p("CtMeteringBurden",    "CT Metering Burden [VA]",          unit="VA", is_enum=False),
    _p("VtRatio",             "VT Ratio",                         is_enum=False),
    _p("VtClass",             "VT Accuracy Class",
       allowed_values=["0.2", "0.5", "1", "3P", "6P"], is_enum=False),
    _p("VtBurden",            "VT Burden [VA]",                   unit="VA", is_enum=False),
    _p("RelayModel",          "Protection Relay Model",
       allowed_values=["REF615", "REF630", "REM615", "RED615", "REQ615",
                       "Sepam 10", "Sepam 20", "Sepam 40",
                       "MiCOM P127", "MiCOM P141", "MiCOM P142",
                       "PowerLogic P3U30", "PowerLogic P5", "PowerLogic P6",
                       "Easergy P3", "Easergy P5",
                       "7SJ85", "SIPROTEC 5", "None"],
       is_enum=False),
    _p("RelayFunctions",      "Protection Functions (ANSI)",      is_enum=False),
    _p("EarthingSwitch",      "Earthing Switch Type",
       allowed_values=["Manual", "Motor operated", "None"]),
    _p("MotorVoltage",        "Motor / Coil Operating Voltage",
       allowed_values=["24 VDC", "48 VDC", "110 VDC", "220 VDC", "230 VAC", "110 VAC", "None"]),
]


# ── Switchgear (UniGear, UniSec, ZS1, ZS2, etc.) ─────────────────────────────

_SW_SYSTEM: list[ParameterDefinition] = [
    _p("Market",              "Market",
       allowed_values=["IEC", "ANSI", "All", "Europe", "Global"]),
    _p("Product",             "Product / Switchgear Type",
       allowed_values=["UniGear ZS1", "UniGear ZS2", "UniSec", "UniGear ZS1.2",
                       "ZX0", "ZX1", "ZX2", "HAX",
                       "SM6", "SM AirSet", "RM6", "PIX",
                       "NXPLUS C", "8DJH", "8DA10",
                       "Metal-clad AIS", "Metal-enclosed AIS", "GIS", "Hybrid"],
       is_enum=False),
    _p("Standard",            "Applicable Standard",
       allowed_values=["IEC 62271-200", "IEC 62271-100", "ANSI/IEEE C37.20.2"]),
    _p("RatedVoltage",        "Rated Voltage [kV]",               unit="kV",
       allowed_values=["12", "17.5", "20", "24", "36", "40.5"]),
    _p("PowerFreqWithstand",  "Power Frequency Withstand [kV]",   unit="kV",
       allowed_values=["28", "38", "50", "70", "80"]),
    _p("LightningImpulse",    "Lightning Impulse BIL [kV]",       unit="kV",
       allowed_values=["75", "95", "125", "145", "170"]),
    _p("ShortCircuit",        "Short-Circuit Breaking Current [kA]", unit="kA",
       allowed_values=["16", "20", "25", "31.5", "40", "50"]),
    _p("ShortCircuitDuration","Short-Circuit Duration [s]",       unit="s",
       allowed_values=["1", "3"]),
    _p("BusBbarCurrent",      "Busbar Continuous Current [A]",    unit="A",
       allowed_values=["630", "1250", "1600", "2000", "2500", "3150", "4000"]),
    _p("NumberOfPanels",      "Number of Panels / Cubicles",      is_enum=False),
    _p("InternalArc",         "Internal Arc Classification",
       allowed_values=["AFL", "AFLR", "AB", "A", "None"]),
    _p("IpDegree",            "Degree of Protection",
       allowed_values=["IP21", "IP31", "IP 31", "IP3X", "IP 3X",
                       "IP41", "IP 41", "IP4X", "IP 4X",
                       "IP54", "IP 54", "IP65", "IP 65"]),
    _p("Enclosure",           "Enclosure Type",
       allowed_values=["Metal-clad AIS", "Metal-clad withdrawable", "Metal-clad fixed",
                       "Metal-enclosed fixed", "Metal-enclosed withdrawable", "GIS"]),
    _p("BusBbarArrangement",  "Busbar Arrangement",
       allowed_values=["Single busbar", "Double busbar", "1.5 breaker", "Triple busbar"]),
    _p("CbType",              "Circuit Breaker Type / Model",
       allowed_values=["VD4", "HD4", "VM1", "VD4/R", "HVX", "CVX", "Evolis",
                       "3AH5", "SIRIUS 3", "Vacuum CB", "SF6 CB"]),
    _p("Frequency",           "System Frequency [Hz]",            unit="Hz",
       allowed_values=["50", "60"]),
    _p("AmbientTemp",         "Ambient Temperature Range",        is_enum=False),
    _p("NeutralEarthing",     "Neutral Earthing Method",
       allowed_values=["Solid", "NGR", "Resistor-grounded", "Petersen coil", "Isolated"]),
    _p("InternalLighting",    "Internal Lighting",
       allowed_values=["Yes", "No"]),
    _p("Heaters",             "Anti-condensation Heaters",
       allowed_values=["Yes", "No"]),
    _p("AuxVoltage",          "Auxiliary / Control Voltage",
       allowed_values=["24 VDC", "48 VDC", "110 VDC", "220 VDC", "230 VAC", "110 VAC"]),
    _p("DeliveryWeeks",       "Delivery Lead Time [weeks]",       unit="weeks", is_enum=False),
    _p("WarrantyMonths",      "Warranty Period [months]",         unit="months", is_enum=False),
]

_SW_PANEL: list[ParameterDefinition] = [
    _p("PanelFunction",       "Panel / Cubicle Function",
       allowed_values=["Incomer", "Outgoing Feeder", "Bus Section Coupler",
                       "Motor Feeder", "Capacitor Feeder", "Metering", "Bus VT"]),
    _p("FunctionalUnit",      "Functional Unit Type",
       allowed_values=["Withdrawable CB", "Fixed CB", "Disconnector", "Metering", "Bus PT"]),
    _p("CbRatedCurrent",      "CB Rated Current [A]",             unit="A",   is_enum=False),
    _p("CbBreakingCapacity",  "CB Breaking Capacity [kA]",        unit="kA",  is_enum=False),
    _p("CtProtectionRatio",   "CT Protection Ratio",              is_enum=False),
    _p("CtProtectionClass",   "CT Protection Accuracy Class",
       allowed_values=["5P10", "5P20", "10P10", "10P20"], is_enum=False),
    _p("CtProtectionBurden",  "CT Protection Burden [VA]",        unit="VA",  is_enum=False),
    _p("CtMeteringRatio",     "CT Metering Ratio",                is_enum=False),
    _p("CtMeteringClass",     "CT Metering Accuracy Class",
       allowed_values=["0.2S", "0.5S", "0.2", "0.5", "1"], is_enum=False),
    _p("CtMeteringBurden",    "CT Metering Burden [VA]",          unit="VA",  is_enum=False),
    _p("VtRatio",             "VT Ratio",                         is_enum=False),
    _p("VtClass",             "VT Accuracy Class",
       allowed_values=["0.2", "0.5", "1", "3P", "6P"], is_enum=False),
    _p("VtBurden",            "VT Burden [VA]",                   unit="VA",  is_enum=False),
    _p("RelayModel",          "Protection Relay Model",
       allowed_values=["REF615", "REF630", "REM615", "RED615", "REQ615",
                       "Sepam 10", "Sepam 20", "Sepam 40",
                       "MiCOM P127", "MiCOM P141", "MiCOM P142",
                       "PowerLogic P3U30", "PowerLogic P5", "PowerLogic P6",
                       "Easergy P3", "Easergy P5",
                       "7SJ85", "SIPROTEC 5", "None"],
       is_enum=False),
    _p("RelayFunctions",      "Protection Functions (ANSI)",      is_enum=False),
    _p("EarthingSwitch",      "Earthing Switch Type",
       allowed_values=["Manual", "Motor operated", "None"]),
    _p("CbMechanism",         "CB Operating Mechanism",
       allowed_values=["Spring (manual)", "Spring (motor)", "Magnetic", "Solenoid"]),
    _p("MotorVoltage",        "Motor / Coil Operating Voltage",
       allowed_values=["24 VDC", "48 VDC", "110 VDC", "220 VDC", "230 VAC", "None"]),
]


# ── Registry ──────────────────────────────────────────────────────────────────

_REGISTRY: dict[str, tuple[list[ParameterDefinition], list[ParameterDefinition]]] = {
    "safering":   (_SR_SYSTEM, _SR_PANEL),
    "safeplus":   (_SR_SYSTEM, _SR_PANEL),
    "switchgear": (_SW_SYSTEM, _SW_PANEL),
    "unisec":     (_SW_SYSTEM, _SW_PANEL),
}


def get_bom_param_defs(
    product_name: str,
    group: str = "system",
) -> list[ParameterDefinition]:
    """Return BOM parameter definitions for *product_name*.

    group="system" — global electrical/commercial parameters (extracted from page 1–2)
    group="panel"  — per-panel component parameters (extracted from panel-schedule pages)
    group="all"    — system + panel combined
    """
    key = product_name.lower().strip()
    system_defs, panel_defs = _REGISTRY.get(key, (_SW_SYSTEM, _SW_PANEL))
    if group == "system":
        return list(system_defs)
    if group == "panel":
        return list(panel_defs)
    return list(system_defs) + list(panel_defs)
