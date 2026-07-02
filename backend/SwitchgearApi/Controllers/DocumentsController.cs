using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwitchgearApi.Data;
using SwitchgearApi.Dtos;
using SwitchgearApi.Services;

namespace SwitchgearApi.Controllers
{
    [ApiController]
    [Route("api/v1/documents")]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentProcessingService _processingService;
        private readonly IPipelineOrchestrationService _pipelineService;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IAbbProductMatchingService _productMatching;
        private readonly SwitchgearDbContext _context;
        private readonly IPythonExtractionClient _pythonClient;

        public DocumentsController(
            IDocumentProcessingService processingService,
            IPipelineOrchestrationService pipelineService,
            IServiceScopeFactory scopeFactory,
            IAbbProductMatchingService productMatching,
            SwitchgearDbContext context,
            IPythonExtractionClient pythonClient)
        {
            _processingService = processingService;
            _pipelineService = pipelineService;
            _scopeFactory = scopeFactory;
            _productMatching = productMatching;
            _context = context;
            _pythonClient = pythonClient;
        }

        /// <summary>
        /// POST /api/v1/documents/upload
        /// Upload an RFQ document package and initiate pipeline processing
        /// </summary>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<DocumentStatusResponse>> UploadDocument([FromForm] IFormCollection form)
        {
            try
            {
                // Extract files from form
                var files = form.Files;
                
                // Debug logging
                Console.WriteLine($"[Upload] Received {files.Count} files");
                Console.WriteLine($"[Upload] Form keys: {string.Join(", ", form.Keys)}");
                
                if (files.Count == 0)
                {
                    // Try alternative: check if files came under different names
                    var allFormFiles = Request.Form.Files;
                    Console.WriteLine($"[Upload] Request.Form.Files count: {allFormFiles.Count}");
                    
                    if (allFormFiles.Count == 0)
                        return BadRequest(new { error = "No files provided in request" });
                    
                    files = allFormFiles;
                }

                // Get package name from form or generate from first file
                var packageName = form["packageName"].ToString();
                if (string.IsNullOrEmpty(packageName))
                {
                    packageName = $"Package_{DateTime.UtcNow:yyyyMMdd_HHmmss}";
                }

                var productName = form["productName"].ToString();
                if (string.IsNullOrWhiteSpace(productName))
                    productName = "Switchgear";

                // Create document package
                var package = await _processingService.CreateDocumentPackageAsync(
                    packageName,
                    User?.Identity?.Name ?? "Anonymous",
                    productName);

                // Persist uploaded files as page records so extraction has source content.
                await _processingService.CreatePagesFromUploadAsync(package.Id, files);

                // Trigger pipeline processing asynchronously with proper scope management
                // Create a new service scope for the background task to ensure DbContext is not disposed
                #pragma warning disable CS4014
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using (var scope = _scopeFactory.CreateScope())
                        {
                            var pipelineService = scope.ServiceProvider.GetRequiredService<IPipelineOrchestrationService>();
                            await pipelineService.ProcessDocumentAsync(package.Id);
                            Console.WriteLine($"[Pipeline] Background task completed for document {package.Id}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Pipeline Error] Background task for document {package.Id}: {ex.GetType().Name}");
                        Console.WriteLine($"[Pipeline Error] {ex.Message}");
                        if (ex.InnerException != null)
                        {
                            Console.WriteLine($"[Pipeline Error] InnerException: {ex.InnerException.Message}");
                        }
                    }
                });
                #pragma warning restore CS4014

                var response = new DocumentStatusResponse
                {
                    Id = package.Id,
                    Name = package.Name,
                    Status = package.Status,
                    OverallConfidence = package.OverallConfidence,
                    UploadedAt = package.UploadedAt,
                    ParameterCount = 0,
                    CubicleCount = 0,
                    DeviationCount = 0,
                    UnresolvedDeviationCount = 0
                };

