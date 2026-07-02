using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Azure;
using Azure.AI.DocumentIntelligence;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PdfPigDocument = UglyToad.PdfPig.PdfDocument;

namespace SwitchgearApi.Services
{
    public interface IDocumentIntelligenceService
    {
        /// <summary>True when the service is ready to extract text.</summary>
        bool IsConfigured { get; }

        /// <summary>
        /// Extracts plain text from the supplied document stream.
        /// Returns an empty string for unsupported formats or on failure.
        /// </summary>
        Task<string> ExtractTextAsync(Stream content, string fileName);

        /// <summary>
        /// Extracts plain text page-by-page from a PDF or DOCX stream.
        /// Returns one entry per page that contains non-empty text.
        /// DOCX and image formats return a single entry at page 1.
        /// </summary>
        Task<List<(int PageNumber, string Text)>> ExtractTextByPageAsync(Stream content, string fileName);
    }

    /// <summary>
    /// Local OCR / text-extraction fallback using PdfPig (PDF) and
    /// DocumentFormat.OpenXml (DOCX). No cloud credentials required.
    /// Image-only files (PNG, TIFF, etc.) return empty text.
    /// </summary>
    public class LocalOcrService : IDocumentIntelligenceService
    {
        private readonly ILogger<LocalOcrService> _logger;

        public LocalOcrService(ILogger<LocalOcrService> logger)
        {
            _logger = logger;
        }

        public bool IsConfigured => true;

        public async Task<string> ExtractTextAsync(Stream content, string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant() ?? string.Empty;

            try
            {
                if (extension == ".pdf")
                    return await ExtractPdfAsync(content, fileName);
                if (extension == ".docx")
                    return await ExtractDocxAsync(content, fileName);

                _logger.LogWarning(
                    "Local OCR does not support {Extension} files ({FileName}). " +
                    "Configure Azure Document Intelligence to extract text from images.",
                    extension, fileName);
                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Local OCR extraction failed for {FileName}.", fileName);
                return string.Empty;
            }
        }

        public async Task<List<(int PageNumber, string Text)>> ExtractTextByPageAsync(Stream content, string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant() ?? string.Empty;
            try
            {
                if (extension == ".pdf")
                    return await ExtractPdfByPageAsync(content, fileName);

                var text = await ExtractTextAsync(content, fileName);
                return string.IsNullOrWhiteSpace(text)
                    ? new List<(int, string)>()
                    : new List<(int, string)> { (1, text) };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Per-page OCR extraction failed for {FileName}.", fileName);
                return new List<(int, string)>();
            }
        }

        private async Task<string> ExtractPdfAsync(Stream stream, string fileName)
        {
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);

            using var pdf = PdfPigDocument.Open(ms.ToArray());
            var sb = new StringBuilder();
            foreach (var page in pdf.GetPages())
                sb.AppendLine(ExtractPageText(page));

            var text = sb.ToString();
            _logger.LogInformation("PDF extracted {Length} chars from {FileName}.", text.Length, fileName);
            return text;
        }

        private async Task<List<(int PageNumber, string Text)>> ExtractPdfByPageAsync(Stream stream, string fileName)
        {
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            var bytes = ms.ToArray();

            // --- PdfPig pass (fast, good for standard PDFs) ---
            var pages = ExtractWithPdfPig(bytes, fileName);

            // --- iText7 fallback (handles custom font encoding, Form XObjects, CAD-exported PDFs) ---
            // Trigger when PdfPig yields fewer than 30% of total pages or fewer than 3 pages.
            int totalPages;
            try
            {
                var opts = new UglyToad.PdfPig.ParsingOptions { UseLenientParsing = true };
                using var tmpPdf = PdfPigDocument.Open(bytes, opts);
                totalPages = tmpPdf.NumberOfPages;
            }
            catch { totalPages = 0; }

            bool pigFailed = pages.Count < 3 || (totalPages > 0 && pages.Count < totalPages * 0.3);
            if (pigFailed)
            {
                _logger.LogInformation(
                    "PdfPig extracted only {PigCount}/{Total} pages from {FileName}. Retrying with iText7.",
                    pages.Count, totalPages, fileName);
                var iTextPages = ExtractWithIText7(bytes, fileName);
                if (iTextPages.Count > pages.Count)
                    pages = iTextPages;
            }

            _logger.LogInformation(
                "PDF extraction: {Count} pages with text from {FileName}.", pages.Count, fileName);
            return pages;
        }

