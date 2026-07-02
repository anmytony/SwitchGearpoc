using System;

namespace SwitchgearApi.Models
{
    /// <summary>
    /// Represents a single page from an uploaded document.
    /// Tracks page classification and confidence for traceability.
    /// </summary>
    public class DocumentPage
    {
        public int Id { get; set; }
        public int DocumentPackageId { get; set; }
        public int PageNumber { get; set; }
        
        // Classification: text_tabular (specs), visual_sld (diagrams), unknown
        public string Classification { get; set; }
        
        // Confidence in classification (0.0 - 1.0)
        public double ClassificationConfidence { get; set; }
        
        // Raw content extracted from page
        public string RawContent { get; set; }
        
        // Path to stored file
        public string FilePath { get; set; }
        
        // When page was classified
        public DateTime ClassifiedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public DocumentPackage DocumentPackage { get; set; }
    }
}
