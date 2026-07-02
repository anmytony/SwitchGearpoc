"""
ABB Sales Configurator client.

Calls the filterSelector API to discover what parameters must be extracted
for a given product (Switchgear, SafeRing, SafePlus …).
Token is always fetched from the identity endpoint — nothing is hardcoded.
"""
from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field

import httpx

logger = logging.getLogger(__name__)

# ── Endpoints ─────────────────────────────────────────────────────────────────
_BASE = "https://medium-voltage-devices.salesconfigurator.abb.com/ELDS/api"
_FILTER_URL   = f"{_BASE}/filterSelector"
_MATERIALS_URL = f"{_BASE}/materials"
_SELECTOR_URL  = f"{_BASE}/selector"
_TOKEN_URL = (
    "https://medium-voltage-devices.salesconfigurator.abb.com/ELDS/api/identity/get/"
    "ODVjMTk4NGEtMmViZC00Yjg0LTgxYjgtM2U3MWRlNDYwYzAy"
)
_COOKIE = (
    "ak_bmsc=BBC2E1502EE5B70819ADCF53B31509CF~000000000000000000000000000000~"
    "YAAQtGnTF3KF8cqeAQAAzNwHAgColem7ZXrCZAPB8f2qNks5EDOkbHVw6c2JSnHN0FfKSPb0/"
    "gd/glgoSCgSwEZPEDjGqz00t+YsX4wqoPxNk9ldkB2PlHRNxJJhpNERJzOqrOjSCjuUm25gr"
    "n8ALgynJdTo2YyDIvXYlc7zvZmiD+mlCvY925MZacdyHkstEgceJ+tNWyfq3tWFVpKkW036h1"
    "gpwsLCge6Wb5cLBtpJ+WVAulqD2k7IortS+CFZt7nffbO58jnzmeG/IVGWWG2ziPJC2vWQtOv"
    "Zp3G+n0cr4/1XBqkgCjyuG801NsLQdoSX6hZ232Wtmwvmmj7+sa2XxyzCWfyEA6Nyf8DGEGEb"
    "3uWnDMheqTkoY73/fw=="
)

# User-facing product name → ABB API selector name
_PRODUCT_API_NAMES: dict[str, str] = {
    "switchgear": "Switchgear",
    "safering":   "MV_SEC_SafeRing",
    "safeplus":   "MV_SEC_SafePlus",
}

# Identifiers to skip in parameter extraction (not RFQ parameters)
_SKIP_IDENTIFIERS = {"Selector.Variant", "Selector.availability", "Selector.Availability"}

# ── Token management ──────────────────────────────────────────────────────────
_cached_token: str | None = None


def _fetch_token() -> str:
    logger.info("[ABBConfigurator] Fetching token from identity endpoint")
    resp = httpx.get(_TOKEN_URL, headers={"Cookie": _COOKIE}, timeout=10.0)
    resp.raise_for_status()
    return resp.text.strip().strip('"')


def _get_token() -> str:
    global _cached_token
    if _cached_token is None:
        _cached_token = _fetch_token()
    return _cached_token


def _invalidate_token() -> None:
    global _cached_token
    _cached_token = None


# ── HTTP helpers ──────────────────────────────────────────────────────────────
def _make_headers() -> dict:
    token = _get_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json;charset=utf-8",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://medium-voltage-devices.salesconfigurator.abb.com",
        "Referer": "https://medium-voltage-devices.salesconfigurator.abb.com/ELDS/",
    }


def _abb_post(payload: dict) -> list[dict]:
    """POST to filterSelector. Refreshes token once on 401."""
    headers = _make_headers()
    resp = httpx.post(_FILTER_URL, json=payload, headers=headers, timeout=15.0)
    if resp.status_code == 401:
        logger.info("[ABBConfigurator] 401 — refreshing token and retrying")
        _invalidate_token()
        headers = _make_headers()
        resp = httpx.post(_FILTER_URL, json=payload, headers=headers, timeout=15.0)
    resp.raise_for_status()
    return resp.json()


def _abb_post_materials(payload: dict) -> dict:
    """POST to materials API. Refreshes token once on 401."""
    headers = _make_headers()
    resp = httpx.post(_MATERIALS_URL, json=payload, headers=headers, timeout=20.0)
    if resp.status_code == 401:
        logger.info("[ABBConfigurator] 401 on materials — refreshing token and retrying")
        _invalidate_token()
        headers = _make_headers()
        resp = httpx.post(_MATERIALS_URL, json=payload, headers=headers, timeout=20.0)
    resp.raise_for_status()
    return resp.json()


