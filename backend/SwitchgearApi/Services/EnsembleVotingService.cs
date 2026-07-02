using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using SwitchgearApi.Models;

namespace SwitchgearApi.Services
{
    public class EnsembleVotingResult
    {
        public List<ExtractedParameter> Accepted   { get; set; } = new();
        public List<DeviationItem>      Deviations { get; set; } = new();
    }

    public interface IEnsembleVotingService
    {
        EnsembleVotingResult Vote(int documentPackageId, List<ExtractedParameter> pathResults);
    }

    public class EnsembleVotingService : IEnsembleVotingService
    {
        public static readonly string[] RequiredLevel1Params =
        {
            "OperatingVoltage", "ShortCircuitLevel", "RatedBusbarCurrent", "PanelRatedCurrent",
            "Frequency", "Market", "BusbarArrangement", "Insulation", "Distribution",
            "IngressProtection", "InternalArcClassification"
        };

        private static readonly HashSet<string> NumericParams = new(StringComparer.OrdinalIgnoreCase)
        {
            "OperatingVoltage", "ShortCircuitLevel", "RatedBusbarCurrent", "PanelRatedCurrent", "Frequency"
        };

        private readonly ILogger<EnsembleVotingService> _logger;

        public EnsembleVotingService(ILogger<EnsembleVotingService> logger)
        {
            _logger = logger;
        }

        public EnsembleVotingResult Vote(int documentPackageId, List<ExtractedParameter> pathResults)
        {
            var result = new EnsembleVotingResult();

            // Group by (instance, parameter name)
            var groups = pathResults
                .GroupBy(p => (InstanceId: p.SwitchgearInstanceId ?? 0, p.Name));

            foreach (var group in groups)
            {
                var paramName  = group.Key.Name;
                var instanceId = group.Key.InstanceId;
                var candidates = group.ToList();

                // Find the value that most paths agree on
                var (winnerValue, agreeingPaths, minority) = FindMajority(paramName, candidates);

                if (winnerValue == null)
                {
                    // Should not happen — group is non-empty, but guard anyway
                    continue;
                }

                var winnerCandidates = agreeingPaths
                    .OrderByDescending(c => c.ConfidenceScore)
                    .ToList();
                var best = winnerCandidates.First();

                double confidence;
                bool   flagged;
                string? deviationDesc = null;
                string  deviationSeverity = "Medium";

                bool hasContradiction = minority != null;

                if (hasContradiction)
                {
                    // Contradicting values between paths — the only genuine confidence issue.
                    // A document with no SLD (Path C absent) or no DI result (Path A absent)
                    // is NOT a contradiction; absence is neutral.
                    confidence = 0.50;
                    flagged    = true;
                    deviationDesc = $"Contradiction: {agreeingPaths.Count} path(s) report " +
                                    $"{paramName}={winnerValue}, but " +
                                    $"{minority!.ExtractionPath} reports {minority.Value}.";
                    deviationSeverity = "High";
                }
                else if (agreeingPaths.Count >= 2)
                {
                    // Multiple independent paths agree — boost confidence slightly.
                    confidence = Math.Min(0.99, best.ConfidenceScore + 0.10);
                    flagged    = confidence < 0.75;
                    // No deviation needed for multi-path agreement.
                }
                else
                {
                    // Single path found the value; no other path contradicted it.
                    // Absence of Path A (DI) or Path C (SLD) when the document has no
                    // diagram / DI model is NOT a reason to penalise confidence.
                    // Use the extraction's own quality score directly.
                    confidence = best.ConfidenceScore;
                    flagged    = confidence < 0.75;
                    // No deviation raised — trust the extraction's internal confidence.
                }

                var accepted = new ExtractedParameter
                {
                    DocumentPackageId    = documentPackageId,
                    SwitchgearInstanceId = best.SwitchgearInstanceId,
                    SwitchgearInstanceName = best.SwitchgearInstanceName,
                    Name                 = paramName,
                    Value                = best.Value,
                    Unit                 = best.Unit,
                    NormalizedValue      = best.NormalizedValue,
                    ConfidenceScore      = confidence,
                    FlaggedForReview     = flagged,
                    ExtractionPath       = string.Join(",", agreeingPaths.Select(c => c.ExtractionPath).Distinct()),
                    SourceText           = best.SourceText,
                    SourceBoundingBox    = best.SourceBoundingBox,
                    SourcePageNumber     = best.SourcePageNumber,
                    IsAbbDefault         = false,
                    ExtractionReason     = $"Ensemble: {agreeingPaths.Count} path(s) agree"
                };

                result.Accepted.Add(accepted);

                if (deviationDesc != null)
                {
                    result.Deviations.Add(new DeviationItem
                    {
                        DocumentPackageId = documentPackageId,
                        Type              = "LowConfidence",
                        Severity          = deviationSeverity,
                        Description       = deviationDesc,
                        AffectedField     = paramName,
                        SuggestedValue    = winnerValue,
                        EngineersComment  = string.Empty,
                        SourcePageNumbers = Array.Empty<int>(),
                        Resolved          = false,
                        CreatedAt         = DateTime.UtcNow
                    });
                }
            }

            _logger.LogInformation(
                "[Ensemble] {Accepted} accepted, {Deviations} deviation(s) from {Total} path results.",
                result.Accepted.Count, result.Deviations.Count, pathResults.Count);

            return result;
        }

        // Returns (majorityValue, agreeingCandidates, firstMinorityCandiate)
        private static (string? Winner, List<ExtractedParameter> Agreeing, ExtractedParameter? Minority)
            FindMajority(string paramName, List<ExtractedParameter> candidates)
        {
            if (candidates.Count == 0)
                return (null, new List<ExtractedParameter>(), null);

            // Try each candidate as a potential winner; count how many others agree
            var best = candidates
                .Select(pivot =>
                {
                    var agreeing = candidates
                        .Where(c => ValuesAgree(paramName, pivot.Value, c.Value))
                        .ToList();
                    var minority = candidates
                        .FirstOrDefault(c => !ValuesAgree(paramName, pivot.Value, c.Value));
                    return (Pivot: pivot.Value, Agreeing: agreeing, Minority: minority);
                })
                .OrderByDescending(x => x.Agreeing.Count)
                .ThenByDescending(x => x.Agreeing.Max(c => c.ConfidenceScore))
                .First();

            return (best.Pivot, best.Agreeing, best.Minority);
        }

        private static bool ValuesAgree(string paramName, string? a, string? b)
        {
            if (string.IsNullOrWhiteSpace(a) || string.IsNullOrWhiteSpace(b))
                return false;

            if (NumericParams.Contains(paramName))
            {
                var aNorm = a.Replace(',', '.');
                var bNorm = b.Replace(',', '.');
                if (double.TryParse(aNorm, System.Globalization.NumberStyles.Float,
                        System.Globalization.CultureInfo.InvariantCulture, out var aNum) &&
                    double.TryParse(bNorm, System.Globalization.NumberStyles.Float,
                        System.Globalization.CultureInfo.InvariantCulture, out var bNum))
                {
                    var denominator = Math.Max(Math.Abs(aNum), Math.Max(Math.Abs(bNum), 1.0));
                    return Math.Abs(aNum - bNum) / denominator < 0.05;
                }
                return false;
            }

            return string.Equals(a.Trim(), b.Trim(), StringComparison.OrdinalIgnoreCase);
        }
    }
}
