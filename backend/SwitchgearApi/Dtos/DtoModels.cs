using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SwitchgearApi.Dtos
{
    public class UploadDocumentRequest
    {
    public string PackageName { get; set; }
    }

    public class DocumentStatusResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public double OverallConfidence { get; set; }
        public DateTime UploadedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string ErrorMessage { get; set; }
        public int ParameterCount { get; set; }
        public int CubicleCount { get; set; }
        public int DeviationCount { get; set; }
        public int UnresolvedDeviationCount { get; set; }
    }

    public class ExtractedParameterDto
    {
        public string Name { get; set; }
        public string Value { get; set; }
        public string Unit { get; set; }
        public string NormalizedValue { get; set; }
        [JsonPropertyName("confidenceIndex")]
        public double ConfidenceScore { get; set; }
        [JsonPropertyName("sourcePage")]
        public int SourcePageNumber { get; set; }
        public bool FlaggedForReview { get; set; }
        [JsonPropertyName("isAbbDefault")]
        public bool IsAbbDefault { get; set; } = false;
        [JsonPropertyName("extractionReason")]
        public string ExtractionReason { get; set; }
        public int? SwitchgearInstanceId { get; set; }
        public string SwitchgearInstanceName { get; set; } = string.Empty;
    }

    public class SwitchgearInstanceDto
    {
        public int Id { get; set; }
        public int InstanceIndex { get; set; }
        public string InstanceName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public List<ExtractedParameterDto> Parameters { get; set; } = new();
    }

    public class DocumentPageDto
    {
        public int PageNumber { get; set; }

        [JsonPropertyName("pageType")]
        public string Classification { get; set; }

        [JsonPropertyName("confidenceIndex")]
        public double ClassificationConfidence { get; set; }

        public string? ThumbnailUrl { get; set; }
    }

    public class CubicleDto
    {
        public int Id { get; set; }
        public int Position { get; set; }
        public string FunctionalPosition { get; set; } = string.Empty;
        public string Type { get; set; }
        public string AbbProductFamily { get; set; }
        public string AbbArticleNumber { get; set; }
        public int Quantity { get; set; }
        public double ConfidenceScore { get; set; }
        public string TopologyWarning { get; set; } = string.Empty;
        public int? SwitchgearInstanceId { get; set; }
        public List<DeviceSelectionDto> Devices { get; set; } = new();
    }

    public class DeviceSelectionDto
    {
        public int Id { get; set; }
        public string DeviceType { get; set; }
        public string AbbArticleNumber { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public double ConfidenceScore { get; set; }
    }

    public class DeviationItemDto
    {
        public int Id { get; set; }
        public string DeviationId { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
        public string AffectedField { get; set; }
        public int[] SourcePageNumbers { get; set; } = Array.Empty<int>();
        public string SuggestedValue { get; set; }
        public bool Resolved { get; set; }
        public string EngineersComment { get; set; }
        public string Severity { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    public class ReviewSubmissionRequest
    {
        public List<DeviationReview> DeviationReviews { get; set; } = new();
        public List<string> ResolvedDeviationIds { get; set; } = new();
    }

    public class DeviationReview
    {
        public int DeviationId { get; set; }
        public string ParameterName { get; set; }
        public string Resolution { get; set; } // Approve, Override, Reject
        public string CorrectedValue { get; set; }
        public string Comment { get; set; }
    }

    public class LineupDto
    {
        public int Id { get; set; }
        public double OverallConfidence { get; set; }
        public List<CubicleDto> Cubicles { get; set; } = new();
    }

    public class CubicleDeviceDto
    {
        public int    Id                  { get; set; }
        public string FunctionalPosition  { get; set; } = string.Empty;
        public string PanelType           { get; set; } = string.Empty;
        public string CbModel             { get; set; } = string.Empty;
        public string CbRating            { get; set; } = string.Empty;
        public string CbBreakingCapacity  { get; set; } = string.Empty;
        public string CtRatio             { get; set; } = string.Empty;
        public string CtAccuracyClass     { get; set; } = string.Empty;
        public string VtRatio             { get; set; } = string.Empty;
        public string VtAccuracyClass     { get; set; } = string.Empty;
        public string RelayModel          { get; set; } = string.Empty;
        public List<string> ProtectionFunctions { get; set; } = new();
        public string ExtractionPath      { get; set; } = string.Empty;
        public double ConfidenceScore     { get; set; }
        public int    SourcePage          { get; set; }
        public bool   FlaggedForReview    { get; set; }
        public string DeviationReason     { get; set; } = string.Empty;
        public int?   SwitchgearInstanceId { get; set; }
    }

    public class ProductMatchDto
    {
        public string ProductKey { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? DocumentationUrl { get; set; }
        public bool IsRecommended { get; set; }
        public bool IsCompatible { get; set; }
        public double MatchScore { get; set; }
        public List<string> MatchedCriteria { get; set; } = new();
        public List<string> Mismatches { get; set; } = new();
        public string InsulationType { get; set; } = string.Empty;
        public string[] Markets { get; set; } = Array.Empty<string>();
    }

    /// <summary>
    /// Device parameter detail (CB, CT, VT, Relay) with confidence and source
    /// </summary>
    public class DeviceParameterDto
    {
        [JsonPropertyName("value")]
        public string Value { get; set; } = string.Empty;

        [JsonPropertyName("confidence")]
        public double ConfidenceScore { get; set; }

        [JsonPropertyName("source")]
        public string ExtractionSource { get; set; } = string.Empty;

        [JsonPropertyName("sourcePage")]
        public int SourcePage { get; set; }

        [JsonPropertyName("flaggedForReview")]
        public bool FlaggedForReview { get; set; }

        [JsonPropertyName("deviationReason")]
        public string DeviationReason { get; set; } = string.Empty;
    }

    /// <summary>
    /// Complete device extraction for a single cubicle
    /// </summary>
    public class CubicleDeviceDetailsDto
    {
        [JsonPropertyName("position")]
        public int Position { get; set; }

        [JsonPropertyName("functionalPosition")]
        public string FunctionalPosition { get; set; } = string.Empty;

        [JsonPropertyName("panelType")]
        public string PanelType { get; set; } = string.Empty;

        [JsonPropertyName("circuitBreaker")]
        public CircuitBreakerDetailsDto CircuitBreaker { get; set; } = new();

        [JsonPropertyName("currentTransformer")]
        public TransformerDetailsDto CurrentTransformer { get; set; } = new();

        [JsonPropertyName("voltageTransformer")]
        public TransformerDetailsDto VoltageTransformer { get; set; } = new();

        [JsonPropertyName("protectionRelay")]
        public RelayDetailsDto ProtectionRelay { get; set; } = new();

        [JsonPropertyName("disconnector")]
        public DisconnectorDetailsDto Disconnector { get; set; } = new();

        [JsonPropertyName("earthingSwitch")]
        public EarthingSwitchDetailsDto EarthingSwitch { get; set; } = new();

        [JsonPropertyName("surgeArrester")]
        public SurgeArresterDetailsDto SurgeArrester { get; set; } = new();

        [JsonPropertyName("auxiliary")]
        public AuxiliaryDetailsDto Auxiliary { get; set; } = new();
    }

    /// <summary>
    /// Circuit breaker details with individual parameter confidence
    /// </summary>
    public class CircuitBreakerDetailsDto
    {
        [JsonPropertyName("model")]
        public DeviceParameterDto Model { get; set; } = new();

        [JsonPropertyName("rating")]
        public DeviceParameterDto Rating { get; set; } = new();

        [JsonPropertyName("breakingCapacity")]
        public DeviceParameterDto? BreakingCapacity { get; set; }

        [JsonPropertyName("makingCapacity")]
        public DeviceParameterDto? MakingCapacity { get; set; }

        [JsonPropertyName("mechanismType")]
        public DeviceParameterDto? MechanismType { get; set; }

        [JsonPropertyName("numberOfPoles")]
        public DeviceParameterDto? NumberOfPoles { get; set; }
    }

    /// <summary>
    /// Transformer (CT/VT) details
    /// </summary>
    public class TransformerDetailsDto
    {
        [JsonPropertyName("ratio")]
        public DeviceParameterDto Ratio { get; set; } = new();

        [JsonPropertyName("accuracyClass")]
        public DeviceParameterDto? AccuracyClass { get; set; }

        [JsonPropertyName("burden")]
        public DeviceParameterDto? Burden { get; set; }

        [JsonPropertyName("coreType")]
        public DeviceParameterDto? CoreType { get; set; }

        [JsonPropertyName("insulationLevel")]
        public DeviceParameterDto? InsulationLevel { get; set; }
    }

    /// <summary>
    /// Relay details with protection functions
    /// </summary>
    public class RelayDetailsDto
    {
        [JsonPropertyName("model")]
        public DeviceParameterDto Model { get; set; } = new();

        [JsonPropertyName("protectionFunctions")]
        public List<string> ProtectionFunctions { get; set; } = new();

        [JsonPropertyName("protectionFunctionsConfidence")]
        public double ProtectionFunctionsConfidence { get; set; }

        [JsonPropertyName("protectionFunctionsSource")]
        public string ProtectionFunctionsSource { get; set; } = string.Empty;

        [JsonPropertyName("auxVoltage")]
        public DeviceParameterDto? AuxVoltage { get; set; }

        [JsonPropertyName("communicationProtocol")]
        public List<string> CommunicationProtocol { get; set; } = new();
    }

    /// <summary>
    /// Disconnector / isolator details
    /// </summary>
    public class DisconnectorDetailsDto
    {
        [JsonPropertyName("count")]
        public DeviceParameterDto? Count { get; set; }

        [JsonPropertyName("operatingMode")]
        public DeviceParameterDto? OperatingMode { get; set; }
    }

    /// <summary>
    /// Earthing switch details
    /// </summary>
    public class EarthingSwitchDetailsDto
    {
        [JsonPropertyName("present")]
        public bool Present { get; set; }

        [JsonPropertyName("id")]
        public DeviceParameterDto? Id { get; set; }
    }

    /// <summary>
    /// Surge arrester details
    /// </summary>
    public class SurgeArresterDetailsDto
    {
        [JsonPropertyName("present")]
        public bool Present { get; set; }
    }

    /// <summary>
    /// Auxiliary / control supply details
    /// </summary>
    public class AuxiliaryDetailsDto
    {
        [JsonPropertyName("controlVoltage")]
        public DeviceParameterDto? ControlVoltage { get; set; }
    }

    /// <summary>
    /// Lineup devices response grouped by switchgear instances
    /// </summary>
    public class LineupDevicesResponseDto
    {
        [JsonPropertyName("switchgearInstances")]
        public List<LineupInstanceDto> SwitchgearInstances { get; set; } = new();

        [JsonPropertyName("overallConfidence")]
        public double OverallConfidence { get; set; }

        [JsonPropertyName("totalCubicles")]
        public int TotalCubicles { get; set; }
    }

    /// <summary>
    /// Single switchgear instance with cubicles and their device details
    /// </summary>
    public class LineupInstanceDto
    {
        [JsonPropertyName("instanceId")]
        public int InstanceId { get; set; }

        [JsonPropertyName("instanceIndex")]
        public int InstanceIndex { get; set; }

        [JsonPropertyName("instanceName")]
        public string InstanceName { get; set; } = string.Empty;

        [JsonPropertyName("location")]
        public string Location { get; set; } = string.Empty;

        [JsonPropertyName("cubicles")]
        public List<CubicleDeviceDetailsDto> Cubicles { get; set; } = new();

        [JsonPropertyName("topologySummary")]
        public TopologySummaryDto? TopologySummary { get; set; }
    }

    /// <summary>
    /// Topology summary for the switchgear instance
    /// </summary>
    public class TopologySummaryDto
    {
        [JsonPropertyName("totalPanels")]
        public int TotalPanels { get; set; }

        [JsonPropertyName("incomers")]
        public int Incomers { get; set; }

        [JsonPropertyName("feeders")]
        public int Feeders { get; set; }

        [JsonPropertyName("couplers")]
        public int Couplers { get; set; }

        [JsonPropertyName("busbarSections")]
        public int BusbarSections { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }
}
