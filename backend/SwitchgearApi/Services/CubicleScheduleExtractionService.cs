using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Azure;
using Azure.AI.Inference;
using Azure.AI.OpenAI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;

namespace SwitchgearApi.Services
{
    public class CubicleDeviceData
    {
        public string       FunctionalPosition  { get; set; } = string.Empty;
        public string       PanelType           { get; set; } = string.Empty;
        public string       CBModel             { get; set; } = string.Empty;
        public string       CBRating            { get; set; } = string.Empty;
        public string       CTRatio             { get; set; } = string.Empty;
        public string       VTRatio             { get; set; } = string.Empty;
        public string       RelayModel          { get; set; } = string.Empty;
        public List<string> ProtectionFunctions { get; set; } = new();
        public double       Confidence          { get; set; } = 0.75;
        public int          SourcePage          { get; set; }
    }

    public interface ICubicleScheduleExtractionService
    {
        bool IsConfigured { get; }
        Task<List<CubicleDeviceData>> ExtractCubiclesAsync(List<(int PageNumber, string Text)> pages);
    }

    public class CubicleScheduleExtractionService : ICubicleScheduleExtractionService
    {
        private static readonly string[] ScheduleKeywords =
        {
            // EN
            "cubicle", "panel", "feeder", "incomer", "coupler", "circuit breaker",
            "current transformer", "relay", "protection", "rated current", "equipment list", "schedule",
            // IT
            "scomparto", "quadro", "interruttore", "relè", "rele", "protezione",
            // FR
            "départ", "arrivée", "disjoncteur", "transformateur de courant",
            // DE
            "abgang", "einspeiser", "schutzrelais"
        };

        private const string SystemPrompt =
            "You are extracting a cubicle equipment schedule from a medium-voltage switchgear document.\n" +
            "The text is OCR-extracted from a schedule or table page. Extract every cubicle row.\n" +
            "Panel type classification (multilingual):\n" +
            "  Incomer: arriv, incom, arrivée, arrivo, einspeise, incoming\n" +
            "  Feeder:  départ, feeder, sortie, partenza, abgang, outgoing\n" +
            "  Coupler: couplage, coupler, bus-tie, accoppiatore, kupplung\n" +
            "  Metering: comptage, metering, mesure, misura, messung\n" +
            "ProtectionFunctions: ANSI relay function codes (e.g. 50/51, 27, 59, 87T, 67, 79, 51N).\n" +
            "Return ONLY valid JSON array (no markdown, no prose):\n" +
            "[{\"functionalPosition\":\"A1\",\"panelType\":\"Incomer\",\"cbModel\":\"VD4 1250\"," +
            "\"cbRating\":\"1250A\",\"ctRatio\":\"600/1A\",\"vtRatio\":\"\"," +
            "\"relayModel\":\"REF615\",\"protectionFunctions\":[\"50/51\",\"27\",\"59\"]," +
            "\"confidence\":0.82}]\n" +
            "Return [] if no cubicle schedule data is present in this text.";

        private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

        private readonly ILogger<CubicleScheduleExtractionService> _logger;
        private readonly string?                 _deploymentName;
        private readonly AzureOpenAIClient?      _azureClient;
        private readonly ChatCompletionsClient?  _inferenceClient;

        public CubicleScheduleExtractionService(
            IConfiguration configuration,
            ILogger<CubicleScheduleExtractionService> logger)
        {
            _logger = logger;

            var section     = configuration.GetSection("AzureOpenAI");
            var endpoint    = section["Endpoint"];
            var apiKey      = section["ApiKey"];
            _deploymentName = section["DeploymentName"];

            if (string.IsNullOrWhiteSpace(endpoint) ||
                string.IsNullOrWhiteSpace(apiKey)   ||
                string.IsNullOrWhiteSpace(_deploymentName))
            {
                _logger.LogWarning("[PathB-L2] CubicleScheduleExtractionService not configured; skipping.");
                return;
            }

            var uri = new Uri(endpoint);
            if (uri.Host.EndsWith("openai.azure.com", StringComparison.OrdinalIgnoreCase) ||
                uri.Host.EndsWith("services.ai.azure.com", StringComparison.OrdinalIgnoreCase))
                _azureClient = new AzureOpenAIClient(uri, new AzureKeyCredential(apiKey));
            else
                _inferenceClient = new ChatCompletionsClient(uri, new AzureKeyCredential(apiKey));
        }

