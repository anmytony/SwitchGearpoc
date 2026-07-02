using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PDFtoImage;
using SkiaSharp;
using SwitchgearApi.Data;
using SwitchgearApi.Dtos;
using SwitchgearApi.Models;
using UglyToad.PdfPig;

namespace SwitchgearApi.Services
{
    /// <summary>
    /// Core service for CRUD operations on documents and their extracted data.
    /// Handles the data access layer for all pipeline stages.
    /// </summary>
    public interface IDocumentProcessingService
    {
        Task<DocumentPackage> CreateDocumentPackageAsync(string name, string uploadedBy, string productName = "Switchgear");
        Task<DocumentPackage> GetDocumentAsync(int id);
        Task<List<DocumentPackage>> GetAllDocumentsAsync();
        Task<DocumentStatusResponse?> GetDocumentStatusAsync(int id);
        Task<List<DocumentStatusResponse>> GetAllDocumentStatusesAsync();
        Task<string?> GetProductNameAsync(int documentId);
        Task<List<ExtractedParameter>> GetParametersAsync(int documentId);
        Task<List<SwitchgearCubicle>> GetLineupAsync(int documentId);
        Task<List<DeviationItem>> GetDeviationsAsync(int documentId);
        Task<string> GetXmlOutputAsync(int documentId);
        Task<bool> DocumentExistsAsync(int documentId);
        Task<List<DocumentPage>> CreatePagesFromUploadAsync(int documentId, IFormFileCollection files);
        Task<DocumentPackage> UpdateDocumentStatusAsync(int documentId, string status);
        Task<DocumentPackage> UpdateOverallConfidenceAsync(int documentId);
        Task ApplyParameterOverridesAsync(int documentId, IEnumerable<(string Name, string Value)> overrides);
        Task ResolveDeviationsAsync(int documentId, IEnumerable<int> deviationIds);
        Task<bool> HasUnresolvedCriticalDeviationsAsync(int documentId);
    }

