using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SwitchgearApi.Models;

namespace SwitchgearApi.Services
{
    public class ProductMatchResult
    {
        public string ProductKey { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? DocumentationUrl { get; set; }
        public bool IsRecommended { get; set; }
        public bool IsCompatible { get; set; }
        public double MatchScore { get; set; }
        public List<string> MatchedCriteria { get; set; } = new();
        public List<string> Mismatches { get; set; } = new();
        // Structured classification fields for reliable frontend filtering
        public string InsulationType { get; set; } = string.Empty;
        public string[] Markets { get; set; } = Array.Empty<string>();
    }

    public interface IAbbProductMatchingService
    {
        List<ProductMatchResult> MatchProducts(IEnumerable<ExtractedParameter> parameters);

        // Ensures the live catalog is loaded, then scores every product against the parameters.
        Task<List<ProductMatchResult>> GetAllProductsAsync(IEnumerable<ExtractedParameter> parameters);

        // Calls the live ABB Sales Configurator API with the document's extracted parameters
        // and returns only the products the API marks as compatible (State != 0).
        // Falls back to the static MatchProducts if the API returns nothing.
        Task<List<ProductMatchResult>> MatchProductsLiveAsync(IEnumerable<ExtractedParameter> parameters);
    }

    internal sealed class AbbProduct
    {
        public string Key { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public double MaxVoltageKv { get; init; }
        public double MaxShortCircuitKa { get; init; }
        public double MaxBusbarCurrentA { get; init; }
        public string[] Markets { get; init; } = Array.Empty<string>();
        public string[] Distributions { get; init; } = Array.Empty<string>();
        public string[] InsulationTypes { get; init; } = Array.Empty<string>();
        public string[] BusbarArrangements { get; init; } = Array.Empty<string>();
        public string? ImageUrl { get; init; }
        public string? DocumentationUrl { get; init; }
    }

    public class AbbProductMatchingService : IAbbProductMatchingService
    {
        private readonly IAbbSalesConfiguratorClient _client;
        private readonly ILogger<AbbProductMatchingService> _logger;

        // Live catalog is populated asynchronously on startup; static catalog is the fallback.
        private volatile AbbProduct[]? _liveCatalog;

        public AbbProductMatchingService(
            IAbbSalesConfiguratorClient client,
            ILogger<AbbProductMatchingService> logger)
        {
            _client = client;
            _logger = logger;
            // Warm up token and catalog concurrently at startup so the first request is fast
            Task.Run(() => Task.WhenAll(_client.WarmUpAsync(), RefreshLiveCatalogAsync()));
        }

