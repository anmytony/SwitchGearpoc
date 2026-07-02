using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Azure;
using Azure.AI.Inference;
using Azure.AI.OpenAI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using SwitchgearApi.Models;

namespace SwitchgearApi.Services
{
    public interface IRagParameterExtractionService
    {
        bool IsConfigured { get; }
        Task<List<ExtractedParameter>> ExtractLevel1Async(
            int documentPackageId, int? instanceId, string instanceName);
    }

    public class RagParameterExtractionService : IRagParameterExtractionService
    {
        private static readonly (string Name, string Query, string AllowedList)[] Parameters =
        {
            ("OperatingVoltage",
             "operating voltage rated voltage kV tensione nominale Nennspannung",
             ParameterAllowedValues.VoltageList),
            ("ShortCircuitLevel",
             "short circuit level kA Icc corrente cortocircuito Kurzschlussstrom",
             ParameterAllowedValues.ShortCircuitList),
            ("RatedBusbarCurrent",
             "rated busbar current busbar ampacity corrente sbarra Sammelschiene",
             ParameterAllowedValues.BusbarCurrentList),
            ("PanelRatedCurrent",
             "panel rated current feeder current corrente pannello Abgangsstrom",
             ParameterAllowedValues.PanelCurrentList),
            ("Frequency",
             "frequency Hz frequenza Frequenz system frequency",
             ParameterAllowedValues.FrequencyList),
            ("Market",
             "IEC ANSI standard market norma",
             string.Join(", ", ParameterAllowedValues.MarketOptions)),
            ("BusbarArrangement",
             "busbar arrangement single double sbarra disposizione Sammelschienensystem",
             string.Join(", ", ParameterAllowedValues.BusbarArrangementOptions)),
            ("Insulation",
             "insulation AIS GIS SF6 dry air isolamento Isolierung",
             string.Join(", ", ParameterAllowedValues.InsulationOptions)),
            ("Distribution",
             "primary secondary distribution distribuzione primaire secondaire",
             string.Join(", ", ParameterAllowedValues.DistributionOptions)),
            ("IngressProtection",
             "ingress protection IP degree of protection indice de protection grado di protezione Schutzart",
             ParameterAllowedValues.IngressProtectionList),
            ("InternalArcClassification",
             "internal arc IAC tenue arc interne classificazione arco interno Lichtbogenklassifizierung",
             ParameterAllowedValues.InternalArcList),
        };

        private readonly ILogger<RagParameterExtractionService> _logger;
        private readonly IHttpClientFactory                      _httpClientFactory;
        private readonly string?  _searchEndpoint;
        private readonly string?  _searchApiKey;
        private readonly string?  _searchIndex;
        private readonly string?  _llmDeployment;
        private readonly AzureOpenAIClient?     _azureClient;
        private readonly ChatCompletionsClient? _inferenceClient;

        private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

        public RagParameterExtractionService(
            IConfiguration configuration,
            ILogger<RagParameterExtractionService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _logger            = logger;
            _httpClientFactory = httpClientFactory;

            var searchSection = configuration.GetSection("AzureAISearch");
            _searchEndpoint   = searchSection["Endpoint"];
            _searchApiKey     = searchSection["ApiKey"];
            _searchIndex      = searchSection["IndexName"];

            var llmSection  = configuration.GetSection("AzureOpenAI");
            var llmEndpoint = llmSection["Endpoint"];
            var llmApiKey   = llmSection["ApiKey"];
            _llmDeployment  = llmSection["DeploymentName"];

            if (string.IsNullOrWhiteSpace(_searchEndpoint) ||
                string.IsNullOrWhiteSpace(_searchApiKey)   ||
                string.IsNullOrWhiteSpace(_searchIndex)    ||
                string.IsNullOrWhiteSpace(llmEndpoint)     ||
                string.IsNullOrWhiteSpace(llmApiKey)       ||
                string.IsNullOrWhiteSpace(_llmDeployment))
            {
                _logger.LogWarning(
                    "[PathB] RAG extraction not configured (missing AzureAISearch or AzureOpenAI credentials). " +
                    "Path B will be skipped.");
                return;
            }

            var uri = new Uri(llmEndpoint);
            if (uri.Host.EndsWith("openai.azure.com", StringComparison.OrdinalIgnoreCase) ||
                uri.Host.EndsWith("services.ai.azure.com", StringComparison.OrdinalIgnoreCase))
                _azureClient = new AzureOpenAIClient(uri, new AzureKeyCredential(llmApiKey));
            else
                _inferenceClient = new ChatCompletionsClient(uri, new AzureKeyCredential(llmApiKey));

            _logger.LogInformation(
                "[PathB] RAG extraction configured — search index: {Index}, LLM: {Model}.",
                _searchIndex, _llmDeployment);
        }

        public bool IsConfigured => (_azureClient != null || _inferenceClient != null)
                                    && !string.IsNullOrWhiteSpace(_searchEndpoint);

