using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SwitchgearApi.Models;

namespace SwitchgearApi.Services
{
    public class AbbLiveCatalogProduct
    {
        public string Key { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? DocumentationUrl { get; set; }
    }

    public interface IAbbSalesConfiguratorClient
    {
        /// <summary>Pre-fetches and caches the bearer token so the first real request is instant.</summary>
        Task WarmUpAsync();

        /// <summary>Fetch the full product catalog (unfiltered, cached 1 h).</summary>
        Task<List<AbbLiveCatalogProduct>> FetchProductCatalogAsync();

        /// <summary>
        /// Fetch products filtered by the document's extracted parameters.
        /// Calls the live ABB Sales Configurator API and returns only products
        /// the API marks as assignable (State != 0) for the given parameters.
        /// </summary>
        Task<List<AbbLiveCatalogProduct>> FetchFilteredProductsAsync(
            IEnumerable<ExtractedParameter> parameters);
    }

    public class AbbSalesConfiguratorClient : IAbbSalesConfiguratorClient
    {
        private readonly IHttpClientFactory _httpFactory;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _config;
        private readonly ILogger<AbbSalesConfiguratorClient> _logger;

        private const string CatalogCacheKey = "abb_live_catalog";
        private const string TokenCacheKey = "abb_bearer_token";
        private const string AbbBaseUrl = "https://medium-voltage-devices.salesconfigurator.abb.com";

        // Primary identity endpoint — returns a bearer token for the guest session
        private const string IdentityEndpoint =
            "/ELDS/api/identity/get/ODVjMTk4NGEtMmViZC00Yjg0LTgxYjgtM2U3MWRlNDYwYzAy";

        // ── ABB filter schema ────────────────────────────────────────────────────────
        // Defines every filter group the /materials API accepts.
        // ApiName      = the "name" value the API expects in the request
        // DisplayValue = what the extraction pipeline produces (used for matching)
        private record FilterOpt(string ApiName, string DisplayValue);

        private static readonly (string Identifier, string Label, FilterOpt[] Opts)[] FilterSchema =
        {
            (
                "Selector.varMarkets", "Market",
                new[]
                {
                    new FilterOpt("IEC",  "IEC"),
                    new FilterOpt("ANSI", "ANSI"),
                }
            ),
            (
                "Selector.varNumberofbusbars", "Busbar arrangement",
                new[]
                {
                    new FilterOpt("single",       "Single busbar"),
                    new FilterOpt("double",       "Double busbar"),
                    new FilterOpt("double_level", "Double level"),
                }
            ),
            (
                "Selector.varVoltagelevel", "Rated voltage [kV]",
                new[]
                {
                    new FilterOpt("5",    "5"),
                    new FilterOpt("7_2",  "7.2"),
                    new FilterOpt("12",   "12"),
                    new FilterOpt("15",   "15"),
                    new FilterOpt("17_5", "17.5"),
                    new FilterOpt("24",   "24"),
                    new FilterOpt("27",   "27"),
                    new FilterOpt("36",   "36"),
                    new FilterOpt("38",   "38"),
                    new FilterOpt("40_5", "40.5"),
                }
            ),
            (
                "Selector.varShortcircuitlevel", "Rated short-time withstand current [kA]",
                new[]
                {
                    new FilterOpt("16",   "16"),
                    new FilterOpt("20",   "20"),
                    new FilterOpt("21",   "21"),
                    new FilterOpt("25",   "25"),
                    new FilterOpt("31_5", "31.5"),
                    new FilterOpt("40",   "40"),
                    new FilterOpt("50",   "50"),
                    new FilterOpt("63",   "63"),
                }
            ),
            (
                "Selector.varBusbarcurrent", "Rated busbar current [A]",
                new[]
                {
                    new FilterOpt("630",  "630"),
                    new FilterOpt("1200", "1200"),
                    new FilterOpt("1250", "1250"),
                    new FilterOpt("1600", "1600"),
                    new FilterOpt("2000", "2000"),
                    new FilterOpt("2500", "2500"),
                    new FilterOpt("3000", "3000"),
                    new FilterOpt("3150", "3150"),
                    new FilterOpt("4000", "4000"),
                    new FilterOpt("5000", "5000"),
                }
            ),
            (
                "Selector.varFeedercurrent", "Panel rated current [A]",
                new[]
                {
                    new FilterOpt("400",  "400"),
                    new FilterOpt("630",  "630"),
                    new FilterOpt("1200", "1200"),
                    new FilterOpt("1250", "1250"),
                    new FilterOpt("1600", "1600"),
                    new FilterOpt("2000", "2000"),
                    new FilterOpt("2500", "2500"),
                    new FilterOpt("3000", "3000"),
                    new FilterOpt("3150", "3150"),
                    new FilterOpt("4000", "4000"),
                }
            ),
            (
                "Selector.varInsulationtechnology", "Insulation",
                new[]
                {
                    new FilterOpt("AIS",         "AIS"),
                    new FilterOpt("GIS_air",     "GIS (Dry air)"),
                    new FilterOpt("GIS_SF6",     "GIS (SF6)"),
                    new FilterOpt("GIS_SF6free", "GIS (SF6-free)"),
                }
            ),
            (
                "Selector.varDistribution", "Distribution application",
                new[]
                {
                    new FilterOpt("prim", "Primary"),
                    new FilterOpt("sec",  "Secondary"),
                }
            ),
        };

