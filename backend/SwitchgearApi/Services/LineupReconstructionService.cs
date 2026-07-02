using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using SwitchgearApi.Models;

namespace SwitchgearApi.Services
{
    /// <summary>
    /// Reconstructs the switchgear cubicle lineup from extracted data.
    ///
    /// Priority order:
    ///   1. SLD vision result  — panels read directly from the diagram image
    ///   2. Heuristic fallback — standard incomer/outgoer/coupler lineup
    ///
    /// The vision path produces accurate panel counts, types, positions, and device
    /// details (CT ratios, relay types) extracted from the actual SLD.
    /// </summary>
    public interface ILineupReconstructionService
    {
        Task<List<SwitchgearCubicle>> ReconstructLineupAsync(DocumentPackage package, IReadOnlyList<ExtractedParameter> parameters);
    }

    public class LineupReconstructionService : ILineupReconstructionService
    {
        private static readonly JsonSerializerOptions JsonOpts =
            new() { PropertyNameCaseInsensitive = true };

        public async Task<List<SwitchgearCubicle>> ReconstructLineupAsync(DocumentPackage package, IReadOnlyList<ExtractedParameter> parameters)
        {
            // ── 1. Try to build lineup from SLD vision result ──────────────────────────
            if (package.Pages != null)
            {
                foreach (var page in package.Pages)
                {
                    var content = page?.RawContent ?? string.Empty;
                    if (!content.StartsWith("[SLD_RESULT:", StringComparison.Ordinal))
                        continue;

                    try
                    {
                        var json      = content["[SLD_RESULT:".Length..^1];
                        var sldResult = JsonSerializer.Deserialize<SldVisionResult>(json, JsonOpts);

                        if (sldResult?.Panels?.Count > 0)
                        {
                            Console.WriteLine(
                                $"[LineupReconstruction] Building lineup from SLD vision: " +
                                $"{sldResult.Panels.Count} panel(s), title='{sldResult.DiagramTitle}'.");
                            return BuildLineupFromSld(sldResult, package.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[LineupReconstruction] Failed to parse SLD result: {ex.Message}");
                    }
                }
            }

            // ── 2. Build from extracted topology parameters (no fallback heuristic) ────
            string GetParam(string name) => (parameters ?? Array.Empty<ExtractedParameter>())
                .FirstOrDefault(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase))
                ?.NormalizedValue ?? string.Empty;

            var incomersStr = GetParam("NumberOfIncomers");
            var feedersStr  = GetParam("NumberOfFeeders");
            var couplersStr = GetParam("NumberOfBusCouplers");
            var totalStr    = GetParam("TotalCubicles");

            bool hasTopologyData = !string.IsNullOrEmpty(incomersStr) ||
                                   !string.IsNullOrEmpty(feedersStr)  ||
                                   !string.IsNullOrEmpty(couplersStr) ||
                                   !string.IsNullOrEmpty(totalStr);

            if (hasTopologyData)
            {
                int.TryParse(incomersStr, out int incomers);
                int.TryParse(feedersStr,  out int feeders);
                int.TryParse(couplersStr, out int couplers);
                int.TryParse(totalStr,    out int total);

                // Derive missing counts from total when partial data is available
                if (total > 0 && incomers == 0 && feeders == 0)
                {
                    incomers = 1;
                    feeders  = Math.Max(0, total - incomers - couplers);
                }

                Console.WriteLine(
                    $"[LineupReconstruction] Building from extracted topology: " +
                    $"total={total}, incomers={incomers}, feeders={feeders}, couplers={couplers}.");
                return BuildTopologyLineup(package.Id, incomers, feeders, couplers);
            }

            // No SLD data and no topology parameters extracted
            Console.WriteLine("[LineupReconstruction] No SLD vision data and no topology parameters found — empty lineup.");
            return new List<SwitchgearCubicle>();
        }

        // ===================== SLD-driven reconstruction =====================

        private static List<SwitchgearCubicle> BuildLineupFromSld(SldVisionResult sld, int documentId)
        {
            var lineup = new List<SwitchgearCubicle>();

            foreach (var panel in sld.Panels)
            {
                var cubicleType = NormalizePanelType(panel.Type);
                var cubicle = new SwitchgearCubicle
                {
                    DocumentPackageId = documentId,
                    Position          = panel.Position,
                    Type              = cubicleType,
                    AbbProductFamily  = "UniGear ZS1",
                    AbbArticleNumber  = SelectArticleNumber(cubicleType),
                    Quantity          = 1,
                    ConfidenceScore   = Math.Round(panel.Confidence, 2),
                    TopologyWarning   = string.Empty
                };

                // Populate devices from what the vision model found in the panel.
                AddDevicesFromSldPanel(cubicle, panel);

                lineup.Add(cubicle);
            }

            return lineup;
        }

        private static void AddDevicesFromSldPanel(SwitchgearCubicle cubicle, SldPanel panel)
        {
            if (panel.HasCircuitBreaker)
            {
                cubicle.Devices.Add(new DeviceSelection
                {
                    DeviceType      = "Circuit Breaker",
                    AbbArticleNumber = string.Empty,
                    Description     = "Detected from SLD",
                    Quantity        = 1,
                    ConfidenceScore = 0.88
                });
            }

            if (!string.IsNullOrWhiteSpace(panel.CtRatio))
            {
                cubicle.Devices.Add(new DeviceSelection
                {
                    DeviceType      = "CT",
                    AbbArticleNumber = string.Empty,
                    Description     = panel.CtRatio,
                    Quantity        = 1,
                    ConfidenceScore = 0.85
                });
            }

            if (panel.HasVoltageTransformer)
            {
                cubicle.Devices.Add(new DeviceSelection
                {
                    DeviceType      = "VT",
                    AbbArticleNumber = string.Empty,
                    Description     = string.IsNullOrWhiteSpace(panel.VtRatio) ? "Detected from SLD" : panel.VtRatio,
                    Quantity        = 1,
                    ConfidenceScore = 0.82
                });
            }

            if (!string.IsNullOrWhiteSpace(panel.RelayType))
            {
                cubicle.Devices.Add(new DeviceSelection
                {
                    DeviceType      = "Protection Relay",
                    AbbArticleNumber = string.Empty,
                    Description     = panel.RelayType,
                    Quantity        = 1,
                    ConfidenceScore = 0.80
                });
            }
        }

        // ===================== Topology-driven lineup =====================

        private static List<SwitchgearCubicle> BuildTopologyLineup(int documentId, int incomers, int feeders, int couplers)
        {
            var lineup = new List<SwitchgearCubicle>();
            int position = 1;

            // Layout: [incomers] [first half feeders] [couplers] [second half feeders]
            int feedersFirst  = couplers > 0 ? feeders / 2 : feeders;
            int feedersSecond = couplers > 0 ? feeders - feedersFirst : 0;

            for (int i = 0; i < Math.Max(incomers, 0); i++)
                lineup.Add(AddCbCt(Cubicle(documentId, position++, "incomer", SelectArticleNumber("incomer"), 0.88)));

            for (int i = 0; i < feedersFirst; i++)
                lineup.Add(AddCbCt(Cubicle(documentId, position++, "outgoer", SelectArticleNumber("outgoer"), 0.85)));

            for (int i = 0; i < Math.Max(couplers, 0); i++)
                lineup.Add(Cubicle(documentId, position++, "coupler", SelectArticleNumber("coupler"), 0.85));

            for (int i = 0; i < feedersSecond; i++)
                lineup.Add(AddCbCt(Cubicle(documentId, position++, "outgoer", SelectArticleNumber("outgoer"), 0.85)));

            return lineup;
        }

        private static SwitchgearCubicle AddCbCt(SwitchgearCubicle cub)
        {
            cub.Devices.Add(new DeviceSelection
            {
                DeviceType       = "Circuit Breaker",
                AbbArticleNumber = string.Empty,
                Description      = string.Empty,
                Quantity         = 1,
                ConfidenceScore  = 0.85
            });
            cub.Devices.Add(new DeviceSelection
            {
                DeviceType       = "CT",
                AbbArticleNumber = string.Empty,
                Description      = string.Empty,
                Quantity         = 1,
                ConfidenceScore  = 0.80
            });
            return cub;
        }

        // ===================== Helpers =====================

        // Map vision-returned type strings to the canonical cubicle type values used
        // in the rest of the application.
        private static string NormalizePanelType(string rawType) =>
            (rawType ?? string.Empty).ToLowerInvariant() switch
            {
                "incomer"        => "incomer",
                "feeder"         => "outgoer",
                "outgoer"        => "outgoer",
                "coupler"        => "coupler",
                "measurement"    => "metering",
                "metering"       => "metering",
                "busbar_section" => "busbar_section",
                _                => "outgoer"          // safe default
            };

        private static string SelectArticleNumber(string cubicleType) => cubicleType switch
        {
            "incomer"        => "1SDA065534R1",
            "coupler"        => "1SDA066356R1",
            "busbar_section" => "1SDA065500R1",
            "metering"       => "1SDA065520R1",
            _                => "1SDA065534R1"  // outgoer / feeder
        };

        private static SwitchgearCubicle Cubicle(
            int documentId, int position, string type, string article, double confidence) =>
            new()
            {
                DocumentPackageId = documentId,
                Position          = position,
                Type              = type,
                AbbProductFamily  = "UniGear ZS1",
                AbbArticleNumber  = article,
                Quantity          = 1,
                ConfidenceScore   = confidence,
                TopologyWarning   = string.Empty
            };
    }
}