        public async Task<List<ExtractedParameter>> ExtractLevel1Async(
            int documentPackageId, int? instanceId, string instanceName)
        {
            if (!IsConfigured)
                return new List<ExtractedParameter>();

            var tasks = Parameters.Select(p => ExtractOneAsync(p.Name, p.Query, p.AllowedList,
                                                               documentPackageId, instanceId, instanceName));
            var results = await Task.WhenAll(tasks);

            var found = results.Where(r => r != null).Select(r => r!).ToList();
            _logger.LogInformation("[PathB] Extracted {Count}/11 parameters via RAG.", found.Count);
            return found;
        }

        private async Task<ExtractedParameter?> ExtractOneAsync(
            string name, string query, string allowedList,
            int documentPackageId, int? instanceId, string instanceName)
        {
            try
            {
                var chunks = await SearchChunksAsync(query);
                if (string.IsNullOrWhiteSpace(chunks))
                    return null;

                var systemPrompt =
                    $"You are extracting a single parameter from medium-voltage switchgear specification text.\n" +
                    $"Parameter: {name}. Allowed values: {allowedList}.\n" +
                    $"Return ONLY valid JSON (no markdown, no explanation):\n" +
                    $"{{\"found\":true,\"value\":\"...\",\"unit\":\"...\",\"confidence\":0.85,\"sourceText\":\"exact quote\"}}\n" +
                    $"Set found=false if not explicitly stated. Never invent values.";

                var responseText = await CallLlmAsync(systemPrompt, chunks);
                if (string.IsNullOrWhiteSpace(responseText))
                    return null;

                using var doc  = JsonDocument.Parse(StripFences(responseText));
                var root       = doc.RootElement;
                var found      = root.TryGetProperty("found", out var f) && f.GetBoolean();
                if (!found) return null;

                var value      = root.TryGetProperty("value",      out var v) ? v.GetString() ?? "" : "";
                var unit       = root.TryGetProperty("unit",       out var u) ? u.GetString() ?? "" : "";
                var sourceText = root.TryGetProperty("sourceText", out var s) ? s.GetString() ?? "" : "";
                var confidence = root.TryGetProperty("confidence", out var c) && c.TryGetDouble(out var cd) ? cd : 0.75;

                if (string.IsNullOrWhiteSpace(value)) return null;

                return new ExtractedParameter
                {
                    DocumentPackageId    = documentPackageId,
                    SwitchgearInstanceId = instanceId,
                    SwitchgearInstanceName = instanceName,
                    Name                 = name,
                    Value                = value,
                    Unit                 = unit,
                    NormalizedValue      = value,
                    ConfidenceScore      = confidence,
                    FlaggedForReview     = confidence < 0.75,
                    ExtractionPath       = "PathB",
                    SourceText           = sourceText,
                    SourceBoundingBox    = string.Empty,
                    SourcePageNumber     = 0,
                    IsAbbDefault         = false,
                    ExtractionReason     = "PathB RAG extraction"
                };
            }
            catch (JsonException jex)
            {
                _logger.LogWarning(jex, "[PathB] Non-JSON response for parameter {Name}; skipping.", name);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[PathB] Failed to extract parameter {Name}; skipping.", name);
                return null;
            }
        }

        private async Task<string> SearchChunksAsync(string query)
        {
            var http = _httpClientFactory.CreateClient();
            var url  = $"{_searchEndpoint!.TrimEnd('/')}/indexes/{_searchIndex}/docs/search?api-version=2023-11-01";

            var body = JsonSerializer.Serialize(new
            {
                search    = query,
                queryType = "simple",
                top       = 3,
                select    = "content,pageNumber"
            });

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("api-key", _searchApiKey);
            request.Content = new StringContent(body, Encoding.UTF8, "application/json");

            using var response = await http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[PathB] AI Search returned {Status} for query '{Query}'.",
                    response.StatusCode, query);
                return string.Empty;
            }

            var json      = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var sb = new StringBuilder();
            if (doc.RootElement.TryGetProperty("value", out var values))
            {
                foreach (var item in values.EnumerateArray())
                {
                    if (item.TryGetProperty("content", out var content))
                        sb.Append(content.GetString()).Append('\n');

                    if (sb.Length >= 2000) break;
                }
            }

            return sb.Length > 2000 ? sb.ToString()[..2000] : sb.ToString();
        }

        private async Task<string> CallLlmAsync(string systemPrompt, string userText)
        {
            if (_azureClient != null)
            {
                var chatClient = _azureClient.GetChatClient(_llmDeployment!);
                var messages   = new ChatMessage[]
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userText)
                };
                var opts       = new ChatCompletionOptions { Temperature = 0, MaxOutputTokenCount = 256 };
                var completion = await chatClient.CompleteChatAsync(messages, opts);
                return completion.Value.Content[0].Text;
            }
            else
            {
                var opts = new ChatCompletionsOptions
                {
                    Model       = _llmDeployment,
                    Temperature = 0,
                    MaxTokens   = 256,
                    Messages    =
                    {
                        new ChatRequestSystemMessage(systemPrompt),
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