        // Maps ExtractedParameter.Name → one or more ABB filter identifiers
        private static readonly Dictionary<string, string[]> ParamToFilters =
            new(StringComparer.OrdinalIgnoreCase)
            {
                ["Market"]             = new[] { "Selector.varMarkets" },
                ["BusbarArrangement"]  = new[] { "Selector.varNumberofbusbars" },
                ["OperatingVoltage"]   = new[] { "Selector.varVoltagelevel" },
                ["ShortCircuitLevel"]  = new[] { "Selector.varShortcircuitlevel" },
                ["RatedBusbarCurrent"] = new[] { "Selector.varBusbarcurrent" },
                ["PanelRatedCurrent"]  = new[] { "Selector.varFeedercurrent" },
                // Until the pipeline splits RatedCurrent, map to both busbar and panel
                ["RatedCurrent"]       = new[] { "Selector.varBusbarcurrent", "Selector.varFeedercurrent" },
                ["Insulation"]         = new[] { "Selector.varInsulationtechnology" },
                ["Distribution"]       = new[] { "Selector.varDistribution" },
            };

        // ── Constructor ──────────────────────────────────────────────────────────────

        public AbbSalesConfiguratorClient(
            IHttpClientFactory httpFactory,
            IMemoryCache cache,
            IConfiguration config,
            ILogger<AbbSalesConfiguratorClient> logger)
        {
            _httpFactory = httpFactory;
            _cache = cache;
            _config = config;
            _logger = logger;
        }

        // ── Public API ───────────────────────────────────────────────────────────────

        public async Task WarmUpAsync()
        {
            // Pre-fetch and cache the bearer token in the background at startup
            // so the first user-triggered product match request doesn't pay the auth latency.
            await GetBearerTokenAsync();
            _logger.LogInformation("[AbbCatalog] Token warm-up complete");
        }

        public async Task<List<AbbLiveCatalogProduct>> FetchProductCatalogAsync()
        {
            if (_cache.TryGetValue(CatalogCacheKey, out List<AbbLiveCatalogProduct>? cached) && cached != null)
            {
                _logger.LogDebug("[AbbCatalog] {Count} products from cache", cached.Count);
                return cached;
            }

            var bearer = await GetBearerTokenAsync();
            if (string.IsNullOrEmpty(bearer))
            {
                _logger.LogWarning("[AbbCatalog] No Bearer token available");
                return new List<AbbLiveCatalogProduct>();
            }

            try
            {
                using var client = _httpFactory.CreateClient("AbbSalesConfigurator");
                using var req = BuildHttpRequest(bearer, BuildUnfilteredBody());
                using var resp = await client.SendAsync(req);

                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning("[AbbCatalog] /materials returned {Status}", (int)resp.StatusCode);
                    if (resp.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                        _cache.Remove(TokenCacheKey);
                    return new List<AbbLiveCatalogProduct>();
                }

                var json = await resp.Content.ReadAsStringAsync();
                var products = ParseVariantFilterGroup(json, onlyAssignable: false);

                if (products.Count > 0)
                {
                    _cache.Set(CatalogCacheKey, products, TimeSpan.FromHours(1));
                    _logger.LogInformation("[AbbCatalog] {Count} products loaded (cached 1h)", products.Count);
                }

                return products;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AbbCatalog] Request to ABB API failed");
                return new List<AbbLiveCatalogProduct>();
            }
        }

