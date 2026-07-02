using System;
using System.Collections.Generic;
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
    /// <summary>A single parameter value the LLM claims to have found in the text.</summary>
    public record LlmExtractedValue(string Name, string Value, string Unit);

    public interface ILlmParameterExtractionService
    {
        bool IsConfigured { get; }
        Task<List<LlmExtractedValue>> ExtractAsync(string pageText);
    }

    /// <summary>
    /// PRIMARY parameter extractor backed by Azure OpenAI.
    /// Configure via AzureOpenAI:Endpoint, AzureOpenAI:ApiKey, AzureOpenAI:DeploymentName
    /// in appsettings or environment variables (AZUREOPENAI__ENDPOINT, etc.).
    /// Falls back to regex-only extraction when not configured.
    /// </summary>
    public class AzureOpenAIExtractionService : ILlmParameterExtractionService
    {
        // Build the system prompt dynamically so the allowed-value lists here always
        // stay in sync with ParameterAllowedValues (single source of truth).
        private static readonly string SystemPrompt =
$@"You are an extraction engine for medium-voltage switchgear RFQ documents.
The document may be written in English or Italian (or a mix). Recognise parameter labels in both languages.
From the supplied text, extract ONLY these parameters when their value is explicitly present.
Use the exact 'name' shown. For enumerated parameters, return one of the allowed options verbatim (in English).

Numeric parameters (allowed values shown for reference):
- OperatingVoltage (unit kV) — the switchgear rated insulation voltage (Um/Ur), allowed: {ParameterAllowedValues.VoltageList}
  CRITICAL DISTINCTION: 'Rated Voltage' (Um) ≠ 'Rated Operating Voltage'.
    'Rated Voltage' or 'Um' = the switchgear equipment insulation class (what we want).
    'Rated Operating Voltage' = the actual network/grid voltage (NOT what we want — ignore it).
  Extract the SWITCHGEAR CLASS voltage (Um), NOT the network/system operating voltage.
  E.g. a 12 kV class panel may operate on a 10 kV grid — extract 12, not 10.
  Look for: 'Rated Voltage', 'Um', 'Ur', 'highest voltage for equipment', 'nominal voltage'
  French: 'tension assignée' (IEC 62271 term for Um — use this), NOT 'tension nominale' (= network voltage)
  Italian: 'Tensione nominale', 'Un (kV)', 'Tensione massima per le apparecchiature'
  IGNORE lines labelled: 'rated operating voltage', 'operating voltage', 'system voltage', 'network voltage',
    'tension nominale' (French — this is the NETWORK voltage, not the switchgear class),
    'Tensione di esercizio', 'Tensione operativa', 'Tensione di sistema'
- ShortCircuitLevel (unit kA) - allowed: {ParameterAllowedValues.ShortCircuitList}
  Italian labels: Corrente di cortocircuito, Tenuta al cortocircuito, Icc, Ik (kA)
- RatedBusbarCurrent (unit A) - allowed: {ParameterAllowedValues.BusbarCurrentList}
  Italian labels: Corrente nominale di sbarra, Sbarra principale (A), Corrente sbarra
- PanelRatedCurrent (unit A) - allowed: {ParameterAllowedValues.PanelCurrentList}
  Italian labels: Corrente nominale pannello, Corrente nominale scomparto, Corrente nominale uscita
- Frequency (unit Hz) - allowed: {ParameterAllowedValues.FrequencyList}
  Italian labels: Frequenza, Frequenza nominale, Frequenza di sistema

Enumerated parameters:
- Market - allowed: IEC, ANSI
- BusbarArrangement - allowed: Single busbar, Double busbar, Double Level
  Italian labels: Singola sbarra → Single busbar, Doppia sbarra → Double busbar, Doppio livello → Double Level
- Insulation - allowed: AIS, GIS (Dry Air), GIS (SF6), GIS (SF6-free)
  Italian labels: Aria (isolamento in aria) → AIS, Aria secca → GIS (Dry Air), Gas SF6 → GIS (SF6), SF6 free / senza SF6 → GIS (SF6-free)
- Distribution - allowed: Primary, Secondary
  Italian labels: Distribuzione primaria / Primario → Primary, Distribuzione secondaria / Secondario → Secondary

The text may come from a PDF or image table extracted by OCR. In that case, rows appear as
tab-separated columns, and units may be in a column header rather than next to the value. Examples:
  Rated Voltage        12 kV        -> OperatingVoltage = 12 kV
  Um                   12 kV        -> OperatingVoltage = 12 kV
  Tension assignée     12 kV        -> OperatingVoltage = 12 kV
  Tensione nominale    12 kV        -> OperatingVoltage = 12 kV
  Rated Voltage (kV)   12           -> OperatingVoltage = 12, unit kV
  Rated Operating Voltage  10 kV   -> IGNORE (this is the network voltage, not the switchgear class)
  Short Circuit Level   25 kA       -> ShortCircuitLevel = 25 kA
  Corrente di cortocircuito  25 kA  -> ShortCircuitLevel = 25 kA
  Isc (kA)             25           -> ShortCircuitLevel = 25, unit kA
  Busbar Current (A)   1250         -> RatedBusbarCurrent = 1250, unit A
  Corrente sbarra (A)  1250         -> RatedBusbarCurrent = 1250, unit A
  Frequency            50 Hz        -> Frequency = 50 Hz
  Frequenza            50 Hz        -> Frequency = 50 Hz
Read column headers to determine the unit when it is not inline with the value.
Always return the canonical English option name for enumerated parameters, regardless of input language.

Respond with STRICT JSON only, of the form:
{{""parameters"":[{{""name"":""OperatingVoltage"",""value"":""12"",""unit"":""kV""}}]}}
Include a parameter only if its value actually appears in the text. Never invent or guess values.
If none are found, return {{""parameters"":[]}}.";

        private const int MaxPageTextChars = 40_000; // gpt-4o-mini has 128K context; 40K covers large multi-page PDFs

        private readonly ILogger<AzureOpenAIExtractionService> _logger;
        private readonly string? _deploymentName;

        // Clients are thread-safe and expensive to construct — cache them at startup.
        private readonly AzureOpenAIClient? _azureClient;
        private readonly ChatCompletionsClient? _inferenceClient;

        public AzureOpenAIExtractionService(
            IConfiguration configuration,
            ILogger<AzureOpenAIExtractionService> logger)
        {
            _logger = logger;
            var section = configuration.GetSection("AzureOpenAI");
            var endpoint = section["Endpoint"];
            var apiKey   = section["ApiKey"];
            _deploymentName = section["DeploymentName"];

            if (string.IsNullOrWhiteSpace(endpoint) ||
                string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(_deploymentName))
            {
                _logger.LogWarning(
                    "Azure OpenAI is not configured (missing Endpoint/ApiKey/DeploymentName). " +
                    "LLM extraction disabled; falling back to regex layer only.");
                return;
            }

            var uri = new Uri(endpoint);
            if (uri.Host.EndsWith("openai.azure.com", StringComparison.OrdinalIgnoreCase) ||
                uri.Host.EndsWith("services.ai.azure.com", StringComparison.OrdinalIgnoreCase))
                _azureClient = new AzureOpenAIClient(uri, new AzureKeyCredential(apiKey));
            else
                _inferenceClient = new ChatCompletionsClient(uri, new AzureKeyCredential(apiKey));

            _logger.LogInformation(
                "LLM extraction configured — endpoint: {Host}, deployment: {Deployment}.",
                uri.Host, _deploymentName);
        }

        public bool IsConfigured => _azureClient != null || _inferenceClient != null;

        public async Task<List<LlmExtractedValue>> ExtractAsync(string pageText)
        {
            var results = new List<LlmExtractedValue>();
            if (!IsConfigured || string.IsNullOrWhiteSpace(pageText))
                return results;

            // Truncate overly long pages — keeps the prompt within model limits and speeds up calls.
            if (pageText.Length > MaxPageTextChars)
            {
                _logger.LogWarning(
                    "Page text ({Chars} chars) exceeds {Max} char limit; truncating before LLM call.",
                    pageText.Length, MaxPageTextChars);
                pageText = pageText[..MaxPageTextChars];
            }

            try
            {
                string text;

                if (_azureClient != null)
                {
                    var chatClient = _azureClient.GetChatClient(_deploymentName!);
                    var messages = new ChatMessage[]
                    {
                        new SystemChatMessage(SystemPrompt),
                        new UserChatMessage(pageText)
                    };
                    var chatOptions = new ChatCompletionOptions { Temperature = 0, MaxOutputTokenCount = 1024 };
                    ChatCompletion completion = await chatClient.CompleteChatAsync(messages, chatOptions);
                    text = completion.Content[0].Text;
                }
                else
                {
                    var inferenceOptions = new ChatCompletionsOptions
                    {
                        Model = _deploymentName,
                        Temperature = 0,
                        MaxTokens = 1024,
                        Messages =
                        {
                            new ChatRequestSystemMessage(SystemPrompt),
                            new ChatRequestUserMessage(pageText)
                        }
                    };
                    var response = await _inferenceClient!.CompleteAsync(inferenceOptions);
                    // Parse from raw HTTP JSON to avoid SDK property quirks across beta versions.
                    // GitHub Models returns standard OpenAI format: choices[0].message.content
                    var rawJson = response.GetRawResponse().Content.ToString();
                    using var responseDoc = JsonDocument.Parse(rawJson);
                    text = responseDoc.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString() ?? string.Empty;
                }

                if (string.IsNullOrWhiteSpace(text))
                {
                    _logger.LogWarning("LLM returned empty response for page text ({Chars} chars).", pageText.Length);
                    return results;
                }

                // Strip markdown code fences the model sometimes wraps around JSON
                var json = text.Trim();
                if (json.StartsWith("```"))
                {
                    var start = json.IndexOf('\n') + 1;
                    var end   = json.LastIndexOf("```");
                    if (end > start) json = json[start..end].Trim();
                }

                using var inner = JsonDocument.Parse(json);
                if (inner.RootElement.TryGetProperty("parameters", out var arr) &&
                    arr.ValueKind == JsonValueKind.Array)
                {
                    foreach (var el in arr.EnumerateArray())
                    {
                        var name  = el.TryGetProperty("name",  out var n) ? n.GetString() : null;
                        var value = el.TryGetProperty("value", out var v) ? v.GetString() : null;
                        var unit  = el.TryGetProperty("unit",  out var u) ? u.GetString() : null;

                        if (!string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(value))
                            results.Add(new LlmExtractedValue(name!, value!, unit ?? string.Empty));
                    }
                }

                _logger.LogInformation(
                    "LLM extracted {Count} parameter(s) from page text ({Chars} chars).",
                    results.Count, pageText.Length);
            }
            catch (JsonException jex)
            {
                // LLM returned non-JSON — log and return empty so regex safety net takes over.
                _logger.LogWarning(jex, "LLM returned non-JSON response; regex layer will handle extraction.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LLM extraction call failed; regex layer will handle extraction.");
            }

            return results;
        }
    }
}
