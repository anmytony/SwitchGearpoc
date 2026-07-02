import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  throwError,
  timer,
  switchMap,
  takeWhile,
  catchError,
  map,
  timeout
} from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DocumentStatus,
  DocumentPage,
  ExtractedParameter,
  SwitchgearCubicle,
  CubicleDevice,
  SwitchgearInstance,
  TopologySummary,
  DeviationItem,
  ProductMatch,
  UploadResponse,
  StatusResponse,
  ReviewSubmission,
  AbbProductInfo,
  ParameterDefinition
} from '../models/models';

export interface PolledStatus {
  status: DocumentStatus;
  overallConfidence: number;
}

@Injectable({ providedIn: 'root' })
export class PipelineApiService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  // -------------------------------------------------------------------------
  // Upload
  // -------------------------------------------------------------------------

  /** Return all ABB product variants from the filterSelector API. */
  getAvailableProducts(): Observable<AbbProductInfo[]> {
    return this.http
      .get<any[]>(`${this.base}/api/v1/products`)
      .pipe(
        map(items => items.map(item => ({
          name: item.name ?? '',
          value: item.value ?? '',
          family: item.family ?? '',
          description: item.description ?? '',
          imageUrl: item.image_url ?? item.imageUrl ?? '',
          docUrl: item.doc_url ?? item.docUrl ?? '',
        }))),
        catchError(this.handleError)
      );
  }

  /** Return parameter definitions for an ABB product family (drives the extraction catalog). */
  getParameterDefinitions(productFamily: string): Observable<ParameterDefinition[]> {
    return this.http
      .get<any[]>(`${this.base}/api/v1/parameter-definitions/${encodeURIComponent(productFamily)}`)
      .pipe(
        map(items => items.map(item => ({
          key: item.key ?? '',
          label: item.label ?? '',
          labelWithoutUnit: item.label_without_unit ?? item.labelWithoutUnit ?? '',
          unit: item.unit ?? '',
          allowedValues: item.allowed_values ?? item.allowedValues ?? [],
          isEnum: item.is_enum ?? item.isEnum ?? false,
        }))),
        catchError(this.handleError)
      );
  }

  /** Upload one or more RFQ document files. Returns the new documentId. */
  uploadDocuments(files: File[], productName: string = 'Switchgear'): Observable<UploadResponse> {
    const form = new FormData();
    files.forEach(f => form.append('files', f, f.name));
    form.append('productName', productName);
    return this.http
      .post<UploadResponse>(`${this.base}/api/v1/documents/upload`, form)
      .pipe(catchError(this.handleError));
  }

  // -------------------------------------------------------------------------
  // Status polling with exponential backoff
  // -------------------------------------------------------------------------

  /**
   * Polls document status starting at 500 ms and backing off gently (×1.5)
   * up to a 5 s cap. The pipeline typically completes in well under a second,
   * so an aggressive initial cadence keeps the perceived upload-to-review time
   * short. Completes automatically when the document reaches a terminal state.
   * Cancels cleanly on unsubscribe.
   */
  pollStatus(id: string): Observable<PolledStatus> {
    const terminalStates: DocumentStatus[] = [
      'extracted',
      'review_required',
      'ready_for_xml',
      'exported'
    ];

    let intervalMs = 500;
    const maxIntervalMs = 5000;
    // Fail loudly instead of polling forever if the pipeline never reaches a
    // terminal state (e.g. backend stalled the document in "Queued").
    const maxPollDurationMs = 240_000; // 4 min hard cap — pipeline must complete within this window

    const poll = (): Observable<PolledStatus> =>
      timer(intervalMs).pipe(
        switchMap(() => this.getStatus(id)),
        switchMap(result => {
          if (terminalStates.includes(result.status)) {
            return [result] as const;
          }

          // Back off gently, capped at max
          intervalMs = Math.min(Math.round(intervalMs * 1.5), maxIntervalMs);
          return poll();
        })
      );

    return this.getStatus(id).pipe(
      switchMap(status => {
        if (terminalStates.includes(status.status)) {
          return [status] as const;
        }
        return poll();
      }),
      takeWhile(
        (result: PolledStatus) => !terminalStates.includes(result.status),
        true  // emit the terminal value before completing
      ),
      timeout({
        first: maxPollDurationMs,
        with: () =>
          throwError(
            () =>
              new Error(
                'Processing timed out — the pipeline did not finish. Please retry.'
              )
          )
      })
    );
  }

  private getStatus(id: string): Observable<PolledStatus> {
    return this.http
      .get<StatusResponse>(`${this.base}/api/v1/documents/${id}/status`)
      .pipe(
        map(r => {
          const normalized = this.normalizeStatus(r.status);
          if (normalized === null) {
            throw new Error(r.errorMessage ?? `Document ${id} failed in pipeline.`);
          }

          return {
            status: normalized,
            overallConfidence: Number(r.overallConfidence ?? 0)
          };
        }),
        catchError(this.handleError)
      );
  }

  // -------------------------------------------------------------------------
  // Pipeline stage data
  // -------------------------------------------------------------------------

  getPages(id: string): Observable<DocumentPage[]> {
    return this.http
      .get<unknown[]>(`${this.base}/api/v1/documents/${id}/pages`)
      .pipe(
        map((pages) => pages.map((page) => this.mapPage(page))),
        catchError(this.handleError)
      );
  }

  getParameters(id: string): Observable<ExtractedParameter[]> {
    return this.http
      .get<unknown[]>(`${this.base}/api/v1/documents/${id}/parameters`)
      .pipe(
        map((items) => items.map((item) => this.mapParameter(item))),
        catchError(this.handleError)
      );
  }

  getInstances(id: string): Observable<SwitchgearInstance[]> {
    return this.http
      .get<unknown[]>(`${this.base}/api/v1/documents/${id}/instances`)
      .pipe(
        map((items) => items.map((item) => this.mapInstance(item))),
        catchError(this.handleError)
      );
  }

  getCubicleDevices(id: string): Observable<CubicleDevice[]> {
    return this.http
      .get<unknown[]>(`${this.base}/api/v1/documents/${id}/cubicle-devices`)
      .pipe(
        map(items => items.map(item => this.mapCubicleDevice(item))),
        catchError(this.handleError)
      );
  }

  getLineup(id: string): Observable<SwitchgearCubicle[]> {
    return this.http
      .get<unknown>(`${this.base}/api/v1/documents/${id}/lineup`)
      .pipe(
        map((response) => {
          const payload = response as { cubicles?: unknown[] } | unknown[];
          const cubicles = Array.isArray(payload)
            ? payload
            : (payload.cubicles ?? []);
          return cubicles.map((item) => this.mapCubicle(item));
        }),
        catchError(this.handleError)
      );
  }

  getLineupDevices(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.base}/api/v1/documents/${id}/lineup/devices`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getProductMatch(id: string): Observable<ProductMatch[]> {
    return this.http
      .get<unknown[]>(`${this.base}/api/v1/documents/${id}/product-match`)
      .pipe(
        map(items => items.map(item => this.mapProductMatch(item))),
        catchError(this.handleError)
      );
  }

  getAllProducts(id: string): Observable<ProductMatch[]> {
    return this.http
      .get<unknown[]>(`${this.base}/api/v1/documents/${id}/all-products`)
      .pipe(
        map(items => items.map(item => this.mapProductMatch(item))),
        catchError(this.handleError)
      );
  }

  getDeviations(id: string): Observable<DeviationItem[]> {
    return this.http
      .get<unknown[]>(`${this.base}/api/v1/documents/${id}/deviations`)
      .pipe(
        map((items) => items.map((item) => this.mapDeviation(item))),
        catchError(this.handleError)
      );
  }

  getXml(id: string): Observable<string> {
    return this.http
      .get(`${this.base}/api/v1/documents/${id}/xml`, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // -------------------------------------------------------------------------
  // Review submission
  // -------------------------------------------------------------------------

  submitReview(submission: ReviewSubmission): Observable<void> {
    // Map the frontend review model onto the backend's ReviewSubmissionRequest
    // contract: parameter overrides become "deviationReviews" entries whose
    // corrected value the backend applies to the matching parameter.
    const body = {
      deviationReviews: submission.parameterOverrides.map(o => ({
        parameterName: o.parameterName,
        resolution: 'Override',
        correctedValue: String(o.newValue),
        comment: o.reviewerNote ?? ''
      })),
      resolvedDeviationIds: submission.resolvedDeviationIds
    };

    return this.http
      .post<void>(
        `${this.base}/api/v1/documents/${submission.documentId}/review`,
        body
      )
      .pipe(catchError(this.handleError));
  }

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message: string;
    
    if (err.error instanceof ErrorEvent) {
      // Client-side error
      message = err.error.message;
    } else {
      // Server error - try to extract error message from response body
      if (err.error && typeof err.error === 'object' && 'error' in err.error) {
        message = `Server error ${err.status}: ${err.error.error}`;
      } else if (err.error && typeof err.error === 'string') {
        message = `Server error ${err.status}: ${err.error}`;
      } else {
        message = `Server error ${err.status}: ${err.statusText || 'Unknown error'}`;
      }
    }
    
    console.error('[API Error]', message, err);
    return throwError(() => new Error(message));
  }

  private normalizeStatus(rawStatus: string | null | undefined): DocumentStatus | null {
    const value = (rawStatus ?? '').trim().toLowerCase().replace(/\s+/g, '_');
    const mapped: Record<string, DocumentStatus | null> = {
      queued: 'uploaded',
      uploaded: 'uploaded',
      processing: 'processing',
      extracted: 'extracted',
      review_required: 'review_required',
      completed: 'review_required',
      ready_for_xml: 'ready_for_xml',
      ready_for_export: 'ready_for_xml',
      exported: 'exported',
      failed: null,
      error: null
    };

    return mapped[value] ?? 'processing';
  }

  private mapPage(raw: unknown): DocumentPage {
    const page = raw as {
      pageNumber?: number;
      pageType?: string;
      confidenceIndex?: number;
      thumbnailUrl?: string | null;
      classification?: string;
      classificationConfidence?: number;
    };
    const rawType = page.pageType ?? page.classification ?? 'text_tabular';
    const normalizedType = String(rawType).toLowerCase() === 'visual_sld'
      ? 'visual_sld'
      : 'text_tabular';

    return {
      pageNumber: Number(page.pageNumber ?? 0),
      pageType: normalizedType,
      confidenceIndex: Number(page.confidenceIndex ?? page.classificationConfidence ?? 0),
      thumbnailUrl: page.thumbnailUrl ?? null
    };
  }

  private mapParameter(raw: unknown): ExtractedParameter {
    const item = raw as {
      name?: string;
      value?: string | number;
      normalizedValue?: string;
      normalized_value?: string;
      unit?: string | null;
      confidenceIndex?: number;
      confidenceScore?: number;
      sourcePage?: number;
      sourcePageNumber?: number;
      flaggedForReview?: boolean;
      isAbbDefault?: boolean;
      extractionReason?: string | null;
      switchgearInstanceId?: number | null;
      switchgearInstanceName?: string;
      // Ensemble fields — camelCase from .NET, snake_case from Python
      extractionPath?: string;
      extraction_path?: string;
      sourceText?: string;
      source_text?: string;
      sourceBoundingBox?: string;
      source_bounding_box?: string;
      deviationReason?: string;
      deviation_reason?: string;
    };

    return {
      name: item.name ?? '',
      value: item.value ?? '',
      normalizedValue: item.normalizedValue ?? item.normalized_value ?? undefined,
      unit: item.unit ?? null,
      confidenceIndex: Number(item.confidenceIndex ?? item.confidenceScore ?? 0),
      sourcePage: Number(item.sourcePage ?? item.sourcePageNumber ?? 0),
      flaggedForReview: Boolean(item.flaggedForReview),
      isAbbDefault: Boolean(item.isAbbDefault),
      extractionReason: item.extractionReason ?? null,
      switchgearInstanceId: item.switchgearInstanceId ?? null,
      switchgearInstanceName: item.switchgearInstanceName ?? '',
      extractionPath: (item.extractionPath ?? item.extraction_path ?? '') as ExtractedParameter['extractionPath'],
      sourceText: item.sourceText ?? item.source_text ?? '',
      sourceBoundingBox: item.sourceBoundingBox ?? item.source_bounding_box ?? '',
      deviationReason: item.deviationReason ?? item.deviation_reason ?? ''
    };
  }

  private mapInstance(raw: unknown): SwitchgearInstance {
    const item = raw as {
      id?: number;
      instanceIndex?: number;
      instanceName?: string;
      location?: string;
      parameters?: unknown[];
      topologySummary?: unknown;
    };

    return {
      id: Number(item.id ?? 0),
      instanceIndex: Number(item.instanceIndex ?? 1),
      instanceName: item.instanceName ?? 'Main Switchgear',
      location: item.location ?? '',
      parameters: (item.parameters ?? []).map(p => this.mapParameter(p)),
      topologySummary: item.topologySummary
        ? this.parseTopology(item.topologySummary)
        : null
    };
  }

  private parseTopology(raw: unknown): TopologySummary | null {
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw as Record<string, unknown>;
      return {
        totalPanels:    Number(obj['total_panels']    ?? obj['totalPanels']    ?? 0),
        incomers:       Number(obj['incomers']        ?? 0),
        feeders:        Number(obj['feeders']         ?? 0),
        couplers:       Number(obj['couplers']        ?? 0),
        metering:       Number(obj['metering']        ?? 0),
        transformers:   Number(obj['transformers']    ?? 0),
        busbarSections: Number(obj['busbar_sections'] ?? obj['busbarSections'] ?? 1),
        description:    String(obj['description']     ?? '')
      };
    } catch {
      return null;
    }
  }

  private mapCubicle(raw: unknown): SwitchgearCubicle {
    const item = raw as {
      position?: number;
      functionalPosition?: string;
      type?: string;
      abbProductFamily?: string;
      abbArticleNumber?: string | null;
      confidenceIndex?: number;
      confidenceScore?: number;
      topologyWarning?: string | null;
      switchgearInstanceId?: number | null;
      devices?: Array<{ name?: string; deviceType?: string; abbArticleNumber?: string | null; quantity?: number; description?: string }>;
      // Path C device detail
      cbModel?: string;
      cbRating?: string;
      ctRatio?: string;
      vtRatio?: string;
      relayModel?: string;
      protectionFunctions?: string[];
    };

    return {
      position: Number(item.position ?? 0),
      functionalPosition: item.functionalPosition ?? '',
      type: (item.type ?? 'outgoer') as SwitchgearCubicle['type'],
      abbProductFamily: item.abbProductFamily ?? 'Unknown',
      abbArticleNumber: item.abbArticleNumber ?? null,
      confidenceIndex: Number(item.confidenceIndex ?? item.confidenceScore ?? 0),
      topologyWarning: item.topologyWarning ?? null,
      switchgearInstanceId: item.switchgearInstanceId ?? null,
      devices: (item.devices ?? []).map((device) => ({
        name: device.name ?? device.deviceType ?? 'Unknown Device',
        abbArticleNumber: device.abbArticleNumber ?? null,
        quantity: Number(device.quantity ?? 1),
        description: device.description ?? ''
      })),
      cbModel: item.cbModel ?? '',
      cbRating: item.cbRating ?? '',
      ctRatio: item.ctRatio ?? '',
      vtRatio: item.vtRatio ?? '',
      relayModel: item.relayModel ?? '',
      protectionFunctions: item.protectionFunctions ?? []
    };
  }

  private mapProductMatch(raw: unknown): ProductMatch {
    const item = raw as {
      productKey?: string;
      productName?: string;
      description?: string;
      imageUrl?: string | null;
      documentationUrl?: string | null;
      isRecommended?: boolean;
      isCompatible?: boolean;
      matchScore?: number;
      matchedCriteria?: string[];
      mismatches?: string[];
      insulationType?: string;
      markets?: string[];
    };
    return {
      productKey: item.productKey ?? '',
      productName: item.productName ?? '',
      description: item.description ?? '',
      imageUrl: item.imageUrl ?? null,
      documentationUrl: item.documentationUrl ?? null,
      isRecommended: Boolean(item.isRecommended),
      isCompatible: Boolean(item.isCompatible),
      matchScore: Number(item.matchScore ?? 0),
      matchedCriteria: item.matchedCriteria ?? [],
      mismatches: item.mismatches ?? [],
      insulationType: item.insulationType ?? '',
      markets: item.markets ?? []
    };
  }

  private mapCubicleDevice(raw: unknown): CubicleDevice {
    const d = raw as {
      id?: number;
      functionalPosition?: string;
      panelType?: string;
      cbModel?: string;
      cbRating?: string;
      cbBreakingCapacity?: string;
      ctRatio?: string;
      ctAccuracyClass?: string;
      vtRatio?: string;
      vtAccuracyClass?: string;
      relayModel?: string;
      protectionFunctions?: string[];
      extractionPath?: string;
      confidenceScore?: number;
      sourcePage?: number;
      flaggedForReview?: boolean;
      deviationReason?: string;
      switchgearInstanceId?: number | null;
    };
    return {
      id: Number(d.id ?? 0),
      functionalPosition: d.functionalPosition ?? '',
      panelType: d.panelType ?? '',
      cbModel: d.cbModel ?? '',
      cbRating: d.cbRating ?? '',
      cbBreakingCapacity: d.cbBreakingCapacity ?? '',
      ctRatio: d.ctRatio ?? '',
      ctAccuracyClass: d.ctAccuracyClass ?? '',
      vtRatio: d.vtRatio ?? '',
      vtAccuracyClass: d.vtAccuracyClass ?? '',
      relayModel: d.relayModel ?? '',
      protectionFunctions: d.protectionFunctions ?? [],
      extractionPath: d.extractionPath ?? '',
      confidenceScore: Number(d.confidenceScore ?? 0),
      sourcePage: Number(d.sourcePage ?? 0),
      flaggedForReview: Boolean(d.flaggedForReview),
      deviationReason: d.deviationReason ?? '',
      switchgearInstanceId: d.switchgearInstanceId ?? null
    };
  }

  private mapDeviation(raw: unknown): DeviationItem {
    const item = raw as {
      id?: string;
      deviationId?: string;
      field?: string;
      affectedField?: string;
      reason?: string;
      description?: string;
      sourcePages?: number[];
      sourcePageNumbers?: number[];
      severity?: string;
      resolved?: boolean;
      recommendedAction?: string | null;
      suggestedValue?: string | null;
    };

    const severity = String(item.severity ?? 'low').toLowerCase();
    const normalizedSeverity = severity === 'high' || severity === 'critical'
      ? 'high'
      : severity === 'medium'
        ? 'medium'
        : 'low';

    return {
      id: String(item.id ?? item.deviationId ?? ''),
      field: item.field ?? item.affectedField ?? 'Unknown Field',
      reason: item.reason ?? item.description ?? 'No description provided',
      sourcePages: item.sourcePages ?? item.sourcePageNumbers ?? [],
      severity: normalizedSeverity,
      resolved: Boolean(item.resolved),
      recommendedAction: item.recommendedAction ?? item.suggestedValue ?? null
    };
  }
}