# ── Data model ────────────────────────────────────────────────────────────────
@dataclass
class ParameterDefinition:
    key: str
    identifier: str
    prop_name: str       # filterGroup.properties.Name — used as key for materials API
    label: str
    unit: str
    allowed_values: list[str] = field(default_factory=list)
    is_enum: bool = False

    @property
    def label_without_unit(self) -> str:
        return re.sub(r"\s*\[.*?\]", "", self.label).strip()

    @property
    def search_query(self) -> str:
        parts = [self.label_without_unit, self.key]
        if self.allowed_values:
            parts.append(" ".join(str(v) for v in self.allowed_values[:6]))
        return " ".join(parts)


@dataclass
class ProductVariant:
    name: str
    value: str
    description: str
    image_url: str
    doc_url: str


@dataclass
class ProductMatch:
    name: str
    display_name: str
    description: str
    image_url: str
    doc_url: str


# ── Caches ────────────────────────────────────────────────────────────────────
_FILTER_CACHE: dict[str, list[ParameterDefinition]] = {}
_SELECTOR_CACHE: dict[str, dict] = {}  # api_name → selector config from /selector


# ── Helpers ───────────────────────────────────────────────────────────────────
def _resolve_api_name(product_name: str) -> str:
    """Map user-facing product name to ABB API selector name."""
    return _PRODUCT_API_NAMES.get(product_name.lower().strip(), product_name)


def _extract_unit(label: str) -> str:
    m = re.search(r"\[(.+?)\]", label)
    return m.group(1) if m else ""


def _sanitize_key(label: str) -> str:
    clean = re.sub(r"\s*\[.*?\]", "", label)   # remove [unit] suffix
    clean = re.sub(r"\s*\(.*?\)", "", clean)    # remove (parenthetical) — prevents invalid identifiers
    words = re.split(r"[\s\-_/]+", clean.strip())
    return "".join(w.capitalize() for w in words if w)


def _is_enum(values: list[str]) -> bool:
    if not values:
        return False
    return any(not re.match(r"^[\d.,\-]+$", v) for v in values)


def _get_selector_config(api_name: str) -> dict:
    """Fetch selector configuration from /selector endpoint (cached)."""
    if api_name in _SELECTOR_CACHE:
        return _SELECTOR_CACHE[api_name]
    logger.info(f"[ABBConfigurator] Fetching selector configs from /selector")
    headers = _make_headers()
    resp = httpx.get(_SELECTOR_URL, headers=headers, timeout=15.0)
    if resp.status_code == 401:
        _invalidate_token()
        headers = _make_headers()
        resp = httpx.get(_SELECTOR_URL, headers=headers, timeout=15.0)
    resp.raise_for_status()
    all_selectors: list[dict] = resp.json()
    # Cache all of them
    for s in all_selectors:
        _SELECTOR_CACHE[s["name"]] = s
    if api_name not in _SELECTOR_CACHE:
        raise ValueError(f"Selector '{api_name}' not found in /selector response")
    return _SELECTOR_CACHE[api_name]


# ── Public API ────────────────────────────────────────────────────────────────
def fetch_product_filters(
    product_name: str,
    *,
    force_refresh: bool = False,
) -> list[ParameterDefinition]:
    """Return parameter definitions for the given ABB product family.
    Raises on any network or API error — no fallback."""
    api_name = _resolve_api_name(product_name)
    cache_key = api_name.lower()
    if not force_refresh and cache_key in _FILTER_CACHE:
        return _FILTER_CACHE[cache_key]

    logger.info(f"[ABBConfigurator] Fetching filters for '{api_name}'")
    raw = _abb_post({"name": api_name})

    defs: list[ParameterDefinition] = []
    for item in raw:
        identifier = item.get("identifier", "")
        if identifier in _SKIP_IDENTIFIERS:
            continue
        props = item.get("properties", {})
        if props.get("IsBomItem"):
            continue
        label = item.get("name", "") or props.get("EN", "") or identifier
        key = _sanitize_key(label)
        if not key:
            continue
        prop_name = props.get("Name", "") or identifier.split(".")[-1]
        values = [v.get("value", "") for v in item.get("values", []) if v.get("value")]
        defs.append(ParameterDefinition(
            key=key,
            identifier=identifier,
            prop_name=prop_name,
            label=label,
            unit=_extract_unit(label),
            allowed_values=values,
            is_enum=_is_enum(values),
        ))

    _FILTER_CACHE[cache_key] = defs
    logger.info(f"[ABBConfigurator] '{api_name}': {len(defs)} parameters")
    return defs


