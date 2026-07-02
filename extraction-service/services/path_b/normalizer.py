"""
Maps multilingual / variant enum values to the canonical ABB strings
used by ensemble/voting.py ALLOWED_VALUES and the .NET domain model.

Matching priority:
  1. Exact lowercase key lookup in _MAPS
  2. Regex patterns (IP codes, AuxVoltage AC/DC)
  3. Partial / substring match against known keys
"""
from __future__ import annotations
import re

# Keys: param name → (lowercased input → canonical output)
_MAPS: dict[str, dict[str, str]] = {
    # IEC 62271-200: PM = metal-enclosed (involucro metallico); MC = metal-clad (metallicamente suddiviso)
    # These are DIFFERENT classes — do NOT map metal-enclosed → metal-clad.
    "Enclosure": {
        # Metal-enclosed (PM class) — Italian spec QMT uses this
        "metal-enclosed": "Metal-enclosed AIS",
        "metal enclosed": "Metal-enclosed AIS",
        "involucro metallico": "Metal-enclosed AIS",
        "pm": "Metal-enclosed AIS",
        "lsc2a-pm": "Metal-enclosed AIS",
        "lsc2-pm": "Metal-enclosed AIS",
        "involucro metallico fisso": "Metal-enclosed AIS",
        "involucro in acciaio": "Metal-enclosed AIS",
        # Metal-clad (MC class) — fully partitioned metal barriers
        "metal-clad": "Metal-clad AIS",
        "metal clad": "Metal-clad AIS",
        "metal-clad ais": "Metal-clad AIS",
        "mc": "Metal-clad AIS",
        "metallicamente suddiviso": "Metal-clad AIS",
        "suddivisione metallica": "Metal-clad AIS",
        # GIS
        "metal-enclosed gis": "Metal-enclosed GIS",
        "metal enclosed gis": "Metal-enclosed GIS",
    },
    "BusbarArrangement": {
        "single": "Single busbar",
        "single busbar": "Single busbar",
        "simple": "Single busbar",           # French
        "jeu de barres simple": "Single busbar",
        "jeu barres simple": "Single busbar",
        "jeu de barres omnibus": "Single busbar",
        "semplice": "Single busbar",           # Italian
        "sbarra semplice": "Single busbar",
        "a semplice sbarra": "Single busbar",
        "configurazione semplice": "Single busbar",
        "sbarre omnibus": "Single busbar",     # Italian spec sheet term for common/single busbar
        "sbarra omnibus": "Single busbar",
        "omnibus": "Single busbar",
        "einfach": "Single busbar",           # German
        "einfachsammelschiene": "Single busbar",
        "double": "Double busbar",
        "double busbar": "Double busbar",
        "double jeu de barres": "Double busbar",
        "jeu de barres double": "Double busbar",
        "doppia": "Double busbar",
        "doppia sbarra": "Double busbar",
        "a doppia sbarra": "Double busbar",
        "configurazione doppia": "Double busbar",
        "doppelt": "Double busbar",
        "doppelsammelschiene": "Double busbar",
        "double level": "Double Level",
        "one and a half": "Double Level",
        "1.5 breaker": "Double Level",
        "breaker and a half": "Double Level",
        "anderthalb": "Double Level",         # German
        "1 jeu de barres": "Single busbar",   # French numeric prefix
        "sbarra singola": "Single busbar",    # Italian alternative
        "singola sbarra": "Single busbar",
        "2 jeux de barres": "Double busbar",  # French
        "2 jeu de barres": "Double busbar",
    },
    "Insulation": {
        "air insulated": "AIS",
        "air-insulated": "AIS",
        "ais": "AIS",
        "air": "AIS",
        "isolement air": "AIS",               # French
        "isolé à l'air": "AIS",
        "isolamento aria": "AIS",             # Italian
        "isolato in aria": "AIS",             # Italian variant
        "in aria": "AIS",                     # Italian shorthand
        "luftisoliert": "AIS",                # German
        "luftisolierung": "AIS",
        "gas insulated sf6": "GIS (SF6)",
        "gas insulated (sf6)": "GIS (SF6)",
        "sf6": "GIS (SF6)",
        "gis sf6": "GIS (SF6)",
        "gis (sf6)": "GIS (SF6)",
        "gas isolato sf6": "GIS (SF6)",       # Italian
        "isolamento in gas sf6": "GIS (SF6)", # Italian
        "gasisoliert sf6": "GIS (SF6)",
        "gas insulated dry air": "GIS (Dry Air)",
        "dry air": "GIS (Dry Air)",
        "clean air": "GIS (Dry Air)",
        "gis (dry air)": "GIS (Dry Air)",
        "gis dry air": "GIS (Dry Air)",
        "aria compressa": "GIS (Dry Air)",    # Italian
        "aria secca": "GIS (Dry Air)",        # Italian
        "gas isolato aria": "GIS (Dry Air)",  # Italian
        "isolamento aria compressa": "GIS (Dry Air)", # Italian
        "druckluft": "GIS (Dry Air)",         # German
        "trockenluft": "GIS (Dry Air)",       # German (dry air)
        "isolé en air": "AIS",               # French variant
        "isolation air": "AIS",              # French shorthand
        "sf6-free": "GIS (SF6-free)",
        "sf6 free": "GIS (SF6-free)",
        "gis (sf6-free)": "GIS (SF6-free)",
        "gis sf6-free": "GIS (SF6-free)",
        "sans sf6": "GIS (SF6-free)",         # French
        "senza sf6": "GIS (SF6-free)",        # Italian
        "senza gas sf6": "GIS (SF6-free)",    # Italian variant
        "gas alternativo": "GIS (SF6-free)",  # Italian (alternative gas)
    },
    "Market": {
        "iec": "IEC",
        "norme iec": "IEC",
        "norma iec": "IEC",
        "iec standard": "IEC",
        "lec": "IEC",                # OCR corruption: capital I misread as lowercase l
        "en 62271": "IEC",           # standard reference without explicit IEC prefix
        "en62271": "IEC",
        "cei": "IEC",                # Italian standards body (CEI = IEC national committee)
        "cei en": "IEC",
        "cei en 62271": "IEC",
        "norma cei": "IEC",
        "cei/iec": "IEC",
        "iec/cei": "IEC",
        "all": "IEC",                # LLM sometimes returns "All" — default to IEC
        "both": "IEC",               # "both IEC and ANSI" → IEC
        "ansi": "ANSI",
        "ieee": "ANSI",
        "nema": "ANSI",
        "ansi/ieee": "ANSI",
        "ieee/ansi": "ANSI",
    },
    "Distribution": {
        "primary": "Primary",
        "primaire": "Primary",               # French
        "primario": "Primary",               # Italian
        "primär": "Primary",                 # German
        "haute tension": "Primary",          # French (HV primary)
        "ht": "Primary",
        "hv": "Primary",
        "secondary": "Secondary",
        "secondaire": "Secondary",
        "secondario": "Secondary",
        "sekundär": "Secondary",
        "medium tension": "Secondary",
        "moyenne tension": "Secondary",
        "mt": "Secondary",
        "mv": "Secondary",
    },
    "IngressProtection": {
        "ip31": "IP31", "ip 31": "IP31",
        "ip33": "IP33", "ip 33": "IP33",
        "ip41": "IP41", "ip 41": "IP41",
        "ip43": "IP43", "ip 43": "IP43",
        "ip44": "IP44", "ip 44": "IP44",
        "ip54": "IP54", "ip 54": "IP54",
        "ip55": "IP55", "ip 55": "IP55",
        "ip65": "IP65", "ip 65": "IP65",
        "ip3x": "IP31", "ip 3x": "IP31",   # X = unspecified digit, assume 1 (indoor)
        "ip4x": "IP41", "ip 4x": "IP41",
        "ip5x": "IP54", "ip 5x": "IP54",
        # French: indice de protection
        "indice de protection 31": "IP31",
        "indice de protection 33": "IP33",
        "indice de protection 54": "IP54",
        "indice de protection 55": "IP55",
        # German: Schutzart
        "schutzart ip44": "IP44",
        "schutzart ip54": "IP54",
        "schutzart ip55": "IP55",
    },
    # BOM param key variant — same mappings as IngressProtection
    "IpDegree": {
        "ip21": "IP21", "ip 21": "IP21",
        "ip31": "IP31", "ip 31": "IP31",
        "ip41": "IP41", "ip 41": "IP41",
        "ip54": "IP54", "ip 54": "IP54",
        "ip65": "IP65", "ip 65": "IP65",
        "ip3x": "IP31", "ip 3x": "IP31",
        "ip4x": "IP41", "ip 4x": "IP41",
        "ip5x": "IP54", "ip 5x": "IP54",
        "grado di protezione ip31": "IP31",
        "grado di protezione ip3x": "IP31",
    },
    "NeutralEarthing": {
        # Italian
        "compensato":                   "Petersen coil",
        "neutro compensato":            "Petersen coil",
        "esercizio compensato":         "Petersen coil",
        "esercizio del neutro compensato": "Petersen coil",
        "messo a terra tramite bobina": "Petersen coil",
        "bobina di peterson":           "Petersen coil",
        "bobina peterson":              "Petersen coil",
        "isolato":                      "Isolated",
        "neutro isolato":               "Isolated",
        "esercizio isolato":            "Isolated",
        "messa a terra diretta":        "Solid",
        "solidamente messo a terra":    "Solid",
        "diretto":                      "Solid",
        "neutro diretto":               "Solid",
        "tramite resistenza":           "NGR",
        "resistenza di neutro":         "NGR",
        "a resistenza":                 "NGR",
        "resistore di neutro":          "NGR",
        "tramite impedenza":            "NGR",
        # French
        "neutre compensé":              "Petersen coil",
        "compensé":                     "Petersen coil",
        "neutre résonnant":             "Petersen coil",
        "mise à la terre par bobine":   "Petersen coil",
        "bobine de peterson":           "Petersen coil",
        "neutre isolé":                 "Isolated",
        "isolé":                        "Isolated",
        "neutre solidement mis à la terre": "Solid",
        "mise à la terre directe":      "Solid",
        "directement mis à la terre":   "Solid",
        "solide":                       "Solid",
        "neutre résistance":            "NGR",
        "résistance de mise à la terre": "NGR",
        "résistance":                   "NGR",
        "mise à la terre par résistance": "NGR",
        # German
        "resonanzgeerdet":              "Petersen coil",
        "petersenspule":                "Petersen coil",
        "kompensiert":                  "Petersen coil",
        "erdung über petersenspule":    "Petersen coil",
        "isoliert":                     "Isolated",
        "isoliert betrieben":           "Isolated",
        "direkt geerdet":               "Solid",
        "niederohmig geerdet":          "NGR",
        "widerstandsgeerdet":           "NGR",
        "erdung über widerstand":       "NGR",
        # English variants
        "petersen coil":                "Petersen coil",
        "resonant":                     "Petersen coil",
        "resonant earthed":             "Petersen coil",
        "resonant grounded":            "Petersen coil",
        "tuned earth":                  "Petersen coil",
        "solid":                        "Solid",
        "solidly earthed":              "Solid",
        "solidly grounded":             "Solid",
        "direct":                       "Solid",
        "directly earthed":             "Solid",
        "ngr":                          "NGR",
        "resistance":                   "NGR",
        "resistor":                     "NGR",
        "resistor-grounded":            "NGR",
        "resistor grounded":            "NGR",
        "high resistance":              "NGR",
        "low resistance":               "NGR",
        "unearthed":                    "Isolated",
        "ungrounded":                   "Isolated",
        "floating":                     "Isolated",
    },
    "InternalArcClassification": {
        "iac a": "IAC A",   "iac-a": "IAC A",   "iaca": "IAC A",
        "iac b": "IAC B",   "iac-b": "IAC B",   "iacb": "IAC B",
        "iac ab": "IAC AB", "iac-ab": "IAC AB", "iacab": "IAC AB",
        "iac afl": "IAC AFL",   "iac-afl": "IAC AFL",   "iacafl": "IAC AFL",
        "afl": "IAC AFL",
        # AFLR = Front + Rear + Lateral (all three sides)
        "iac aflr": "IAC AFLR", "iac-aflr": "IAC AFLR", "iacaflr": "IAC AFLR",
        "aflr": "IAC AFLR",
        # Italian format: F-R-L = Frontale + Retro + Laterale = all three = AFLR
        "iac a f-r-l": "IAC AFLR",
        "iac a (f-r-l)": "IAC AFLR",
        "iac a frl": "IAC AFLR",
        "iac-a-f-r-l": "IAC AFLR",
        "iac a f r l": "IAC AFLR",
        "iac (a) f-r-l": "IAC AFLR",
        "iac a f-l-r": "IAC AFLR",
        # Without explicit type A
        "iac f-r-l": "IAC AFLR",
        "iac frl": "IAC AFLR",
        "iac f r l": "IAC AFLR",
        # Italian — Front+Lateral only (no rear)
        "iac a f-l": "IAC AFL",
        "iac a frontale laterale": "IAC AFL",
        # Alternate spellings seen in spec sheets
        "class a": "IAC A",
        "class b": "IAC B",
        "class ab": "IAC AB",
        "arc flash a": "IAC A",
        "arc flash b": "IAC B",
        # Italian — all three sides
        "iac a frontale retro laterale": "IAC AFLR",
        "iac frontale retro laterale": "IAC AFLR",
        # Individual sides (treat as minimum AFL)
        "iac a frontale": "IAC AFL",
        "iac a retro": "IAC AFL",
        "iac a laterale": "IAC AFL",
    },
}


