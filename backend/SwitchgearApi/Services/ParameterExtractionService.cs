using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using SwitchgearApi.Models;

namespace SwitchgearApi.Services
{
    /// <summary>
    /// Extracts switchgear configuration parameters from RFQ documents and normalizes them to the
    /// ABB configurator's allowed values. LLM is the primary extractor (when configured); the regex
    /// /rule layer validates LLM output and also serves as the standalone fallback. Numeric values
    /// are snapped to the nearest allowed value (out-of-range values are flagged); enumerated values
    /// are validated against their allowed options.
    /// </summary>
    public interface IParameterExtractionService
    {
        Task<List<ExtractedParameter>> ExtractParametersAsync(DocumentPackage package);
    }

    public class ParameterExtractionService : IParameterExtractionService
    {
        // ===== Allowed values — sourced from ParameterAllowedValues (single source of truth) =====
        private static readonly double[] VoltageKv      = ParameterAllowedValues.VoltageKv;
        private static readonly double[] ShortCircuitKa = ParameterAllowedValues.ShortCircuitKa;
        private static readonly double[] BusbarCurrentA = ParameterAllowedValues.BusbarCurrentA;
        private static readonly double[] PanelCurrentA  = ParameterAllowedValues.PanelCurrentA;
        private static readonly double[] FrequencyHz    = ParameterAllowedValues.FrequencyHz;

        private const double SnapToleranceRel = 0.10;   // > 10% from the nearest allowed value => out of range
        private const double OutOfRangePenalty = 0.25;

        // ===== Regexes (capture group 1 = value) =====
        // Primary patterns: require the unit suffix inline with the value (high precision)

