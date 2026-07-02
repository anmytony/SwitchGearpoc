using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SwitchgearApi.Services
{
    // ── Request models ──────────────────────────────────────────────────────────

    public class PythonPageData
    {
        [JsonPropertyName("page_number")]  public int    PageNumber     { get; set; }
        [JsonPropertyName("text")]         public string Text           { get; set; } = string.Empty;
        [JsonPropertyName("page_type")]    public string PageType       { get; set; } = "text"; // "text" | "sld"
        [JsonPropertyName("sld_image_base64")] public string? SldImageBase64 { get; set; }
        [JsonPropertyName("instance_index")] public int? InstanceIndex { get; set; }
    }

    public class PythonInstanceData
    {
        [JsonPropertyName("instance_index")] public int    InstanceIndex { get; set; }
        [JsonPropertyName("instance_name")]  public string InstanceName  { get; set; } = string.Empty;
    }

    public class PythonExtractionRequest
    {
        [JsonPropertyName("product_name")] public string                  ProductName { get; set; } = "Switchgear";
        [JsonPropertyName("document_id")]  public int                     DocumentId  { get; set; }
        [JsonPropertyName("pages")]        public List<PythonPageData>    Pages       { get; set; } = new();
        [JsonPropertyName("instances")]    public List<PythonInstanceData> Instances  { get; set; } = new();
        [JsonPropertyName("run_path_b")]   public bool                    RunPathB   { get; set; } = true;
        [JsonPropertyName("run_path_c")]   public bool                    RunPathC   { get; set; } = true;
        [JsonPropertyName("run_level2")]   public bool                    RunLevel2  { get; set; } = true;
        /// <summary>Raw PDF as base64 — sent when local text extraction returns 0 pages so Python
        /// can use pdfplumber as a fallback for PDFs with custom font encoding.</summary>
        [JsonPropertyName("pdf_base64")]   public string?                 PdfBase64  { get; set; }
    }

    // ── Response models ─────────────────────────────────────────────────────────

    public class PythonParameter
    {
        [JsonPropertyName("name")]               public string Name              { get; set; } = string.Empty;
        [JsonPropertyName("value")]              public string Value             { get; set; } = string.Empty;
        [JsonPropertyName("unit")]               public string Unit              { get; set; } = string.Empty;
        [JsonPropertyName("confidence")]         public double? Confidence       { get; set; }
        [JsonPropertyName("extraction_path")]    public string ExtractionPath    { get; set; } = string.Empty;
        [JsonPropertyName("source_text")]        public string SourceText        { get; set; } = string.Empty;
        [JsonPropertyName("source_bounding_box")] public string SourceBoundingBox { get; set; } = string.Empty;
        [JsonPropertyName("source_page")]        public int    SourcePage        { get; set; }
        [JsonPropertyName("instance_index")]     public int    InstanceIndex     { get; set; } = 1;
        [JsonPropertyName("flagged_for_review")] public bool   FlaggedForReview  { get; set; }
        [JsonPropertyName("deviation_reason")]   public string DeviationReason   { get; set; } = string.Empty;
    }

    public class PythonCubicleDevice
    {
        [JsonPropertyName("functional_position")]    public string       FunctionalPosition         { get; set; } = string.Empty;
        [JsonPropertyName("panel_type")]             public string       PanelType                  { get; set; } = string.Empty;
        // Circuit Breaker
        [JsonPropertyName("cb_model")]               public string       CbModel                    { get; set; } = string.Empty;
        [JsonPropertyName("cb_rating")]              public string       CbRating                   { get; set; } = string.Empty;
        [JsonPropertyName("cb_breaking_capacity")]   public string       CbBreakingCapacity         { get; set; } = string.Empty;
        [JsonPropertyName("cb_making_capacity")]     public string       CbMakingCapacity           { get; set; } = string.Empty;
        [JsonPropertyName("cb_mechanism_type")]      public string       CbMechanismType            { get; set; } = string.Empty;
        [JsonPropertyName("cb_number_of_poles")]     public string       CbNumberOfPoles            { get; set; } = string.Empty;
        // Current Transformer
        [JsonPropertyName("ct_ratio")]               public string       CtRatio                    { get; set; } = string.Empty;
        [JsonPropertyName("ct_accuracy_class")]      public string       CtAccuracyClass            { get; set; } = string.Empty;
        [JsonPropertyName("ct_burden")]              public string       CtBurden                   { get; set; } = string.Empty;
        [JsonPropertyName("ct_core_type")]           public string       CtCoreType                 { get; set; } = string.Empty;
        // Voltage Transformer
        [JsonPropertyName("vt_ratio")]               public string       VtRatio                    { get; set; } = string.Empty;
        [JsonPropertyName("vt_accuracy_class")]      public string       VtAccuracyClass            { get; set; } = string.Empty;
        [JsonPropertyName("vt_burden")]              public string       VtBurden                   { get; set; } = string.Empty;
        [JsonPropertyName("vt_insulation_level")]    public string       VtInsulationLevel          { get; set; } = string.Empty;
        // Protection Relay
        [JsonPropertyName("relay_model")]            public string       RelayModel                 { get; set; } = string.Empty;
        [JsonPropertyName("protection_functions")]   public List<string> ProtectionFunctions        { get; set; } = new();
        [JsonPropertyName("relay_aux_voltage")]      public string       RelayAuxVoltage            { get; set; } = string.Empty;
        [JsonPropertyName("relay_comm_protocol")]    public List<string> RelayCommunicationProtocol { get; set; } = new();
        // Disconnector
        [JsonPropertyName("ds_count")]               public string       DsCount                    { get; set; } = string.Empty;
        [JsonPropertyName("ds_operating_mode")]      public string       DsOperatingMode            { get; set; } = string.Empty;
        // Earthing Switch
        [JsonPropertyName("es_present")]             public string       EsPresent                  { get; set; } = string.Empty;
        [JsonPropertyName("es_id")]                  public string       EsId                       { get; set; } = string.Empty;
        // Surge Arrester
        [JsonPropertyName("sa_present")]             public string       SaPresent                  { get; set; } = string.Empty;
        // Auxiliary / Control
        [JsonPropertyName("aux_control_voltage")]    public string       AuxControlVoltage          { get; set; } = string.Empty;
        // Metadata
        [JsonPropertyName("confidence")]             public double?      Confidence                 { get; set; }
        [JsonPropertyName("source_page")]            public int          SourcePage                 { get; set; }
        [JsonPropertyName("instance_index")]         public int          InstanceIndex              { get; set; } = 1;
        [JsonPropertyName("flagged_for_review")]     public bool         FlaggedForReview           { get; set; }
        [JsonPropertyName("deviation_reason")]       public string       DeviationReason            { get; set; } = string.Empty;
        [JsonPropertyName("source_bounding_box")]    public string       SourceBoundingBox          { get; set; } = string.Empty;
    }

    public class PythonTopologySummary
    {
        [JsonPropertyName("total_panels")]    public int    TotalPanels    { get; set; }
        [JsonPropertyName("incomers")]        public int    Incomers       { get; set; }
        [JsonPropertyName("feeders")]         public int    Feeders        { get; set; }
        [JsonPropertyName("couplers")]        public int    Couplers       { get; set; }
        [JsonPropertyName("metering")]        public int    Metering       { get; set; }
        [JsonPropertyName("transformers")]    public int    Transformers   { get; set; }
        [JsonPropertyName("busbar_sections")] public int    BusbarSections { get; set; } = 1;
        [JsonPropertyName("description")]     public string Description    { get; set; } = string.Empty;
    }

    public class PythonExtractionResponse
    {
        [JsonPropertyName("document_id")]      public int                       DocumentId      { get; set; }
        [JsonPropertyName("parameters")]       public List<PythonParameter>     Parameters      { get; set; } = new();
        [JsonPropertyName("cubicle_devices")]  public List<PythonCubicleDevice> CubicleDevices  { get; set; } = new();
        [JsonPropertyName("topology_summary")] public PythonTopologySummary     TopologySummary { get; set; } = new();
        [JsonPropertyName("errors")]           public List<string>              Errors          { get; set; } = new();
    }

    // ── Catalogue DTOs ──────────────────────────────────────────────────────────

    public class PythonProductInfo
    {
        [JsonPropertyName("name")]        public string Name        { get; set; } = string.Empty;
        [JsonPropertyName("value")]       public string Value       { get; set; } = string.Empty;
        [JsonPropertyName("family")]      public string Family      { get; set; } = string.Empty;
        [JsonPropertyName("description")] public string Description { get; set; } = string.Empty;
        [JsonPropertyName("image_url")]   public string ImageUrl    { get; set; } = string.Empty;
        [JsonPropertyName("doc_url")]     public string DocUrl      { get; set; } = string.Empty;
    }

    public class PythonParameterDefinition
    {
        [JsonPropertyName("key")]                public string       Key              { get; set; } = string.Empty;
        [JsonPropertyName("prop_name")]          public string       PropName         { get; set; } = string.Empty;
        [JsonPropertyName("label")]              public string       Label            { get; set; } = string.Empty;
        [JsonPropertyName("label_without_unit")] public string       LabelWithoutUnit { get; set; } = string.Empty;
        [JsonPropertyName("unit")]               public string       Unit             { get; set; } = string.Empty;
        [JsonPropertyName("allowed_values")]     public List<string> AllowedValues    { get; set; } = new();
        [JsonPropertyName("is_enum")]            public bool         IsEnum           { get; set; }
    }

    public class PythonProductMatchResult
    {
        [JsonPropertyName("name")]         public string Name        { get; set; } = string.Empty;
        [JsonPropertyName("display_name")] public string DisplayName { get; set; } = string.Empty;
        [JsonPropertyName("description")]  public string Description { get; set; } = string.Empty;
        [JsonPropertyName("image_url")]    public string ImageUrl    { get; set; } = string.Empty;
        [JsonPropertyName("doc_url")]      public string DocUrl      { get; set; } = string.Empty;
    }

    // ── Interface + implementation ───────────────────────────────────────────────

    public interface IPythonExtractionClient
    {
        Task<PythonExtractionResponse?> ExtractAsync(PythonExtractionRequest request);
        Task<List<PythonProductInfo>?> GetProductsAsync();
        Task<List<PythonParameterDefinition>?> GetParameterDefinitionsAsync(string productFamily);
        Task<List<PythonProductMatchResult>?> GetProductMatchesAsync(
            string productName, Dictionary<string, string> extractedParams);
    }

    public class PythonExtractionClient : IPythonExtractionClient
    {
        private readonly HttpClient _http;
        private readonly ILogger<PythonExtractionClient> _logger;

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy        = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition      = JsonIgnoreCondition.WhenWritingNull
        };

        public PythonExtractionClient(HttpClient http, ILogger<PythonExtractionClient> logger)
        {
            _http   = http;
            _logger = logger;
        }

        public async Task<PythonExtractionResponse?> ExtractAsync(PythonExtractionRequest request)
        {
            try
            {
                var response = await _http.PostAsJsonAsync("/extract", request, _jsonOptions);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<PythonExtractionResponse>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning(ex, "[PythonClient] Python service unavailable — falling back to LLM path");
                return null;
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogWarning(ex, "[PythonClient] Python service timed out — falling back to LLM path");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[PythonClient] Unexpected error calling Python service");
                return null;
            }
        }

        public async Task<List<PythonProductInfo>?> GetProductsAsync()
        {
            try
            {
                var response = await _http.GetAsync("/products");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<List<PythonProductInfo>>(_jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[PythonClient] Failed to fetch product list");
                return null;
            }
        }

        public async Task<List<PythonParameterDefinition>?> GetParameterDefinitionsAsync(string productFamily)
        {
            try
            {
                var response = await _http.GetAsync($"/parameter-definitions/{Uri.EscapeDataString(productFamily)}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<List<PythonParameterDefinition>>(_jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[PythonClient] Failed to fetch parameter definitions for '{Family}'", productFamily);
                return null;
            }
        }

        public async Task<List<PythonProductMatchResult>?> GetProductMatchesAsync(
            string productName, Dictionary<string, string> extractedParams)
        {
            try
            {
                var body = new { product_name = productName, extracted_params = extractedParams };
                var response = await _http.PostAsJsonAsync("/product-matches", body, _jsonOptions);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<List<PythonProductMatchResult>>(_jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[PythonClient] Failed to fetch product matches for '{Product}'", productName);
                return null;
            }
        }
    }
}
