using System.Collections.Generic;

namespace SwitchgearApi.Models
{
    public class SwitchgearInstance
    {
        public int Id { get; set; }
        public int DocumentPackageId { get; set; }
        public int InstanceIndex { get; set; }
        public string InstanceName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;

        // JSON: { totalPanels, incomers, feeders, couplers, busbarSections, description }
        public string TopologySummary { get; set; } = string.Empty;

        public DocumentPackage DocumentPackage { get; set; }
        public ICollection<ExtractedParameter> Parameters { get; set; } = new List<ExtractedParameter>();
        public ICollection<SwitchgearCubicle> Cubicles { get; set; } = new List<SwitchgearCubicle>();
    }
}
