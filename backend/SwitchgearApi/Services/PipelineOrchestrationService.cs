using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SwitchgearApi.Data;
using SwitchgearApi.Models;

namespace SwitchgearApi.Services
{
    public interface IPipelineOrchestrationService
    {
        Task<DocumentPackage> ProcessDocumentAsync(int documentId);
    }

    public class PipelineOrchestrationService : IPipelineOrchestrationService
    {
        private readonly SwitchgearDbContext                _context;
        private readonly IParameterExtractionService        _extractionService;
        private readonly IMultiInstanceExtractionService    _multiInstanceService;
        private readonly ILineupReconstructionService       _lineupService;
        private readonly IXmlGenerationService              _xmlService;
        private readonly IDocumentProcessingService         _processingService;
        private readonly IPythonExtractionClient            _pythonClient;
        private readonly IEnsembleVotingService             _ensembleVoting;
        private readonly ISldTopologyService                _topologyService;

        public PipelineOrchestrationService(
            SwitchgearDbContext context,
            IParameterExtractionService extractionService,
            IMultiInstanceExtractionService multiInstanceService,
            ILineupReconstructionService lineupService,
            IXmlGenerationService xmlService,
            IDocumentProcessingService processingService,
            IPythonExtractionClient pythonClient,
            IEnsembleVotingService ensembleVoting,
            ISldTopologyService topologyService)
        {
            _context              = context;
            _extractionService    = extractionService;
            _multiInstanceService = multiInstanceService;
            _lineupService        = lineupService;
            _xmlService           = xmlService;
            _processingService    = processingService;
            _pythonClient         = pythonClient;
            _ensembleVoting       = ensembleVoting;
            _topologyService      = topologyService;
        }