                return CreatedAtAction(nameof(GetStatus), new { id = package.Id }, response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Upload Error] {ex.GetType().Name}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[Upload Error] Inner: {ex.InnerException.Message}");
                    if (ex.InnerException.InnerException != null)
                    {
                        Console.WriteLine($"[Upload Error] Inner-Inner: {ex.InnerException.InnerException.Message}");
                    }
                }
                
                var errorDetail = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { error = $"Failed to process document: {errorDetail}" });
            }
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/status
        /// Get processing status of a document
        /// </summary>
        [HttpGet("{id}/status")]
        public async Task<ActionResult<DocumentStatusResponse>> GetStatus(int id)
        {
            var status = await _processingService.GetDocumentStatusAsync(id);
            if (status == null) return NotFound(new { error = "Document not found" });

            return status;
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/pages
        /// Get page classifications for a document package
        /// </summary>
        [HttpGet("{id}/pages")]
        public async Task<ActionResult<List<DocumentPageDto>>> GetPages(int id)
        {
            if (!await _processingService.DocumentExistsAsync(id))
                return NotFound(new { error = "Document not found" });

            var pages = await _context.DocumentPages
                .AsNoTracking()
                .Where(p => p.DocumentPackageId == id)
                .OrderBy(p => p.PageNumber)
                .Select(p => new DocumentPageDto
                {
                    PageNumber = p.PageNumber,
                    Classification = string.IsNullOrWhiteSpace(p.Classification) ? "text_tabular" : p.Classification,
                    ClassificationConfidence = Math.Round(p.ClassificationConfidence, 2),
                    ThumbnailUrl = null
                })
                .ToListAsync();

            return Ok(pages);
        }

        /// <summary>
        /// GET /api/v1/documents
        /// Get all documents with status summary
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<DocumentStatusResponse>>> GetAllDocuments()
        {
            var responses = await _processingService.GetAllDocumentStatusesAsync();
            return Ok(responses);
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/parameters
        /// Get extracted technical parameters with confidence scores
        /// </summary>
        [HttpGet("{id}/parameters")]
        public async Task<ActionResult<List<ExtractedParameterDto>>> GetParameters(int id)
        {
            if (!await _processingService.DocumentExistsAsync(id))
                return NotFound(new { error = "Document not found" });

            var parameters = await _processingService.GetParametersAsync(id);
            var dtos = parameters.Select(p => new ExtractedParameterDto
            {
                Name                  = p.Name,
                Value                 = p.Value,
                Unit                  = p.Unit,
                NormalizedValue       = p.NormalizedValue,
                ConfidenceScore       = Math.Round(p.ConfidenceScore, 2),
                SourcePageNumber      = p.SourcePageNumber,
                FlaggedForReview      = p.FlaggedForReview,
                IsAbbDefault          = p.IsAbbDefault ?? false,
                ExtractionReason      = p.ExtractionReason,
                SwitchgearInstanceId  = p.SwitchgearInstanceId,
                SwitchgearInstanceName = p.SwitchgearInstanceName
            }).ToList();

            return Ok(dtos);
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/instances
        /// Get all detected switchgear instances with their extracted parameters grouped per instance.
        /// </summary>
        [HttpGet("{id}/instances")]
        public async Task<ActionResult<List<SwitchgearInstanceDto>>> GetInstances(int id)
        {
            try
            {
                if (!await _processingService.DocumentExistsAsync(id))
                    return NotFound(new { error = "Document not found" });

                var instances = await _context.SwitchgearInstances
                    .Where(i => i.DocumentPackageId == id)
                    .OrderBy(i => i.InstanceIndex)
                    .Include(i => i.Parameters)
                    .ToListAsync();

                if (instances.Count == 0)
                {
                    // Document processed before multi-instance feature — return flat list as single instance
                    var parameters = await _processingService.GetParametersAsync(id);
                    return Ok(new List<SwitchgearInstanceDto>
                    {
                        new SwitchgearInstanceDto
                        {
                            Id            = 0,
                            InstanceIndex = 1,
                            InstanceName  = "Main Switchgear",
                            Location      = "",
                            Parameters    = parameters.Select(p => new ExtractedParameterDto
                            {
                                Name                   = p.Name,
                                Value                  = p.Value,
                                Unit                   = p.Unit,
                                NormalizedValue        = p.NormalizedValue,
                                ConfidenceScore        = Math.Round(p.ConfidenceScore, 2),
                                SourcePageNumber       = p.SourcePageNumber,
                                FlaggedForReview       = p.FlaggedForReview,
                                IsAbbDefault           = p.IsAbbDefault ?? false,
                                ExtractionReason       = p.ExtractionReason,
                                SwitchgearInstanceId   = null,
                                SwitchgearInstanceName = "Main Switchgear"
                            }).ToList()
                        }
                    });
                }

                var dtos = instances.Select(inst => new SwitchgearInstanceDto
                {
                    Id            = inst.Id,
                    InstanceIndex = inst.InstanceIndex,
                    InstanceName  = inst.InstanceName,
                    Location      = inst.Location,
                    Parameters    = inst.Parameters
                        .OrderBy(p => p.Name)
                        .Select(p => new ExtractedParameterDto
                        {
                            Name                   = p.Name,
                            Value                  = p.Value,
                            Unit                   = p.Unit,
                            NormalizedValue        = p.NormalizedValue,
                            ConfidenceScore        = Math.Round(p.ConfidenceScore, 2),
                            SourcePageNumber       = p.SourcePageNumber,
                            FlaggedForReview       = p.FlaggedForReview,
                            IsAbbDefault           = p.IsAbbDefault ?? false,
                            ExtractionReason       = p.ExtractionReason,
                            SwitchgearInstanceId   = inst.Id,
                            SwitchgearInstanceName = inst.InstanceName
                        }).ToList()
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Instances Error] {ex.GetType().Name}: {ex.Message}");
                return StatusCode(500, new { error = $"Instance retrieval failed: {ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/lineup
        /// Get reconstructed switchgear lineup with cubicles and devices
        /// </summary>
        [HttpGet("{id}/lineup")]
        public async Task<ActionResult<LineupDto>> GetLineup(int id)
        {
            try
            {
                if (!await _processingService.DocumentExistsAsync(id))
                    return NotFound(new { error = "Document not found" });

                // Prefer CubicleDeviceExtractions (Python output) when available.
                // Ordered by insertion order (MinId) which reflects visual left-to-right order
                // from the document. This ensures GetLineup and GetLineupDevices share the same
                // position numbering so the frontend can reliably match by functionalPosition.
                var deviceGroups = await _context.CubicleDeviceExtractions
                    .Where(c => c.DocumentPackageId == id)
                    .GroupBy(c => c.FunctionalPosition)
                    .Select(g => new
                    {
                        MinId                = g.Min(d => d.Id),
                        FunctionalPosition   = g.Key,
                        PanelType            = g.OrderByDescending(d => d.ConfidenceScore).First().PanelType,
                        ConfidenceScore      = g.Max(d => d.ConfidenceScore),
                        SwitchgearInstanceId = g.OrderByDescending(d => d.ConfidenceScore).First().SwitchgearInstanceId
                    })
                    .OrderBy(g => g.MinId)
                    .ToListAsync();

                if (deviceGroups.Any())
                {
                    int pos = 1;
                    var cubicles = deviceGroups.Select(g => new CubicleDto
                    {
                        Position             = pos++,
                        FunctionalPosition   = g.FunctionalPosition,
                        Type                 = NormalizePanelType(g.PanelType),
                        AbbProductFamily     = "UniGear ZS1",
                        AbbArticleNumber     = SelectArticleNumber(NormalizePanelType(g.PanelType)),
                        Quantity             = 1,
                        ConfidenceScore      = Math.Round(g.ConfidenceScore, 2),
                        TopologyWarning      = string.Empty,
                        SwitchgearInstanceId = g.SwitchgearInstanceId,
                        Devices              = new List<DeviceSelectionDto>()
                    }).ToList();

                    return Ok(new LineupDto
                    {
                        Id                = id,
                        OverallConfidence = Math.Round(cubicles.Average(c => c.ConfidenceScore), 2),
                        Cubicles          = cubicles
                    });
                }

                // Fall back to SwitchgearCubicles (old SLD vision path)
                var lineup = await _processingService.GetLineupAsync(id);
                var fallbackCubicles = lineup.Select(c => new CubicleDto
                {
                    Position             = c.Position,
                    FunctionalPosition   = string.Empty,
                    Type                 = c.Type,
                    AbbProductFamily     = c.AbbProductFamily,
                    AbbArticleNumber     = c.AbbArticleNumber,
                    Quantity             = c.Quantity,
                    ConfidenceScore      = Math.Round(c.ConfidenceScore, 2),
                    TopologyWarning      = c.TopologyWarning ?? string.Empty,
                    SwitchgearInstanceId = c.SwitchgearInstanceId,
                    Devices              = c.Devices.Select(d => new DeviceSelectionDto
                    {
                        DeviceType       = d.DeviceType,
                        AbbArticleNumber = d.AbbArticleNumber,
                        Quantity         = d.Quantity,
                        ConfidenceScore  = Math.Round(d.ConfidenceScore, 2)
                    }).ToList()
                }).ToList();

                var overallConfidence = lineup.Any() ? lineup.Average(c => c.ConfidenceScore) : 0.0;
                return Ok(new LineupDto
                {
                    Id                = id,
                    OverallConfidence = Math.Round(overallConfidence, 2),
                    Cubicles          = fallbackCubicles
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Lineup Error] {ex.GetType().Name}: {ex.Message}");
                return StatusCode(500, new { error = $"Lineup retrieval failed: {ex.Message}" });
            }
        }

        private static string NormalizePanelType(string rawType) =>
            (rawType ?? string.Empty).Trim().ToLowerInvariant() switch
            {
                "incomer"        => "incomer",
                "feeder"         => "outgoer",
                "outgoer"        => "outgoer",
                "coupler"        => "coupler",
                "metering"       => "metering",
                "transformer"    => "outgoer",
                "vt"             => "metering",
                "bussection"     => "busbar_section",
                "busbar_section" => "busbar_section",
                _                => "outgoer"
            };

        private static string SelectArticleNumber(string cubicleType) => cubicleType switch
        {
            "incomer"        => "1SDA065534R1",
            "coupler"        => "1SDA066356R1",
            "busbar_section" => "1SDA065500R1",
            "metering"       => "1SDA065520R1",
            _                => "1SDA065534R1"
        };

        /// <summary>
        /// GET /api/v1/documents/{id}/lineup/devices
        /// Get detailed device parameters for all cubicles grouped by switchgear instances.
        /// Includes CB model/rating, CT/VT ratios, relay model/protection functions with confidence scores.
        /// </summary>
        [HttpGet("{id}/lineup/devices")]
        public async Task<ActionResult<LineupDevicesResponseDto>> GetLineupDevices(int id)
        {
            try
            {
                if (!await _processingService.DocumentExistsAsync(id))
                    return NotFound(new { error = "Document not found" });

                // Get all cubicle device extractions ordered by insertion order (visual order)
                var allDevices = await _context.CubicleDeviceExtractions
                    .Where(c => c.DocumentPackageId == id)
                    .OrderBy(c => c.SwitchgearInstanceId)
                    .ThenBy(c => c.Id)
                    .ToListAsync();

                // Get instances to group data
                var instances = await _context.SwitchgearInstances
                    .Where(i => i.DocumentPackageId == id)
                    .OrderBy(i => i.InstanceIndex)
                    .ToListAsync();

                // If no instances, create a default one for legacy data
                if (instances.Count == 0)
                {
                    instances.Add(new Models.SwitchgearInstance
                    {
                        Id = 0,
                        DocumentPackageId = id,
                        InstanceIndex = 1,
                        InstanceName = "Switchgear 1",
                        Location = string.Empty,
                        TopologySummary = "{}"
                    });
                }

                // Build response grouped by instance
                var instanceDtos = new List<LineupInstanceDto>();
                var allConfidences = new List<double>();

                foreach (var inst in instances)
                {
                    // Group by functional position, preserving insertion order (MinId = visual order)
                    var cubicleDevices = allDevices
                        .Where(d => d.SwitchgearInstanceId == inst.Id || (inst.Id == 0 && d.SwitchgearInstanceId == null))
                        .GroupBy(d => d.FunctionalPosition)
                        .OrderBy(g => g.Min(d => d.Id))
                        .ToList();

                    var cubicleDetails = new List<CubicleDeviceDetailsDto>();
                    int position = 1;

                    foreach (var cubGroup in cubicleDevices)
                    {
                        var rows = cubGroup.ToList();

                        // Per-field ensemble: pick the highest-confidence source for each field
                        // independently, rather than using a single winner for all fields.
                        var primaryDevice = rows.OrderByDescending(d => d.ConfidenceScore).First();

                        var bestCbModel   = rows.Where(d => !string.IsNullOrEmpty(d.CBModel))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault() ?? primaryDevice;
                        var bestCbRating  = rows.Where(d => !string.IsNullOrEmpty(d.CBRating))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault() ?? primaryDevice;
                        var bestCbBreak   = rows.Where(d => !string.IsNullOrEmpty(d.CbBreakingCapacity))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestCbMaking  = rows.Where(d => !string.IsNullOrEmpty(d.CbMakingCapacity))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestCbMech    = rows.Where(d => !string.IsNullOrEmpty(d.CbMechanismType))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestCbPoles   = rows.Where(d => !string.IsNullOrEmpty(d.CbNumberOfPoles))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestCtRatio   = rows.Where(d => !string.IsNullOrEmpty(d.CTRatio))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault() ?? primaryDevice;
                        var bestCtAcc     = rows.Where(d => !string.IsNullOrEmpty(d.CtAccuracyClass))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestCtBurden  = rows.Where(d => !string.IsNullOrEmpty(d.CtBurden))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestCtCore    = rows.Where(d => !string.IsNullOrEmpty(d.CtCoreType))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestVtRatio   = rows.Where(d => !string.IsNullOrEmpty(d.VTRatio))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault() ?? primaryDevice;
                        var bestVtAcc     = rows.Where(d => !string.IsNullOrEmpty(d.VtAccuracyClass))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestVtBurden  = rows.Where(d => !string.IsNullOrEmpty(d.VtBurden))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestVtInsul   = rows.Where(d => !string.IsNullOrEmpty(d.VtInsulationLevel))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestRelay     = rows.Where(d => !string.IsNullOrEmpty(d.RelayModel))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault() ?? primaryDevice;
                        var bestProt      = rows.Where(d => !string.IsNullOrEmpty(d.ProtectionFunctions) && d.ProtectionFunctions != "[]")
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault() ?? primaryDevice;
                        var bestRelayAux  = rows.Where(d => !string.IsNullOrEmpty(d.RelayAuxVoltage))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestRelayComm = rows.Where(d => !string.IsNullOrEmpty(d.RelayCommunicationProtocol) && d.RelayCommunicationProtocol != "[]")
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestDsCount   = rows.Where(d => !string.IsNullOrEmpty(d.DsCount))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestDsMode    = rows.Where(d => !string.IsNullOrEmpty(d.DsOperatingMode))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestEsRow     = rows.Where(d => !string.IsNullOrEmpty(d.EsPresent))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestSaRow     = rows.Where(d => !string.IsNullOrEmpty(d.SaPresent))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();
                        var bestAuxVolt   = rows.Where(d => !string.IsNullOrEmpty(d.AuxControlVoltage))
                                               .OrderByDescending(d => d.ConfidenceScore).FirstOrDefault();

                        List<string> protectionFunctions = new();
                        try
                        {
                            protectionFunctions = System.Text.Json.JsonSerializer.Deserialize<List<string>>(
                                bestProt.ProtectionFunctions ?? "[]") ?? new();
                        }
                        catch { }

                        List<string> commProtocols = new();
                        try
                        {
                            if (bestRelayComm != null)
                                commProtocols = System.Text.Json.JsonSerializer.Deserialize<List<string>>(
                                    bestRelayComm.RelayCommunicationProtocol ?? "[]") ?? new();
                        }
                        catch { }

                        DeviceParameterDto MakeParam(string value, double conf, string path, int page) =>
                            new() { Value = value, ConfidenceScore = Math.Round(conf, 2), ExtractionSource = path, SourcePage = page };

                        var cubDetail = new CubicleDeviceDetailsDto
                        {
                            Position           = position++,
                            FunctionalPosition = primaryDevice.FunctionalPosition,
                            PanelType          = primaryDevice.PanelType ?? string.Empty,
                            CircuitBreaker = new CircuitBreakerDetailsDto
                            {
                                Model            = MakeParam(bestCbModel.CBModel ?? "", bestCbModel.ConfidenceScore, bestCbModel.ExtractionPath ?? "", bestCbModel.SourcePage),
                                Rating           = MakeParam(bestCbRating.CBRating ?? "", bestCbRating.ConfidenceScore, bestCbRating.ExtractionPath ?? "", bestCbRating.SourcePage),
                                BreakingCapacity = bestCbBreak  == null ? null : MakeParam(bestCbBreak.CbBreakingCapacity,  bestCbBreak.ConfidenceScore,  bestCbBreak.ExtractionPath  ?? "", bestCbBreak.SourcePage),
                                MakingCapacity   = bestCbMaking == null ? null : MakeParam(bestCbMaking.CbMakingCapacity,   bestCbMaking.ConfidenceScore, bestCbMaking.ExtractionPath ?? "", bestCbMaking.SourcePage),
                                MechanismType    = bestCbMech   == null ? null : MakeParam(bestCbMech.CbMechanismType,      bestCbMech.ConfidenceScore,   bestCbMech.ExtractionPath   ?? "", bestCbMech.SourcePage),
                                NumberOfPoles    = bestCbPoles  == null ? null : MakeParam(bestCbPoles.CbNumberOfPoles,     bestCbPoles.ConfidenceScore,  bestCbPoles.ExtractionPath  ?? "", bestCbPoles.SourcePage),
                            },
                            CurrentTransformer = new TransformerDetailsDto
                            {
                                Ratio          = MakeParam(bestCtRatio.CTRatio ?? "", bestCtRatio.ConfidenceScore, bestCtRatio.ExtractionPath ?? "", bestCtRatio.SourcePage),
                                AccuracyClass  = bestCtAcc    == null ? null : MakeParam(bestCtAcc.CtAccuracyClass,   bestCtAcc.ConfidenceScore,   bestCtAcc.ExtractionPath   ?? "", bestCtAcc.SourcePage),
                                Burden         = bestCtBurden == null ? null : MakeParam(bestCtBurden.CtBurden,       bestCtBurden.ConfidenceScore, bestCtBurden.ExtractionPath ?? "", bestCtBurden.SourcePage),
                                CoreType       = bestCtCore   == null ? null : MakeParam(bestCtCore.CtCoreType,       bestCtCore.ConfidenceScore,   bestCtCore.ExtractionPath   ?? "", bestCtCore.SourcePage),
                            },
                            VoltageTransformer = new TransformerDetailsDto
                            {
                                Ratio           = MakeParam(bestVtRatio.VTRatio ?? "", bestVtRatio.ConfidenceScore, bestVtRatio.ExtractionPath ?? "", bestVtRatio.SourcePage),
                                AccuracyClass   = bestVtAcc   == null ? null : MakeParam(bestVtAcc.VtAccuracyClass,    bestVtAcc.ConfidenceScore,   bestVtAcc.ExtractionPath   ?? "", bestVtAcc.SourcePage),
                                Burden          = bestVtBurden == null ? null : MakeParam(bestVtBurden.VtBurden,        bestVtBurden.ConfidenceScore, bestVtBurden.ExtractionPath ?? "", bestVtBurden.SourcePage),
                                InsulationLevel = bestVtInsul  == null ? null : MakeParam(bestVtInsul.VtInsulationLevel, bestVtInsul.ConfidenceScore, bestVtInsul.ExtractionPath  ?? "", bestVtInsul.SourcePage),
                            },
                            ProtectionRelay = new RelayDetailsDto
                            {
                                Model                         = MakeParam(bestRelay.RelayModel ?? "", bestRelay.ConfidenceScore, bestRelay.ExtractionPath ?? "", bestRelay.SourcePage),
                                ProtectionFunctions           = protectionFunctions,
                                ProtectionFunctionsConfidence = Math.Round(bestProt.ConfidenceScore, 2),
                                ProtectionFunctionsSource     = bestProt.ExtractionPath ?? string.Empty,
                                AuxVoltage                    = bestRelayAux == null ? null : MakeParam(bestRelayAux.RelayAuxVoltage, bestRelayAux.ConfidenceScore, bestRelayAux.ExtractionPath ?? "", bestRelayAux.SourcePage),
                                CommunicationProtocol         = commProtocols,
                            },
                            Disconnector = new DisconnectorDetailsDto
                            {
                                Count         = bestDsCount == null ? null : MakeParam(bestDsCount.DsCount,         bestDsCount.ConfidenceScore, bestDsCount.ExtractionPath ?? "", bestDsCount.SourcePage),
                                OperatingMode = bestDsMode  == null ? null : MakeParam(bestDsMode.DsOperatingMode,  bestDsMode.ConfidenceScore,  bestDsMode.ExtractionPath  ?? "", bestDsMode.SourcePage),
                            },
                            EarthingSwitch = new EarthingSwitchDetailsDto
                            {
                                Present = bestEsRow != null && string.Equals(bestEsRow.EsPresent, "true", StringComparison.OrdinalIgnoreCase),
                                Id      = bestEsRow == null || string.IsNullOrEmpty(bestEsRow.EsId) ? null
                                          : MakeParam(bestEsRow.EsId, bestEsRow.ConfidenceScore, bestEsRow.ExtractionPath ?? "", bestEsRow.SourcePage),
                            },
                            SurgeArrester = new SurgeArresterDetailsDto
                            {
                                Present = bestSaRow != null && string.Equals(bestSaRow.SaPresent, "true", StringComparison.OrdinalIgnoreCase),
                            },
                            Auxiliary = new AuxiliaryDetailsDto
                            {
                                ControlVoltage = bestAuxVolt == null ? null : MakeParam(bestAuxVolt.AuxControlVoltage, bestAuxVolt.ConfidenceScore, bestAuxVolt.ExtractionPath ?? "", bestAuxVolt.SourcePage),
                            },
                        };

                        cubicleDetails.Add(cubDetail);
                        allConfidences.Add(primaryDevice.ConfidenceScore);
                    }

                    // ── Fallback: no CubicleDeviceExtractions — synthesize from system-level parameters ──
                    if (cubicleDetails.Count == 0)
                    {
                        var sysParams = await _context.ExtractedParameters
                            .Where(p => p.DocumentPackageId == id &&
                                        (p.SwitchgearInstanceId == inst.Id || p.SwitchgearInstanceId == null))
                            .ToListAsync();

                        var lineup = await _context.SwitchgearCubicles
                            .Where(c => c.DocumentPackageId == id &&
                                        (c.SwitchgearInstanceId == inst.Id || c.SwitchgearInstanceId == null))
                            .Include(c => c.Devices)
                            .OrderBy(c => c.Position)
                            .ToListAsync();

                        string SysVal(string name) => sysParams
                            .FirstOrDefault(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase))
                            ?.NormalizedValue ?? string.Empty;
                        double SysConf(string name) => sysParams
                            .FirstOrDefault(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase))
                            ?.ConfidenceScore ?? 0.0;

                        var voltage  = SysVal("OperatingVoltage");
                        var voltConf = SysConf("OperatingVoltage");
                        var currentPrimary = SysVal("PanelRatedCurrent");
                        var current  = currentPrimary.Length > 0 ? currentPrimary : SysVal("RatedBusbarCurrent");
                        var currConf = currentPrimary.Length > 0 ? SysConf("PanelRatedCurrent") : SysConf("RatedBusbarCurrent");
                        var isc      = SysVal("ShortCircuitLevel");
                        var iscConf  = SysConf("ShortCircuitLevel");

                        var ratingParts = new List<string>();
                        if (!string.IsNullOrEmpty(voltage)) ratingParts.Add($"{voltage} kV");
                        if (!string.IsNullOrEmpty(current)) ratingParts.Add($"{current} A");
                        var cbRating     = string.Join(" / ", ratingParts);
                        var cbRatingConf = ratingParts.Count > 0 ? Math.Min(voltConf, currConf) : 0.0;

                        DeviceParameterDto MakeSys(string value, double conf, string src = "RFQ", int pg = 0) =>
                            new() { Value = value, ConfidenceScore = Math.Round(conf, 2), ExtractionSource = src, SourcePage = pg };

                        foreach (var cub in lineup)
                        {
                            var hasCb = cub.Devices.Any(d => d.DeviceType == "Circuit Breaker");

                            var fallbackDetail = new CubicleDeviceDetailsDto
                            {
                                Position           = cub.Position,
                                FunctionalPosition = cub.Position.ToString(),
                                PanelType          = cub.Type,
                                CircuitBreaker = new CircuitBreakerDetailsDto
                                {
                                    Model            = MakeSys(string.Empty, 0.0),
                                    Rating           = MakeSys(hasCb ? cbRating : string.Empty, cbRatingConf),
                                    BreakingCapacity = (hasCb && !string.IsNullOrEmpty(isc))
                                                       ? MakeSys($"{isc} kA", iscConf) : null,
                                },
                                CurrentTransformer = new TransformerDetailsDto { Ratio = MakeSys(string.Empty, 0.0) },
                                VoltageTransformer = new TransformerDetailsDto { Ratio = MakeSys(string.Empty, 0.0) },
                                ProtectionRelay    = new RelayDetailsDto
                                {
                                    Model                         = MakeSys(string.Empty, 0.0),
                                    ProtectionFunctions           = new List<string>(),
                                    ProtectionFunctionsConfidence = 0.0,
                                    ProtectionFunctionsSource     = string.Empty,
                                    CommunicationProtocol         = new List<string>(),
                                },
                                Disconnector   = new DisconnectorDetailsDto(),
                                EarthingSwitch = new EarthingSwitchDetailsDto { Present = false },
                                SurgeArrester  = new SurgeArresterDetailsDto  { Present = false },
                                Auxiliary      = new AuxiliaryDetailsDto(),
                            };
                            cubicleDetails.Add(fallbackDetail);
                            if (cbRatingConf > 0) allConfidences.Add(cbRatingConf);
                        }
                    }

                    // Parse topology summary
                    TopologySummaryDto topologySummary = new();
                    try
                    {
                        var topoData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
                            inst.TopologySummary ?? "{}") ?? new();
                        if (topoData.ContainsKey("totalPanels"))
                            topologySummary.TotalPanels = Convert.ToInt32(topoData["totalPanels"]);
                        if (topoData.ContainsKey("incomers"))
                            topologySummary.Incomers = Convert.ToInt32(topoData["incomers"]);
                        if (topoData.ContainsKey("feeders"))
                            topologySummary.Feeders = Convert.ToInt32(topoData["feeders"]);
                        if (topoData.ContainsKey("couplers"))
                            topologySummary.Couplers = Convert.ToInt32(topoData["couplers"]);
                        if (topoData.ContainsKey("busbarSections"))
                            topologySummary.BusbarSections = Convert.ToInt32(topoData["busbarSections"]);
                        if (topoData.ContainsKey("description"))
                            topologySummary.Description = topoData["description"].ToString() ?? string.Empty;
                    }
                    catch { }

                    instanceDtos.Add(new LineupInstanceDto
                    {
                        InstanceId = inst.Id,
                        InstanceIndex = inst.InstanceIndex,
                        InstanceName = inst.InstanceName,
                        Location = inst.Location ?? string.Empty,
                        Cubicles = cubicleDetails,
                        TopologySummary = topologySummary
                    });
                }

                var response = new LineupDevicesResponseDto
                {
                    SwitchgearInstances = instanceDtos,
                    OverallConfidence = allConfidences.Any() 
                        ? Math.Round(allConfidences.Average(), 2) 
                        : 0.0,
                    TotalCubicles = allDevices.DistinctBy(d => d.FunctionalPosition).Count()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LineupDevices Error] {ex.GetType().Name}: {ex.Message}");
                return StatusCode(500, new { error = $"Lineup devices retrieval failed: {ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/product-match
        /// Match extracted parameters against the ABB switchgear product catalog
        /// </summary>
        [HttpGet("{id}/product-match")]
        public async Task<ActionResult<List<ProductMatchDto>>> GetProductMatch(int id)
        {
            try
            {
                if (!await _processingService.DocumentExistsAsync(id))
                    return NotFound(new { error = "Document not found" });

                var productName = await _processingService.GetProductNameAsync(id) ?? "Switchgear";
                var parameters = await _processingService.GetParametersAsync(id);

                // Build PascalCase key → value map from extracted parameters (highest confidence wins)
                var paramDict = parameters
                    .Where(p => !string.IsNullOrWhiteSpace(p.Name))
                    .GroupBy(p => p.Name!.Trim(), StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(
                        g => g.Key,
                        g => (g.OrderByDescending(p => p.ConfidenceScore).First().Value ?? string.Empty).Trim(),
                        StringComparer.OrdinalIgnoreCase);

                // Call Python /product-matches — uses ABB materials API with extracted param values
                var pythonMatches = await _pythonClient.GetProductMatchesAsync(productName, paramDict);

                if (pythonMatches != null && pythonMatches.Count > 0)
                {
                    var dtos = pythonMatches.Select((m, i) => new ProductMatchDto
                    {
                        ProductKey       = m.Name,
                        ProductName      = string.IsNullOrEmpty(m.DisplayName) ? m.Name : m.DisplayName,
                        Description      = m.Description,
                        ImageUrl         = string.IsNullOrEmpty(m.ImageUrl) ? null : m.ImageUrl,
                        DocumentationUrl = string.IsNullOrEmpty(m.DocUrl) ? null : m.DocUrl,
                        IsRecommended    = i == 0,
                        IsCompatible     = true,
                        MatchScore       = 1.0,
                        MatchedCriteria  = new List<string> { "Confirmed by ABB Materials API" },
                        Mismatches       = new List<string>(),
                        InsulationType   = string.Empty,
                        Markets          = Array.Empty<string>()
                    }).ToList();
                    return Ok(dtos);
                }

                // Fallback to local scoring if Python service unavailable
                var matches = await _productMatching.MatchProductsLiveAsync(parameters);
                var fallback = matches.Select(m => new ProductMatchDto
                {
                    ProductKey = m.ProductKey, ProductName = m.ProductName,
                    Description = m.Description, ImageUrl = m.ImageUrl,
                    DocumentationUrl = m.DocumentationUrl, IsRecommended = m.IsRecommended,
                    IsCompatible = m.IsCompatible, MatchScore = m.MatchScore,
                    MatchedCriteria = m.MatchedCriteria, Mismatches = m.Mismatches,
                    InsulationType = m.InsulationType, Markets = m.Markets
                }).ToList();
                return Ok(fallback);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ProductMatch Error] {ex.GetType().Name}: {ex.Message}");
                return StatusCode(500, new { error = $"Product matching failed: {ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/all-products
        /// Return every ABB catalog product scored against this document's extracted parameters.
        /// Products with no parameter match still appear with MatchScore=0.
        /// </summary>
        [HttpGet("{id}/all-products")]
        public async Task<ActionResult<List<ProductMatchDto>>> GetAllProducts(int id)
        {
            try
            {
                if (!await _processingService.DocumentExistsAsync(id))
                    return NotFound(new { error = "Document not found" });

                var productName = await _processingService.GetProductNameAsync(id) ?? "Switchgear";
                var parameters  = await _processingService.GetParametersAsync(id);

                // Build param map (highest confidence wins per key)
                var paramDict = parameters
                    .Where(p => !string.IsNullOrWhiteSpace(p.Name))
                    .GroupBy(p => p.Name!.Trim(), StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(
                        g => g.Key,
                        g => (g.OrderByDescending(p => p.ConfidenceScore).First().Value ?? string.Empty).Trim(),
                        StringComparer.OrdinalIgnoreCase);

                // Non-Switchgear products (SafeRing, SafePlus, …): delegate to Python which
                // uses the ABB materials API to return product-specific matches.
                bool isSwitchgear = string.Equals(productName, "Switchgear", StringComparison.OrdinalIgnoreCase);
                if (!isSwitchgear)
                {
                    var pythonMatches = await _pythonClient.GetProductMatchesAsync(productName, paramDict);
                    if (pythonMatches != null && pythonMatches.Count > 0)
                    {
                        var dtos = pythonMatches.Select((m, i) => new ProductMatchDto
                        {
                            ProductKey       = m.Name,
                            ProductName      = string.IsNullOrEmpty(m.DisplayName) ? m.Name : m.DisplayName,
                            Description      = m.Description,
                            ImageUrl         = string.IsNullOrEmpty(m.ImageUrl) ? null : m.ImageUrl,
                            DocumentationUrl = string.IsNullOrEmpty(m.DocUrl)   ? null : m.DocUrl,
                            IsRecommended    = i == 0,
                            IsCompatible     = true,
                            MatchScore       = 1.0 - (i * 0.01), // rank by position
                            MatchedCriteria  = new List<string> { "Confirmed compatible by ABB Sales Configurator" },
                            Mismatches       = new List<string>(),
                            InsulationType   = string.Empty,
                            Markets          = Array.Empty<string>()
                        }).ToList();
                        return Ok(dtos);
                    }
                    // Python unavailable — return empty list so UI shows a clear "no results" state
                    return Ok(new List<ProductMatchDto>());
                }

                // Switchgear: use full C# scoring against the local ABB catalog
                var matches = await _productMatching.GetAllProductsAsync(parameters);
                var switchgearDtos = matches.Select(m => new ProductMatchDto
                {
                    ProductKey       = m.ProductKey,
                    ProductName      = m.ProductName,
                    Description      = m.Description,
                    ImageUrl         = m.ImageUrl,
                    DocumentationUrl = m.DocumentationUrl,
                    IsRecommended    = m.IsRecommended,
                    IsCompatible     = m.IsCompatible,
                    MatchScore       = m.MatchScore,
                    MatchedCriteria  = m.MatchedCriteria,
                    Mismatches       = m.Mismatches,
                    InsulationType   = m.InsulationType,
                    Markets          = m.Markets
                }).ToList();

                return Ok(switchgearDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AllProducts Error] {ex.GetType().Name}: {ex.Message}");
                return StatusCode(500, new { error = $"Product catalog failed: {ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/cubicle-devices
        /// Get Level 2 extracted device schedule data (Path B/C cubicle-level extraction)
        /// </summary>
        [HttpGet("{id}/cubicle-devices")]
        public async Task<ActionResult<List<CubicleDeviceDto>>> GetCubicleDevices(int id)
        {
            try
            {
                if (!await _processingService.DocumentExistsAsync(id))
                    return NotFound(new { error = "Document not found" });

                var devices = await _context.CubicleDeviceExtractions
                    .Where(c => c.DocumentPackageId == id)
                    .OrderBy(c => c.FunctionalPosition)
                    .ToListAsync();

                var dtos = devices.Select(d =>
                {
                    List<string> pf;
                    try { pf = System.Text.Json.JsonSerializer.Deserialize<List<string>>(d.ProtectionFunctions) ?? new(); }
                    catch { pf = new(); }

                    return new CubicleDeviceDto
                    {
                        Id                   = d.Id,
                        FunctionalPosition   = d.FunctionalPosition,
                        PanelType            = d.PanelType,
                        CbModel              = d.CBModel,
                        CbRating             = d.CBRating,
                        CbBreakingCapacity   = d.CbBreakingCapacity,
                        CtRatio              = d.CTRatio,
                        CtAccuracyClass      = d.CtAccuracyClass,
                        VtRatio              = d.VTRatio,
                        VtAccuracyClass      = d.VtAccuracyClass,
                        RelayModel           = d.RelayModel,
                        ProtectionFunctions  = pf,
                        ExtractionPath       = d.ExtractionPath,
                        ConfidenceScore      = Math.Round(d.ConfidenceScore, 2),
                        SourcePage           = d.SourcePage,
                        FlaggedForReview     = d.FlaggedForReview,
                        DeviationReason      = d.DeviationReason,
                        SwitchgearInstanceId = d.SwitchgearInstanceId
                    };
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CubicleDevices Error] {ex.GetType().Name}: {ex.Message}");
                return StatusCode(500, new { error = $"Cubicle device retrieval failed: {ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/deviations
        /// Get all deviations flagged for engineer review
        /// </summary>
        [HttpGet("{id}/deviations")]
        public async Task<ActionResult<List<DeviationItemDto>>> GetDeviations(int id)
        {
            if (!await _processingService.DocumentExistsAsync(id))
                return NotFound(new { error = "Document not found" });

            var deviations = await _processingService.GetDeviationsAsync(id);
            var dtos = deviations.Select(d => new DeviationItemDto
            {
                DeviationId = d.Id.ToString(),
                Description = d.Description,
                AffectedField = d.AffectedField,
                SourcePageNumbers = d.SourcePageNumbers ?? new int[] { },
                Resolved = d.Resolved,
                Severity = d.Severity,
                SuggestedValue = d.SuggestedValue
            }).ToList();

            return Ok(dtos);
        }

        /// <summary>
        /// GET /api/v1/documents/{id}/xml
        /// Download generated ABB-compliant XML configuration
        /// </summary>
        [HttpGet("{id}/xml")]
        public async Task<ActionResult> GetXml(int id)
        {
            var xml = await _processingService.GetXmlOutputAsync(id);
            if (xml == null) return NotFound(new { error = "XML not generated yet" });

            return File(
                Encoding.UTF8.GetBytes(xml),
                "application/xml",
                $"switchgear_config_{id}.xml"
            );
        }

        /// <summary>
        /// POST /api/v1/documents/{id}/review
        /// Submit engineer review corrections for deviations
        /// </summary>
        [HttpPost("{id}/review")]
        public async Task<ActionResult<DocumentStatusResponse>> SubmitReview(int id, [FromBody] ReviewSubmissionRequest request)
        {
            try
            {
                var doc = await _processingService.GetDocumentAsync(id);
                if (doc == null) return NotFound(new { error = "Document not found" });

                // Process each deviation review
                // Handle parameter overrides
                foreach (var override_ in request.DeviationReviews)
                {
                    var parameter = doc.Parameters.FirstOrDefault(p => p.Name == override_.ParameterName);
                    if (parameter != null && !string.IsNullOrEmpty(override_.CorrectedValue))
                    {
                        parameter.Value = override_.CorrectedValue;
                        parameter.FlaggedForReview = false;
                    }
                }

                // Mark resolved deviations
                foreach (var deviationId in request.ResolvedDeviationIds)
                {
                    if (int.TryParse(deviationId, out int parsedId))
                    {
                        var deviation = doc.Deviations.FirstOrDefault(d => d.Id == parsedId);
                        if (deviation != null)
                        {
                            deviation.Resolved = true;
                            deviation.ResolvedAt = DateTime.UtcNow;
                        }
                    }
                }

                // Recalculate overall confidence
                var params_ = await _processingService.GetParametersAsync(id);
                doc.OverallConfidence = params_.Count > 0 ? params_.Average(p => p.ConfidenceScore) : 0.0;

                // Check if all critical deviations are resolved
                var unresolvedCritical = doc.Deviations.Where(d => d.Severity == "Critical" && !d.Resolved).Count();
                if (unresolvedCritical == 0)
                {
                    doc.Status = "Ready for Export";
                }

                await _processingService.UpdateDocumentStatusAsync(id, doc.Status);

                return Ok(new DocumentStatusResponse
                {
                    Id = doc.Id,
                    Name = doc.Name,
                    Status = doc.Status,
                    OverallConfidence = Math.Round(doc.OverallConfidence, 2),
                    UploadedAt = doc.UploadedAt,
                    ProcessedAt = doc.ProcessedAt,
                    ParameterCount = doc.Parameters.Count,
                    CubicleCount = doc.Lineup.Count,
                    DeviationCount = doc.Deviations.Count,
                    UnresolvedDeviationCount = doc.Deviations.Count(d => !d.Resolved)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/v1/documents/{id}/reprocess
        /// Clear all extracted data for a document and re-run the full extraction pipeline.
        /// Useful after extraction logic changes without needing to re-upload the source files.
        /// </summary>
        [HttpPost("{id}/reprocess")]
        public async Task<ActionResult<DocumentStatusResponse>> Reprocess(int id)
        {
            if (!await _processingService.DocumentExistsAsync(id))
                return NotFound(new { error = "Document not found" });

            // Clear all previously extracted data so the pipeline writes fresh results.
            var parameters    = _context.ExtractedParameters.Where(p => p.DocumentPackageId == id);
            var instances     = _context.SwitchgearInstances.Where(i => i.DocumentPackageId == id);
            var cubicles      = _context.SwitchgearCubicles.Where(c => c.DocumentPackageId == id);
            var cubicleDevs   = _context.CubicleDeviceExtractions.Where(c => c.DocumentPackageId == id);
            var deviations    = _context.DeviationItems.Where(d => d.DocumentPackageId == id);

            _context.ExtractedParameters.RemoveRange(parameters);
            _context.SwitchgearInstances.RemoveRange(instances);
            _context.SwitchgearCubicles.RemoveRange(cubicles);
            _context.CubicleDeviceExtractions.RemoveRange(cubicleDevs);
            _context.DeviationItems.RemoveRange(deviations);

            await _context.SaveChangesAsync();
            await _processingService.UpdateDocumentStatusAsync(id, "processing");

            // Re-run pipeline asynchronously — same pattern as the upload endpoint.
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var pipeline = scope.ServiceProvider.GetRequiredService<IPipelineOrchestrationService>();
                    await pipeline.ProcessDocumentAsync(id);
                    Console.WriteLine($"[Reprocess] Completed for document {id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Reprocess Error] document {id}: {ex.Message}");
                }
            });

            var status = await _processingService.GetDocumentStatusAsync(id);
            return Accepted(status);
        }

        /// <summary>
        /// GET /api/v1/documents/products
        /// Return the list of ABB product variants from the ABB Sales Configurator API.
        /// </summary>
        [HttpGet("/api/v1/products")]
        public async Task<ActionResult<List<PythonProductInfo>>> GetProducts()
        {
            var products = await _pythonClient.GetProductsAsync();
            if (products == null)
                return StatusCode(502, new { error = "ABB product catalogue unavailable — Python service did not respond." });
            return Ok(products);
        }

        /// <summary>
        /// GET /api/v1/parameter-definitions/{productFamily}
        /// Return parameter definitions for the given ABB product family.
        /// </summary>
        [HttpGet("/api/v1/parameter-definitions/{productFamily}")]
        public async Task<ActionResult<List<PythonParameterDefinition>>> GetParameterDefinitions(string productFamily)
        {
            var defs = await _pythonClient.GetParameterDefinitionsAsync(productFamily);
            if (defs == null)
                return StatusCode(502, new { error = $"Parameter definitions unavailable for '{productFamily}'." });
            return Ok(defs);
        }
    }
}