        public bool IsConfigured => _azureClient != null || _inferenceClient != null;

        public async Task<List<CubicleDeviceData>> ExtractCubiclesAsync(
            List<(int PageNumber, string Text)> pages)
        {
            if (!IsConfigured)
                return new List<CubicleDeviceData>();

            var schedulePages = pages
                .Where(p => IsSchedulePage(p.Text))
                .ToList();

            _logger.LogInformation("[PathB-L2] {Count} schedule page(s) detected.", schedulePages.Count);

            var all = new List<CubicleDeviceData>();

            foreach (var (pageNumber, text) in schedulePages)
            {
                var truncated = text.Length > 3000 ? text[..3000] : text;
                var records   = await ExtractFromPageAsync(truncated, pageNumber);
                all.AddRange(records);
            }

            // Deduplicate by FunctionalPosition — keep highest confidence
            var deduped = all
                .GroupBy(c => c.FunctionalPosition, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.OrderByDescending(c => c.Confidence).First())
                .ToList();

            _logger.LogInformation("[PathB-L2] Extracted {Total} cubicle record(s) after dedup.", deduped.Count);
            return deduped;
        }

        private async Task<List<CubicleDeviceData>> ExtractFromPageAsync(string text, int pageNumber)
        {
            try
            {
                var responseText = await CallLlmAsync(text);
                if (string.IsNullOrWhiteSpace(responseText))
                    return new List<CubicleDeviceData>();

                var json    = StripFences(responseText);
                var records = JsonSerializer.Deserialize<List<CubicleDeviceData>>(json, JsonOpts)
                              ?? new List<CubicleDeviceData>();

                foreach (var r in records)
                    r.SourcePage = pageNumber;

                return records;
            }
            catch (JsonException jex)
            {
                _logger.LogWarning(jex, "[PathB-L2] Non-JSON response for page {Page}; skipping.", pageNumber);
                return new List<CubicleDeviceData>();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[PathB-L2] LLM call failed for page {Page}; skipping.", pageNumber);
                return new List<CubicleDeviceData>();
            }
        }

        private async Task<string> CallLlmAsync(string userText)
        {
            if (_azureClient != null)
            {
                var chatClient = _azureClient.GetChatClient(_deploymentName!);
                var messages   = new ChatMessage[]
                {
                    new SystemChatMessage(SystemPrompt),
                    new UserChatMessage(userText)
                };
                var opts       = new ChatCompletionOptions { Temperature = 0, MaxOutputTokenCount = 2048 };
                var completion = await chatClient.CompleteChatAsync(messages, opts);
                return completion.Value.Content[0].Text;
            }
            else
            {
                var opts = new ChatCompletionsOptions
                {
                    Model       = _deploymentName,
                    Temperature = 0,
                    MaxTokens   = 2048,
                    Messages    =
                    {
                        new ChatRequestSystemMessage(SystemPrompt),
                        new ChatRequestUserMessage(userText)
                    }
                };
                var response = await _inferenceClient!.CompleteAsync(opts);
                var rawJson  = response.GetRawResponse().Content.ToString();
                using var doc = JsonDocument.Parse(rawJson);
                return doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? string.Empty;
            }
        }

        private static bool IsSchedulePage(string text)
        {
            var count = ScheduleKeywords.Count(k =>
                text.Contains(k, StringComparison.OrdinalIgnoreCase));
            return count >= 2;
        }

        private static string StripFences(string text)
        {
            var t = text.Trim();
            if (!t.StartsWith("```")) return t;
            var start = t.IndexOf('\n') + 1;
            var end   = t.LastIndexOf("```");
            return end > start ? t[start..end].Trim() : t;
        }
    }
}
