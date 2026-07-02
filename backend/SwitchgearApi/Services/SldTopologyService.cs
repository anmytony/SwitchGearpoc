using System.Linq;
using Microsoft.Extensions.Logging;

namespace SwitchgearApi.Services
{
    public interface ISldTopologyService
    {
        PythonTopologySummary BuildTopology(SldVisionResult sldResult);
    }

    public class SldTopologyService : ISldTopologyService
    {
        private readonly ILogger<SldTopologyService> _logger;

        public SldTopologyService(ILogger<SldTopologyService> logger)
        {
            _logger = logger;
        }

        public PythonTopologySummary BuildTopology(SldVisionResult sldResult)
        {
            var summary = new PythonTopologySummary();

            foreach (var panel in sldResult.Panels)
            {
                summary.TotalPanels++;
                var type = panel.Type ?? string.Empty;
                var desc = panel.Description ?? string.Empty;

                if (IsIncomer(type, desc))        summary.Incomers++;
                else if (IsFeeder(type, desc))    summary.Feeders++;
                else if (IsCoupler(type, desc))   summary.Couplers++;
                else if (IsMetering(type, desc))  summary.Metering++;
                else if (IsTransformer(desc))     summary.Transformers++;
            }

            summary.BusbarSections = summary.Couplers + 1;

            summary.Description = BuildDescription(summary);

            _logger.LogInformation(
                "[Topology] {TotalPanels} panels → {Description}",
                summary.TotalPanels, summary.Description);

            return summary;
        }

        private static bool IsIncomer(string type, string desc) =>
            Eq(type, "incomer") ||
            ContainsAny(desc, "arriv", "incom", "arrivée", "arrivo", "einspeise");

        private static bool IsFeeder(string type, string desc) =>
            Eq(type, "feeder") ||
            ContainsAny(desc, "départ", "feeder", "sortie", "partenza", "abgang");

        private static bool IsCoupler(string type, string desc) =>
            Eq(type, "coupler") ||
            ContainsAny(desc, "couplage", "coupler", "bus-tie", "accoppiatore", "kupplung");

        private static bool IsMetering(string type, string desc) =>
            Eq(type, "measurement") ||
            ContainsAny(desc, "comptage", "metering", "mesure", "misura", "messung");

        private static bool IsTransformer(string desc) =>
            ContainsAny(desc, "transfo", "transformer", "trasformatore");

        private static bool Eq(string a, string b) =>
            string.Equals(a, b, System.StringComparison.OrdinalIgnoreCase);

        private static bool ContainsAny(string text, params string[] keywords) =>
            keywords.Any(k => text.Contains(k, System.StringComparison.OrdinalIgnoreCase));

        private static string BuildDescription(PythonTopologySummary s)
        {
            var parts = new System.Collections.Generic.List<string>();
            if (s.Incomers     > 0) parts.Add($"{s.Incomers}-incomer");
            if (s.Feeders      > 0) parts.Add($"{s.Feeders}-feeder");
            if (s.Couplers     > 0) parts.Add($"{s.Couplers}-coupler");
            if (s.Metering     > 0) parts.Add($"{s.Metering}-metering");
            if (s.Transformers > 0) parts.Add($"{s.Transformers}-transformer");

            var joined = parts.Count > 0 ? string.Join(" + ", parts) : "unknown";
            return $"{joined} ({s.BusbarSections} section(s))";
        }
    }
}