        public async Task<List<AbbLiveCatalogProduct>> FetchFilteredProductsAsync(
            IEnumerable<ExtractedParameter> parameters)
        {
            var paramMap = BuildParamMap(parameters);

            if (paramMap.Count == 0)
            {
                _logger.LogInformation("[AbbCatalog] No parameters to filter — returning full catalog");
                return await FetchProductCatalogAsync();
            }

            // Cache key: sorted "name=value" pairs so the same parameter set always hits the same entry
            var cacheKey = "abb_filtered_" + string.Join("|",
                paramMap.OrderBy(kv => kv.Key).Select(kv => $"{kv.Key}={kv.Value}"));

            if (_cache.TryGetValue(cacheKey, out List<AbbLiveCatalogProduct>? hit) && hit != null)
            {
                _logger.LogDebug("[AbbCatalog] {Count} filtered products from cache", hit.Count);
                return hit;
            }

            _logger.LogInformation("[AbbCatalog] Filtered API call with: {Params}",
                string.Join(", ", paramMap.Select(kv => $"{kv.Key}={kv.Value}")));

            // Fetch token and build request body concurrently
            var tokenTask = GetBearerTokenAsync();
            var bodyJson  = BuildFilterBody(paramMap);
            var bearer    = await tokenTask;

            if (string.IsNullOrEmpty(bearer))
            {
                _logger.LogWarning("[AbbCatalog] No Bearer token — cannot filter products");
                return new List<AbbLiveCatalogProduct>();
            }

            try
            {
                using var client = _httpFactory.CreateClient("AbbSalesConfigurator");
                using var req = BuildHttpRequest(bearer, bodyJson);
                using var resp = await client.SendAsync(req);

                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning("[AbbCatalog] Filtered /materials returned {Status}", (int)resp.StatusCode);
                    if (resp.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                        _cache.Remove(TokenCacheKey);
                    return new List<AbbLiveCatalogProduct>();
                }

                var json = await resp.Content.ReadAsStringAsync();
                var products = ParseVariantFilterGroup(json, onlyAssignable: true);
                _logger.LogInformation("[AbbCatalog] {Count} compatible products from ABB API", products.Count);

                // Cache for 5 minutes — parameters rarely change within a session
                if (products.Count > 0)
                    _cache.Set(cacheKey, products, TimeSpan.FromMinutes(5));

                return products;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AbbCatalog] Filtered request to ABB API failed");
                return new List<AbbLiveCatalogProduct>();
            }
        }

        // ── Token acquisition ────────────────────────────────────────────────────────

        private async Task<string?> GetBearerTokenAsync()
        {
            if (_cache.TryGetValue(TokenCacheKey, out string? cached) && !string.IsNullOrEmpty(cached))
                return cached;

            var token = await FetchTokenFromAbbApiAsync();

            if (!string.IsNullOrEmpty(token))
            {
                var ttl = GetTokenTtl(token);
                _cache.Set(TokenCacheKey, token, ttl);
                _logger.LogInformation("[AbbToken] Dynamic token acquired (TTL {TTL})", ttl);
                return token;
            }

            var configured = _config["AbbSalesConfigurator:BearerToken"];
            if (!string.IsNullOrWhiteSpace(configured))
            {
                _logger.LogWarning("[AbbToken] Dynamic fetch failed — using static BearerToken from config");
                _cache.Set(TokenCacheKey, configured, TimeSpan.FromMinutes(30));
                return configured;
            }

            return null;
        }

