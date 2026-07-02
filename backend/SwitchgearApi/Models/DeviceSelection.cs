namespace SwitchgearApi.Models
{
    /// <summary>
    /// Represents an ABB device selected for a cubicle.
    /// Examples: Circuit Breaker, CT, VT, Relay, Busbar, etc.
    /// </summary>
    public class DeviceSelection
    {
        public int Id { get; set; }
        public int CubicleId { get; set; }
        
        // Device type: CircuitBreaker, CT, VT, Relay, Busbar, CableTermination, etc.
        public string DeviceType { get; set; } = string.Empty;

        // ABB article number (e.g., 1SDA065534R1 for breaker)
        public string AbbArticleNumber { get; set; } = string.Empty;

        // Description from ABB catalog
        public string Description { get; set; } = string.Empty;
        
        // Quantity needed
        public int Quantity { get; set; }
        
        // Confidence in device selection match (0.0 - 1.0)
        // REQUIRES HUMAN REVIEW if < 0.75
        public double ConfidenceScore { get; set; }

        // Navigation
        public SwitchgearCubicle Cubicle { get; set; }
    }
}
