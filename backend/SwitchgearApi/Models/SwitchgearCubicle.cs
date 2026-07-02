using System.Collections.Generic;

namespace SwitchgearApi.Models
{
    /// <summary>
    /// Represents a reconstructed switchgear cubicle in the lineup.
    /// Includes type, position, ABB mapping, and contained devices.
    /// </summary>
    public class SwitchgearCubicle
    {
        public int Id { get; set; }
        public int DocumentPackageId { get; set; }
        
        // Position in lineup (1, 2, 3...)
        public int Position { get; set; }
        
        // Type: incomer, outgoer, coupler, metering, busbar_section
        public string Type { get; set; }
        
        // ABB product family: UniGear ZS1, SafeRing, etc.
        public string AbbProductFamily { get; set; }
        
        // ABB article number for this cubicle
        public string AbbArticleNumber { get; set; }
        
        // Quantity of this cubicle type in lineup
        public int Quantity { get; set; }
        
        // Confidence in this cubicle's type and position inference (0.0 - 1.0)
        // REQUIRES HUMAN REVIEW if < 0.75
        public double ConfidenceScore { get; set; }

        // Warning if cubicle violates topology rules
        public string TopologyWarning { get; set; } = string.Empty;

        // Which switchgear installation this cubicle belongs to
        public int? SwitchgearInstanceId { get; set; }

        // Navigation - devices contained in this cubicle
        public DocumentPackage DocumentPackage { get; set; }
        public SwitchgearInstance? SwitchgearInstance { get; set; }
        public ICollection<DeviceSelection> Devices { get; set; } = new List<DeviceSelection>();
    }
}
