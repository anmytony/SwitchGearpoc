namespace SwitchgearApi.Models
{
    public class CubicleDeviceExtraction
    {
        public int    Id                   { get; set; }
        public int    DocumentPackageId    { get; set; }
        public int?   SwitchgearInstanceId { get; set; }
        public string FunctionalPosition   { get; set; } = string.Empty;
        public string PanelType            { get; set; } = string.Empty;
        // Circuit Breaker
        public string CBModel              { get; set; } = string.Empty;
        public string CBRating             { get; set; } = string.Empty;
        public string CbBreakingCapacity   { get; set; } = string.Empty;
        public string CbMakingCapacity     { get; set; } = string.Empty;
        public string CbMechanismType      { get; set; } = string.Empty;
        public string CbNumberOfPoles      { get; set; } = string.Empty;
        // Current Transformer
        public string CTRatio              { get; set; } = string.Empty;
        public string CtAccuracyClass      { get; set; } = string.Empty;
        public string CtBurden             { get; set; } = string.Empty;
        public string CtCoreType           { get; set; } = string.Empty;
        // Voltage Transformer
        public string VTRatio              { get; set; } = string.Empty;
        public string VtAccuracyClass      { get; set; } = string.Empty;
        public string VtBurden             { get; set; } = string.Empty;
        public string VtInsulationLevel    { get; set; } = string.Empty;
        // Protection Relay
        public string RelayModel           { get; set; } = string.Empty;
        public string ProtectionFunctions  { get; set; } = string.Empty; // JSON: ["50/51","27"]
        public string RelayAuxVoltage      { get; set; } = string.Empty;
        public string RelayCommunicationProtocol { get; set; } = string.Empty; // JSON: ["IEC61850"]
        // Disconnector
        public string DsCount              { get; set; } = string.Empty;
        public string DsOperatingMode      { get; set; } = string.Empty;
        // Earthing Switch
        public string EsPresent            { get; set; } = string.Empty;
        public string EsId                 { get; set; } = string.Empty;
        // Surge Arrester
        public string SaPresent            { get; set; } = string.Empty;
        // Auxiliary / Control
        public string AuxControlVoltage    { get; set; } = string.Empty;
        // Metadata
        public string ExtractionPath       { get; set; } = string.Empty;
        public double ConfidenceScore      { get; set; }
        public int    SourcePage           { get; set; }
        public bool   FlaggedForReview     { get; set; }
        public string DeviationReason      { get; set; } = string.Empty;
        public string SourceBoundingBox    { get; set; } = string.Empty;
        public DocumentPackage     DocumentPackage    { get; set; } = null!;
        public SwitchgearInstance? SwitchgearInstance { get; set; }
    }
}