        private async Task RefreshLiveCatalogAsync()
        {
            try
            {
                var live = await _client.FetchProductCatalogAsync();
                if (live.Count > 0)
                {
                    _liveCatalog = BuildFromLive(live);
                    _logger.LogInformation("[AbbCatalog] Live catalog ready: {Count} products", _liveCatalog.Length);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[AbbCatalog] Background refresh failed — no catalog available");
            }
        }

        private static AbbProduct[] BuildFromLive(List<AbbLiveCatalogProduct> liveProducts)
        {
            return liveProducts.Select(ParseFromLive).ToArray();
        }

        public async Task<List<ProductMatchResult>> MatchProductsLiveAsync(
            IEnumerable<ExtractedParameter> parameters)
        {
            var paramList = parameters.ToList();
            var liveProducts = await _client.FetchFilteredProductsAsync(paramList);

            if (liveProducts.Count == 0)
            {
                _logger.LogInformation("[AbbCatalog] Live filter returned 0 — falling back to local match");
                return MatchProducts(paramList);
            }

            _logger.LogInformation("[AbbCatalog] {Count} compatible products from ABB API", liveProducts.Count);

            return liveProducts.Select(live =>
            {
                var parsed = ParseFromLive(live);
                return new ProductMatchResult
                {
                    ProductKey           = live.Key,
                    ProductName          = live.DisplayName,
                    Description          = live.Description,
                    ImageUrl             = live.ImageUrl,
                    DocumentationUrl     = live.DocumentationUrl,
                    IsRecommended        = true,
                    IsCompatible         = true,
                    MatchScore           = 1.0,
                    MatchedCriteria      = new List<string> { "Confirmed compatible by ABB Sales Configurator" },
                    Mismatches           = new List<string>(),
                    InsulationType       = parsed.InsulationTypes.FirstOrDefault() ?? string.Empty,
                    Markets              = parsed.Markets
                };
            }).ToList();
        }

        private static readonly Regex SpecRe = new(
            @"Up\s+to\s+([\d.]+)\s*kV[,\s]+([\d.]+)\s*kA[,\s]+([\d.]+)\s*A",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static AbbProduct ParseFromLive(AbbLiveCatalogProduct live)
        {
            var m = SpecRe.Match(live.Description);

            // When the description doesn't carry spec data we still include the product
            // with zero specs so it appears in GetAllProducts (scored as 0, not hidden).
            double voltage      = m.Success ? double.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture) : 0;
            double shortCircuit = m.Success ? double.Parse(m.Groups[2].Value, CultureInfo.InvariantCulture) : 0;
            double current      = m.Success ? double.Parse(m.Groups[3].Value, CultureInfo.InvariantCulture) : 0;

            var desc = live.Description;
            var key = live.Key;

            var markets = new List<string>();
            if (desc.Contains("IEC", StringComparison.OrdinalIgnoreCase)) markets.Add("IEC");
            if (desc.Contains("ANSI", StringComparison.OrdinalIgnoreCase)) markets.Add("ANSI");
            if (markets.Count == 0) markets.Add("IEC");

            var distributions = new List<string>();
            if (desc.Contains("Primary", StringComparison.OrdinalIgnoreCase)) distributions.Add("Primary");
            if (desc.Contains("Secondary", StringComparison.OrdinalIgnoreCase)) distributions.Add("Secondary");
            if (distributions.Count == 0) distributions.Add("Primary");

            string[] insulation;
            if (desc.Contains("SF6-free", StringComparison.OrdinalIgnoreCase) ||
                key.Contains("SF6free", StringComparison.OrdinalIgnoreCase))
                insulation = new[] { "GIS (SF6-free)" };
            else if (desc.Contains("Dry air", StringComparison.OrdinalIgnoreCase) ||
                     desc.Contains("DryAir", StringComparison.OrdinalIgnoreCase))
                insulation = new[] { "GIS (Dry Air)" };
            else if (desc.Contains("SF6", StringComparison.OrdinalIgnoreCase) ||
                     (desc.Contains("GIS", StringComparison.OrdinalIgnoreCase) &&
                      !desc.Contains("AIS", StringComparison.OrdinalIgnoreCase)))
                insulation = new[] { "GIS (SF6)" };
            else
                insulation = new[] { "AIS" };

            string[] busbar;
            if (key.Contains("DBB", StringComparison.OrdinalIgnoreCase))
                busbar = new[] { "Double busbar" };
            else if (key.Contains("DLL", StringComparison.OrdinalIgnoreCase))
                busbar = new[] { "Double Level" };
            else
                busbar = new[] { "Single busbar", "Double busbar" };

            return new AbbProduct
            {
                Key = key,
                Name = live.DisplayName,
                Description = live.Description,
                MaxVoltageKv = voltage,
                MaxShortCircuitKa = shortCircuit,
                MaxBusbarCurrentA = current,
                Markets = markets.ToArray(),
                Distributions = distributions.ToArray(),
                InsulationTypes = insulation,
                BusbarArrangements = busbar,
                ImageUrl = live.ImageUrl,
                DocumentationUrl = live.DocumentationUrl
            };
        }

        private AbbProduct[] GetCatalog() => _liveCatalog ?? Array.Empty<AbbProduct>();

        public List<ProductMatchResult> MatchProducts(IEnumerable<ExtractedParameter> parameters)
        {
            var paramMap = BuildParamMap(parameters);
            if (paramMap.Count == 0)
                return new List<ProductMatchResult>();

            return GetCatalog()
                .Select(p => ScoreProduct(p, paramMap))
                .Where(r => r.MatchScore > 0)
                .OrderByDescending(r => r.IsRecommended)
                .ThenByDescending(r => r.MatchScore)
                .ToList();
        }

        public async Task<List<ProductMatchResult>> GetAllProductsAsync(IEnumerable<ExtractedParameter> parameters)
        {
            // If background refresh hasn't finished yet, fetch the catalog inline now
            if (_liveCatalog == null || _liveCatalog.Length == 0)
            {
                var live = await _client.FetchProductCatalogAsync();
                if (live.Count > 0)
                    _liveCatalog = BuildFromLive(live);
            }

            var paramMap = BuildParamMap(parameters);
            return GetCatalog()
                .Select(p => ScoreProduct(p, paramMap))
                .OrderByDescending(r => r.IsRecommended)
                .ThenByDescending(r => r.MatchScore)
                .ThenBy(r => r.ProductName)
                .ToList();
        }

        private static Dictionary<string, string> BuildParamMap(IEnumerable<ExtractedParameter> parameters)
        {
            // Deduplicate by name before building the map — duplicate rows can exist in the DB when
            // the pipeline runs more than once for the same document. Keep the highest-confidence value.
            var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var p in parameters.OrderByDescending(p => p.ConfidenceScore))
            {
                var key = p.Name?.Trim() ?? string.Empty;
                if (!string.IsNullOrEmpty(key) && !map.ContainsKey(key))
                    map[key] = p.Value?.Trim() ?? string.Empty;
            }
            return map;
        }

        // Strips trailing unit suffixes (kV, kA, A, Hz, VA, …) and parses the leading number.
        private static bool TryParseNumeric(string raw, out double value)
        {
            var s = raw.Trim();
            var spaceIdx = s.IndexOf(' ');
            if (spaceIdx > 0) s = s[..spaceIdx];
            return double.TryParse(s, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out value);
        }

        // Look up a value by primary name, then by aliases (extraction pipeline may use different names).
        private static string? GetParamValue(Dictionary<string, string> pm, string primary, params string[] aliases)
        {
            if (pm.TryGetValue(primary, out var v) && !string.IsNullOrWhiteSpace(v)) return v;
            foreach (var alias in aliases)
                if (pm.TryGetValue(alias, out v) && !string.IsNullOrWhiteSpace(v)) return v;
            return null;
        }

