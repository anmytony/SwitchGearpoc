namespace SwitchgearApi.Services
{
    /// <summary>
    /// Single source of truth for all allowed parameter values used across:
    ///   - ParameterExtractionService  (snap + validation)
    ///   - LlmParameterExtractionService  (LLM system prompt)
    ///   - SldVisionExtractionService  (vision system prompt)
    ///
    /// Covers the full ABB medium-voltage product range (UniGear ZS1, SafeRing,
    /// SafePlus, PIX) across IEC voltage levels 1 kV – 40.5 kV.
    /// </summary>
    public static class ParameterAllowedValues
    {
        // Operating voltage — IEC standard MV levels (kV)
        // Includes 20 kV and 24 kV which are common in European distribution networks
        public static readonly double[] VoltageKv =
            { 3.6, 5, 7.2, 12, 15, 17.5, 20, 24, 36, 40.5 };

        // Short-circuit withstand current (kA)
        public static readonly double[] ShortCircuitKa =
            { 8, 12.5, 16, 20, 21, 25, 31.5, 40, 50, 63 };

        // Rated busbar current (A)
        public static readonly double[] BusbarCurrentA =
            { 400, 630, 800, 1000, 1200, 1250, 1600, 2000, 2500, 3150 };

        // Rated panel / feeder current (A)
        public static readonly double[] PanelCurrentA =
            { 200, 400, 630, 800, 1000, 1200, 1250, 1600, 2000 };

        // System frequency (Hz)
        public static readonly double[] FrequencyHz = { 50, 60 };

        // Enumerated options
        public static readonly string[] MarketOptions =
            { "IEC", "ANSI" };

        public static readonly string[] BusbarArrangementOptions =
            { "Single busbar", "Double busbar", "Double Level" };

        public static readonly string[] InsulationOptions =
            { "AIS", "GIS (Dry Air)", "GIS (SF6)", "GIS (SF6-free)" };

        public static readonly string[] DistributionOptions =
            { "Primary", "Secondary" };

        // Ingress protection degrees (IEC 60529)
        public static readonly string[] IngressProtectionOptions =
            { "IP30", "IP31", "IP32", "IP40", "IP41", "IP42", "IP43", "IP44", "IP54", "IP55", "IP65" };

        // Internal arc classification (IEC 62271-200)
        public static readonly string[] InternalArcOptions =
            { "NotClassified", "ClassA", "ClassB", "ClassC",
              "IAC_A", "IAC_B", "IAC_C", "IAC_AB", "IAC_AFL", "IAC_AFLR" };

        // ── Helpers for prompt generation ──────────────────────────────────────

        public static string VoltageList            => string.Join(", ", VoltageKv);
        public static string ShortCircuitList       => string.Join(", ", ShortCircuitKa);
        public static string BusbarCurrentList      => string.Join(", ", BusbarCurrentA);
        public static string PanelCurrentList       => string.Join(", ", PanelCurrentA);
        public static string FrequencyList          => string.Join(", ", FrequencyHz);
        public static string IngressProtectionList  => string.Join(", ", IngressProtectionOptions);
        public static string InternalArcList        => string.Join(", ", InternalArcOptions);

        // ── Snap helper used by multi-instance extraction path ──────────────────

        private const double SnapToleranceRel = 0.10;

        public static (double Snapped, bool OutOfRange) Snap(double value, double[] allowed)
        {
            var nearest = System.Linq.Enumerable.OrderBy(allowed, a => System.Math.Abs(a - value)).First();
            var outOfRange = System.Math.Abs(value) > 0 &&
                             System.Math.Abs(nearest - value) / System.Math.Abs(value) > SnapToleranceRel;
            return (nearest, outOfRange);
        }
    }
}
