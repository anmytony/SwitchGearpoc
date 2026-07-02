namespace SwitchgearApi.Models
{
    /// <summary>
    /// Represents an extracted technical parameter from the RFQ document.
    /// Includes confidence score and source traceability for engineer review.
    /// </summary>
    public class ExtractedParameter
    {
        public int Id { get; set; }
        public int DocumentPackageId { get; set; }
        
        // Parameter name: OperatingVoltage, ShortCircuitLevel, IPRating, IAC, Frequency, Phases, EarthingSystem
        public string Name { get; set; }
        
        // Extracted value
        public string Value { get; set; }
        
        // Unit: kV, kA, Hz, etc.
        public string Unit { get; set; }
        
        // Confidence in extraction (0.0 - 1.0)
        // REQUIRES HUMAN REVIEW if < 0.75
        public double ConfidenceScore { get; set; }
        
        // Which page this came from (for traceability)
        public int SourcePageNumber { get; set; }
        
        // If true, this parameter should be reviewed by engineer before export
        public bool FlaggedForReview { get; set; }
        
        // Normalized value after validation (e.g., voltage normalized to ABB standard)
        public string NormalizedValue { get; set; } = string.Empty;

        // Indicates if this is an ABB standard default value
        public bool? IsAbbDefault { get; set; }

        // Traceability note from extraction stage
        public string ExtractionReason { get; set; } = string.Empty;

        // Which switchgear installation this parameter belongs to
        public int? SwitchgearInstanceId { get; set; }
        public string SwitchgearInstanceName { get; set; } = string.Empty;

        // Which extraction path produced this value: "PathB", "PathC", "LLM", "Regex"
        public string ExtractionPath { get; set; } = string.Empty;

        // Verbatim text snippet from which the value was extracted
        public string SourceText { get; set; } = string.Empty;

        // JSON polygon string from Azure AI Vision bounding box (PathC only)
        public string SourceBoundingBox { get; set; } = string.Empty;

        // Navigation
        public DocumentPackage DocumentPackage { get; set; }
        public SwitchgearInstance? SwitchgearInstance { get; set; }
    }
}