        private List<(int PageNumber, string Text)> ExtractWithPdfPig(byte[] bytes, string fileName)
        {
            try
            {
                var options = new UglyToad.PdfPig.ParsingOptions { UseLenientParsing = true };
                using var pdf = PdfPigDocument.Open(bytes, options);
                var pages = new List<(int, string)>();
                foreach (var page in pdf.GetPages())
                {
                    var text = ExtractPageText(page);
                    if (!string.IsNullOrWhiteSpace(text))
                        pages.Add((page.Number, text));
                }
                return pages;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "PdfPig extraction failed for {FileName}.", fileName);
                return new List<(int, string)>();
            }
        }

        private List<(int PageNumber, string Text)> ExtractWithIText7(byte[] bytes, string fileName)
        {
            try
            {
                using var memStream = new MemoryStream(bytes);
                using var reader = new PdfReader(memStream);
                using var pdfDoc = new iText.Kernel.Pdf.PdfDocument(reader);
                var pages = new List<(int, string)>();
                for (int i = 1; i <= pdfDoc.GetNumberOfPages(); i++)
                {
                    var strategy = new SimpleTextExtractionStrategy();
                    var text = PdfTextExtractor.GetTextFromPage(pdfDoc.GetPage(i), strategy);
                    if (!string.IsNullOrWhiteSpace(text))
                        pages.Add((i, text));
                }
                _logger.LogInformation(
                    "iText7 extracted {Count}/{Total} pages from {FileName}.",
                    pages.Count, pdfDoc.GetNumberOfPages(), fileName);
                return pages;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "iText7 extraction failed for {FileName}.", fileName);
                return new List<(int, string)>();
            }
        }

        private static string ExtractPageText(UglyToad.PdfPig.Content.Page page)
        {
            // 1st attempt: page.Text (fast, works for most native-text PDFs)
            var text = page.Text;
            if (!string.IsNullOrWhiteSpace(text))
                return text;

            // 2nd attempt: word clustering — better for tables and multi-column layouts
            try
            {
                var words = page.GetWords();
                var wordList = words.ToList();
                if (wordList.Count > 0)
                {
                    var sorted = wordList
                        .OrderBy(w => -w.BoundingBox.Top)
                        .ThenBy(w => w.BoundingBox.Left);
                    return string.Join(" ", sorted.Select(w => w.Text));
                }
            }
            catch { /* fall through */ }

            // 3rd attempt: raw letters — last resort for non-standard font encoding
            try
            {
                var letters = page.Letters;
                if (letters.Count > 0)
                {
                    var sorted = letters
                        .OrderBy(l => -l.GlyphRectangle.Top)
                        .ThenBy(l => l.GlyphRectangle.Left);
                    return string.Concat(sorted.Select(l => l.Value));
                }
            }
            catch { /* fall through */ }

            return string.Empty;
        }

        private async Task<string> ExtractDocxAsync(Stream stream, string fileName)
        {
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            ms.Position = 0;

            using var wordDoc = WordprocessingDocument.Open(ms, isEditable: false);
            var body = wordDoc.MainDocumentPart?.Document?.Body;
            if (body is null)
                return string.Empty;

            var sb = new StringBuilder();
            foreach (var para in body.Descendants<Paragraph>())
            {
                var line = para.InnerText;
                if (!string.IsNullOrWhiteSpace(line))
                    sb.AppendLine(line);
            }

            var text = sb.ToString();
            _logger.LogInformation("DOCX extracted {Length} chars from {FileName}.", text.Length, fileName);
            return text;
        }
    }

    /// <summary>
    /// Cloud text-extraction backed by Azure Document Intelligence (prebuilt-read model).
    /// Supports PDF, DOCX, and image formats. Falls back to <see cref="LocalOcrService"/>
    /// when Azure credentials are absent or a call fails.
    /// Configure via AzureDocumentIntelligence:Endpoint and AzureDocumentIntelligence:ApiKey.
    /// </summary>
    public class AzureDocumentIntelligenceService : IDocumentIntelligenceService
    {
        private const long MaxFileSizeBytes = 50 * 1024 * 1024; // 50 MB — well within Azure DI's 500 MB limit

        private readonly ILogger<AzureDocumentIntelligenceService> _logger;
        private readonly string? _endpoint;
        private readonly string? _apiKey;
        private readonly LocalOcrService _localFallback;

        // Cached client — DocumentIntelligenceClient is thread-safe and expensive to construct.
        private readonly DocumentIntelligenceClient? _client;

        public AzureDocumentIntelligenceService(
            IConfiguration configuration,
            ILogger<AzureDocumentIntelligenceService> logger,
            ILoggerFactory loggerFactory)
        {
            _logger = logger;
            _localFallback = new LocalOcrService(loggerFactory.CreateLogger<LocalOcrService>());

            var section = configuration.GetSection("AzureDocumentIntelligence");
            _endpoint = section["Endpoint"];
            _apiKey = section["ApiKey"];

            if (!IsConfigured)
            {
                _logger.LogWarning(
                    "Azure Document Intelligence is not configured (missing AzureDocumentIntelligence:Endpoint/ApiKey). " +
                    "Falling back to local PDF/DOCX extraction.");
            }
            else
            {
                _client = new DocumentIntelligenceClient(new Uri(_endpoint!), new AzureKeyCredential(_apiKey!));
                _logger.LogInformation("Azure Document Intelligence configured at {Endpoint}.", _endpoint);
            }
        }

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(_endpoint) &&
            !string.IsNullOrWhiteSpace(_apiKey);

        public async Task<List<(int PageNumber, string Text)>> ExtractTextByPageAsync(Stream content, string fileName)
        {
            if (!IsConfigured)
                return await _localFallback.ExtractTextByPageAsync(content, fileName);

            using var ms = new MemoryStream();
            await content.CopyToAsync(ms);
            var bytes = ms.ToArray();

            if (bytes.Length == 0)
                return new List<(int, string)>();

            if (bytes.Length > MaxFileSizeBytes)
            {
                _logger.LogWarning(
                    "File {FileName} exceeds the {LimitMb} MB limit. Falling back to local per-page OCR.",
                    fileName, MaxFileSizeBytes / (1024 * 1024));
                return await _localFallback.ExtractTextByPageAsync(new MemoryStream(bytes), fileName);
            }

            // Pre-screen: run iText7 first (fast, local, no network).
            // If it already covers ≥80% of pages with meaningful text, skip Azure DI entirely —
            // CAD-generated PDFs with custom font encoding always fail DI but work with iText7.
            int pdfPageCount = 0;
            try
            {
                using var countPdf = PdfPigDocument.Open(bytes, new UglyToad.PdfPig.ParsingOptions { UseLenientParsing = true });
                pdfPageCount = countPdf.NumberOfPages;
            }
            catch { /* leave at 0 */ }

            if (pdfPageCount > 0)
            {
                var localPages = await _localFallback.ExtractTextByPageAsync(new MemoryStream(bytes), fileName);
                double localCoverage = (double)localPages.Count / pdfPageCount;
                if (localCoverage >= 0.80)
                {
                    _logger.LogInformation(
                        "iText7 pre-screen: {Count}/{Total} pages ({Coverage:P0}) — skipping Azure DI for {FileName}.",
                        localPages.Count, pdfPageCount, localCoverage, fileName);
                    return localPages;
                }
            }

            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(90));
                var operation = await _client!.AnalyzeDocumentAsync(
                    WaitUntil.Completed,
                    "prebuilt-layout",
                    BinaryData.FromBytes(bytes),
                    cancellationToken: cts.Token);

                var result = operation.Value;

                // Accumulate text lines per page
                var pageBuilders = new System.Collections.Generic.Dictionary<int, StringBuilder>();

                foreach (var page in result.Pages)
                {
                    if (!pageBuilders.ContainsKey(page.PageNumber))
                        pageBuilders[page.PageNumber] = new StringBuilder();
                    foreach (var line in page.Lines ?? [])
                        pageBuilders[page.PageNumber].AppendLine(line.Content);
                }

                // Append table rows to the page they belong to
                foreach (var table in result.Tables ?? [])
                {
                    var pageNum = table.BoundingRegions?.Count > 0
                        ? table.BoundingRegions[0].PageNumber
                        : 1;

                    if (!pageBuilders.ContainsKey(pageNum))
                        pageBuilders[pageNum] = new StringBuilder();
                    var sb = pageBuilders[pageNum];

                    var grid = new System.Collections.Generic.Dictionary<int, System.Collections.Generic.Dictionary<int, string>>();
                    foreach (var cell in table.Cells)
                    {
                        if (!grid.ContainsKey(cell.RowIndex))
                            grid[cell.RowIndex] = new System.Collections.Generic.Dictionary<int, string>();
                        grid[cell.RowIndex][cell.ColumnIndex] = cell.Content?.Trim() ?? string.Empty;
                    }
                    foreach (var row in grid.OrderBy(r => r.Key))
                    {
                        var line = string.Join("\t", row.Value.OrderBy(c => c.Key).Select(c => c.Value));
                        if (!string.IsNullOrWhiteSpace(line))
                            sb.AppendLine(line);
                    }
                    sb.AppendLine();
                }

                var pages = pageBuilders
                    .OrderBy(kv => kv.Key)
                    .Where(kv => !string.IsNullOrWhiteSpace(kv.Value.ToString()))
                    .Select(kv => (kv.Key, kv.Value.ToString()))
                    .ToList();

                int azureReportedPages = result.Pages?.Count ?? 0;
                _logger.LogInformation(
                    "Azure DI per-page extraction: {Count}/{AzurePages} page(s) with content, {Total} PDF pages, {TableCount} table(s) from {FileName}.",
                    pages.Count, azureReportedPages, pdfPageCount, result.Tables?.Count ?? 0, fileName);

                // If Azure DI missed most pages (typical for CAD-generated PDFs with custom font encoding),
                // fall back to iText7 via LocalOcrService. Use the pre-counted PDF page count, NOT the
                // Azure DI-reported count, since Azure DI itself may under-count pages.
                int expectedPages = pdfPageCount > 0 ? pdfPageCount : azureReportedPages;
                bool poorCoverage = expectedPages > 4 && pages.Count < expectedPages * 0.3;
                if (poorCoverage)
                {
                    _logger.LogInformation(
                        "Azure DI coverage too low ({Count}/{Total} PDF pages). Retrying with local iText7 extraction.",
                        pages.Count, expectedPages);
                    var localPages = await _localFallback.ExtractTextByPageAsync(new MemoryStream(bytes), fileName);
                    if (localPages.Count > pages.Count)
                    {
                        _logger.LogInformation(
                            "iText7 fallback extracted {Count} page(s) for {FileName}.", localPages.Count, fileName);
                        return localPages;
                    }
                }

                return pages;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Azure Document Intelligence per-page extraction failed for {FileName}. Falling back to local OCR.", fileName);
                return await _localFallback.ExtractTextByPageAsync(new MemoryStream(bytes), fileName);
            }
        }

        public async Task<string> ExtractTextAsync(Stream content, string fileName)
        {
            if (!IsConfigured)
                return await _localFallback.ExtractTextAsync(content, fileName);

            // Buffer the stream before the try block so the bytes are available
            // in both the Azure path and the catch fallback. IFormFile streams are
            // not seekable, so we cannot reset content.Position after it is consumed.
            using var ms = new MemoryStream();
            await content.CopyToAsync(ms);
            var bytes = ms.ToArray();

            if (bytes.Length == 0)
            {
                _logger.LogWarning("Skipping Azure Document Intelligence for empty file {FileName}.", fileName);
                return string.Empty;
            }

            if (bytes.Length > MaxFileSizeBytes)
            {
                _logger.LogWarning(
                    "File {FileName} is {SizeMb:F1} MB, which exceeds the {LimitMb} MB processing limit. Falling back to local OCR.",
                    fileName, bytes.Length / (1024.0 * 1024), MaxFileSizeBytes / (1024 * 1024));
                return await _localFallback.ExtractTextAsync(new MemoryStream(bytes), fileName);
            }

            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(90));
                var operation = await _client!.AnalyzeDocumentAsync(
                    WaitUntil.Completed,
                    "prebuilt-layout",
                    BinaryData.FromBytes(bytes),
                    cancellationToken: cts.Token);

                var result = operation.Value;
                var sb = new StringBuilder();

                // Extract text lines per page.
                foreach (var page in result.Pages)
                {
                    foreach (var line in page.Lines ?? [])
                        sb.AppendLine(line.Content);
                }

                // Extract tables as "Key: Value" pairs so the LLM can read structured data.
                // Tables are the primary source of RFQ parameters in switchgear documents.
                foreach (var table in result.Tables ?? [])
                {
                    // Build a row→column grid to reconstruct logical rows.
                    var grid = new System.Collections.Generic.Dictionary<int, System.Collections.Generic.Dictionary<int, string>>();
                    foreach (var cell in table.Cells)
                    {
                        if (!grid.ContainsKey(cell.RowIndex))
                            grid[cell.RowIndex] = new System.Collections.Generic.Dictionary<int, string>();
                        grid[cell.RowIndex][cell.ColumnIndex] = cell.Content?.Trim() ?? string.Empty;
                    }

                    // Emit each row as a tab-separated line so the LLM sees structure.
                    foreach (var row in grid.OrderBy(r => r.Key))
                    {
                        var cols = row.Value.OrderBy(c => c.Key).Select(c => c.Value);
                        var line = string.Join("\t", cols);
                        if (!string.IsNullOrWhiteSpace(line))
                            sb.AppendLine(line);
                    }

                    sb.AppendLine(); // blank line between tables
                }

                var text = sb.ToString();
                _logger.LogInformation(
                    "Azure Document Intelligence (layout) extracted {Length} chars, {TableCount} table(s) from {FileName}.",
                    text.Length, result.Tables?.Count ?? 0, fileName);
                return text;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Azure Document Intelligence failed for {FileName}. Falling back to local OCR.", fileName);

                // Use buffered bytes for the fallback — the original stream is exhausted.
                return await _localFallback.ExtractTextAsync(new MemoryStream(bytes), fileName);
            }
        }
    }
}