def _normalize_ip_code(raw: str) -> str:
    """Convert any IPxx / IP x variant to canonical IPnn form."""
    m = re.match(r"ip\s*(\d)([x\d])", raw.strip().lower())
    if not m:
        return raw
    first, second = m.group(1), m.group(2).lower()
    if second == "x":
        # IPnX — assume the lowest standard second digit for that first digit
        second = {"1": "1", "2": "1", "3": "1", "4": "1", "5": "4", "6": "5"}.get(first, "1")
    return f"IP{first}{second}"


def _normalize_aux_voltage(raw: str) -> str:
    """Convert Italian c.a./c.c. voltage strings to canonical nVAC / nVDC form."""
    s = raw.strip()
    # "230 V c.a." → "230 VAC", "110 V c.c." → "110 VDC"
    m = re.match(r"(\d+)\s*[Vv]?\s*c\.a\.", s)
    if m:
        return f"{m.group(1)} VAC"
    m = re.match(r"(\d+)\s*[Vv]?\s*c\.c\.", s)
    if m:
        return f"{m.group(1)} VDC"
    # "230VAC" / "230 VAC" / "110VDC" already canonical
    if re.match(r"\d+\s*V(?:AC|DC)", s, re.I):
        return re.sub(r"(\d+)\s*V(AC|DC)", lambda mo: f"{mo.group(1)} V{mo.group(2).upper()}", s)
    return raw