        private static ProductMatchResult ScoreProduct(AbbProduct product, Dictionary<string, string> pm)
        {
            var matched = new List<string>();
            var missed = new List<string>();

            void Check(string label, string? val, Func<string, bool> passes, Func<string, string> mismatchMsg)
            {
                if (string.IsNullOrWhiteSpace(val)) return;
                if (passes(val))
                    matched.Add($"{label}: {val}");
                else
                    missed.Add(mismatchMsg(val));
            }

            Check("Market",
                GetParamValue(pm, "Market"),
                v => product.Markets.Any(m => m.Equals(v, StringComparison.OrdinalIgnoreCase)),
                v => $"Market {v} not in [{string.Join(", ", product.Markets)}]");

            Check("Distribution",
                GetParamValue(pm, "Distribution"),
                v => product.Distributions.Any(d => d.Equals(v, StringComparison.OrdinalIgnoreCase)),
                v => $"Distribution {v} not in [{string.Join(", ", product.Distributions)}]");

            // "Enclosure" from extraction maps to insulation type (Metal-enclosed fixed → AIS)
            Check("Insulation",
                GetParamValue(pm, "Insulation", "Enclosure"),
                v =>
                {
                    var normV = NormInsulation(v);
                    // Map extraction value to ABB insulation type
                    if (normV.Contains("metal-enclosed", StringComparison.OrdinalIgnoreCase) ||
                        normV.Contains("ais", StringComparison.OrdinalIgnoreCase))
                        normV = "AIS";
                    else if (normV.Contains("gis", StringComparison.OrdinalIgnoreCase) ||
                             normV.Contains("gas", StringComparison.OrdinalIgnoreCase))
                        normV = "GIS";
                    return product.InsulationTypes.Any(i =>
                        NormInsulation(i).Equals(normV, StringComparison.OrdinalIgnoreCase) ||
                        i.StartsWith(normV, StringComparison.OrdinalIgnoreCase));
                },
                v => $"Insulation {v} → product has {string.Join("/", product.InsulationTypes)}");

            Check("BusbarArrangement",
                GetParamValue(pm, "BusbarArrangement", "BusBbarArrangement"),
                v => product.BusbarArrangements.Any(b => b.Equals(v, StringComparison.OrdinalIgnoreCase)),
                v => $"Busbar arrangement {v} → product supports [{string.Join(", ", product.BusbarArrangements)}]");

            // Voltage: extraction uses "RatedVoltage"; scoring checks v <= product.MaxVoltageKv
            Check("RatedVoltage",
                GetParamValue(pm, "OperatingVoltage", "RatedVoltage"),
                v => product.MaxVoltageKv > 0 && TryParseNumeric(v, out var n) && n <= product.MaxVoltageKv,
                v => $"Voltage {v} kV exceeds product max {product.MaxVoltageKv} kV");

            // Short-circuit: extraction uses "ShortCircuit"; also check CbBreakingCapacity
            Check("ShortCircuit",
                GetParamValue(pm, "ShortCircuitLevel", "ShortCircuit", "CbBreakingCapacity"),
                v => product.MaxShortCircuitKa > 0 && TryParseNumeric(v, out var n) && n <= product.MaxShortCircuitKa,
                v => $"Short-circuit {v} kA exceeds product max {product.MaxShortCircuitKa} kA");

            // Busbar current: extraction uses "BusBbarCurrent" (note typo preserved from BOM schema)
            Check("BusbarCurrent",
                GetParamValue(pm, "RatedBusbarCurrent", "BusBbarCurrent", "BusbarCurrent"),
                v => product.MaxBusbarCurrentA > 0 && TryParseNumeric(v, out var n) && n <= product.MaxBusbarCurrentA,
                v => $"Busbar current {v} A exceeds product max {product.MaxBusbarCurrentA} A");

            int total = matched.Count + missed.Count;
            double score = total == 0 ? 0 : Math.Round((double)matched.Count / total, 2);

            // Recommended: zero mismatches AND matched at least 3 criteria (or all criteria if fewer
            // than 3 were present in the document — avoids penalising sparse RFQs).
            int recommendedMinMatch = Math.Min(3, total);
            bool isRecommended = missed.Count == 0 && matched.Count >= recommendedMinMatch && total > 0;

            return new ProductMatchResult
            {
                ProductKey = product.Key,
                ProductName = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                DocumentationUrl = product.DocumentationUrl,
                IsRecommended = isRecommended,
                IsCompatible = !isRecommended && total > 0 && score >= 0.65 && missed.Count <= 2,
                MatchScore = score,
                MatchedCriteria = matched,
                Mismatches = missed,
                InsulationType = product.InsulationTypes.FirstOrDefault() ?? string.Empty,
                Markets = product.Markets
            };
        }

        private static string NormInsulation(string s) =>
            s.Replace("Dry air", "Dry Air", StringComparison.OrdinalIgnoreCase).Trim();
    }
}