        public async Task<DocumentPackage> ProcessDocumentAsync(int documentId)
        {
            var doc = await _context.DocumentPackages
                .Include(d => d.Pages)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (doc == null) throw new InvalidOperationException("Document not found");

            var sw = System.Diagnostics.Stopwatch.StartNew();

            try
            {
                Console.WriteLine($"[Pipeline] ⏱ Starting document {documentId} — {doc.Pages.Count} page(s), types: {string.Join(", ", doc.Pages.Select(p => p.RawContent?.StartsWith("[SLD_IMAGE:") == true ? "SLD-image" : "text"))}");
                doc.Status = "Processing";
                await _context.SaveChangesAsync();

                // Fetch product-specific parameter definitions from the ABB filter API.
                // These drive which parameters to extract, validate, and flag — no hardcoding.
                var productName = doc.ProductName ?? "Switchgear";
                var filterDefs  = await _pythonClient.GetParameterDefinitionsAsync(productName)
                                  ?? new List<PythonParameterDefinition>();
                bool isSwithgearProduct = string.Equals(productName, "Switchgear", StringComparison.OrdinalIgnoreCase);
                Console.WriteLine($"[Pipeline] Product='{productName}', {filterDefs.Count} filter-API param defs loaded.");

                // ====== STAGE 1: MULTI-INSTANCE DETECTION + PYTHON EXTRACTION (parallel) ======
                Console.WriteLine("[Pipeline] Stage 1/5: Multi-instance detection + Python extraction (parallel)...");

                static bool IsSpecPage(string text) =>
                    text.Contains("kV", StringComparison.OrdinalIgnoreCase) ||
                    text.Contains("kA", StringComparison.OrdinalIgnoreCase) ||
                    text.Contains("busbar", StringComparison.OrdinalIgnoreCase) ||
                    text.Contains("switchgear", StringComparison.OrdinalIgnoreCase) ||
                    text.Contains("MVS", StringComparison.OrdinalIgnoreCase) ||
                    text.Contains("rated", StringComparison.OrdinalIgnoreCase);

                // Score a page by density of switchgear-specific terms (vs. cable/motor specs).
                // Higher scores = more likely to be a switchboard specification section.
                static int ScoreSpecDensity(string text)
                {
                    string[] terms =
                    [
                        "switchboard", "switchgear", "PMCC", "MCC", "cubicle",
                        "busbar", "incomer", "feeder", "coupler",
                        "withstand current", "short time withstand",
                        "arc classification", "IAC", "internal arc",
                        "ingress protection", "IP3", "IP4", "IP5", "IP6",
                        "LSC", "loss of service", "single busbar", "double busbar",
                        "rated current", "rated voltage", "utilization voltage"
                    ];
                    return terms.Sum(term =>
                    {
                        int count = 0, idx = 0;
                        while ((idx = text.IndexOf(term, idx, StringComparison.OrdinalIgnoreCase)) >= 0)
                        { count++; idx += term.Length; }
                        return count;
                    });
                }

                var textPages = doc.Pages
                    .OrderBy(p => p.PageNumber)
                    .Where(p => !string.IsNullOrWhiteSpace(p.RawContent) &&
                                !p.RawContent.StartsWith("[SLD_IMAGE:", StringComparison.Ordinal) &&
                                !p.RawContent.StartsWith("[SLD_RESULT:", StringComparison.Ordinal))
                    .Select(p => p.RawContent!)
                    .ToList();

                var specPages = textPages.Where(IsSpecPage).ToList();
                var pagesForDetection = specPages.Count >= 2 ? specPages : textPages;

                // For large documents the naive join gets truncated to the front, missing specs
                // buried deep (e.g. Section 13 on page 33 of 145). Rank pages by switchgear-term
                // density so the highest-relevance pages survive truncation to MaxTextChars.
                const int MaxDetectionChars = 46_000;
                string fullText;
                if (pagesForDetection.Sum(p => p.Length) > MaxDetectionChars)
                {
                    var ranked = pagesForDetection
                        .Select((p, i) => (page: p, idx: i, score: ScoreSpecDensity(p)))
                        .OrderByDescending(x => x.score)
                        .Take(20)
                        .OrderBy(x => x.idx)          // restore document order for context
                        .Select(x => x.page)
                        .ToList();
                    fullText = string.Join("\n\n", ranked);
                    Console.WriteLine($"[Pipeline] Detection text: top-20 dense pages ({fullText.Length} chars).");
                }
                else
                {
                    fullText = string.Join("\n\n", pagesForDetection);
                    Console.WriteLine($"[Pipeline] Detection text: {pagesForDetection.Count} pages ({fullText.Length} chars) — full document fits.");
                }

                // Build the Python request with a default single-instance placeholder so it
                // can start immediately in parallel with multi-instance detection.
                var pythonPagesPayload = doc.Pages
                    .OrderBy(p => p.PageNumber)
                    .Select(p => new PythonPageData
                    {
                        PageNumber     = p.PageNumber,
                        Text           = p.RawContent?.StartsWith("[SLD_IMAGE:", StringComparison.Ordinal) == true
                                         ? string.Empty
                                         : (p.RawContent ?? string.Empty),
                        PageType       = p.RawContent?.StartsWith("[SLD_IMAGE:", StringComparison.Ordinal) == true
                                         ? "sld"
                                         : "text",
                        SldImageBase64 = ExtractSldBase64(p.RawContent)
                    })
                    .ToList();

                // If no text was extracted (custom font encoding issue), include raw PDF bytes
                // so the Python service can use pdfplumber as a fallback.
                bool hasTextPages = pythonPagesPayload.Any(p => p.PageType == "text" && !string.IsNullOrEmpty(p.Text));
                string? pdfBase64 = null;
                if (!hasTextPages && !string.IsNullOrEmpty(doc.RawPdfBase64))
                {
                    pdfBase64 = doc.RawPdfBase64;
                    Console.WriteLine($"[Pipeline] No text pages extracted — attaching raw PDF ({pdfBase64.Length / 1024} KB base64) for pdfplumber fallback.");
                }

                var pythonRequestEarly = new PythonExtractionRequest
                {
                    ProductName = doc.ProductName,
                    DocumentId = doc.Id,
                    Instances  = new List<PythonInstanceData>
                    {
                        new PythonInstanceData { InstanceIndex = 1, InstanceName = "Main Switchgear" }
                    },
                    Pages     = pythonPagesPayload,
                    PdfBase64 = pdfBase64,
                };

                // Fire both in parallel — Python RAG doesn't need the exact instance name for a first pass
                Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Firing multi-instance detection + Python extraction in parallel...");
                Console.WriteLine($"[Pipeline] ⏱ Python payload: {pythonPagesPayload.Count} page(s), SLD pages with base64: {pythonPagesPayload.Count(p => !string.IsNullOrEmpty(p.SldImageBase64))}, text pages: {pythonPagesPayload.Count(p => p.PageType == "text" && !string.IsNullOrEmpty(p.Text))}");

                var multiInstanceTask = _multiInstanceService.ExtractMultiInstanceAsync(fullText);
                var pythonTask        = _pythonClient.ExtractAsync(pythonRequestEarly);

                await Task.WhenAll(multiInstanceTask, pythonTask);
                Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Stage 1 WhenAll done (multi-instance + Python)");

                var instanceResults = multiInstanceTask.Result;
                var isMultiInstance = instanceResults.Count > 1;

                PythonExtractionResponse? pythonResult;
                if (isMultiInstance)
                {
                    // Re-run Python Path B only with named instances — Path C (SLD vision)
                    // results are instance-independent and already available from the first pass.
                    Console.WriteLine(
                        $"[Pipeline] Multi-instance ({instanceResults.Count}): re-running Path B with named instances (Path C reused from first pass)...");
                    var pythonRequestFull = new PythonExtractionRequest
                    {
                        ProductName = doc.ProductName,
                        DocumentId = doc.Id,
                        Instances  = instanceResults.Select(r => new PythonInstanceData
                        {
                            InstanceIndex = r.InstanceIndex,
                            InstanceName  = r.InstanceName
                        }).ToList(),
                        Pages     = pythonPagesPayload,
                        RunPathB  = true,
                        RunPathC  = false,  // reuse first-pass Path C results
                        RunLevel2 = false   // device schedules already extracted in first pass
                    };
                    pythonResult = await _pythonClient.ExtractAsync(pythonRequestFull);

                    // Merge Path C cubicle devices + topology from the first pass
                    var earlyResult = pythonTask.Result;
                    if (pythonResult != null && earlyResult != null)
                    {
                        if (earlyResult.CubicleDevices.Count > 0)
                            pythonResult.CubicleDevices.AddRange(earlyResult.CubicleDevices);
                        if (earlyResult.TopologySummary.TotalPanels > 0 &&
                            pythonResult.TopologySummary.TotalPanels == 0)
                            pythonResult.TopologySummary = earlyResult.TopologySummary;
                    }
                }
                else
                {
                    pythonResult = pythonTask.Result;
                }

                Console.WriteLine($"[Pipeline] Detected {instanceResults.Count} switchgear instance(s).");

                var instances = instanceResults.Select(r => new SwitchgearInstance
                {
                    DocumentPackageId = doc.Id,
                    InstanceIndex     = r.InstanceIndex,
                    InstanceName      = r.InstanceName,
                    Location          = r.Location
                }).ToList();

                _context.SwitchgearInstances.AddRange(instances);
                await _context.SaveChangesAsync();

                var instanceMap = instances.ToDictionary(i => i.InstanceIndex);

                var pythonParams = new List<ExtractedParameter>();

                if (pythonResult != null)
                {
                    foreach (var pp in pythonResult.Parameters)
                    {
                        var inst = instanceMap.TryGetValue(pp.InstanceIndex, out var found)
                                   ? found
                                   : instances.First();

                        pythonParams.Add(new ExtractedParameter
                        {
                            DocumentPackageId      = doc.Id,
                            SwitchgearInstanceId   = inst.Id,
                            SwitchgearInstanceName = inst.InstanceName,
                            Name                   = pp.Name,
                            Value                  = pp.Value,
                            Unit                   = pp.Unit,
                            NormalizedValue        = pp.Value,
                            ConfidenceScore        = pp.Confidence ?? 0.65,
                            FlaggedForReview       = pp.FlaggedForReview,
                            ExtractionPath         = pp.ExtractionPath,
                            SourceText             = pp.SourceText,
                            SourceBoundingBox      = pp.SourceBoundingBox,
                            SourcePageNumber       = pp.SourcePage,
                            IsAbbDefault           = false,
                            ExtractionReason       = string.IsNullOrEmpty(pp.DeviationReason)
                                                     ? $"{pp.ExtractionPath} extraction"
                                                     : $"{pp.ExtractionPath} — deviation: {pp.DeviationReason}"
                        });
                    }

                    // Persist topology into each SwitchgearInstance
                    if (pythonResult.TopologySummary.TotalPanels > 0)
                    {
                        var topologyJson = System.Text.Json.JsonSerializer.Serialize(pythonResult.TopologySummary);
                        foreach (var inst in instances)
                            inst.TopologySummary = topologyJson;

                        // Emit topology counts as ExtractedParameter records so the lineup
                        // reconstruction service can use them without a heuristic fallback.
                        var topo        = pythonResult.TopologySummary;
                        var firstInst   = instances.First();
                        var topoNames   = new HashSet<string>(pythonParams.Select(p => p.Name), StringComparer.OrdinalIgnoreCase);

                        void EmitTopo(string name, int value)
                        {
                            if (value <= 0 || topoNames.Contains(name)) return;
                            pythonParams.Add(new ExtractedParameter
                            {
                                DocumentPackageId      = doc.Id,
                                SwitchgearInstanceId   = firstInst.Id,
                                SwitchgearInstanceName = firstInst.InstanceName,
                                Name                   = name,
                                Value                  = value.ToString(),
                                NormalizedValue        = value.ToString(),
                                Unit                   = "",
                                ConfidenceScore        = 0.90,
                                ExtractionPath         = "TopologyCount",
                                ExtractionReason       = "Derived from SLD panel count",
                                SourcePageNumber       = 0,
                                FlaggedForReview       = false,
                                IsAbbDefault           = false
                            });
                        }

                        EmitTopo("TotalCubicles",      topo.TotalPanels);
                        EmitTopo("NumberOfIncomers",   topo.Incomers);
                        EmitTopo("NumberOfFeeders",    topo.Feeders);
                        EmitTopo("NumberOfBusCouplers", topo.Couplers);
                    }

                    if (pythonResult.Errors.Count > 0)
                        Console.WriteLine($"[Pipeline] Python errors: {string.Join("; ", pythonResult.Errors)}");

                    Console.WriteLine(
                        $"[Pipeline] Python returned {pythonResult.Parameters.Count} params, " +
                        $"{pythonResult.CubicleDevices.Count} cubicle devices.");

                    // Persist Level 2 cubicle device extractions
                    if (pythonResult.CubicleDevices.Count > 0)
                    {
                        var cubicleExtractions = pythonResult.CubicleDevices.Select(cd =>
                        {
                            var inst = instanceMap.TryGetValue(cd.InstanceIndex, out var found)
                                       ? found : instances.First();
                            return new SwitchgearApi.Models.CubicleDeviceExtraction
                            {
                                DocumentPackageId          = doc.Id,
                                SwitchgearInstanceId       = inst.Id,
                                FunctionalPosition         = cd.FunctionalPosition,
                                PanelType                  = cd.PanelType,
                                CBModel                    = cd.CbModel,
                                CBRating                   = cd.CbRating,
                                CbBreakingCapacity         = cd.CbBreakingCapacity,
                                CbMakingCapacity           = cd.CbMakingCapacity,
                                CbMechanismType            = cd.CbMechanismType,
                                CbNumberOfPoles            = cd.CbNumberOfPoles,
                                CTRatio                    = cd.CtRatio,
                                CtAccuracyClass            = cd.CtAccuracyClass,
                                CtBurden                   = cd.CtBurden,
                                CtCoreType                 = cd.CtCoreType,
                                VTRatio                    = cd.VtRatio,
                                VtAccuracyClass            = cd.VtAccuracyClass,
                                VtBurden                   = cd.VtBurden,
                                VtInsulationLevel          = cd.VtInsulationLevel,
                                RelayModel                 = cd.RelayModel,
                                ProtectionFunctions        = System.Text.Json.JsonSerializer.Serialize(cd.ProtectionFunctions),
                                RelayAuxVoltage            = cd.RelayAuxVoltage,
                                RelayCommunicationProtocol = System.Text.Json.JsonSerializer.Serialize(cd.RelayCommunicationProtocol),
                                DsCount                    = cd.DsCount,
                                DsOperatingMode            = cd.DsOperatingMode,
                                EsPresent                  = cd.EsPresent,
                                EsId                       = cd.EsId,
                                SaPresent                  = cd.SaPresent,
                                AuxControlVoltage          = cd.AuxControlVoltage,
                                ExtractionPath             = "Python",
                                ConfidenceScore            = cd.Confidence ?? 0.65,
                                SourcePage                 = cd.SourcePage,
                                FlaggedForReview           = cd.FlaggedForReview,
                                DeviationReason            = cd.DeviationReason,
                                SourceBoundingBox          = cd.SourceBoundingBox
                            };
                        }).ToList();

                        _context.CubicleDeviceExtractions.AddRange(cubicleExtractions);
                        Console.WriteLine($"[Pipeline] Queued {cubicleExtractions.Count} CubicleDeviceExtraction rows.");
                    }
                }

                List<ExtractedParameter> allParameters;

                if (isMultiInstance)
                {
                    // MULTI-INSTANCE PATH: convert per-instance LLM values into ExtractedParameter entities
                    allParameters = new List<ExtractedParameter>();
                    foreach (var ir in instanceResults)
                    {
                        var instance = instanceMap[ir.InstanceIndex];
                        var perInstanceParams = ConvertRawParams(ir.Parameters, doc, instance);
                        allParameters.AddRange(perInstanceParams);
                    }
                }
                else
                {
                    // SINGLE-INSTANCE PATH: use the full page-by-page extraction (higher quality).
                    // C# regex/LLM extraction is Switchgear-specific; for other products (SafeRing,
                    // SafePlus, …) Python extraction already returned the correct product parameters,
                    // so we skip the C# layer to avoid mixing Switchgear-named params into the result.
                    if (textPages.Count == 0)
                    {
                        allParameters = new List<ExtractedParameter>();
                        Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Image-only document — skipping .NET text extraction (Python Path C already ran).");
                    }
                    else if (!isSwithgearProduct)
                    {
                        allParameters = new List<ExtractedParameter>();
                        Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Non-Switchgear product '{productName}' — skipping C# LLM extraction (Python handles all products).");
                    }
                    else
                    {
                        Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Starting .NET ExtractParametersAsync ({textPages.Count} text page(s))...");
                        allParameters = await _extractionService.ExtractParametersAsync(doc);
                        Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — .NET ExtractParametersAsync done → {allParameters.Count} params");
                    }

                    // Tag all parameters with the single detected instance
                    var singleInstance = instances.First();
                    foreach (var p in allParameters)
                    {
                        p.SwitchgearInstanceId   = singleInstance.Id;
                        p.SwitchgearInstanceName = singleInstance.InstanceName;
                        if (string.IsNullOrEmpty(p.ExtractionPath))
                            p.ExtractionPath = "LLM";
                    }
                }

                // Python params take priority; LLM fills any parameters not found by Python.
                // Only count Python params that actually extracted a value — not_extracted nulls
                // must NOT block the LLM from gap-filling the same parameter.
                if (pythonParams.Count > 0)
                {
                    var pythonExtracted = pythonParams
                        .Where(p => !string.IsNullOrWhiteSpace(p.Value))
                        .ToList();

                    var pythonNames = pythonExtracted
                        .GroupBy(p => (p.Name, p.SwitchgearInstanceId))
                        .Select(g => g.Key)
                        .ToHashSet();

                    var llmGaps = allParameters
                        .Where(p => !pythonNames.Contains((p.Name, p.SwitchgearInstanceId)))
                        .ToList();

                    allParameters = pythonExtracted.Concat(llmGaps).ToList();
                    Console.WriteLine(
                        $"[Pipeline] Merged: {pythonExtracted.Count} python + {llmGaps.Count} LLM gap-fill params " +
                        $"({pythonParams.Count - pythonExtracted.Count} python not_extracted dropped).");
                }

                // ====== STAGE 2: ENSEMBLE VOTING + DEVIATION DETECTION ======
                Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Stage 2/5: Ensemble voting...");

                var votingResult = _ensembleVoting.Vote(doc.Id, allParameters);
                allParameters    = votingResult.Accepted;
                _context.DeviationItems.AddRange(votingResult.Deviations);

                // IEC 60038 / IEC 62271 voltage normalization — Switchgear only.
                // SafeRing/SafePlus use RatedVoltage (already in IEC equipment class format).
                if (isSwithgearProduct)
                    ApplyIecVoltageNormalization(allParameters);

                // Flag MissingData for any filter-API parameter not extracted.
                // Uses the product's live filter-API defs so this works for all products.
                var requiredParamNames = filterDefs.Count > 0
                    ? filterDefs.Select(d => d.Key).ToArray()
                    : EnsembleVotingService.RequiredLevel1Params; // fallback for Switchgear if API unavailable

                var foundKeys = allParameters
                    .Select(p => (p.SwitchgearInstanceId ?? 0, p.Name))
                    .ToHashSet();

                foreach (var instance in instances)
                {
                    foreach (var paramName in requiredParamNames)
                    {
                        if (foundKeys.Contains((instance.Id, paramName)))
                            continue;

                        _context.DeviationItems.Add(new DeviationItem
                        {
                            DocumentPackageId = doc.Id,
                            Type              = "MissingData",
                            Severity          = "Critical",
                            Description       = $"{paramName} not found by any extraction path [{instance.InstanceName}]",
                            AffectedField     = paramName,
                            SuggestedValue    = string.Empty,
                            EngineersComment  = string.Empty,
                            SourcePageNumbers = Array.Empty<int>(),
                            CreatedAt         = DateTime.UtcNow
                        });
                    }
                }

                Console.WriteLine(
                    $"[Pipeline] Ensemble: {allParameters.Count} accepted, {votingResult.Deviations.Count} deviation(s).");

                // Inject fixed-value defaults from the filter API (e.g. Availability=Globals for SafeRing,
                // Market=All for Switchgear). Only inject when: (a) the param exists in the filter API,
                // (b) the filter API exposes exactly one allowed value (meaning it is fixed), and
                // (c) the param was not already extracted from the document.
                var fixedFilterParams = filterDefs
                    .Where(d => d.AllowedValues.Count == 1)
                    .ToList();

                foreach (var instance in instances)
                {
                    var instId     = instance.Id;
                    var instName   = instance.InstanceName;
                    var instNames  = allParameters
                        .Where(p => p.SwitchgearInstanceId == instId)
                        .Select(p => p.Name)
                        .ToHashSet(StringComparer.OrdinalIgnoreCase);

                    foreach (var def in fixedFilterParams)
                    {
                        if (instNames.Contains(def.Key)) continue;

                        allParameters.Add(new ExtractedParameter
                        {
                            DocumentPackageId      = doc.Id,
                            SwitchgearInstanceId   = instId,
                            SwitchgearInstanceName = instName,
                            Name                   = def.Key,
                            Value                  = def.AllowedValues[0],
                            Unit                   = def.Unit,
                            NormalizedValue        = def.AllowedValues[0],
                            ConfidenceScore        = 1.0,
                            FlaggedForReview       = false,
                            IsAbbDefault           = true,
                            ExtractionPath         = "FilterAPI",
                            ExtractionReason       = $"Fixed value from ABB filter API for {productName}."
                        });
                    }

                }

                // ====== STAGE 3: LINEUP RECONSTRUCTION ======
                Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Stage 3/5: Lineup reconstruction...");
                var lineup = await _lineupService.ReconstructLineupAsync(doc, allParameters);

                // Tag lineup cubicles: if multiple instances, assign round-robin or by SLD result
                var firstInstance = instances.First();
                foreach (var cubicle in lineup)
                    cubicle.SwitchgearInstanceId = firstInstance.Id;

                _context.SwitchgearCubicles.AddRange(lineup);

                foreach (var cubicle in lineup.Where(c => c.ConfidenceScore < 0.75))
                {
                    _context.DeviationItems.Add(new DeviationItem
                    {
                        DocumentPackageId = doc.Id,
                        Type              = "LowConfidence",
                        Severity          = "Medium",
                        Description       = $"Low confidence cubicle at position {cubicle.Position}",
                        AffectedField     = $"Cubicle_{cubicle.Position}",
                        SuggestedValue    = cubicle.Type,
                        CreatedAt         = DateTime.UtcNow
                    });
                }

                // ====== BATCH SAVE #1 ======
                _context.ExtractedParameters.AddRange(allParameters);
                Console.WriteLine($"[Pipeline] Saving {allParameters.Count} params, {lineup.Count} cubicles...");
                await _context.SaveChangesAsync();

                // ====== STAGE 4: XML GENERATION ======
                Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Stage 4/5: XML generation...");
                var xml = await _xmlService.GenerateAbbXmlAsync(doc, allParameters, lineup);
                doc.XmlOutput = xml;

                // ====== STAGE 5: CONFIDENCE + STATUS ======
                Console.WriteLine($"[Pipeline] ⏱ t+{sw.Elapsed.TotalSeconds:0.0}s — Stage 5/5: Finalizing...");
                doc.OverallConfidence = allParameters.Count > 0
                    ? allParameters.Average(p => p.ConfidenceScore)
                    : 0.0;

                doc.Status      = "Completed";
                doc.ProcessedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                Console.WriteLine(
                    $"[Pipeline] ✓ Document {documentId} completed in {sw.Elapsed.TotalSeconds:0.0}s. " +
                    $"{instances.Count} instance(s), confidence: {doc.OverallConfidence:P0}");

                return doc;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Pipeline Error] Document {documentId}: {ex.GetType().Name}");
                Console.WriteLine($"[Pipeline Error] Message: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[Pipeline Error] InnerException: {ex.InnerException.Message}");
                Console.WriteLine($"[Pipeline Error] StackTrace: {ex.StackTrace}");

                _context.ChangeTracker.Clear();
                var failedDoc = await _context.DocumentPackages.FindAsync(documentId);
                if (failedDoc != null)
                {
                    failedDoc.Status       = "Failed";
                    failedDoc.ErrorMessage = ex.InnerException?.Message ?? ex.Message;
                    failedDoc.ProcessedAt  = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                throw;
            }
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        // Parses the [SLD_IMAGE:{mime}]\n{base64} marker written by DocumentProcessingService.
        // DocumentProcessingService may append "\n[SLD_OCR_TEXT]\n{ocrText}" after the base64 —
        // strip that suffix so Python gets clean base64 only.
        private static string? ExtractSldBase64(string? rawContent)
        {
            if (string.IsNullOrEmpty(rawContent)) return null;
            if (!rawContent.StartsWith("[SLD_IMAGE:", StringComparison.Ordinal)) return null;
            var newline = rawContent.IndexOf('\n');
            if (newline < 0) return null;
            var afterHeader = rawContent[(newline + 1)..];
            const string ocrSep = "\n[SLD_OCR_TEXT]\n";
            var sepIdx = afterHeader.IndexOf(ocrSep, StringComparison.Ordinal);
            return sepIdx >= 0 ? afterHeader[..sepIdx] : afterHeader;
        }

        // IEC 60038 Table 1 / IEC 62271-1 Table 1: system nominal voltage → highest voltage for
        // equipment (Um).  Documents (especially French HTA) state the grid voltage, not the
        // switchgear class.  E.g. Enedis 20 kV network → Um = 24 kV.
        private static readonly Dictionary<double, string> _networkToUm = new()
        {
            {  3.0, "3.6"  }, {  3.3, "3.6"  },
            {  6.0, "7.2"  }, {  6.6, "7.2"  },
            { 10.0, "12"   }, { 11.0, "12"   },
            { 15.0, "17.5" },
            { 20.0, "24"   }, { 22.0, "24"   },
            { 30.0, "36"   }, { 33.0, "36"   },
        };

        private static void ApplyIecVoltageNormalization(List<ExtractedParameter> parameters)
        {
            foreach (var p in parameters.Where(p => p.Name == "OperatingVoltage"))
            {
                if (string.IsNullOrWhiteSpace(p.Value)) continue;

                var raw = p.Value.Trim().Replace(',', '.');
                if (!double.TryParse(raw, NumberStyles.Float,
                        CultureInfo.InvariantCulture, out var extracted)) continue;

                if (!_networkToUm.TryGetValue(extracted, out var umClass)) continue;
                if (p.Value == umClass) continue; // already the correct Um class

                // Store original network voltage in NormalizedValue for audit trail,
                // then replace Value with the IEC equipment class (Um).
                p.NormalizedValue  = umClass;
                p.Value            = umClass;
                p.ExtractionReason = (p.ExtractionReason ?? string.Empty)
                    + $" | IEC 60038: {extracted} kV network → Um {umClass} kV";
                // Raise confidence slightly — this is a deterministic standard rule, not a guess.
                if (p.ConfidenceScore < 0.70)
                    p.ConfidenceScore = 0.70;
                p.FlaggedForReview = true; // still flag so engineer can confirm
            }
        }

        private static List<ExtractedParameter> ConvertRawParams(
            List<InstanceRawParam> rawParams,
            DocumentPackage package,
            SwitchgearInstance instance)
        {
            var results = new List<ExtractedParameter>();

            foreach (var raw in rawParams)
            {
                var ep = ConvertOneRawParam(raw, package, instance);
                if (ep != null) results.Add(ep);
            }

            return results;
        }

        private static ExtractedParameter? ConvertOneRawParam(
            InstanceRawParam raw,
            DocumentPackage package,
            SwitchgearInstance instance)
        {
            var (allowed, unit, isEnum) = raw.Name switch
            {
                "OperatingVoltage"   => (ParameterAllowedValues.VoltageKv,      "kV", false),
                "ShortCircuitLevel"  => (ParameterAllowedValues.ShortCircuitKa, "kA", false),
                "RatedBusbarCurrent" => (ParameterAllowedValues.BusbarCurrentA, "A",  false),
                "PanelRatedCurrent"  => (ParameterAllowedValues.PanelCurrentA,  "A",  false),
                "Frequency"          => (ParameterAllowedValues.FrequencyHz,    "Hz", false),
                _                    => (null!, string.Empty, true)
            };

            if (!isEnum && allowed != null)
            {
                var raw_normalized = (raw.Value ?? string.Empty).Replace(',', '.');
                if (!double.TryParse(raw_normalized,
                    System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out var num))
                    return null;

                var (snapped, outOfRange) = ParameterAllowedValues.Snap(num, allowed);
                return new ExtractedParameter
                {
                    DocumentPackageId    = package.Id,
                    SwitchgearInstanceId = instance.Id,
                    SwitchgearInstanceName = instance.InstanceName,
                    Name                 = raw.Name,
                    Value                = num.ToString("0.###", CultureInfo.InvariantCulture),
                    Unit                 = unit,
                    NormalizedValue      = snapped.ToString("0.###", CultureInfo.InvariantCulture),
                    ConfidenceScore      = outOfRange ? 0.60 : 0.82,
                    FlaggedForReview     = outOfRange,
                    IsAbbDefault         = false,
                    ExtractionReason     = $"Multi-instance LLM extraction [{instance.InstanceName}]" +
                                           (outOfRange ? " — out-of-range, snapped for review." : ".")
                };
            }

            if (isEnum)
            {
                // Enum: accept as-is; flag if not in allowed options
                string[] opts = raw.Name switch
                {
                    "Market"            => ParameterAllowedValues.MarketOptions,
                    "BusbarArrangement" => ParameterAllowedValues.BusbarArrangementOptions,
                    "Insulation"        => ParameterAllowedValues.InsulationOptions,
                    "Distribution"      => ParameterAllowedValues.DistributionOptions,
                    _                   => Array.Empty<string>()
                };

                var canonical = opts.FirstOrDefault(o =>
                    string.Equals(o, raw.Value?.Trim(), StringComparison.OrdinalIgnoreCase));
                var val     = canonical ?? raw.Value ?? string.Empty;
                var flagged = canonical == null;

                return new ExtractedParameter
                {
                    DocumentPackageId    = package.Id,
                    SwitchgearInstanceId = instance.Id,
                    SwitchgearInstanceName = instance.InstanceName,
                    Name                 = raw.Name,
                    Value                = val,
                    Unit                 = "",
                    NormalizedValue      = val,
                    ConfidenceScore      = flagged ? 0.55 : 0.82,
                    FlaggedForReview     = flagged,
                    IsAbbDefault         = false,
                    ExtractionReason     = $"Multi-instance LLM extraction [{instance.InstanceName}]."
                };
            }

            return null;
        }
    }
}