def normalize_enum_value(param_name: str, raw_value: str) -> str:
    """Return the canonical enum string for raw_value using multi-strategy matching.

    Strategy order:
      1. Regex normalisation (IP codes, voltage suffixes)
      2. Exact lowercase key lookup in _MAPS
      3. Partial / substring match against known keys
      4. Return raw_value unchanged (caller flags as low-confidence)
    """
    if not raw_value:
        return raw_value

    # LLMs sometimes return "None", "N/A", "Not specified" to mean "not found".
    # Treat these as absent so the field is left empty rather than stored as a bogus value.
    _ABSENT_SENTINELS = {"none", "n/a", "not specified", "not found", "unknown", "-", "—"}
    if raw_value.strip().lower() in _ABSENT_SENTINELS:
        return ""

    # Strategy 1 — regex patterns for structured values
    if param_name in ("IpDegree", "IngressProtection"):
        normalized = _normalize_ip_code(raw_value)
        if normalized != raw_value:
            return normalized

    if param_name == "AuxVoltage":
        normalized = _normalize_aux_voltage(raw_value)
        if normalized != raw_value:
            return normalized

    mapping = _MAPS.get(param_name)
    if not mapping:
        return raw_value

    raw_lower = raw_value.strip().lower()

    # Strategy 2 — exact match
    result = mapping.get(raw_lower)
    if result:
        return result

    # Strategy 3 — substring: find the longest key that appears in raw_value
    best_key, best_len = None, 0
    for key, canonical in mapping.items():
        if len(key) > best_len and key in raw_lower:
            best_key, best_len = key, len(key)
    if best_key and best_len >= 4:          # avoid single-char false matches
        return mapping[best_key]

    return raw_value
