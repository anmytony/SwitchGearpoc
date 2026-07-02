using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SwitchgearApi.Dtos.Backup
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
    }

    public class CubicleDto
    {
        public int Position { get; set; }
        public string Type { get; set; }
        public string AbbProductFamily { get; set; }

        [JsonPropertyName("abbArticleNumber")]
        public string AbbArticleNumber { get; set; }

        public int Quantity { get; set; }

        [JsonPropertyName("confidenceIndex")]
        public double ConfidenceScore { get; set; }

        public List<DeviceSelectionDto> Devices { get; set; } = new();

        [JsonPropertyName("topologyWarning")]
        public string TopologyWarning { get; set; }
    }

    public class DeviceSelectionDto
    {
        [JsonPropertyName("name")]
        public string DeviceType { get; set; }

        [JsonPropertyName("abbArticleNumber")]
        public string AbbArticleNumber { get; set; }

        public int Quantity { get; set; }
    }

    public class DeviationItemDto
    {
        [JsonPropertyName("id")]
        public string DeviationId { get; set; }

        [JsonPropertyName("field")]
        public string AffectedField { get; set; }

        [JsonPropertyName("reason")]
        public string Description { get; set; }

        [JsonPropertyName("sourcePages")]
        public int[] SourcePageNumbers { get; set; }

        public string Severity { get; set; }

        public bool Resolved { get; set; }

        [JsonPropertyName("recommendedAction")]
        public string SuggestedValue { get; set; }
    }

    public class ReviewSubmissionRequest
    {
        [JsonPropertyName("parameterOverrides")]
        public List<DeviationReview> DeviationReviews { get; set; } = new();

        [JsonPropertyName("resolvedDeviationIds")]
        public List<string> ResolvedDeviationIds { get; set; } = new();
    }

    public class DeviationReview
    {
        [JsonPropertyName("parameterName")]
        public string ParameterName { get; set; }

        [JsonPropertyName("newValue")]
        public string CorrectedValue { get; set; }

        public string Unit { get; set; }

        [JsonPropertyName("reviewerNote")]
        public string Comment { get; set; }
    }

    public class LineupDto
    {
        public int Id { get; set; }
        public double OverallConfidence { get; set; }
        public List<CubicleDto> Cubicles { get; set; } = new();
    }
}