def fetch_product_variants(product_name: str) -> list[ProductVariant]:
    """Return selectable product variants for the given ABB product family.
    Raises on any network or API error — no fallback."""
    api_name = _resolve_api_name(product_name)
    logger.info(f"[ABBConfigurator] Fetching variants for '{api_name}'")
    raw = _abb_post({"name": api_name})

    variants: list[ProductVariant] = []
    for item in raw:
        if item.get("identifier") != "Selector.Variant":
            continue
        for v in item.get("values", []):
            p = v.get("properties", {})
            variants.append(ProductVariant(
                name=v.get("name", ""),
                value=v.get("value", ""),
                description=p.get("Description", ""),
                image_url=p.get("Image_link", ""),
                doc_url=p.get("Documentation_link", ""),
            ))
    return variants


def fetch_product_matches(
    product_name: str,
    extracted_params: dict[str, str],
) -> list[ProductMatch]:
    """Call the ABB materials API with extracted RFQ parameter values.

    extracted_params maps filterGroup.properties.Name (e.g. 'varMarkets') to
    the selected value string (e.g. 'IEC').  Raises on error — no fallback.
    """
    api_name = _resolve_api_name(product_name)
    logger.info(
        f"[ABBConfigurator] Fetching product matches for '{api_name}' "
        f"with {len(extracted_params)} params"
    )

    # Get filter groups structure
    raw = _abb_post({"name": api_name})

    # Get selector config for maps array + fileName
    selector = _get_selector_config(api_name)
    maps = selector.get("maps") or []
    file_name = selector.get("fileName") or ""
    property_source = selector.get("propertySource") or "Selector.Variant"

    # Build filterGroups — include ALL groups (Availability included), set isSelected on matching values
    filter_groups = []
    for item in raw:
        identifier = item.get("identifier", "")
        prop_name = item.get("properties", {}).get("Name", "")
        sel_val = extracted_params.get(prop_name)

        values = []
        for v in item.get("values", []):
            is_sel = bool(sel_val and v.get("value") == sel_val)
            values.append({
                "isAssignable": v.get("isAssignable", True),
                "isSelected": is_sel,
                "name": v.get("name", ""),
                "value": v.get("value", ""),
                "fullyQualifiedName": v.get("fullyQualifiedName", ""),
                "properties": {**v.get("properties", {}), "State": 4 if is_sel else 2},
            })

        props = {**item.get("properties", {}), "ReadOnly": False, "Required": False}
        filter_groups.append({
            "propertyMap": item.get("propertyMap", {}),
            "isFixedFilter": item.get("isFixedFilter", False),
            "identifier": identifier,
            "isUserAssigned": True,
            "name": item.get("name", ""),
            "fullyQualifiedName": item.get("fullyQualifiedName", ""),
            "values": values,
            "properties": props,
            "title": item.get("name", ""),
        })

    payload = {
        "page": 0,
        "pageSize": 20,
        "request": {
            "name": api_name,
            "description": "",
            "fileName": file_name,
            "country": "GL",
            "type": 3,
            "propertySource": property_source,
            "maps": maps,
            "filterGroups": filter_groups,
        },
    }

    logger.info(f"[ABBConfigurator] Calling materials API for '{api_name}'")
    result = _abb_post_materials(payload)

    matches: list[ProductMatch] = []
    for item in result.get("results", []):
        # Build a {name: value} map from properties array
        props_map = {p["name"]: p["value"] for p in item.get("properties", []) if "name" in p}
        description = item.get("description") or item.get("productDescription") or props_map.get("Description", "")
        display_name = description or item.get("materialName") or item.get("name", "")
        image_url = item.get("imageThumb") or props_map.get("Image", "")
        doc_url = props_map.get("Documentation_link", "")
        matches.append(ProductMatch(
            name=item.get("name", ""),
            display_name=display_name,
            description=description,
            image_url=image_url,
            doc_url=doc_url,
        ))
    return matches