        private async Task<string?> FetchTokenFromAbbApiAsync()
        {
            using var client = _httpFactory.CreateClient("AbbSalesConfigurator");
            try
            {
                using var req = new HttpRequestMessage(HttpMethod.Get, IdentityEndpoint);
                req.Headers.TryAddWithoutValidation("Accept", "application/json, text/plain, */*");
                req.Headers.TryAddWithoutValidation("x-requested-with", "XMLHttpRequest");
                req.Headers.TryAddWithoutValidation("Origin", AbbBaseUrl);
                req.Headers.TryAddWithoutValidation("Referer", $"{AbbBaseUrl}/ELDS/");
                req.Headers.TryAddWithoutValidation("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36");

                using var resp = await client.SendAsync(req);
                _logger.LogDebug("[AbbToken] Identity endpoint → {Status}", (int)resp.StatusCode);

                if (!resp.IsSuccessStatusCode)
                    return null;

                var body = (await resp.Content.ReadAsStringAsync()).Trim().Trim('"');

                // Response may be a raw JWT string or a JSON object containing the token
                if (IsJwt(body))
                {
                    _logger.LogInformation("[AbbToken] Token acquired from identity endpoint");
                    return body;
                }

                var token = ExtractTokenFromJson(body);
                if (!string.IsNullOrEmpty(token))
                {
                    _logger.LogInformation("[AbbToken] Token parsed from identity response JSON");
                    return token;
                }

                _logger.LogWarning("[AbbToken] Identity endpoint responded but no JWT found in body");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[AbbToken] Identity endpoint request failed");
                return null;
            }
        }

