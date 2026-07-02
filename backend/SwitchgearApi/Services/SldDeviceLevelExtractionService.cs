using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace SwitchgearApi.Services
{
    public class SldDeviceExtraction
    {
        public int          PanelPosition       { get; set; }
        public string       FunctionalPosition  { get; set; } = string.Empty;
        public string       PanelType           { get; set; } = string.Empty;
        public string       CBModel             { get; set; } = string.Empty;
        public string       CBRating            { get; set; } = string.Empty;
        public string       CTRatio             { get; set; } = string.Empty;
        public string       VTRatio             { get; set; } = string.Empty;
        public string       RelayModel          { get; set; } = string.Empty;
        public List<string> ProtectionFunctions { get; set; } = new();
        public double       Confidence          { get; set; } = 0.75;
    }

    public interface ISldDeviceLevelExtractionService
    {
        List<SldDeviceExtraction> ExtractFromSldResult(SldVisionResult sldResult);
    }

    public interface ISldPanelSegmentationService
    {
        List<string> SummarizePanels(SldVisionResult sldResult);
    }

    public class SldDeviceLevelExtractionService : ISldDeviceLevelExtractionService
    {
        private static readonly Regex AnsiPattern = new(@"^\d+[/\w]*$", RegexOptions.Compiled);

        private readonly ILogger<SldDeviceLevelExtractionService> _logger;

        public SldDeviceLevelExtractionService(ILogger<SldDeviceLevelExtractionService> logger)
        {
            _logger = logger;
        }

        public List<SldDeviceExtraction> ExtractFromSldResult(SldVisionResult sldResult)
        {
            var results = sldResult.Panels.Select(panel => new SldDeviceExtraction
            {
                PanelPosition       = panel.Position,
                FunctionalPosition  = panel.PanelId,
                PanelType           = NormalizeType(panel.Type),
                CBModel             = panel.CbModel,
                CBRating            = string.Empty,
                CTRatio             = panel.CtRatio,
                VTRatio             = panel.VtRatio,
                RelayModel          = panel.RelayType,
                ProtectionFunctions = ParseProtectionFunctions(panel.ProtectionFunctions),
                Confidence          = panel.Confidence
            }).ToList();

            _logger.LogInformation("[PathC-L2] Mapped {Count} device records from SLD panels.", results.Count);
            return results;
        }

        private static string NormalizeType(string? type) => type?.ToLowerInvariant() switch
        {
            "incomer"        => "Incomer",
            "feeder"         => "Feeder",
            "coupler"        => "Coupler",
            "measurement"    => "Metering",
            "busbar_section" => "BusbarSection",
            null or ""       => string.Empty,
            var t            => char.ToUpper(t[0]) + t[1..]
        };

        private static List<string> ParseProtectionFunctions(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return new List<string>();

            return raw
                .Split(new[] { ',', ';', ' ' }, System.StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => AnsiPattern.IsMatch(t))
                .Distinct()
                .ToList();
        }
    }

    public class SldPanelSegmentationService : ISldPanelSegmentationService
    {
        private readonly ILogger<SldPanelSegmentationService> _logger;

        public SldPanelSegmentationService(ILogger<SldPanelSegmentationService> logger)
        {
            _logger = logger;
        }

        public List<string> SummarizePanels(SldVisionResult sldResult)
        {
            return sldResult.Panels.Select(panel =>
                $"{panel.Position}: {panel.PanelId} ({panel.Type}) " +
                $"CB={panel.CbModel} CT={panel.CtRatio} Relay={panel.RelayType}"
            ).ToList();
        }
    }
}
