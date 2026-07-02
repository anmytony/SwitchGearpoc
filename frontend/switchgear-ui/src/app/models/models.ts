// ABB Medium Voltage Switchgear AI Pipeline — TypeScript Models
// Keep in sync with backend .NET DTO contracts.

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'extracted'
  | 'review_required'
  | 'ready_for_xml'
  | 'exported';

export type PageType = 'text_tabular' | 'visual_sld';

export type CubicleType =
  | 'incomer'
  | 'outgoer'
  | 'coupler'
  | 'metering'
  | 'busbar_section';

export type DeviationSeverity = 'high' | 'medium' | 'low';

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export interface DocumentPackage {
  documentId: string;
  fileName: string;
  uploadedAt: string; // ISO 8601
  status: DocumentStatus;
  pageCount: number;
  overallConfidence: number; // 0.0 – 1.0
  flags: string[];
}

export interface DocumentPage {
  pageNumber: number;
  pageType: PageType;
  confidenceIndex: number; // 0.0 – 1.0
  thumbnailUrl: string | null;
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

export interface ExtractedParameter {
  name: string;
  value: string | number;       // raw value as found in the document
  normalizedValue?: string;     // snapped/canonical allowed value (may differ from value)
  unit: string | null;
  confidenceIndex: number; // 0.0 – 1.0
  sourcePage: number;
  flaggedForReview: boolean;
  isAbbDefault: boolean; // true when backend applied ABB standard fallback
  extractionReason: string | null; // traceability note from extraction stage
  switchgearInstanceId: number | null;
  switchgearInstanceName: string;
  // Ensemble extraction fields
  extractionPath: 'PathB' | 'PathC' | 'LLM' | 'Regex' | '';
  sourceText: string;          // verbatim text snippet from document
  sourceBoundingBox: string;   // JSON polygon string (PathC only)
  deviationReason: string;     // "PathB=20, PathC=24" when paths disagreed
}

export interface TopologySummary {
  totalPanels: number;
  incomers: number;
  feeders: number;
  couplers: number;
  metering: number;
  transformers: number;
  busbarSections: number;
  description: string;
}

export interface SwitchgearInstance {
  id: number;
  instanceIndex: number;
  instanceName: string;
  location: string;
  parameters: ExtractedParameter[];
  topologySummary: TopologySummary | null;
}

// ---------------------------------------------------------------------------
// Lineup
// ---------------------------------------------------------------------------

export interface Device {
  name: string;
  abbArticleNumber: string | null;
  quantity: number;
  description: string;
}

export interface CubicleDevice {
  id: number;
  functionalPosition: string;
  panelType: string;
  cbModel: string;
  cbRating: string;
  cbBreakingCapacity: string;
  ctRatio: string;
  ctAccuracyClass: string;
  vtRatio: string;
  vtAccuracyClass: string;
  relayModel: string;
  protectionFunctions: string[];
  extractionPath: string;
  confidenceScore: number;
  sourcePage: number;
  flaggedForReview: boolean;
  deviationReason: string;
  switchgearInstanceId: number | null;
}

export interface SwitchgearCubicle {
  position: number;
  functionalPosition: string;  // bay reference e.g. "F01", "I02" — used to match device details
  type: CubicleType;
  abbProductFamily: string;
  abbArticleNumber: string | null;
  devices: Device[];
  confidenceIndex: number; // 0.0 – 1.0
  topologyWarning: string | null; // set when cubicle violates topology rules
  switchgearInstanceId: number | null;
  // Path C extracted device detail
  cbModel: string;
  cbRating: string;
  ctRatio: string;
  vtRatio: string;
  relayModel: string;
  protectionFunctions: string[];
}

// ---------------------------------------------------------------------------
// Lineup Devices Detail (Enhanced)
// ---------------------------------------------------------------------------

export interface DeviceParameter {
  value: string;
  confidence: number;
  source: string;
  sourcePage: number;
  flaggedForReview?: boolean;
  deviationReason?: string;
}

export interface CircuitBreakerDetails {
  model: DeviceParameter;
  rating: DeviceParameter;
  breakingCapacity?: DeviceParameter;
  makingCapacity?: DeviceParameter;
  mechanismType?: DeviceParameter;
  numberOfPoles?: DeviceParameter;
}

export interface TransformerDetails {
  ratio: DeviceParameter;
  accuracyClass?: DeviceParameter;
  burden?: DeviceParameter;
  coreType?: DeviceParameter;        // CT only
  insulationLevel?: DeviceParameter; // VT only
}

export interface RelayDetails {
  model: DeviceParameter;
  protectionFunctions: string[];
  protectionFunctionsConfidence: number;
  protectionFunctionsSource: string;
  auxVoltage?: DeviceParameter;
  communicationProtocol: string[];
}

export interface DisconnectorDetails {
  count?: DeviceParameter;
  operatingMode?: DeviceParameter;
}

export interface EarthingSwitchDetails {
  present: boolean;
  id?: DeviceParameter;
}

export interface SurgeArresterDetails {
  present: boolean;
}

export interface AuxiliaryDetails {
  controlVoltage?: DeviceParameter;
}

export interface CubicleDeviceDetails {
  position: number;
  functionalPosition: string;
  panelType: string;
  circuitBreaker: CircuitBreakerDetails;
  currentTransformer: TransformerDetails;
  voltageTransformer: TransformerDetails;
  protectionRelay: RelayDetails;
  disconnector: DisconnectorDetails;
  earthingSwitch: EarthingSwitchDetails;
  surgeArrester: SurgeArresterDetails;
  auxiliary: AuxiliaryDetails;
}

export interface LineupInstanceDetails {
  instanceId: number;
  instanceIndex: number;
  instanceName: string;
  location: string;
  cubicles: CubicleDeviceDetails[];
  topologySummary: TopologySummary | null;
}

export interface LineupDevicesResponse {
  switchgearInstances: LineupInstanceDetails[];
  overallConfidence: number;
  totalCubicles: number;
}

// ---------------------------------------------------------------------------

export interface DeviationItem {
  id: string;
  field: string;
  reason: string;
  sourcePages: number[];
  severity: DeviationSeverity;
  resolved: boolean;
  recommendedAction: string | null;
}

// ---------------------------------------------------------------------------
// Pipeline Result
// ---------------------------------------------------------------------------

export interface PipelineResult {
  documentId: string;
  status: DocumentStatus;
  pages: DocumentPage[];
  parameters: ExtractedParameter[];
  lineup: SwitchgearCubicle[];
  deviations: DeviationItem[];
  xmlOutput: string | null;
  xmlSchemaValid: boolean | null; // null = not yet validated
  overallConfidence: number; // 0.0 – 1.0
  flags: string[];
}

// ---------------------------------------------------------------------------
// API Request / Response shapes
// ---------------------------------------------------------------------------

export interface UploadResponse {
  id: number;
  name: string;
  status: string;
  overallConfidence: number;
  uploadedAt: string;
  processedAt?: string;
  errorMessage?: string;
  parameterCount: number;
  cubicleCount: number;
  deviationCount: number;
  unresolvedDeviationCount: number;
}

export interface StatusResponse {
  id: number;
  name: string;
  status: string;
  overallConfidence: number;
  uploadedAt: string;
  processedAt?: string;
  errorMessage?: string;
  parameterCount: number;
  cubicleCount: number;
  deviationCount: number;
  unresolvedDeviationCount: number;
  flags?: string[];
}

// ---------------------------------------------------------------------------
// Product Matching
// ---------------------------------------------------------------------------

export interface ProductMatch {
  productKey: string;
  productName: string;
  description: string;
  imageUrl: string | null;
  documentationUrl: string | null;
  isRecommended: boolean;
  isCompatible: boolean;
  matchScore: number; // 0.0 – 1.0
  matchedCriteria: string[];
  mismatches: string[];
  insulationType: string;  // "AIS" | "GIS (SF6)" | "GIS (Dry Air)" | "GIS (SF6-free)"
  markets: string[];       // ["IEC"] | ["ANSI"] | ["IEC", "ANSI"]
}

// ---------------------------------------------------------------------------
// ABB Product Catalogue (from filterSelector API)
// ---------------------------------------------------------------------------

export interface AbbProductInfo {
  name: string;        // display name, e.g. "UniGear ZS1.2"
  value: string;       // ABB internal value
  family: string;      // product family for API calls, e.g. "Switchgear"
  description: string;
  imageUrl: string;
  docUrl: string;
}

export interface ParameterDefinition {
  key: string;             // safe identifier, e.g. "RatedVoltage"
  label: string;           // e.g. "Rated voltage [kV]"
  labelWithoutUnit: string;// e.g. "Rated voltage"
  unit: string;            // e.g. "kV"
  allowedValues: string[];
  isEnum: boolean;
}

// ---------------------------------------------------------------------------

export interface ReviewOverride {
  parameterName: string;
  newValue: string | number;
  unit: string | null;
  reviewerNote: string | null;
}

export interface ReviewSubmission {
  documentId: string;
  parameterOverrides: ReviewOverride[];
  resolvedDeviationIds: string[];
}