        private static string? ExtractTokenFromJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return null;
            try
            {
                using var doc = JsonDocument.Parse(json);
                return SearchForJwt(doc.RootElement);
            }
            catch { return null; }
        }

        private static string? SearchForJwt(JsonElement el)
        {
            if (el.ValueKind != JsonValueKind.Object) return null;

            foreach (var field in new[] { "token", "bearerToken", "accessToken", "jwt", "authToken", "authorization" })
            {
                if (el.TryGetProperty(field, out var prop) && prop.ValueKind == JsonValueKind.String)
                {
                    var val = prop.GetString();
                    if (IsJwt(val)) return val;
                }
            }

            foreach (var prop in el.EnumerateObject())
            {
                if (prop.Value.ValueKind == JsonValueKind.Object)
                {
                    var found = SearchForJwt(prop.Value);
                    if (found != null) return found;
                }
            }

            return null;
        }

        // A JWT is 3 base64url segments separated by dots with no whitespace.
        // The header may start with "ey" ({"...) or "ew" ({\r\n...) depending on formatting.
        private static bool IsJwt(string? s) =>
            s is { Length: > 20 } &&
            !s.Any(char.IsWhiteSpace) &&
            s.Count(c => c == '.') == 2;

        private static TimeSpan GetTokenTtl(string jwt)
        {
            try
            {
                var parts = jwt.Split('.');
                if (parts.Length < 2) return TimeSpan.FromMinutes(30);

                var padding = (4 - parts[1].Length % 4) % 4;
                var payload = Convert.FromBase64String(parts[1] + new string('=', padding));
                using var doc = JsonDocument.Parse(payload);

                if (doc.RootElement.TryGetProperty("exp", out var expEl))
                {
                    var exp = expEl.GetInt64();
                    var remaining = DateTimeOffset.FromUnixTimeSeconds(exp) - DateTimeOffset.UtcNow - TimeSpan.FromMinutes(5);
                    if (remaining > TimeSpan.Zero)
                        return remaining > TimeSpan.FromHours(1) ? TimeSpan.FromHours(1) : remaining;
                }
            }
            catch { /* ignore */ }

            return TimeSpan.FromMinutes(30);
        }

        // ── HTTP request helper ──────────────────────────────────────────────────────

        private HttpRequestMessage BuildHttpRequest(string bearer, string body)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, "/ELDS/api/materials");
            req.Headers.TryAddWithoutValidation("Authorization", $"Bearer {bearer}");
            req.Headers.TryAddWithoutValidation("Accept", "application/json");
            req.Headers.TryAddWithoutValidation("x-requested-with", "XMLHttpRequest");
            req.Headers.TryAddWithoutValidation("Origin", AbbBaseUrl);
            req.Headers.TryAddWithoutValidation("Referer", $"{AbbBaseUrl}/ELDS/");
            req.Headers.TryAddWithoutValidation("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36");

            var cookies = _config["AbbSalesConfigurator:Cookies"];
            if (!string.IsNullOrWhiteSpace(cookies))
                req.Headers.TryAddWithoutValidation("Cookie", cookies);

            req.Content = new StringContent(body, Encoding.UTF8, "application/json");
            return req;
        }

        // ── Request body builders ────────────────────────────────────────────────────

        // Unfiltered body — no values selected, returns all globally available products.
        private static string BuildUnfilteredBody() => """
            {
              "page": 0,
              "pageSize": 100,
              "request": {
                "name": "Switchgear",
                "description": "",
                "fileName": "EPDS_SG.vtz",
                "country": "GL",
                "type": 3,
                "propertySource": "Selector.Variant",
                "filterGroups": [
                  {
                    "isFixedFilter": false,
                    "identifier": "Selector.varMarkets",
                    "isUserAssigned": true,
                    "name": "Market",
                    "fullyQualifiedName": "Selector.varMarkets",
                    "values": [
                      {"isAssignable": true, "isSelected": false, "name": "IEC",  "value": "IEC",  "fullyQualifiedName": "Selector.varMarkets.IEC",  "properties": {"Name": "IEC",  "State": 2}},
                      {"isAssignable": true, "isSelected": false, "name": "ANSI", "value": "ANSI", "fullyQualifiedName": "Selector.varMarkets.ANSI", "properties": {"Name": "ANSI", "State": 2}}
                    ],
                    "properties": {"IsBomItem": false, "Show": true, "Name": "varMarkets", "EN": "Market", "ReadOnly": false, "Required": false}
                  },
                  {
                    "isFixedFilter": false,
                    "identifier": "Selector.Variant",
                    "isUserAssigned": true,
                    "name": "Product",
                    "fullyQualifiedName": "Selector.Variant",
                    "values": [],
                    "properties": {"IsBomItem": true, "Show": false, "Name": "Variant", "EN": "Product", "ReadOnly": false, "Required": false}
                  },
                  {
                    "isFixedFilter": false,
                    "identifier": "Selector.availability",
                    "isUserAssigned": false,
                    "name": "Availability",
                    "fullyQualifiedName": "Selector.availability",
                    "values": [
                      {"isAssignable": true, "isSelected": true, "name": "GL", "value": "Global", "fullyQualifiedName": "Selector.availability.GL", "properties": {"Name": "GL", "EN": "Global", "State": 4}}
                    ],
                    "properties": {"IsBomItem": false, "Show": true, "Name": "availability", "EN": "Availability", "ReadOnly": false, "Required": false}
                  }
                ],
                "preFilters": [],
                "sqlFilters": null,
                "maps": [
                  {"fqn": "Selector.varMarkets",    "dbProperty": "Selector.varMarkets"},
                  {"fqn": "Selector.Variant",       "dbProperty": "Selector.Variant"},
                  {"fqn": "Selector.availability",  "dbProperty": "Selector.availability"}
                ],
                "metaData": {},
                "isSimple": false,
                "isFixedParts": false,
                "isAccessories": false,
                "isComplexSelector": false,
                "isPrefiltered": false,
                "isProduct": true,
                "hasMultiSelect": false,
                "parent": null
              },
              "user": {
                "username": "Guest User",
                "culture": "en-EN",
                "currency": "USD",
                "isLoggedOn": false,
                "hasCart": true,
                "hasUserSettings": false,
                "country": "GL",
                "properties": {
                  "DisplayName": "Guest User",
                  "SenderId": "CommonBOL",
                  "CartID": "0",
                  "CartDetailID": "0",
                  "ShowAddToList": "true",
                  "ShowAddToCart": "true",
                  "ViewNetPrice": "false",
                  "ViewListPrice": "false",
                  "ViewSalesPrice": "true",
                  "CustomerCode": "0006000074",
                  "CustomerCountry": "GL",
                  "BAUCode": "0006000074",
                  "BAUCountry": "GL",
                  "BAUUnit": "L",
                  "GACountry": null
                },
                "name": "Guest User",
                "authenticationType": "File",
                "isAuthenticated": true,
                "useLocalCart": true,
                "customerCurrencies": [{"kunnr": "0006000074", "waers": "USD", "vkorg": "", "vtweg": ""}],
                "products": {"properties": {}, "children": [], "characteristics": {}, "additionalProducts": []}
              }
            }
            """;

        // Filtered body — builds request dynamically from extracted parameters.
        // Each parameter that matches a filter group gets its value marked as selected (State 4).
        // The ABB API responds with State 0 for incompatible products and State 2 for compatible ones.
        private static string BuildFilterBody(Dictionary<string, string> paramMap)
        {
            // Resolve which option name to select for each filter identifier
            var selections = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var (paramName, value) in paramMap)
            {
                if (!ParamToFilters.TryGetValue(paramName, out var identifiers)) continue;
                foreach (var identifier in identifiers)
                {
                    if (selections.ContainsKey(identifier)) continue;
                    var schema = FilterSchema.FirstOrDefault(f => f.Identifier == identifier);
                    if (schema == default) continue;
                    var optName = FindOptionName(schema.Opts, value);
                    if (optName != null)
                        selections[identifier] = optName;
                }
            }

            var filterGroups = new JsonArray();
            foreach (var (identifier, label, opts) in FilterSchema)
            {
                selections.TryGetValue(identifier, out var selectedName);
                filterGroups.Add(BuildFilterGroup(identifier, label, opts, selectedName));
            }

            // Selector.Variant — always empty; ABB API populates product States in the response
            filterGroups.Add(new JsonObject
            {
                ["isFixedFilter"]      = false,
                ["identifier"]         = "Selector.Variant",
                ["isUserAssigned"]     = true,
                ["name"]               = "Product",
                ["fullyQualifiedName"] = "Selector.Variant",
                ["values"]             = new JsonArray(),
                ["properties"]         = new JsonObject
                {
                    ["IsBomItem"] = true, ["Show"] = false, ["Name"] = "Variant",
                    ["EN"] = "Product", ["ReadOnly"] = false, ["Required"] = false
                }
            });

            // Availability — always Global
            filterGroups.Add(new JsonObject
            {
                ["isFixedFilter"]      = false,
                ["identifier"]         = "Selector.availability",
                ["isUserAssigned"]     = false,
                ["name"]               = "Availability",
                ["fullyQualifiedName"] = "Selector.availability",
                ["values"]             = new JsonArray
                {
                    new JsonObject
                    {
                        ["isAssignable"]       = true,
                        ["isSelected"]         = true,
                        ["name"]               = "GL",
                        ["value"]              = "Global",
                        ["fullyQualifiedName"] = "Selector.availability.GL",
                        ["properties"]         = new JsonObject
                            { ["Name"] = "GL", ["EN"] = "Global", ["State"] = 4 }
                    }
                },
                ["properties"] = new JsonObject
                {
                    ["IsBomItem"] = false, ["Show"] = true, ["Name"] = "availability",
                    ["EN"] = "Availability", ["ReadOnly"] = false, ["Required"] = false
                }
            });

            var maps = new JsonArray();
            foreach (var (identifier, _, _) in FilterSchema)
                maps.Add(new JsonObject { ["fqn"] = identifier, ["dbProperty"] = identifier });
            maps.Add(new JsonObject { ["fqn"] = "Selector.Variant",     ["dbProperty"] = "Selector.Variant" });
            maps.Add(new JsonObject { ["fqn"] = "Selector.availability", ["dbProperty"] = "Selector.availability" });

            return new JsonObject
            {
                ["page"]     = 0,
                ["pageSize"] = 100,
                ["request"]  = new JsonObject
                {
                    ["name"]              = "Switchgear",
                    ["description"]       = "",
                    ["fileName"]          = "EPDS_SG.vtz",
                    ["country"]           = "GL",
                    ["type"]              = 3,
                    ["propertySource"]    = "Selector.Variant",
                    ["filterGroups"]      = filterGroups,
                    ["preFilters"]        = new JsonArray(),
                    ["sqlFilters"]        = JsonValue.Create<object?>(null),
                    ["maps"]              = maps,
                    ["metaData"]          = new JsonObject(),
                    ["isSimple"]          = false,
                    ["isFixedParts"]      = false,
                    ["isAccessories"]     = false,
                    ["isComplexSelector"] = false,
                    ["isPrefiltered"]     = false,
                    ["isProduct"]         = true,
                    ["hasMultiSelect"]    = false,
                    ["parent"]            = JsonValue.Create<object?>(null)
                },
                ["user"] = BuildUserNode()
            }.ToJsonString();
        }

        private static JsonObject BuildFilterGroup(
            string identifier, string label, FilterOpt[] opts, string? selectedName)
        {
            var values = new JsonArray();
            foreach (var opt in opts)
            {
                bool selected = selectedName != null &&
                    opt.ApiName.Equals(selectedName, StringComparison.OrdinalIgnoreCase);

                values.Add(new JsonObject
                {
                    ["isAssignable"]       = true,
                    ["isSelected"]         = selected,
                    ["name"]               = opt.ApiName,
                    ["value"]              = opt.DisplayValue,
                    ["fullyQualifiedName"] = $"{identifier}.{opt.ApiName}",
                    ["properties"]         = new JsonObject
                    {
                        ["Name"]  = opt.ApiName,
                        ["EN"]    = opt.DisplayValue,
                        ["State"] = selected ? 4 : 2
                    }
                });
            }

            return new JsonObject
            {
                ["isFixedFilter"]      = false,
                ["identifier"]         = identifier,
                ["isUserAssigned"]     = selectedName != null,
                ["name"]               = label,
                ["fullyQualifiedName"] = identifier,
                ["values"]             = values,
                ["properties"]         = new JsonObject
                {
                    ["IsBomItem"] = false,
                    ["Show"]      = true,
                    ["Name"]      = identifier.Split('.').Last(),
                    ["EN"]        = label,
                    ["ReadOnly"]  = false,
                    ["Required"]  = false
                }
            };
        }

        private static JsonObject BuildUserNode() => new()
        {
            ["username"]          = "Guest User",
            ["culture"]           = "en-EN",
            ["currency"]          = "USD",
            ["isLoggedOn"]        = false,
            ["hasCart"]           = true,
            ["hasUserSettings"]   = false,
            ["country"]           = "GL",
            ["properties"]        = new JsonObject
            {
                ["DisplayName"]     = "Guest User",
                ["SenderId"]        = "CommonBOL",
                ["CartID"]          = "0",
                ["CartDetailID"]    = "0",
                ["ShowAddToList"]   = "true",
                ["ShowAddToCart"]   = "true",
                ["ViewNetPrice"]    = "false",
                ["ViewListPrice"]   = "false",
                ["ViewSalesPrice"]  = "true",
                ["CustomerCode"]    = "0006000074",
                ["CustomerCountry"] = "GL",
                ["BAUCode"]         = "0006000074",
                ["BAUCountry"]      = "GL",
                ["BAUUnit"]         = "L",
                ["GACountry"]       = JsonValue.Create<object?>(null)
            },
            ["name"]               = "Guest User",
            ["authenticationType"] = "File",
            ["isAuthenticated"]    = true,
            ["useLocalCart"]       = true,
            ["customerCurrencies"] = new JsonArray
            {
                new JsonObject
                    { ["kunnr"] = "0006000074", ["waers"] = "USD", ["vkorg"] = "", ["vtweg"] = "" }
            },
            ["products"] = new JsonObject
            {
                ["properties"]         = new JsonObject(),
                ["children"]           = new JsonArray(),
                ["characteristics"]    = new JsonObject(),
                ["additionalProducts"] = new JsonArray()
            }
        };

        // ── Helpers ──────────────────────────────────────────────────────────────────

        // Builds a name→value map from extracted parameters (highest confidence wins on duplicate names).
        private static Dictionary<string, string> BuildParamMap(IEnumerable<ExtractedParameter> parameters)
        {
            var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var p in parameters.OrderByDescending(x => x.ConfidenceScore))
            {
                var key = p.Name?.Trim() ?? string.Empty;
                if (string.IsNullOrEmpty(key) || map.ContainsKey(key)) continue;
                var val = !string.IsNullOrWhiteSpace(p.NormalizedValue) ? p.NormalizedValue : p.Value;
                if (!string.IsNullOrWhiteSpace(val))
                    map[key] = val.Trim();
            }
            return map;
        }

        // Finds the ApiName that best matches an extracted value string.
        // Tries: exact display-value match → numeric proximity → partial contains.
        private static string? FindOptionName(FilterOpt[] opts, string? extracted)
        {
            if (string.IsNullOrWhiteSpace(extracted)) return null;

            var exact = opts.FirstOrDefault(o =>
                o.DisplayValue.Equals(extracted, StringComparison.OrdinalIgnoreCase));
            if (exact != null) return exact.ApiName;

            if (double.TryParse(extracted, NumberStyles.Any, CultureInfo.InvariantCulture, out var num))
            {
                var numeric = opts.FirstOrDefault(o =>
                    double.TryParse(o.DisplayValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var v) &&
                    Math.Abs(v - num) < 0.01);
                if (numeric != null) return numeric.ApiName;
            }

            var partial = opts.FirstOrDefault(o =>
                extracted.Contains(o.DisplayValue, StringComparison.OrdinalIgnoreCase) ||
                o.DisplayValue.Contains(extracted, StringComparison.OrdinalIgnoreCase));

            return partial?.ApiName;
        }

        // ── Response parser ───────────────────────────────────────────────────────────

        // Parses the ABB /materials API response.
        // Products are in the top-level "results" array (not inside filterGroups).
        // onlyAssignable is ignored — filtered calls already receive only compatible products.
        private static List<AbbLiveCatalogProduct> ParseVariantFilterGroup(
            string json, bool onlyAssignable)
        {
            var products = new List<AbbLiveCatalogProduct>();
            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (!root.TryGetProperty("results", out var results) ||
                    results.ValueKind != JsonValueKind.Array)
                    return products;

                foreach (var item in results.EnumerateArray())
                {
                    var key  = StrProp(item, "code") ?? StrProp(item, "externalId") ?? StrProp(item, "name");
                    if (string.IsNullOrWhiteSpace(key)) continue;

                    var name = StrProp(item, "name") ?? StrProp(item, "materialName") ?? key;
                    var desc = StrProp(item, "description") ?? StrProp(item, "productDescription") ?? string.Empty;
                    var img  = StrProp(item, "imageThumb") ?? StrProp(item, "imageLso");
                    var link = StrProp(item, "productLink");

                    // Enrich from the nested properties array if top-level fields are empty
                    if (item.TryGetProperty("properties", out var propsArr) &&
                        propsArr.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var p in propsArr.EnumerateArray())
                        {
                            var pName  = StrProp(p, "name")  ?? string.Empty;
                            var pValue = StrProp(p, "value") ?? string.Empty;
                            if (string.IsNullOrWhiteSpace(pValue)) continue;

                            if (string.IsNullOrEmpty(desc) &&
                                (pName == "Description" || pName == "Translation.EN"))
                                desc = pValue;
                            if (string.IsNullOrEmpty(img) && pName == "Image")
                                img = pValue;
                            if (string.IsNullOrEmpty(link) && pName == "ProductLink")
                                link = pValue;
                        }
                    }

                    products.Add(new AbbLiveCatalogProduct
                    {
                        Key              = key,
                        DisplayName      = name,
                        Description      = desc,
                        ImageUrl         = img   == "-" ? null : img,
                        DocumentationUrl = link  == "-" ? null : link
                    });
                }
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"[AbbCatalog] JSON parse error: {ex.Message}");
            }
            return products;
        }

        private static string? StrProp(JsonElement el, string key) =>
            el.ValueKind == JsonValueKind.Object &&
            el.TryGetProperty(key, out var p) &&
            p.ValueKind == JsonValueKind.String
                ? p.GetString()
                : null;

        private static string? GetStr(JsonElement el, string key) =>
            el.ValueKind == JsonValueKind.Object && el.TryGetProperty(key, out var p) &&
            p.ValueKind == JsonValueKind.String
                ? p.GetString()
                : null;
    }
}
