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
    // ===== Result models returned by the vision LLM =====

    public class SldSystemParameter
    {
        public string Name  { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Unit  { get; set; } = string.Empty;
    }

    public class SldPanel
    {
        public int    Position               { get; set; }
        public string PanelId               { get; set; } = string.Empty; // UC1, UC2 …
        public string Type                  { get; set; } = string.Empty; // incomer|feeder|coupler|measurement|busbar_section
        public string Description           { get; set; } = string.Empty; // full heading label
        public string ConnectionSource      { get; set; } = string.Empty; // "From 400kV", "From MVS2"

        // ── Circuit breaker ──────────────────────────────────────────────────
        public bool   HasCircuitBreaker     { get; set; }
        public string CbModel               { get; set; } = string.Empty; // QB1, VM1, VD4 …
        public string CbState               { get; set; } = string.Empty; // "closed" | "open" | "unknown"

        // ── Disconnectors / isolators ────────────────────────────────────────
        public int    DisconnectorCount     { get; set; }                 // QC1, QA1, QC2 …
        public bool   HasEarthSwitch        { get; set; }
        public string EarthSwitchId         { get; set; } = string.Empty; // QZ1

        // ── Current transformers ─────────────────────────────────────────────
        public string CtRatio               { get; set; } = string.Empty; // "100/1A"
        public string CtAccuracyClass       { get; set; } = string.Empty; // "5P20", "0.5-3P"
        public string SecondaryCt           { get; set; } = string.Empty; // second CT e.g. "1250/1-1A" (BC2)

        // ── Voltage transformers ─────────────────────────────────────────────
        public bool   HasVoltageTransformer { get; set; }
        public string VtRatio               { get; set; } = string.Empty; // "21/√3–0.11/√3 kV"
        public string VtAccuracyClass       { get; set; } = string.Empty; // "0.5", "3P", "6P"

        // ── Protection / measurement ─────────────────────────────────────────
        public string RelayType             { get; set; } = string.Empty; // ToMACH | IED | ED …
        public string ProtectionFunctions   { get; set; } = string.Empty; // "27/59, 50/S1, 50/S1N, 51N"
        public string MeteringFunctions     { get; set; } = string.Empty; // "50/S1, 50/S1N"

        public double Confidence            { get; set; } = 0.75;
    }

    public class SldVisionResult
    {
        public string                   DiagramTitle     { get; set; } = string.Empty;
        public List<SldSystemParameter> SystemParameters { get; set; } = new();
        public List<SldPanel>           Panels           { get; set; } = new();
    }

    // ===== Service interface =====

    public interface ISldVisionExtractionService
    {
        bool IsConfigured { get; }
        Task<SldVisionResult?> AnalyzeSldAsync(byte[] imageBytes, string mimeType);
    }

    /// <summary>
    /// Calls a vision-capable LLM (GPT-4o / GPT-4o-mini) to extract structured data
    /// from medium-voltage switchgear single-line diagrams (SLDs).
    ///
    /// Configure via:
    ///   AzureOpenAI:Endpoint          — Azure OpenAI resource URL or inference endpoint
    ///   AzureOpenAI:ApiKey            — API key / GitHub PAT
    ///   AzureOpenAI:VisionDeploymentName — model that supports vision (falls back to DeploymentName)
    ///
    /// Gracefully disabled when credentials are absent; the text pipeline continues unaffected.
    /// </summary>
    public class SldVisionExtractionService : ISldVisionExtractionService
    {
        private const string SldSystemPrompt =
@"You are a senior protection and switchgear engineer with 20+ years of experience reading
IEC medium-voltage single-line diagrams (SLDs). You have deep knowledge of:
  IEC 60617 graphical symbols, IEC 62271 switchgear standards,
  ABB product families (UniGear ZS1, SafeRing, SafePlus, PIX, ZS2),
  ABB relay platforms (REF615, REF630, RED615, ToMACH, REX640),
  and ANSI/IEEE protection relay function numbers:
    21=distance  27=undervoltage  32=dir.power  46=neg-seq  47=phase-seq-volt
    49=thermal   50=inst.OC  50N/50G=gnd.inst.OC  51=time.OC  51N/51G=gnd.time.OC
    59=overvoltage  67=dir.OC  79=reclosing  81=frequency
    87=differential  87T=transformer-diff  87B=busbar-diff
  IEC device naming: QB=circuit-breaker  QC/QA=disconnector  QZ=earth-switch
    BA=VT-unit  BC=CT  CVI=capacitive-voltage-indicator  VA=surge-arrester

Analyze this SLD image and extract everything below in strict JSON.

SYSTEM-LEVEL PARAMETERS (title bar, busbar annotation, general notes):
  OperatingVoltage (kV)     busbar nominal voltage  e.g. '20 kV' -> '20'
  RatedBusbarCurrent (A)    busbar ampacity  e.g. '630A' -> '630'
  ShortCircuitLevel (kA)    rated SC withstand  e.g. '20kA/1s' -> '20'
  Frequency (Hz)            if shown
  BusbarArrangement         'Single busbar' | 'Double busbar' | 'Double Level'
  NeutralCurrentLimit (A)   if neutral annotation present e.g. '300'
  SubstationName            title / building name

PANEL/CUBICLE LIST - every panel left to right:
  position            1-based integer
  panelId             label as shown  UC1 / -UC01 / etc.
  type                incomer | feeder | coupler | measurement | busbar_section
  description         full heading text
  connectionSource    'From 400kV' / 'From MVS2' etc. if annotated

  Circuit breaker:
    hasCircuitBreaker   true if QB symbol present
    cbModel             label on CB  QB1 / VM1 / VD4 etc.
    cbState             'closed' | 'open' (x or dashed = open) | 'unknown'

  Disconnectors:
    disconnectorCount   total QC + QA count in this panel
    hasEarthSwitch      true if QZ symbol
    earthSwitchId       QZ label e.g. 'QZ1'

  Current transformers:
    ctRatio             primary ratio  '100/1A' / '50/1A'
    ctAccuracyClass     accuracy cores  '5P20' / '0.5-3P' / '6P'
    secondaryCt         second CT if present  '1250/1-1A'

  Voltage transformers:
    hasVoltageTransformer  true if BA or VT symbols present
    vtRatio             ratio  '21/sqrt3-0.11/sqrt3 kV'
    vtAccuracyClass     cores  '0.5, 0.5-3P, 6P'

  Protection and metering:
    relayType           platform label  ToMACH / IED / REF615 / ED
    protectionFunctions all ANSI numbers visible on relay block  '27/59, 50/S1, 50/S1N'
    meteringFunctions   metering codes if separate from protection

  confidence          0.0-1.0

Return ONLY valid JSON - no markdown fences, no prose, no explanation.
Omit a field only when it is genuinely not visible; do not invent values.
{""diagramTitle"":""Terminal 1 MVS Building T1"",""systemParameters"":[{""name"":""OperatingVoltage"",""value"":""20"",""unit"":""kV""},{""name"":""RatedBusbarCurrent"",""value"":""630"",""unit"":""A""},{""name"":""ShortCircuitLevel"",""value"":""20"",""unit"":""kA""},{""name"":""NeutralCurrentLimit"",""value"":""300"",""unit"":""A""}],""panels"":[{""position"":1,""panelId"":""UC1"",""type"":""incomer"",""description"":""INCOMER (From 400kV)"",""connectionSource"":""From 400kV"",""hasCircuitBreaker"":true,""cbModel"":""QB1"",""cbState"":""closed"",""disconnectorCount"":3,""hasEarthSwitch"":true,""earthSwitchId"":""QZ1"",""ctRatio"":""100/1A"",""ctAccuracyClass"":""5P20"",""secondaryCt"":""1250/1-1A"",""hasVoltageTransformer"":true,""vtRatio"":""21/sqrt3-0.11/sqrt3 kV"",""vtAccuracyClass"":""0.5, 0.5-3P, 6P"",""relayType"":""ToMACH"",""protectionFunctions"":""27/59, 50/S1, 50/S1N"",""confidence"":0.92}]}";

        private readonly ILogger<SldVisionExtractionService> _logger;
        private readonly string?                  _deploymentName;
        private readonly AzureOpenAIClient?        _azureClient;
        private readonly ChatCompletionsClient?    _inferenceClient;

        private static readonly JsonSerializerOptions JsonOpts =
            new() { PropertyNameCaseInsensitive = true };

        public SldVisionExtractionService(
            IConfiguration configuration,
            ILogger<SldVisionExtractionService> logger)
        {
            _logger = logger;

            var section     = configuration.GetSection("AzureOpenAI");
            var endpoint    = section["Endpoint"];
            var apiKey      = section["ApiKey"];
            _deploymentName = section["VisionDeploymentName"] ?? section["DeploymentName"];

            if (string.IsNullOrWhiteSpace(endpoint) ||
                string.IsNullOrWhiteSpace(apiKey)   ||
                string.IsNullOrWhiteSpace(_deploymentName))
            {
                _logger.LogWarning(
                    "SLD vision extraction not configured (missing AzureOpenAI credentials). " +
                    "Image diagrams will be skipped; text extraction continues normally.");
                return;
            }

            var uri = new Uri(endpoint);
            if (uri.Host.EndsWith("openai.azure.com", StringComparison.OrdinalIgnoreCase) ||
                uri.Host.EndsWith("services.ai.azure.com", StringComparison.OrdinalIgnoreCase))
                _azureClient = new AzureOpenAIClient(uri, new AzureKeyCredential(apiKey));
            else
                _inferenceClient = new ChatCompletionsClient(uri, new AzureKeyCredential(apiKey));

            _logger.LogInformation(
                "SLD vision service ready — endpoint: {Host}, model: {Model}.",
                uri.Host, _deploymentName);
        }

        public bool IsConfigured => _azureClient != null || _inferenceClient != null;

        public async Task<SldVisionResult?> AnalyzeSldAsync(byte[] imageBytes, string mimeType)
        {
            if (!IsConfigured || imageBytes is null || imageBytes.Length == 0)
                return null;

            using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(60));
            var visionSw = System.Diagnostics.Stopwatch.StartNew();
            _logger.LogInformation("SLD vision: starting GPT-4o call ({Bytes} bytes, {Mime})", imageBytes.Length, mimeType);

            try
            {
                string responseText;

                if (_azureClient != null)
                {
                    var chatClient = _azureClient.GetChatClient(_deploymentName!);
                    var messages = new ChatMessage[]
                    {
                        new SystemChatMessage(SldSystemPrompt),
                        new UserChatMessage(
                            ChatMessageContentPart.CreateImagePart(
                                BinaryData.FromBytes(imageBytes), mimeType))
                    };
                    var opts = new ChatCompletionOptions
                    {
                        Temperature         = 0,
                        MaxOutputTokenCount = 2048
                    };
                    ChatCompletion completion = await chatClient.CompleteChatAsync(messages, opts, cts.Token);
                    responseText              = completion.Content[0].Text;
                }
                else
                {
                    // Azure AI Inference path (GitHub Models endpoint).
                    // Embed image as a data URI so the model can see it.
                    var base64  = Convert.ToBase64String(imageBytes);
                    var dataUri = $"data:{mimeType};base64,{base64}";

                    var userContent = new List<ChatMessageContentItem>
                    {
                        new ChatMessageImageContentItem(
                            new Uri(dataUri), ChatMessageImageDetailLevel.High)
                    };

                    var opts = new ChatCompletionsOptions
                    {
                        Model       = _deploymentName,
                        Temperature = 0,
                        MaxTokens   = 2048,
                        Messages    =
                        {
                            new ChatRequestSystemMessage(SldSystemPrompt),
                            new ChatRequestUserMessage(userContent)
                        }
                    };

                    var response = await _inferenceClient!.CompleteAsync(opts, cts.Token);
                    var rawJson  = response.GetRawResponse().Content.ToString();
                    using var doc = JsonDocument.Parse(rawJson);
                    responseText  = doc.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString() ?? string.Empty;
                }

                if (string.IsNullOrWhiteSpace(responseText))
                {
                    _logger.LogWarning("SLD vision returned an empty response for the image.");
                    return null;
                }

                // Strip optional markdown code fences.
                var json = responseText.Trim();
                if (json.StartsWith("```"))
                {
                    var start = json.IndexOf('\n') + 1;
                    var end   = json.LastIndexOf("```");
                    if (end > start) json = json[start..end].Trim();
                }

                var result = JsonSerializer.Deserialize<SldVisionResult>(json, JsonOpts);

                _logger.LogInformation(
                    "SLD vision: done in {Elapsed:0.0}s — title='{Title}', {Params} system params, {Panels} panels.",
                    visionSw.Elapsed.TotalSeconds,
                    result?.DiagramTitle,
                    result?.SystemParameters?.Count ?? 0,
                    result?.Panels?.Count ?? 0);

                return result;
            }
            catch (JsonException jex)
            {
                _logger.LogWarning(jex, "SLD vision response was not valid JSON after {Elapsed:0.0}s; skipping.", visionSw.Elapsed.TotalSeconds);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SLD vision call failed after {Elapsed:0.0}s: {Type}", visionSw.Elapsed.TotalSeconds, ex.GetType().Name);
                return null;
            }
        }
    }
}