        // Tier-1 voltage: explicit switchgear insulation class labels — Um, Ur, "rated voltage",
        // "tension assignée" (FR), "tensione nominale" (IT), "Nennspannung" (DE).
        // These always refer to the switchgear's rated voltage (Um), not the network voltage.
        // Up to 20 non-digit chars allowed between the label and the numeric value to handle
        // formats like "Rated voltage (Um): 12 kV" or "Um = 12 kV".
        // French NOTE: "tension nominale" = NETWORK nominal voltage → excluded from tier-1.
        //              "tension assignée" = IEC 62271 French term for switchgear Um → included.
        // Italian NOTE: "tensione nominale" in IT switchgear specs = equipment Um → included.
        private static readonly Regex RatedVoltageRx = new(
            @"(?:\bUm\b|\bUr\b|(?:rated|nominal|maximum)\s+voltage|tension\s+assign[ée]e|tensione\s+nominale|Nennspannung|highest\s+voltage\s+for\s+equipment)[^0-9\n]{0,20}(\d+(?:[\.,]\d+)?)\s*kV(?![A-Za-z])",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        // Tier-2 voltage: "rated voltage" or "nominal voltage" — prefix is REQUIRED (not optional).
        // Making the prefix mandatory ensures "Operating Voltage" and "Rated Operating Voltage"
        // never match: "rated\s+voltage" demands the two words to be adjacent, so "rated operating
        // voltage" cannot satisfy the pattern (there is a word "operating" in between).
        private static readonly Regex VoltageRx = new(
            @"(?:rated|nominal)\s+(?:voltage|tensione)\s*[:=\-]?\s*(\d+(?:[\.,]\d+)?)\s*kV(?![A-Za-z])",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex ShortCircuitRx = new(
            @"\b(?:short\s*circuit|short[- ]?time\s*withstand|isc|ik""?|withstand|corrente\s+di\s+cortocircuito|tenuta\s+al\s+cortocircuito|icc)\s*(?:level|current|rating)?\s*[:=\-]?\s*(\d+(?:[\.,]\d+)?)\s*kA(?![A-Za-z])",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        // Busbar current: "busbar" or Italian "sbarra" keyword followed (within ~40 chars) by an amperage.
        private static readonly Regex BusbarCurrentRx = new(
            @"\b(?:busbar|sbarra\s+principale|sbarra)\b[^\n]{0,40}?\b(\d{2,4})\s*A\b(?![A-Za-z])",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex PanelCurrentRx = new(
            @"\b(?:panel|feeder|rated\s*current|scomparto|pannello|uscita)\b[^\n]{0,40}?\b(\d{2,4})\s*A\b(?![A-Za-z])",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex AnyCurrentRx = new(
            @"\b(\d{2,4})\s*A\b(?![A-Za-z])",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex FrequencyRx = new(
            @"(?:frequency|freq\.|frequenza\s+(?:nominale|di\s+sistema)|frequenza)\s*[:=\-]?\s*(50|60)\s*Hz",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        // Table-aware patterns: match label followed by a bare number (unit in column header, not inline).
        // Used as fallback when the primary pattern does not match — common in OCR'd table images.

        // Tier-1 table: same label set as RatedVoltageRx but without the inline kV requirement.
        private static readonly Regex RatedVoltageTableRx = new(
            @"(?:\bUm\b|\bUr\b|(?:rated|nominal|maximum)\s+voltage|tension\s+assign[ée]e|tensione\s+nominale|Nennspannung)[^0-9\n]{0,20}(\d+(?:[.,]\d+)?)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        // Tier-2 table: "rated/nominal voltage" table variant — prefix REQUIRED for the same reason.
        private static readonly Regex VoltageTableRx = new(
            @"(?:rated|nominal)\s+(?:voltage|tensione)\s*[\t:=\-]\s*(\d+(?:[.,]\d+)?)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex ShortCircuitTableRx = new(
            @"(?:short[\s\-]?circuit|short[\s\-]?time\s*withstand|corrente\s+di\s+cortocircuito|tenuta\s+al\s+cortocircuito)\s*(?:current|level|rating)?\s*[\t:=\-]\s*(\d+(?:[.,]\d+)?)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex BusbarTableRx = new(
            @"(?:(?:rated\s+)?(?:busbar|sbarra(?:\s+principale)?)\s+(?:rated\s+)?current|corrente\s+(?:nominale\s+)?(?:di\s+)?sbarra)\s*[\t:=\-]\s*(\d{3,4})",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex PanelTableRx = new(
            @"(?:(?:panel|feeder|outgoing|scomparto|pannello)\s+(?:rated\s+)?current|corrente\s+nominale\s+(?:pannello|scomparto|uscita))\s*[\t:=\-]\s*(\d{3,4})",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex FrequencyTableRx = new(
            @"(?:system\s+)?(?:frequency|freq\.?|frequenza(?:\s+(?:nominale|di\s+sistema))?)\s*[\t:=\-]\s*(50|60)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        // ===== Enumerated options — sourced from ParameterAllowedValues =====
        private static readonly string[] MarketOptions            = ParameterAllowedValues.MarketOptions;
        private static readonly string[] BusbarArrangementOptions = ParameterAllowedValues.BusbarArrangementOptions;
        private static readonly string[] InsulationOptions        = ParameterAllowedValues.InsulationOptions;
        private static readonly string[] DistributionOptions      = ParameterAllowedValues.DistributionOptions;

        // Text token -> canonical option. Ordered most-specific first so e.g. "SF6 free" wins over "SF6".
        private static readonly Dictionary<string, (string Token, string Canonical)[]> EnumSynonyms =
            new(StringComparer.OrdinalIgnoreCase)
            {
                ["Market"] = new[] { ("ANSI", "ANSI"), ("IEC", "IEC") },
                ["BusbarArrangement"] = new[]
                {
                    ("double level",   "Double Level"),
                    ("doppio livello", "Double Level"),
                    ("double busbar",  "Double busbar"),
                    ("doppia sbarra",  "Double busbar"),
                    ("single busbar",  "Single busbar"),
                    ("singola sbarra", "Single busbar")
                },
                ["Insulation"] = new[]
                {
                    ("sf6 free",     "GIS (SF6-free)"),
                    ("sf6-free",     "GIS (SF6-free)"),
                    ("sf6free",      "GIS (SF6-free)"),
                    ("senza sf6",    "GIS (SF6-free)"),
                    ("dry air",      "GIS (Dry Air)"),
                    ("aria secca",   "GIS (Dry Air)"),
                    ("sf6",          "GIS (SF6)"),
                    ("gas sf6",      "GIS (SF6)"),
                    ("ais",          "AIS"),
                    ("aria",         "AIS"),
                    ("gis",          "GIS (SF6)")
                },
                ["Distribution"] = new[]
                {
                    ("primary",                "Primary"),
                    ("primario",               "Primary"),
                    ("distribuzione primaria", "Primary"),
                    ("secondary",              "Secondary"),
                    ("secondario",             "Secondary"),
                    ("distribuzione secondaria", "Secondary")
                }
            };

        private enum Kind { Numeric, Enum }

        private sealed record ParamSpec(
            string Name,
            Kind Kind,
            string Unit,
            double BasePrior,
            double[]? Allowed,
            string[]? Options);

        // The switchgear-configuration checklist. Drives both the LLM guardrail and the regex fallback.
        private static readonly List<ParamSpec> Catalog = new()
        {
            new("OperatingVoltage",   Kind.Numeric, "kV", 0.86, VoltageKv,      null),
            new("ShortCircuitLevel",  Kind.Numeric, "kA", 0.82, ShortCircuitKa, null),
            new("RatedBusbarCurrent", Kind.Numeric, "A",  0.80, BusbarCurrentA, null),
            new("PanelRatedCurrent",  Kind.Numeric, "A",  0.80, PanelCurrentA,  null),
            new("Frequency",          Kind.Numeric, "Hz", 0.90, FrequencyHz,    null),
            new("Market",             Kind.Enum,    "",   0.74, null, MarketOptions),
            new("BusbarArrangement",  Kind.Enum,    "",   0.74, null, BusbarArrangementOptions),
            new("Insulation",         Kind.Enum,    "",   0.74, null, InsulationOptions),
            new("Distribution",       Kind.Enum,    "",   0.74, null, DistributionOptions)
        };

        private static ParamSpec? FindSpec(string? name) =>
            Catalog.FirstOrDefault(s => string.Equals(s.Name, name, StringComparison.OrdinalIgnoreCase));

        private sealed record ParameterCandidate(
            string Name, string Value, string Unit, string NormalizedValue,
            int SourcePageNumber, double ConfidenceScore, string ExtractionReason);

        private readonly ILlmParameterExtractionService _llm;
        private readonly ISldVisionExtractionService   _vision;

        private static readonly JsonSerializerOptions JsonOpts =
            new() { PropertyNameCaseInsensitive = true };

        public ParameterExtractionService(
            ILlmParameterExtractionService llm,
            ISldVisionExtractionService    vision)
        {
            _llm    = llm;
            _vision = vision;
        }

        public async Task<List<ExtractedParameter>> ExtractParametersAsync(DocumentPackage package)
        {
            // Process all pages in parallel — each LLM call is independent.
            // Sequential processing caused ~60 s × N_pages latency; parallelism caps it at one call.
            var pageTasks = package.Pages
                .OrderBy(p => p.PageNumber)
                .Select(page => ExtractPageCandidatesAsync(page, package.Id))
                .ToList();

            var allCandidateBatches = await Task.WhenAll(pageTasks);

            var extracted = new Dictionary<string, List<ParameterCandidate>>(StringComparer.OrdinalIgnoreCase);
            foreach (var batch in allCandidateBatches)
                foreach (var c in batch)
                    TryAdd(extracted, c);

            return Aggregate(package, extracted);
        }

        private async Task<List<ParameterCandidate?>> ExtractPageCandidatesAsync(
            SwitchgearApi.Models.DocumentPage page,
            int packageId)
        {
            var content = page.RawContent ?? string.Empty;
            var results = new List<ParameterCandidate?>();

            // ── IMAGE PATH ───────────────────────────────────────────────────────
            if (content.StartsWith("[SLD_IMAGE:", StringComparison.Ordinal))
            {
                var imageExtracted = new Dictionary<string, List<ParameterCandidate>>(StringComparer.OrdinalIgnoreCase);
                await ProcessImagePageAsync(page, content, packageId, imageExtracted);
                foreach (var list in imageExtracted.Values)
                    results.AddRange(list);
                return results;
            }

            // ── TEXT PATH ────────────────────────────────────────────────────────
            if (string.IsNullOrWhiteSpace(content))
                return results;

            var boost = string.Equals(page.Classification, "text_tabular", StringComparison.OrdinalIgnoreCase)
                ? 0.08
                : 0.0;

            if (_llm.IsConfigured)
            {
                var llmValues = await _llm.ExtractAsync(content);
                var llmNames  = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var value in llmValues)
                {
                    var c = ValidateLlmValue(value, content, page.PageNumber, boost);
                    results.Add(c);
                    if (c != null) llmNames.Add(c.Name);
                }

                foreach (var candidate in RegexExtractPage(content, page.PageNumber, boost))
                {
                    if (candidate != null && !llmNames.Contains(candidate.Name))
                        results.Add(candidate);
                }
            }
            else
            {
                results.AddRange(RegexExtractPage(content, page.PageNumber, boost));
            }

            return results;
        }

        // ===================== SLD image extraction =====================

        private async Task ProcessImagePageAsync(
            SwitchgearApi.Models.DocumentPage page,
            string content,
            int documentId,
            Dictionary<string, List<ParameterCandidate>> extracted)
        {
            // ── 1. Split raw content into image bytes and optional OCR text ──────────
            // Format written by DocumentProcessingService:
            //   [SLD_IMAGE:{mimeType}]\n{base64}[\n[SLD_OCR_TEXT]\n{ocrText}]
            var firstNewline = content.IndexOf('\n');
            if (firstNewline < 0) return;

            var header   = content[..firstNewline];               // "[SLD_IMAGE:image/png]"
            var mimeType = header[("[SLD_IMAGE:".Length)..^1];    // "image/png"

            var afterHeader = content[(firstNewline + 1)..];

            string base64;
            string ocrText = string.Empty;

            var ocrSep = afterHeader.IndexOf("\n[SLD_OCR_TEXT]\n", StringComparison.Ordinal);
            if (ocrSep >= 0)
            {
                base64  = afterHeader[..ocrSep];
                ocrText = afterHeader[(ocrSep + "\n[SLD_OCR_TEXT]\n".Length)..];
            }
            else
            {
                base64 = afterHeader;
            }

            // ── 2. Vision extraction ──────────────────────────────────────────────────
            if (_vision.IsConfigured)
            {
                try
                {
                    var imageBytes = Convert.FromBase64String(base64);
                    var sldResult  = await _vision.AnalyzeSldAsync(imageBytes, mimeType);

                    if (sldResult != null)
                    {
                        // Replace the image payload with the structured JSON result so that
                        // LineupReconstructionService can read the panel topology later.
                        page.RawContent = $"[SLD_RESULT:{JsonSerializer.Serialize(sldResult)}]";

                        // Map each vision-extracted system parameter into the extraction dict.
                        foreach (var sp in sldResult.SystemParameters)
                        {
                            var candidate = BuildVisionCandidate(sp, page.PageNumber);
                            TryAdd(extracted, candidate);
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Vision failure must not prevent text-based extraction from running.
                    Console.WriteLine($"[ParameterExtraction] Vision call failed for page {page.PageNumber}: {ex.Message}");
                }
            }

            // ── 3. Also run text-based extraction on the OCR text (if available) ────
            // This runs even when vision succeeds, giving regex/LLM a chance to
            // confirm or supplement values found in labels visible to the OCR engine.
            if (!string.IsNullOrWhiteSpace(ocrText))
            {
                const double boost = 0.0; // no tabular boost for OCR from images

                if (_llm.IsConfigured)
                {
                    var llmValues = await _llm.ExtractAsync(ocrText);
                    var llmNames  = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                    foreach (var value in llmValues)
                    {
                        var c = ValidateLlmValue(value, ocrText, page.PageNumber, boost);
                        TryAdd(extracted, c);
                        if (c != null) llmNames.Add(c.Name);
                    }

                    foreach (var candidate in RegexExtractPage(ocrText, page.PageNumber, boost))
                    {
                        if (candidate != null && !llmNames.Contains(candidate.Name))
                            TryAdd(extracted, candidate);
                    }
                }
                else
                {
                    foreach (var candidate in RegexExtractPage(ocrText, page.PageNumber, boost))
                        TryAdd(extracted, candidate);
                }
            }
        }

        private static ParameterCandidate? BuildVisionCandidate(SldSystemParameter sp, int pageNumber)
        {
            var spec = FindSpec(sp.Name);
            if (spec == null) return null;

            if (spec.Kind == Kind.Numeric)
            {
                var num = ParseNumber(sp.Value);
                if (num == null) return null;
                return BuildNumeric(spec, num.Value, pageNumber, 0.0,
                    $"Vision-extracted {spec.Name} from SLD diagram (page {pageNumber})");
            }
            else
            {
                var canonical = MatchEnumValue(spec, sp.Value);
                if (canonical == null) return null;
                var confidence = Clamp(spec.BasePrior + 0.05, 0.0, 1.0);
                return new ParameterCandidate(
                    spec.Name, sp.Value ?? canonical, string.Empty, canonical, pageNumber, confidence,
                    $"Vision-extracted {spec.Name} from SLD diagram (page {pageNumber}): '{sp.Value}' → '{canonical}'.");
            }
        }

        // ===================== Regex-only fallback path =====================

        private static IEnumerable<ParameterCandidate?> RegexExtractPage(string content, int page, double boost)
        {
            // Voltage priority: rated/Um labels > bare voltage label > table variants of each.
            // "operating voltage" and "system voltage" patterns are deliberately omitted —
            // they identify the network voltage, not the switchgear insulation class (Um).
            yield return NumericFromRegex("OperatingVoltage", RatedVoltageRx,      content, page, boost)
                         ?? NumericFromRegex("OperatingVoltage", VoltageRx,          content, page, boost)
                         ?? NumericFromRegex("OperatingVoltage", RatedVoltageTableRx, content, page, boost)
                         ?? NumericFromRegex("OperatingVoltage", VoltageTableRx,      content, page, boost);
            yield return NumericFromRegex("ShortCircuitLevel",  ShortCircuitRx,  content, page, boost)
                         ?? NumericFromRegex("ShortCircuitLevel",  ShortCircuitTableRx, content, page, boost);
            yield return NumericFromRegex("RatedBusbarCurrent", BusbarCurrentRx, content, page, boost)
                         ?? NumericFromRegex("RatedBusbarCurrent", BusbarTableRx,  content, page, boost);
            yield return NumericFromRegex("PanelRatedCurrent",  PanelCurrentRx,  content, page, boost)
                         ?? NumericFromRegex("PanelRatedCurrent",  PanelTableRx,   content, page, boost)
                         ?? NumericFromRegex("PanelRatedCurrent",  AnyCurrentRx,   content, page, boost);
            yield return NumericFromRegex("Frequency",          FrequencyRx,     content, page, boost)
                         ?? NumericFromRegex("Frequency",          FrequencyTableRx, content, page, boost);

            yield return EnumFromText("Market",            content, page, boost);
            yield return EnumFromText("BusbarArrangement", content, page, boost);
            yield return EnumFromText("Insulation",        content, page, boost);
            yield return EnumFromText("Distribution",      content, page, boost);
        }

        private static ParameterCandidate? NumericFromRegex(string name, Regex rx, string content, int page, double boost)
        {
            var spec = FindSpec(name)!;
            var match = rx.Match(content);
            if (!match.Success)
            {
                return null;
            }

            var raw = ParseNumber(match.Groups[1].Value);
            if (raw == null)
            {
                return null;
            }

            return BuildNumeric(spec, raw.Value, page, boost, $"Extracted {name} from page {page}");
        }

        private static ParameterCandidate? EnumFromText(string name, string content, int page, double boost)
        {
            var spec = FindSpec(name)!;
            var match = MatchEnumInTextWithRaw(name, content);
            if (match == null)
                return null;

            var (rawToken, canonical) = match.Value;
            var confidence = Clamp(spec.BasePrior + boost, 0.0, 1.0);
            return new ParameterCandidate(
                spec.Name, rawToken, string.Empty, canonical, page, confidence,
                $"Extracted {name} from page {page}; matched '{rawToken}' → '{canonical}'.");
        }

        // ===================== LLM guardrail (validation) =====================

        private static ParameterCandidate? ValidateLlmValue(LlmExtractedValue llm, string content, int page, double boost)
        {
            var spec = FindSpec(llm?.Name);
            if (spec == null)
            {
                return null; // ignore anything outside the configuration checklist
            }

            return spec.Kind == Kind.Numeric
                ? ValidateNumeric(spec, llm!, content, page, boost)
                : ValidateEnum(spec, llm!, content, page, boost);
        }

        private static ParameterCandidate? ValidateNumeric(ParamSpec spec, LlmExtractedValue llm, string content, int page, double boost)
        {
            var num = ParseNumber(ExtractDigits(llm.Value));
            if (num == null)
            {
                return null;
            }

            var (snapped, outOfRange) = Snap(num.Value, spec.Allowed!);
            double confidence;
            string reason;

            if (outOfRange)
            {
                confidence = 0.50;
                reason = $"LLM-extracted {Fmt(num.Value)} {spec.Unit} (page {page}); outside allowed values, snapped to {Fmt(snapped)} {spec.Unit} — flagged for review.";
            }
            else if (ValuePresentInText(content, num.Value))
            {
                confidence = Clamp(spec.BasePrior + boost + 0.04, 0.0, 1.0);
                reason = $"LLM-extracted {spec.Name} (page {page}); value present in text and matches allowed {Fmt(snapped)} {spec.Unit}.";
            }
            else
            {
                confidence = 0.50;
                reason = $"LLM-extracted {spec.Name} (page {page}); value NOT found in source text — possible hallucination, flagged for review.";
            }

            return new ParameterCandidate(spec.Name, Fmt(num.Value), spec.Unit, Fmt(snapped), page, confidence, reason);
        }

        private static ParameterCandidate? ValidateEnum(ParamSpec spec, LlmExtractedValue llm, string content, int page, double boost)
        {
            var canonical = MatchEnumValue(spec, llm.Value);
            double confidence;
            string reason;
            string normalized;

            if (canonical == null)
            {
                confidence = 0.50;
                normalized = llm.Value ?? string.Empty;
                reason = $"LLM-extracted {spec.Name} '{llm.Value}' (page {page}); not an allowed option — flagged for review.";
            }
            else if (MatchEnumInText(spec.Name, content) != null)
            {
                confidence = Clamp(spec.BasePrior + boost + 0.04, 0.0, 1.0);
                normalized = canonical;
                reason = $"LLM-extracted {spec.Name} (page {page}); confirmed in text as '{canonical}'.";
            }
            else
            {
                confidence = Clamp(0.70 + boost, 0.0, 1.0);
                normalized = canonical;
                reason = $"LLM-extracted {spec.Name} (page {page}); allowed option '{canonical}' (not literally found in text).";
            }

            return new ParameterCandidate(spec.Name, llm.Value ?? normalized, string.Empty, normalized, page, confidence, reason);
        }

        // ===================== Aggregation =====================

        private static List<ExtractedParameter> Aggregate(
            DocumentPackage package,
            Dictionary<string, List<ParameterCandidate>> extracted)
        {
            var parameters = new List<ExtractedParameter>();

            foreach (var group in extracted)
            {
                var candidates = group.Value;
                if (candidates.Count == 0)
                {
                    continue;
                }

                var best = candidates.OrderByDescending(c => c.ConfidenceScore).First();
                var distinct = candidates
                    .Select(c => c.NormalizedValue)
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var hasConflict = distinct.Count > 1;
                var confidence = hasConflict
                    ? Math.Max(0.55, best.ConfidenceScore - 0.20)
                    : best.ConfidenceScore;

                parameters.Add(new ExtractedParameter
                {
                    DocumentPackageId = package.Id,
                    Name = best.Name,
                    Value = best.Value,
                    Unit = best.Unit,
                    NormalizedValue = best.NormalizedValue,
                    ConfidenceScore = Math.Round(Clamp(confidence, 0.0, 1.0), 2),
                    SourcePageNumber = best.SourcePageNumber,
                    FlaggedForReview = hasConflict || confidence < 0.75,
                    IsAbbDefault = false,
                    ExtractionReason = hasConflict
                        ? $"Conflicting values detected across pages ({string.Join(", ", distinct)}); selected {best.NormalizedValue} from page {best.SourcePageNumber}."
                        : best.ExtractionReason
                });
            }

            return parameters;
        }

        // ===================== Helpers =====================

        private static void TryAdd(IDictionary<string, List<ParameterCandidate>> store, ParameterCandidate? candidate)
        {
            if (candidate == null)
            {
                return;
            }

            if (!store.TryGetValue(candidate.Name, out var list))
            {
                list = new List<ParameterCandidate>();
                store[candidate.Name] = list;
            }

            list.Add(candidate);
        }

        private static ParameterCandidate BuildNumeric(ParamSpec spec, double rawValue, int page, double boost, string baseReason)
        {
            var (snapped, outOfRange) = Snap(rawValue, spec.Allowed!);
            var confidence = Clamp(spec.BasePrior + boost - (outOfRange ? OutOfRangePenalty : 0.0), 0.0, 1.0);
            var reason = outOfRange
                ? $"{baseReason}: {Fmt(rawValue)} {spec.Unit} is outside allowed values; snapped to {Fmt(snapped)} {spec.Unit} — review."
                : $"{baseReason}; matches allowed value {Fmt(snapped)} {spec.Unit}.";

            return new ParameterCandidate(spec.Name, Fmt(rawValue), spec.Unit, Fmt(snapped), page, confidence, reason);
        }

        private static (double snapped, bool outOfRange) Snap(double value, double[] allowed)
        {
            var nearest = allowed.OrderBy(a => Math.Abs(a - value)).First();
            var outOfRange = Math.Abs(value) > 0 && Math.Abs(nearest - value) / Math.Abs(value) > SnapToleranceRel;
            return (nearest, outOfRange);
        }

        private static (string Raw, string Canonical)? MatchEnumInTextWithRaw(string name, string content)
        {
            if (!EnumSynonyms.TryGetValue(name, out var synonyms))
                return null;

            foreach (var (token, canonical) in synonyms)
            {
                if (Regex.IsMatch(content, $@"\b{Regex.Escape(token)}\b", RegexOptions.IgnoreCase))
                    return (token, canonical);
            }

            return null;
        }

        private static string? MatchEnumInText(string name, string content) =>
            MatchEnumInTextWithRaw(name, content)?.Canonical;

        private static string? MatchEnumValue(ParamSpec spec, string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            foreach (var option in spec.Options!)
            {
                if (string.Equals(option, value.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    return option;
                }
            }

            if (EnumSynonyms.TryGetValue(spec.Name, out var synonyms))
            {
                foreach (var (token, canonical) in synonyms)
                {
                    if (Regex.IsMatch(value, $@"\b{Regex.Escape(token)}\b", RegexOptions.IgnoreCase))
                    {
                        return canonical;
                    }
                }
            }

            return null;
        }

        private static string ExtractDigits(string? raw)
        {
            var match = Regex.Match(raw ?? string.Empty, @"[-+]?\d+(?:[.,]\d+)?");
            return match.Success ? match.Value : string.Empty;
        }

        private static bool ValuePresentInText(string content, double value)
        {
            if (content.Contains(Fmt(value), StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            var asInt = ((long)value).ToString(CultureInfo.InvariantCulture);
            return content.Contains(asInt, StringComparison.OrdinalIgnoreCase);
        }

        private static double? ParseNumber(string? raw)
        {
            var normalized = (raw ?? string.Empty).Replace(',', '.');
            return double.TryParse(normalized, NumberStyles.Float, CultureInfo.InvariantCulture, out var value)
                ? value
                : (double?)null;
        }

        private static string Fmt(double value) => value.ToString("0.###", CultureInfo.InvariantCulture);

        private static double Clamp(double value, double min, double max)
            => value < min ? min : value > max ? max : value;
    }
}
