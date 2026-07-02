using System;
using System.Collections.Generic;

namespace SwitchgearApi.Models
{
    /// <summary>
    /// Represents an uploaded RFQ document package.
    /// Tracks the entire pipeline journey from upload to XML export.
    /// </summary>
    public class DocumentPackage
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string UploadedBy { get; set; }
        public DateTime UploadedAt { get; set; }
        
        // Pipeline status: Queued, Processing, Completed, Failed
        public string Status { get; set; } = "Queued";
        
        // Overall confidence: average of all extracted parameter confidences
        public double OverallConfidence { get; set; } = 0.0;
        
        // Product type selected at upload (drives ABB filterSelector API parameter discovery)
        public string ProductName { get; set; } = "Switchgear";

        // Error message if pipeline fails
        public string ErrorMessage { get; set; } = string.Empty;
        
        // Final generated XML output
        public string XmlOutput { get; set; } = string.Empty;
        
        // Timestamp when processing completed
        public DateTime? ProcessedAt { get; set; }

        // Raw PDF bytes (base64) — populated when local text extraction returns 0 pages
        // so the Python service can use pdfplumber as a fallback.
        public string? RawPdfBase64 { get; set; }

        // Navigation properties - all pages, parameters, lineup, deviations for this document
        public ICollection<DocumentPage> Pages { get; set; } = new List<DocumentPage>();
        public ICollection<ExtractedParameter> Parameters { get; set; } = new List<ExtractedParameter>();
        public ICollection<SwitchgearCubicle> Lineup { get; set; } = new List<SwitchgearCubicle>();
        public ICollection<DeviationItem> Deviations { get; set; } = new List<DeviationItem>();
        public ICollection<SwitchgearInstance> Instances { get; set; } = new List<SwitchgearInstance>();
    }
}
