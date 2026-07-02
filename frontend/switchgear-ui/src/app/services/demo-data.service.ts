import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  PipelineResult,
  DocumentPage,
  ExtractedParameter,
  SwitchgearCubicle,
  DeviationItem,
  Device,
  UploadResponse
} from '../models/models';

/**
 * Provides a fully typed offline/demo PipelineResult covering all pipeline
 * stages. Use as a drop-in replacement for PipelineApiService when the
 * .NET backend is unavailable.
 */
@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private readonly DEMO_DOCUMENT_ID = 'demo-rfq-001';

  // -------------------------------------------------------------------------
  // Upload stub
  // -------------------------------------------------------------------------

  uploadDocuments(_files: File[]): Observable<UploadResponse> {
    return of({
      id: 1,
      name: 'demo-rfq-001.pdf',
      status: 'review_required',
      overallConfidence: 0.81,
      uploadedAt: new Date().toISOString(),
      parameterCount: 9,
      cubicleCount: 8,
      deviationCount: 4,
      unresolvedDeviationCount: 4
    });
  }

  // -------------------------------------------------------------------------
  // Full pipeline result
  // -------------------------------------------------------------------------

  getPipelineResult(): PipelineResult {
    return {
      documentId: this.DEMO_DOCUMENT_ID,
      status: 'review_required',
      pages: this.getPages(),
      parameters: this.getParameters(),
      lineup: this.getLineup(),
      deviations: this.getDeviations(),
      xmlOutput: this.getXml(),
      xmlSchemaValid: true,
      overallConfidence: 0.81,
      flags: ['low_confidence_on_iac_rating']
    };
  }

  // -------------------------------------------------------------------------
  // Pages
  // -------------------------------------------------------------------------

  getPages(): DocumentPage[] {
    return [
      { pageNumber: 1, pageType: 'text_tabular', confidenceIndex: 0.95, thumbnailUrl: null },
      { pageNumber: 2, pageType: 'text_tabular', confidenceIndex: 0.88, thumbnailUrl: null },
      { pageNumber: 3, pageType: 'visual_sld',   confidenceIndex: 0.76, thumbnailUrl: null },
      { pageNumber: 4, pageType: 'visual_sld',   confidenceIndex: 0.62, thumbnailUrl: null },
      { pageNumber: 5, pageType: 'text_tabular', confidenceIndex: 0.91, thumbnailUrl: null }
    ];
  }

  // -------------------------------------------------------------------------
  // Extracted parameters
  // -------------------------------------------------------------------------

  getParameters(): ExtractedParameter[] {
    const base = { switchgearInstanceId: 1, switchgearInstanceName: 'Main Switchgear', sourceBoundingBox: '', deviationReason: '' };
    return [
      {
        ...base,
        name: 'Operating Voltage', value: 12, unit: 'kV',
        confidenceIndex: 0.97, sourcePage: 1,
        flaggedForReview: false, isAbbDefault: false,
        extractionReason: 'Extracted from "System Voltage" column in Table 1, page 1',
        extractionPath: 'PathB',
        sourceText: 'System Voltage: 12 kV (phase-to-phase, 50 Hz)'
      },
      {
        ...base,
        name: 'Short-Circuit Level (Isc)', value: 25, unit: 'kA',
        confidenceIndex: 0.89, sourcePage: 2,
        flaggedForReview: false, isAbbDefault: false,
        extractionReason: 'Extracted from fault level specification on page 2',
        extractionPath: 'PathB',
        sourceText: 'Rated short-circuit withstand current (Isc): 25 kA / 1 s'
      },
      {
        ...base,
        name: 'IP Rating', value: 'IP31', unit: null,
        confidenceIndex: 0.72, sourcePage: 2,
        flaggedForReview: true, isAbbDefault: false,
        extractionReason: 'Ambiguous between IP31 and IP4X; IP31 selected by frequency',
        extractionPath: 'PathB',
        sourceText: 'Enclosure protection class: IP31 (indoor installation)',
        deviationReason: 'PathB=IP31, PathC=IP4X'
      },
      {
        ...base,
        name: 'IAC Rating', value: 'IAC A FLR 16kA 1s', unit: null,
        confidenceIndex: 0.58, sourcePage: 3,
        flaggedForReview: true, isAbbDefault: false,
        extractionReason: 'Inferred from SLD annotation on page 3; low confidence',
        extractionPath: 'PathC',
        sourceText: 'IAC A FLR 16kA 1s'
      },
      {
        ...base,
        name: 'Frequency', value: 50, unit: 'Hz',
        confidenceIndex: 0.99, sourcePage: 1,
        flaggedForReview: false, isAbbDefault: false,
        extractionReason: 'Explicitly stated in system parameters section',
        extractionPath: 'PathB',
        sourceText: 'System frequency: 50 Hz'
      },
      {
        ...base,
        name: 'Number of Phases', value: 3, unit: null,
        confidenceIndex: 1.0, sourcePage: 1,
        flaggedForReview: false, isAbbDefault: false,
        extractionReason: 'Standard 3-phase stated explicitly',
        extractionPath: 'PathB',
        sourceText: '3-phase, 50 Hz, 12 kV system'
      },
      {
        ...base,
        name: 'Earthing System', value: 'TN-S', unit: null,
        confidenceIndex: 0.65, sourcePage: 5,
        flaggedForReview: true, isAbbDefault: false,
        extractionReason: 'Inferred from neutral treatment description; verify with customer',
        extractionPath: 'LLM',
        sourceText: 'Neutral earthing: solidly earthed, TN-S distribution system'
      },
      {
        ...base,
        name: 'Rated Current (Incomer)', value: 1600, unit: 'A',
        confidenceIndex: 0.93, sourcePage: 2,
        flaggedForReview: false, isAbbDefault: false,
        extractionReason: 'Extracted from incomer feeder specification',
        extractionPath: 'PathB',
        sourceText: 'Incomer feeder rated current: 1600 A'
      },
      {
        ...base,
        name: 'Busbar Rating', value: 1600, unit: 'A',
        confidenceIndex: 0.0, sourcePage: 0,
        flaggedForReview: true, isAbbDefault: true,
        extractionReason: 'Not found in document; ABB default applied for 12 kV / 25 kA configuration',
        extractionPath: '',
        sourceText: ''
      }
    ];
  }

  // -------------------------------------------------------------------------
  // Lineup
  // -------------------------------------------------------------------------

  getLineup(): SwitchgearCubicle[] {
    const ct: Device = { name: 'Current Transformer 200/5A', abbArticleNumber: '1VCF751010R0001', quantity: 3 };
    const vt: Device = { name: 'Voltage Transformer 12kV/100V', abbArticleNumber: '1VCF751010R0010', quantity: 3 };
    const relay: Device = { name: 'Protection Relay REF615', abbArticleNumber: '1MRS756887', quantity: 1 };
    const breaker: Device = { name: 'Vacuum Circuit Breaker VD4 12kV 25kA 1250A', abbArticleNumber: '1VCD000610R0001', quantity: 1 };
    const earthSwitch: Device = { name: 'Earthing Switch', abbArticleNumber: '1VCD010140R0001', quantity: 1 };

    const noDevice = { cbModel: '', cbRating: '', ctRatio: '', vtRatio: '', relayModel: '', protectionFunctions: [] };
    const incomerDevice = { cbModel: 'VD4', cbRating: '1250A', ctRatio: '200/1A', vtRatio: '', relayModel: 'REF615', protectionFunctions: ['50/51', '27', '59', '87'] };
    const feederDevice  = { cbModel: 'VD4', cbRating: '630A',  ctRatio: '200/1A', vtRatio: '', relayModel: 'REF615', protectionFunctions: ['50/51', '67'] };

    return [
      {
        position: 1, functionalPosition: 'I01', type: 'incomer' as const,
        abbProductFamily: 'UniGear ZS1', abbArticleNumber: '1VCF755001R0001',
        devices: [breaker, ct, relay, earthSwitch], confidenceIndex: 0.92, topologyWarning: null,
        switchgearInstanceId: null, ...incomerDevice
      },
      {
        position: 2, functionalPosition: 'M01', type: 'metering' as const,
        abbProductFamily: 'UniGear ZS1', abbArticleNumber: '1VCF755001R0010',
        devices: [ct, vt], confidenceIndex: 0.88, topologyWarning: null,
        switchgearInstanceId: null, ...noDevice, ctRatio: '200/1A', vtRatio: '12000/100V'
      },
      {
        position: 3, functionalPosition: 'F01', type: 'outgoer' as const,
        abbProductFamily: 'UniGear ZS1', abbArticleNumber: '1VCF755001R0002',
        devices: [breaker, ct, relay, earthSwitch], confidenceIndex: 0.85, topologyWarning: null,
        switchgearInstanceId: null, ...feederDevice
      },
      {
        position: 4, functionalPosition: 'F02', type: 'outgoer' as const,
        abbProductFamily: 'UniGear ZS1', abbArticleNumber: '1VCF755001R0002',
        devices: [breaker, ct, relay, earthSwitch], confidenceIndex: 0.85, topologyWarning: null,
        switchgearInstanceId: null, ...feederDevice
      },
      {
        position: 5, functionalPosition: 'K01', type: 'coupler' as const,
        abbProductFamily: 'UniGear ZS1', abbArticleNumber: '1VCF755001R0005',
        devices: [breaker, earthSwitch], confidenceIndex: 0.71, topologyWarning: null,
        switchgearInstanceId: null, ...noDevice, cbModel: 'VD4', cbRating: '1250A'
      },
      {
        position: 6, functionalPosition: 'F03', type: 'outgoer' as const,
        abbProductFamily: 'UniGear ZS1', abbArticleNumber: '1VCF755001R0002',
        devices: [breaker, ct, relay, earthSwitch], confidenceIndex: 0.85, topologyWarning: null,
        switchgearInstanceId: null, ...feederDevice
      },
      {
        position: 7, functionalPosition: 'F04', type: 'outgoer' as const,
        abbProductFamily: 'UniGear ZS1', abbArticleNumber: '1VCF755001R0002',
        devices: [breaker, ct, relay, earthSwitch], confidenceIndex: 0.85, topologyWarning: null,
        switchgearInstanceId: null, ...feederDevice
      },
      {
        position: 8, functionalPosition: 'I02', type: 'incomer' as const,
        abbProductFamily: 'UniGear ZS1', abbArticleNumber: '1VCF755001R0001',
        devices: [breaker, ct, relay, earthSwitch], confidenceIndex: 0.90, topologyWarning: null,
        switchgearInstanceId: null, ...incomerDevice
      }
    ];
  }

  // -------------------------------------------------------------------------
  // Deviations
  // -------------------------------------------------------------------------

  getDeviations(): DeviationItem[] {
    return [
      {
        id: 'dev-001',
        field: 'IAC Rating',
        reason: 'Confidence below threshold (0.58). Value inferred from SLD annotation; contradicts absence of explicit IAC specification in datasheet.',
        sourcePages: [3, 5],
        severity: 'high',
        resolved: false,
        recommendedAction: 'Confirm IAC classification with customer or apply ABB default for 12 kV / 25 kA: IAC A FLR 16kA 1s'
      },
      {
        id: 'dev-002',
        field: 'IP Rating',
        reason: 'Two candidate values detected across pages: IP31 (page 2) and IP4X (page 5). Most frequent value selected.',
        sourcePages: [2, 5],
        severity: 'medium',
        resolved: false,
        recommendedAction: 'Verify intended IP protection class with customer specification sheet'
      },
      {
        id: 'dev-003',
        field: 'Earthing System',
        reason: 'Earthing system inferred from neutral treatment description; not explicitly stated.',
        sourcePages: [5],
        severity: 'medium',
        resolved: false,
        recommendedAction: 'Confirm TN-S or provide correct earthing system designation'
      },
      {
        id: 'dev-004',
        field: 'Busbar Rating',
        reason: 'Busbar current rating not found in any document page. ABB default of 1600 A applied for 12 kV / 25 kA configuration.',
        sourcePages: [],
        severity: 'low',
        resolved: false,
        recommendedAction: 'Accept ABB default (1600 A) or supply explicit busbar rating'
      }
    ];
  }

  // -------------------------------------------------------------------------
  // XML output
  // -------------------------------------------------------------------------

  getXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ABBConfiguration version="1.0" productFamily="UniGear ZS1" generatedBy="SwitchgearCoEngineer">
  <SystemParameters>
    <OperatingVoltage unit="kV">12</OperatingVoltage>
    <ShortCircuitLevel unit="kA">25</ShortCircuitLevel>
    <RatedFrequency unit="Hz">50</RatedFrequency>
    <IPRating>IP31</IPRating>
    <IACRating confidence="0.58" flaggedForReview="true">IAC A FLR 16kA 1s</IACRating>
    <EarthingSystem confidence="0.65" flaggedForReview="true">TN-S</EarthingSystem>
    <BusbarRating unit="A" isABBDefault="true">1600</BusbarRating>
  </SystemParameters>
  <Lineup totalCubicles="8">
    <Cubicle position="1" type="incomer" productFamily="UniGear ZS1" articleNumber="1VCF755001R0001" confidence="0.92">
      <Devices>
        <Device name="Vacuum Circuit Breaker VD4 12kV 25kA 1250A" articleNumber="1VCD000610R0001" quantity="1"/>
        <Device name="Current Transformer 200/5A" articleNumber="1VCF751010R0001" quantity="3"/>
        <Device name="Protection Relay REF615" articleNumber="1MRS756887" quantity="1"/>
        <Device name="Earthing Switch" articleNumber="1VCD010140R0001" quantity="1"/>
      </Devices>
    </Cubicle>
    <Cubicle position="2" type="metering" productFamily="UniGear ZS1" articleNumber="1VCF755001R0010" confidence="0.88">
      <Devices>
        <Device name="Current Transformer 200/5A" articleNumber="1VCF751010R0001" quantity="3"/>
        <Device name="Voltage Transformer 12kV/100V" articleNumber="1VCF751010R0010" quantity="3"/>
      </Devices>
    </Cubicle>
    <Cubicle position="3" type="outgoer" productFamily="UniGear ZS1" articleNumber="1VCF755001R0002" confidence="0.85">
      <Devices>
        <Device name="Vacuum Circuit Breaker VD4 12kV 25kA 1250A" articleNumber="1VCD000610R0001" quantity="1"/>
        <Device name="Current Transformer 200/5A" articleNumber="1VCF751010R0001" quantity="3"/>
        <Device name="Protection Relay REF615" articleNumber="1MRS756887" quantity="1"/>
        <Device name="Earthing Switch" articleNumber="1VCD010140R0001" quantity="1"/>
      </Devices>
    </Cubicle>
    <Cubicle position="4" type="outgoer" productFamily="UniGear ZS1" articleNumber="1VCF755001R0002" confidence="0.85">
      <Devices>
        <Device name="Vacuum Circuit Breaker VD4 12kV 25kA 1250A" articleNumber="1VCD000610R0001" quantity="1"/>
        <Device name="Current Transformer 200/5A" articleNumber="1VCF751010R0001" quantity="3"/>
        <Device name="Protection Relay REF615" articleNumber="1MRS756887" quantity="1"/>
        <Device name="Earthing Switch" articleNumber="1VCD010140R0001" quantity="1"/>
      </Devices>
    </Cubicle>
    <Cubicle position="5" type="coupler" productFamily="UniGear ZS1" articleNumber="1VCF755001R0005" confidence="0.71">
      <Devices>
        <Device name="Vacuum Circuit Breaker VD4 12kV 25kA 1250A" articleNumber="1VCD000610R0001" quantity="1"/>
        <Device name="Earthing Switch" articleNumber="1VCD010140R0001" quantity="1"/>
      </Devices>
    </Cubicle>
    <Cubicle position="6" type="outgoer" productFamily="UniGear ZS1" articleNumber="1VCF755001R0002" confidence="0.85">
      <Devices>
        <Device name="Vacuum Circuit Breaker VD4 12kV 25kA 1250A" articleNumber="1VCD000610R0001" quantity="1"/>
        <Device name="Current Transformer 200/5A" articleNumber="1VCF751010R0001" quantity="3"/>
        <Device name="Protection Relay REF615" articleNumber="1MRS756887" quantity="1"/>
        <Device name="Earthing Switch" articleNumber="1VCD010140R0001" quantity="1"/>
      </Devices>
    </Cubicle>
    <Cubicle position="7" type="outgoer" productFamily="UniGear ZS1" articleNumber="1VCF755001R0002" confidence="0.85">
      <Devices>
        <Device name="Vacuum Circuit Breaker VD4 12kV 25kA 1250A" articleNumber="1VCD000610R0001" quantity="1"/>
        <Device name="Current Transformer 200/5A" articleNumber="1VCF751010R0001" quantity="3"/>
        <Device name="Protection Relay REF615" articleNumber="1MRS756887" quantity="1"/>
        <Device name="Earthing Switch" articleNumber="1VCD010140R0001" quantity="1"/>
      </Devices>
    </Cubicle>
    <Cubicle position="8" type="incomer" productFamily="UniGear ZS1" articleNumber="1VCF755001R0001" confidence="0.90">
      <Devices>
        <Device name="Vacuum Circuit Breaker VD4 12kV 25kA 1250A" articleNumber="1VCD000610R0001" quantity="1"/>
        <Device name="Current Transformer 200/5A" articleNumber="1VCF751010R0001" quantity="3"/>
        <Device name="Protection Relay REF615" articleNumber="1MRS756887" quantity="1"/>
        <Device name="Earthing Switch" articleNumber="1VCD010140R0001" quantity="1"/>
      </Devices>
    </Cubicle>
  </Lineup>
</ABBConfiguration>`;
  }
}
