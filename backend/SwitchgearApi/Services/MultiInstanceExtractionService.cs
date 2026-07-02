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
    // ── Result types ──────────────────────────────────────────────────────────

    public record InstanceRawParam(string Name, string Value, string Unit);

    public class InstanceExtractionResult
    {
        public int InstanceIndex { get; set; }
        public string InstanceName { get; set; } = string.Empty;
        public string Location    { get; set; } = string.Empty;
        public List<InstanceRawParam> Parameters { get; set; } = new();
    }

    // ── Interface ─────────────────────────────────────────────────────────────

    public interface IMultiInstanceExtractionService
    {
        bool IsConfigured { get; }
        Task<List<InstanceExtractionResult>> ExtractMultiInstanceAsync(string fullDocumentText);
    }

    // ── Implementation ────────────────────────────────────────────────────────

    public class MultiInstanceExtractionService : IMultiInstanceExtractionService
    {
        private static readonly string SystemPrompt =
$@"You are a parameter extraction engine for switchgear RFQ documents.
The document may be written in English, French, Italian, or German (or a mix).

TASK — perform two steps:

STEP 1 — IDENTIFY INSTALLATIONS
Count the separate switchgear installations/substations described in this document.
An installation is a distinct switchboard/substation/MCC identified by ANY of:
  • Different names (e.g. 'MVS Building T1', 'MVS Building T2', 'Switchgear A', 'PMCC-1')
  • Different section/chapter headings that introduce a new equipment specification
  • Different SLD titles or equipment tags (e.g. '1-PD01', '1-PD02')
  • DIFFERENT VOLTAGE LEVELS explicitly described as separate systems
    (e.g. a 20 kV switchboard AND a 6 kV switchboard = 2 installations;
     a 6 kV switchboard AND a 0.4 kV PMCC/MCC/LV board = 2 installations)
  • Different equipment types described in separate sections
    (e.g. 'Medium Voltage Switchgear' in one section AND 'Low Voltage Distribution' in another)
  • Numbered or lettered duplicates (e.g. 'No.1 Switchgear'/'No.2 Switchgear',
    'Unit A'/'Unit B', 'Feeder Panel 1'/'Feeder Panel 2')
  • Repeated parameter tables each with their own header identifying a specific system

IMPORTANT: Do NOT count busbar sections, bus couplers, or panel positions within one switchgear
as separate installations. A single switchgear can have multiple sections (e.g. Section 1 and
Section 2 separated by a bus coupler) — that is still ONE installation.
Only count truly separate switchgear assemblies/switchboards as separate installations.

STEP 2 — EXTRACT PARAMETERS PER INSTALLATION
For each installation extract ONLY these parameters when explicitly present:

Numeric (allowed values for reference):
  OperatingVoltage   kV  allowed: {ParameterAllowedValues.VoltageList}
    FR: Tension nominale, Tension d'exploitation, Un
    IT: Tensione nominale, Tensione di esercizio, Un
    DE: Nennspannung, Betriebsspannung, Un
  ShortCircuitLevel  kA  allowed: {ParameterAllowedValues.ShortCircuitList}
    FR: Courant de court-circuit, Icc, Ik
    IT: Corrente di cortocircuito, Icc, Ik
    DE: Kurzschlussstrom, Icc, Ik
  RatedBusbarCurrent A   allowed: {ParameterAllowedValues.BusbarCurrentList}
    FR: Courant nominal jeu de barres, Courant de barre
    IT: Corrente nominale di sbarra, Corrente sbarra
    DE: Nennstrom Sammelschiene, Sammelschienenstrom
  PanelRatedCurrent  A   allowed: {ParameterAllowedValues.PanelCurrentList}
    FR: Courant nominal départ, Courant scomparto
    IT: Corrente nominale scomparto, Corrente nominale pannello
    DE: Nennstrom Abgang, Abgangsstrom
  Frequency          Hz  allowed: {ParameterAllowedValues.FrequencyList}
    FR: Fréquence nominale
    IT: Frequenza nominale
    DE: Nennfrequenz

Enumerated (return English value regardless of source language):
  Market             allowed: IEC, ANSI
    FR: norme IEC / ANSI  IT: norma IEC / ANSI  DE: Norm IEC / ANSI
  BusbarArrangement  allowed: Single busbar, Double busbar, Double Level
    FR: jeu de barres simple / double  IT: sbarra semplice / doppia  DE: Einfachsammelschiene / Doppelsammelschiene
  Insulation         allowed: AIS, GIS (Dry Air), GIS (SF6), GIS (SF6-free)
    FR: isolement air / gaz SF6 / air sec  IT: isolamento aria / gas SF6  DE: luftisoliert / gasisoliert SF6
  Distribution       allowed: Primary, Secondary
    FR: primaire / secondaire  IT: primario / secondario  DE: primär / sekundär
  IngressProtection  allowed: {ParameterAllowedValues.IngressProtectionList}
    FR: indice de protection  IT: grado di protezione  DE: Schutzart
    Extract the full IP code e.g. ""IP54"". Return exactly as written (e.g. ""IP31"", ""IP54"").
  InternalArcClassification  allowed: {ParameterAllowedValues.InternalArcList}
    FR: tenue à l'arc interne  IT: classificazione arco interno  DE: Lichtbogenklassifizierung
    Look for IAC followed by letters (A, B, C, AFL, AFLR) or Class A/B/C.
    Return the canonical form e.g. ""IAC_AFL"", ""ClassA"", ""NotClassified"".

Return STRICT JSON only — no markdown, no prose:
{{""instances"":[{{""instanceIndex"":1,""instanceName"":""MVS Building T1"",""location"":""Terminal 1"",""parameters"":[{{""name"":""OperatingVoltage"",""value"":""20"",""unit"":""kV""}}]}}]}}

Rules:
  • If only one installation exists and it has no explicit name, use instanceName=""Main Switchgear"".
  • Never invent or guess values. Only extract what is explicitly stated.
  • Return enum values in English regardless of source language.
  • If a parameter is missing for an installation, omit it (do not include null/empty entries).";

        // Azure AI Foundry gpt-4o-mini has a 128K-token context window.
        // Leave headroom for system prompt (~1 000 tokens) and JSON response (~600 tokens).
        private const int MaxTextChars = 48_000;

        private readonly ILogger<MultiInstanceExtractionService> _logger;
        private readonly string?                  _deploymentName;
        private readonly AzureOpenAIClient?        _azureClient;
        private readonly ChatCompletionsClient?    _inferenceClient;

        private static readonly JsonSerializerOptions JsonOpts =
            new() { PropertyNameCaseInsensitive = true };

        public MultiInstanceExtractionService(
            IConfiguration configuration,
            ILogger<MultiInstanceExtractionService> logger)
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
                _logger.LogWarning(
                    "MultiInstanceExtractionService not configured — multi-instance detection disabled.");
                return;
            }

            var uri = new Uri(endpoint);
            if (uri.Host.EndsWith("openai.azure.com", StringComparison.OrdinalIgnoreCase) ||
                uri.Host.EndsWith("services.ai.azure.com", StringComparison.OrdinalIgnoreCase))
                _azureClient = new AzureOpenAIClient(uri, new AzureKeyCredential(apiKey));
            else
                _inferenceClient = new ChatCompletionsClient(uri, new AzureKeyCredential(apiKey));

            _logger.LogInformation(
                "MultiInstanceExtractionService ready — endpoint: {Host}, model: {Model}.",
                uri.Host, _deploymentName);
        }

        public bool IsConfigured => _azureClient != null || _inferenceClient != null;

        public async Task<List<InstanceExtractionResult>> ExtractMultiInstanceAsync(string fullDocumentText)
        {
            var fallback = new List<InstanceExtractionResult>
            {
                new() { InstanceIndex = 1, InstanceName = "Main Switchgear", Location = "" }
            };

            if (!IsConfigured || string.IsNullOrWhiteSpace(fullDocumentText))
                return fallback;

            if (fullDocumentText.Length > MaxTextChars)
                fullDocumentText = fullDocumentText[..MaxTextChars];

            try
            {
                string responseText;

                if (_azureClient != null)
                {
                    var chatClient = _azureClient.GetChatClient(_deploymentName!);
                    var messages = new ChatMessage[]
                    {
                        new SystemChatMessage(SystemPrompt),
                        new UserChatMessage(fullDocumentText)
                    };
                    var opts = new ChatCompletionOptions { Temperature = 0, MaxOutputTokenCount = 2048 };
                    ChatCompletion completion = await chatClient.CompleteChatAsync(messages, opts);
                    responseText = completion.Content[0].Text;
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
                            new ChatRequestUserMessage(fullDocumentText)
                        }
                    };
                    var response = await _inferenceClient!.CompleteAsync(opts);
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
                    _logger.LogWarning("MultiInstance LLM returned empty response.");
                    return fallback;
                }

                _logger.LogInformation("[MultiInstance] LLM raw response ({Len} chars): {Text}",
                    responseText.Length, responseText.Length > 500 ? responseText[..500] + "…" : responseText);

                var json = responseText.Trim();
                if (json.StartsWith("```"))
                {
                    var start = json.IndexOf('\n') + 1;
                    var end   = json.LastIndexOf("```");
                    if (end > start) json = json[start..end].Trim();
                }

                using var root = JsonDocument.Parse(json);
                var results = new List<InstanceExtractionResult>();

                if (root.RootElement.TryGetProperty("instances", out var arr) &&
                    arr.ValueKind == JsonValueKind.Array)
                {
                    foreach (var el in arr.EnumerateArray())
                    {
                        var instance = new InstanceExtractionResult
                        {
                            InstanceIndex = el.TryGetProperty("instanceIndex", out var idx) ? idx.GetInt32() : 1,
                            InstanceName  = el.TryGetProperty("instanceName",  out var nm)  ? nm.GetString()  ?? "Main Switchgear" : "Main Switchgear",
                            Location      = el.TryGetProperty("location",       out var loc) ? loc.GetString() ?? string.Empty : string.Empty
                        };

                        if (el.TryGetProperty("parameters", out var pArr) &&
                            pArr.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var p in pArr.EnumerateArray())
                            {
                                var name  = p.TryGetProperty("name",  out var n) ? n.GetString() : null;
                                var value = p.TryGetProperty("value", out var v) ? v.GetString() : null;
                                var unit  = p.TryGetProperty("unit",  out var u) ? u.GetString() : string.Empty;

                                if (!string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(value))
                                    instance.Parameters.Add(new InstanceRawParam(name!, value!, unit ?? string.Empty));
                            }
                        }

                        results.Add(instance);
                    }
                }

                if (results.Count == 0)
                {
                    _logger.LogWarning("MultiInstance LLM returned no instances; using fallback.");
                    return fallback;
                }

                _logger.LogInformation(
                    "MultiInstance extraction: {Count} instance(s) detected.",
                    results.Count);

                return results;
            }
            catch (JsonException jex)
            {
                _logger.LogWarning(jex, "MultiInstance LLM returned non-JSON; falling back to single instance.");
                return fallback;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "MultiInstance extraction call failed; falling back to single instance.");
                return fallback;
            }
        }
    }
}