    public class DocumentProcessingService : IDocumentProcessingService
    {
        private static readonly string[] PlainTextExtensions = { ".txt", ".csv", ".json", ".xml", ".md" };
        private static readonly string[] ImageExtensions = { ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".svg" };
        private static readonly string[] OcrExtensions = { ".pdf", ".docx", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp" };
        // SVG is visual-only (vector graphics); neither local OCR nor Azure DI can extract text from it.

        private readonly SwitchgearDbContext _context;
        private readonly IDocumentIntelligenceService _ocr;
        private readonly ILogger<DocumentProcessingService> _logger;

        public DocumentProcessingService(
            SwitchgearDbContext context,
            IDocumentIntelligenceService ocr,
            ILogger<DocumentProcessingService> logger)
        {
            _context = context;
            _ocr = ocr;
            _logger = logger;
        }

        public async Task<DocumentPackage> CreateDocumentPackageAsync(string name, string uploadedBy, string productName = "Switchgear")
        {
            try
            {
                var package = new DocumentPackage
                {
                    Name = name,
                    UploadedBy = uploadedBy,
                    UploadedAt = DateTime.UtcNow,
                    Status = "Queued",
                    ProductName = productName
                };

                _context.DocumentPackages.Add(package);
                await _context.SaveChangesAsync();
                return package;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreateDocumentPackage Error] {ex.GetType().Name}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[CreateDocumentPackage Error] Inner: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task<bool> DocumentExistsAsync(int documentId) =>
            await _context.DocumentPackages.AnyAsync(d => d.Id == documentId);

        public async Task<DocumentPackage> GetDocumentAsync(int id)
        {
            return await _context.DocumentPackages
                .AsNoTracking()
                .Include(d => d.Parameters)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<List<DocumentPackage>> GetAllDocumentsAsync()
        {
            return await _context.DocumentPackages
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();
        }

        public async Task<DocumentStatusResponse?> GetDocumentStatusAsync(int id)
        {
            var d = await _context.DocumentPackages
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id);
            if (d == null) return null;

            var paramCount      = await _context.ExtractedParameters.CountAsync(p => p.DocumentPackageId == id);
            var cubicleCount    = await _context.SwitchgearCubicles.CountAsync(c => c.DocumentPackageId == id);
            var devCount        = await _context.DeviationItems.CountAsync(v => v.DocumentPackageId == id);
            var unresolvedCount = await _context.DeviationItems.CountAsync(v => v.DocumentPackageId == id && !v.Resolved);

            return new DocumentStatusResponse
            {
                Id = d.Id,
                Name = d.Name,
                Status = d.Status,
                OverallConfidence = Math.Round(d.OverallConfidence, 2),
                UploadedAt = d.UploadedAt,
                ProcessedAt = d.ProcessedAt,
                ErrorMessage = d.ErrorMessage,
                ParameterCount = paramCount,
                CubicleCount = cubicleCount,
                DeviationCount = devCount,
                UnresolvedDeviationCount = unresolvedCount
            };
        }

        public async Task<List<DocumentStatusResponse>> GetAllDocumentStatusesAsync()
        {
            // Fetch counts in bulk (one query each) to avoid N+1 correlated subqueries that timeout.
            var docs = await _context.DocumentPackages
                .AsNoTracking()
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            var ids = docs.Select(d => d.Id).ToList();

            var paramCounts = await _context.ExtractedParameters
                .Where(p => ids.Contains(p.DocumentPackageId))
                .GroupBy(p => p.DocumentPackageId)
                .Select(g => new { Id = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Id, x => x.Count);

            var cubicleCountsRaw = await _context.SwitchgearCubicles
                .Where(c => ids.Contains(c.DocumentPackageId))
                .GroupBy(c => c.DocumentPackageId)
                .Select(g => new { Id = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Id, x => x.Count);

            var devCounts = await _context.DeviationItems
                .Where(v => ids.Contains(v.DocumentPackageId))
                .GroupBy(v => v.DocumentPackageId)
                .Select(g => new { Id = g.Key, Total = g.Count(), Unresolved = g.Count(v => !v.Resolved) })
                .ToDictionaryAsync(x => x.Id, x => (x.Total, x.Unresolved));

            return docs.Select(d => new DocumentStatusResponse
            {
                Id = d.Id,
                Name = d.Name,
                Status = d.Status,
                OverallConfidence = Math.Round(d.OverallConfidence, 2),
                UploadedAt = d.UploadedAt,
                ProcessedAt = d.ProcessedAt,
                ErrorMessage = d.ErrorMessage,
                ParameterCount = paramCounts.GetValueOrDefault(d.Id),
                CubicleCount = cubicleCountsRaw.GetValueOrDefault(d.Id),
                DeviationCount = devCounts.TryGetValue(d.Id, out var dc) ? dc.Total : 0,
                UnresolvedDeviationCount = devCounts.TryGetValue(d.Id, out var du) ? du.Unresolved : 0
            }).ToList();
        }

        public async Task<string?> GetProductNameAsync(int documentId)
        {
            return await _context.DocumentPackages
                .AsNoTracking()
                .Where(d => d.Id == documentId)
                .Select(d => d.ProductName)
                .FirstOrDefaultAsync();
        }

        public async Task<List<ExtractedParameter>> GetParametersAsync(int documentId)
        {
            return await _context.ExtractedParameters
                .AsNoTracking()
                .Where(p => p.DocumentPackageId == documentId)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<List<SwitchgearCubicle>> GetLineupAsync(int documentId)
        {
            return await _context.SwitchgearCubicles
                .Where(c => c.DocumentPackageId == documentId)
                .Include(c => c.Devices)
                .OrderBy(c => c.Position)
                .ToListAsync();
        }

        public async Task<List<DeviationItem>> GetDeviationsAsync(int documentId)
        {
            return await _context.DeviationItems
                .Where(d => d.DocumentPackageId == documentId)
                .OrderByDescending(d => d.Severity)
                .ThenByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<string> GetXmlOutputAsync(int documentId)
        {
            var doc = await GetDocumentAsync(documentId);
            return doc?.XmlOutput;
        }

        public async Task<List<DocumentPage>> CreatePagesFromUploadAsync(int documentId, IFormFileCollection files)
        {
            var existingPages = await _context.DocumentPages
                .Where(p => p.DocumentPackageId == documentId)
                .ToListAsync();

            if (existingPages.Count > 0)
            {
                _context.DocumentPages.RemoveRange(existingPages);
            }

            var pages = new List<DocumentPage>();
            var pageNumber = 1;

            foreach (var file in files)
            {
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant() ?? string.Empty;

                if (ext is ".pdf" or ".docx")
                {
                    // Buffer the file once — stream is consumed by text extraction,
                    // reused for embedded image extraction and SLD page rendering.
                    await using var rawStream = file.OpenReadStream();
                    using var fileMem = new MemoryStream();
                    await rawStream.CopyToAsync(fileMem);
                    var fileBytes = fileMem.ToArray();

                    // ── TEXT EXTRACTION ──────────────────────────────────────────────
                    var textPages = await _ocr.ExtractTextByPageAsync(
                        new MemoryStream(fileBytes), file.FileName);

                    if (textPages.Count == 0)
                    {
                        _logger.LogWarning("No text pages extracted from {FileName} — storing raw PDF for pdfplumber fallback.", file.FileName);
                        // Store raw PDF bytes so the Python service can use pdfplumber fallback
                        if (ext == ".pdf")
                        {
                            var doc = await _context.DocumentPackages.FindAsync(documentId);
                            if (doc != null)
                            {
                                doc.RawPdfBase64 = Convert.ToBase64String(fileBytes);
                                // Don't save yet — caller saves after all pages are added
                            }
                        }
                        pages.Add(new DocumentPage
                        {
                            DocumentPackageId        = documentId,
                            PageNumber               = pageNumber++,
                            Classification           = "text_tabular",
                            ClassificationConfidence = 0.65,
                            RawContent               = string.Empty,
                            FilePath                 = file.FileName,
                            ClassifiedAt             = DateTime.UtcNow
                        });
                    }
                    else
                    {
                        foreach (var (docPage, text) in textPages)
                        {
                            pages.Add(new DocumentPage
                            {
                                DocumentPackageId        = documentId,
                                PageNumber               = pageNumber++,
                                Classification           = "text_tabular",
                                ClassificationConfidence = 0.90,
                                RawContent               = text,
                                FilePath                 = $"{file.FileName}#p{docPage}",
                                ClassifiedAt             = DateTime.UtcNow
                            });
                        }
                        _logger.LogInformation(
                            "{Count} text page(s) extracted from {FileName}.",
                            textPages.Count, file.FileName);
                    }

                    // ── SLD PAGE RENDERING + EMBEDDED IMAGE EXTRACTION (parallel) ───
                    // Run both concurrently: SLD rendering (PDFtoImage, CPU-bound) and
                    // PdfPig embedded image extraction are independent of each other.
                    List<(int PageNum, byte[] PngBytes)> sldRendered = new();
                    List<(byte[] Bytes, string MimeType, int PageNumber)> embeddedImages = new();

                    if (ext == ".pdf")
                    {
                        const int SldTextThreshold = 3000;
                        const int MaxSldPages      = 8;   // cap vision calls — beyond 8 hits rate limits
                        var sldPageNums = textPages
                            .Where(p => p.PageNumber > 2 && p.Text.Length < SldTextThreshold)
                            .OrderBy(p => p.Text.Length)  // fewest chars first = most likely actual diagrams
                            .Take(MaxSldPages)
                            .OrderBy(p => p.PageNumber)   // restore document order
                            .Select(p => p.PageNumber)
                            .ToList();

                        // Render all SLD pages in parallel (each is an independent CPU task).
                        var renderTask = Task.Run(async () =>
                        {
                            if (sldPageNums.Count == 0) return new List<(int, byte[])>();
                            var renders = await Task.WhenAll(
                                sldPageNums.Select(pn => Task.Run(() =>
                                {
                                    var png = RenderPdfPageToPng(fileBytes, pn);
                                    return (pn, png);
                                })));
                            return renders.Where(r => r.png != null)
                                          .Select(r => (r.pn, r.png!))
                                          .ToList();
                        });

                        // Extract embedded images in parallel with SLD rendering.
                        var embedTask = Task.Run(() =>
                        {
                            var results = new List<(byte[], string, int)>();
                            try { ExtractImagesFromPdf(fileBytes, results); }
                            catch (Exception ex) {
                                _logger.LogWarning(ex, "Embedded image extraction failed for {FileName}.", file.FileName);
                            }
                            return results;
                        });

                        await Task.WhenAll(renderTask, embedTask);
                        sldRendered    = await renderTask;
                        embeddedImages = await embedTask;

                        if (sldRendered.Count > 0)
                            _logger.LogInformation("Rendered {Count} SLD page(s) as images from {FileName}.", sldRendered.Count, file.FileName);
                    }
                    else if (ext == ".docx")
                    {
                        embeddedImages = await ExtractEmbeddedImagesAsync(fileBytes, ext, file.FileName);
                    }

                    foreach (var (pdfPageNum, pngBytes) in sldRendered)
                    {
                        var base64 = Convert.ToBase64String(pngBytes);
                        pages.Add(new DocumentPage
                        {
                            DocumentPackageId        = documentId,
                            PageNumber               = pageNumber++,
                            Classification           = "visual_sld",
                            ClassificationConfidence = 0.85,
                            RawContent               = $"[SLD_IMAGE:image/png]\n{base64}",
                            FilePath                 = $"{file.FileName}#sld-p{pdfPageNum}",
                            ClassifiedAt             = DateTime.UtcNow
                        });
                    }

                    foreach (var (imgBytes, mimeType, srcPage) in embeddedImages)
                    {
                        var base64 = Convert.ToBase64String(imgBytes);
                        pages.Add(new DocumentPage
                        {
                            DocumentPackageId        = documentId,
                            PageNumber               = pageNumber++,
                            Classification           = "visual_sld",
                            ClassificationConfidence = 0.80,
                            RawContent               = $"[SLD_IMAGE:{mimeType}]\n{base64}",
                            FilePath                 = $"{file.FileName}#image-p{srcPage}",
                            ClassifiedAt             = DateTime.UtcNow
                        });
                    }

                    if (embeddedImages.Count > 0)
                        _logger.LogInformation(
                            "{Count} embedded image(s) extracted from {FileName} and queued for vision analysis.",
                            embeddedImages.Count, file.FileName);
                }
                else
                {
                    // Plain text, JSON, images — existing single-page path.
                    var rawContent = await ReadTextContentAsync(file);
                    var classification = InferClassification(file.FileName, rawContent);
                    pages.Add(new DocumentPage
                    {
                        DocumentPackageId        = documentId,
                        PageNumber               = pageNumber++,
                        Classification           = classification,
                        ClassificationConfidence = string.IsNullOrWhiteSpace(rawContent) ? 0.65 : 0.90,
                        RawContent               = rawContent,
                        FilePath                 = file.FileName,
                        ClassifiedAt             = DateTime.UtcNow
                    });
                }
            }

            if (pages.Count > 0)
            {
                _context.DocumentPages.AddRange(pages);
                await _context.SaveChangesAsync();
            }

            return pages;
        }

        public async Task<DocumentPackage> UpdateDocumentStatusAsync(int documentId, string status)
        {
            var doc = await _context.DocumentPackages.FindAsync(documentId);
            if (doc == null) throw new InvalidOperationException("Document not found");

            doc.Status = status;
            if (status == "Completed" || status == "Failed")
            {
                doc.ProcessedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return doc;
        }

        public async Task<DocumentPackage> UpdateOverallConfidenceAsync(int documentId)
        {
            var doc = await _context.DocumentPackages.FindAsync(documentId);
            if (doc == null) throw new InvalidOperationException("Document not found");

            var parameters = await GetParametersAsync(documentId);
            doc.OverallConfidence = parameters.Count > 0
                ? parameters.Average(p => p.ConfidenceScore)
                : 0.0;

            await _context.SaveChangesAsync();
            return doc;
        }

        public async Task ApplyParameterOverridesAsync(int documentId, IEnumerable<(string Name, string Value)> overrides)
        {
            var overrideList = overrides.ToList();
            if (overrideList.Count == 0) return;

            var names = overrideList.Select(o => o.Name).ToList();
            var parameters = await _context.ExtractedParameters
                .Where(p => p.DocumentPackageId == documentId && names.Contains(p.Name))
                .ToListAsync();

            foreach (var param in parameters)
            {
                var match = overrideList.FirstOrDefault(o =>
                    string.Equals(o.Name, param.Name, StringComparison.OrdinalIgnoreCase));
                if (match != default)
                {
                    param.Value = match.Value;
                    param.FlaggedForReview = false;
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task ResolveDeviationsAsync(int documentId, IEnumerable<int> deviationIds)
        {
            var idList = deviationIds.ToList();
            if (idList.Count == 0) return;

            var deviations = await _context.DeviationItems
                .Where(d => d.DocumentPackageId == documentId && idList.Contains(d.Id))
                .ToListAsync();

            var now = DateTime.UtcNow;
            foreach (var dev in deviations)
            {
                dev.Resolved = true;
                dev.ResolvedAt = now;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasUnresolvedCriticalDeviationsAsync(int documentId) =>
            await _context.DeviationItems.AnyAsync(d =>
                d.DocumentPackageId == documentId &&
                d.Severity == "Critical" &&
                !d.Resolved);

        // ===================== Embedded image extraction =====================

        private static readonly string[] ImagePartMimeTypes =
            { "image/jpeg", "image/jpg", "image/png", "image/tiff", "image/bmp" };

        /// <summary>
        /// Returns every image embedded in a PDF or DOCX that is large enough to be a
        /// meaningful diagram (not a logo or decorative icon).
        /// </summary>
        private Task<List<(byte[] Bytes, string MimeType, int PageNumber)>> ExtractEmbeddedImagesAsync(
            byte[] fileBytes, string extension, string fileName)
        {
            var results = new List<(byte[], string, int)>();
            try
            {
                if (extension == ".pdf")
                    ExtractImagesFromPdf(fileBytes, results);
                else if (extension == ".docx")
                    ExtractImagesFromDocx(fileBytes, results);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Embedded image extraction failed for {FileName}; continuing without image pages.",
                    fileName);
            }
            return Task.FromResult(results);
        }

        /// <summary>
        /// Renders a single PDF page (1-based) to a PNG at 150 DPI.
        /// Returns null if rendering fails.
        /// </summary>
        private byte[]? RenderPdfPageToPng(byte[] pdfBytes, int pageNumber)
        {
            try
            {
                // PDFtoImage uses 0-based page index.
                using var bitmap = Conversion.ToImage(
                    pdfBytes,
                    page: pageNumber - 1,
                    options: new RenderOptions(Dpi: 150));

                using var ms = new MemoryStream();
                bitmap.Encode(ms, SKEncodedImageFormat.Png, quality: 90);
                return ms.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Failed to render PDF page {Page} as image.", pageNumber);
                return null;
            }
        }

        private static void ExtractImagesFromPdf(
            byte[] pdfBytes,
            List<(byte[] Bytes, string MimeType, int PageNumber)> results)
        {
            using var pdf = PdfDocument.Open(pdfBytes);

            foreach (var page in pdf.GetPages())
            {
                foreach (var img in page.GetImages())
                {
                    // Skip images that are too small to be a technical diagram.
                    // Typical SLD diagrams are at least 300 × 200 px.
                    if (img.WidthInSamples < 200 || img.HeightInSamples < 150)
                        continue;

                    // TryGetPng converts any PdfPig-supported format (JPEG, CCITT, etc.)
                    // to a portable PNG that the vision LLM can consume.
                    if (img.TryGetPng(out var pngData))
                    {
                        results.Add((pngData.ToArray(), "image/png", page.Number));
                    }
                }
            }
        }

        private static void ExtractImagesFromDocx(
            byte[] docxBytes,
            List<(byte[] Bytes, string MimeType, int PageNumber)> results)
        {
            using var ms      = new MemoryStream(docxBytes);
            using var wordDoc = WordprocessingDocument.Open(ms, isEditable: false);
            var mainPart      = wordDoc.MainDocumentPart;
            if (mainPart is null) return;

            var pageNumber = 1; // DOCX has no page model; all images count as "page 1"

            foreach (var imagePart in mainPart.ImageParts)
            {
                var mimeType = imagePart.ContentType; // e.g. "image/jpeg"
                if (!ImagePartMimeTypes.Contains(mimeType, StringComparer.OrdinalIgnoreCase))
                    continue;

                using var imgStream = imagePart.GetStream();
                using var imgMs     = new MemoryStream();
                imgStream.CopyTo(imgMs);
                var imgBytes = imgMs.ToArray();

                // Skip images below 15 KB — too small to be a meaningful diagram.
                if (imgBytes.Length < 15_000)
                    continue;

                results.Add((imgBytes, mimeType, pageNumber));
            }
        }

        private async Task<string> ReadTextContentAsync(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant() ?? string.Empty;

            // Plain-text formats are read directly — unchanged path.
            if (PlainTextExtensions.Contains(extension))
            {
                await using var stream = file.OpenReadStream();
                using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, leaveOpen: false);
                return await reader.ReadToEndAsync();
            }

            // Image files: store raw bytes as a base64-encoded payload so that
            // the SLD vision extraction stage can decode and analyze the diagram.
            // The [SLD_IMAGE:…] prefix is detected by ParameterExtractionService.
            if (ImageExtensions.Contains(extension))
            {
                await using var imgStream = file.OpenReadStream();
                using var ms = new MemoryStream();
                await imgStream.CopyToAsync(ms);
                var bytes    = ms.ToArray();
                var mimeType = GetImageMimeType(extension);
                var base64   = Convert.ToBase64String(bytes);

                _logger.LogInformation(
                    "Image file {FileName} ({SizeKb} KB) stored for SLD vision extraction.",
                    file.FileName, bytes.Length / 1024);

                // If Azure Document Intelligence is configured, also run OCR and append
                // the extracted text so the text-based regex/LLM path can run alongside vision.
                var ocrText = string.Empty;
                if (_ocr.IsConfigured)
                {
                    try
                    {
                        ocrText = await _ocr.ExtractTextAsync(new MemoryStream(bytes), file.FileName);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "OCR failed for image {FileName}; vision-only extraction will be used.", file.FileName);
                    }
                }

                // Layout: marker line + base64, then optional OCR text after a separator.
                // ParameterExtractionService reads up to the separator for the image bytes
                // and anything after it as plain text for regex/LLM extraction.
                return string.IsNullOrWhiteSpace(ocrText)
                    ? $"[SLD_IMAGE:{mimeType}]\n{base64}"
                    : $"[SLD_IMAGE:{mimeType}]\n{base64}\n[SLD_OCR_TEXT]\n{ocrText}";
            }

            // Non-image binary formats (PDF, DOCX) — existing OCR path, unchanged.
            if (OcrExtensions.Contains(extension))
            {
                if (!_ocr.IsConfigured)
                {
                    _logger.LogWarning(
                        "No OCR service configured for {FileName} ({Extension}). " +
                        "Set AzureDocumentIntelligence:Endpoint and ApiKey to enable PDF/DOCX extraction.",
                        file.FileName, extension);
                    return string.Empty;
                }

                await using var stream = file.OpenReadStream();
                return await _ocr.ExtractTextAsync(stream, file.FileName);
            }

            // Unsupported extension (e.g. .svg) — log so it is not silently ignored.
            if (!string.IsNullOrEmpty(extension))
            {
                _logger.LogWarning(
                    "No text extraction available for {FileName} ({Extension}). File will be stored without content.",
                    file.FileName, extension);
            }

            return string.Empty;
        }

        private static string GetImageMimeType(string extension) => extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png"            => "image/png",
            ".tiff" or ".tif" => "image/tiff",
            ".bmp"            => "image/bmp",
            _                 => "image/png"
        };

        private static string InferClassification(string fileName, string rawContent)
        {
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant() ?? string.Empty;

            // Classify by file type: diagrams/images are single-line diagrams,
            // everything textual is treated as text/tabular. OCR'd image text is
            // still extracted downstream regardless of this label.
            if (ImageExtensions.Contains(extension))
            {
                return "visual_sld";
            }

            if (PlainTextExtensions.Contains(extension) || extension is ".pdf" or ".docx")
            {
                return "text_tabular";
            }

            return !string.IsNullOrWhiteSpace(rawContent) ? "text_tabular" : "unknown";
        }
    }
}
