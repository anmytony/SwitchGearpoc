using System;

namespace SwitchgearApi.Models
{
    /// <summary>
    /// Represents a deviation item flagged for engineer review.
    /// Types: LowConfidence, Contradiction, MissingData, ABBMappingUnavailable, TopologyInconsistency
    /// </summary>
    public class DeviationItem
    {
        public int Id { get; set; }
        public int DocumentPackageId { get; set; }
        
        // Deviation type
        public string Type { get; set; }
        
        // Human-readable description of the issue
        public string Description { get; set; }
        
        // Which field is affected (e.g., "OperatingVoltage", "CubiclePosition")
        public string AffectedField { get; set; }
        
        // Source pages where this issue was found (for traceability).
        // Defaults to an empty array — EF Core maps this as a required primitive
        // collection and rejects null on save.
        public int[] SourcePageNumbers { get; set; } = Array.Empty<int>();

        // Suggested value(s) for engineer review
        public string SuggestedValue { get; set; } = string.Empty;

        // Engineer resolution: true if reviewed and approved/corrected
        public bool Resolved { get; set; } = false;

        // Engineer's comment or correction (set during review; non-nullable column)
        public string EngineersComment { get; set; } = string.Empty;
        
        // Severity: Critical (blocks export), High (should review), Low (nice to review)
        public string Severity { get; set; } = "High";
        
        // When this deviation was created
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // When engineer resolved it
        public DateTime? ResolvedAt { get; set; }

        // Navigation
        public DocumentPackage DocumentPackage { get; set; }
    }
}
