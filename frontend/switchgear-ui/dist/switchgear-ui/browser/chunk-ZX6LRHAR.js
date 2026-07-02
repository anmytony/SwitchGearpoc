import {
  DestroyRef,
  HttpClient,
  Observable,
  assertInInjectionContext,
  catchError,
  inject,
  map,
  switchMap,
  takeUntil,
  takeWhile,
  throwError,
  timeout,
  timer,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-2AGIM5UM.js";

// node_modules/@angular/core/fesm2022/rxjs-interop.mjs
function takeUntilDestroyed(destroyRef) {
  if (!destroyRef) {
    assertInInjectionContext(takeUntilDestroyed);
    destroyRef = inject(DestroyRef);
  }
  const destroyed$ = new Observable((observer) => {
    const unregisterFn = destroyRef.onDestroy(observer.next.bind(observer));
    return unregisterFn;
  });
  return (source) => {
    return source.pipe(takeUntil(destroyed$));
  };
}

// src/environments/environment.ts
var environment = {
  production: false,
  apiBaseUrl: "http://localhost:5195"
};

// src/app/services/pipeline-api.service.ts
var PipelineApiService = class _PipelineApiService {
  constructor(http) {
    this.http = http;
    this.base = environment.apiBaseUrl;
  }
  // -------------------------------------------------------------------------
  // Upload
  // -------------------------------------------------------------------------
  /** Return all ABB product variants from the filterSelector API. */
  getAvailableProducts() {
    return this.http.get(`${this.base}/api/v1/products`).pipe(map((items) => items.map((item) => ({
      name: item.name ?? "",
      value: item.value ?? "",
      family: item.family ?? "",
      description: item.description ?? "",
      imageUrl: item.image_url ?? item.imageUrl ?? "",
      docUrl: item.doc_url ?? item.docUrl ?? ""
    }))), catchError(this.handleError));
  }
  /** Return parameter definitions for an ABB product family (drives the extraction catalog). */
  getParameterDefinitions(productFamily) {
    return this.http.get(`${this.base}/api/v1/parameter-definitions/${encodeURIComponent(productFamily)}`).pipe(map((items) => items.map((item) => ({
      key: item.key ?? "",
      label: item.label ?? "",
      labelWithoutUnit: item.label_without_unit ?? item.labelWithoutUnit ?? "",
      unit: item.unit ?? "",
      allowedValues: item.allowed_values ?? item.allowedValues ?? [],
      isEnum: item.is_enum ?? item.isEnum ?? false
    }))), catchError(this.handleError));
  }
  /** Upload one or more RFQ document files. Returns the new documentId. */
  uploadDocuments(files, productName = "Switchgear") {
    const form = new FormData();
    files.forEach((f) => form.append("files", f, f.name));
    form.append("productName", productName);
    return this.http.post(`${this.base}/api/v1/documents/upload`, form).pipe(catchError(this.handleError));
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
  pollStatus(id) {
    const terminalStates = [
      "extracted",
      "review_required",
      "ready_for_xml",
      "exported"
    ];
    let intervalMs = 500;
    const maxIntervalMs = 5e3;
    const maxPollDurationMs = 24e4;
    const poll = () => timer(intervalMs).pipe(switchMap(() => this.getStatus(id)), switchMap((result) => {
      if (terminalStates.includes(result.status)) {
        return [result];
      }
      intervalMs = Math.min(Math.round(intervalMs * 1.5), maxIntervalMs);
      return poll();
    }));
    return this.getStatus(id).pipe(switchMap((status) => {
      if (terminalStates.includes(status.status)) {
        return [status];
      }
      return poll();
    }), takeWhile(
      (result) => !terminalStates.includes(result.status),
      true
      // emit the terminal value before completing
    ), timeout({
      first: maxPollDurationMs,
      with: () => throwError(() => new Error("Processing timed out \u2014 the pipeline did not finish. Please retry."))
    }));
  }
  getStatus(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/status`).pipe(map((r) => {
      const normalized = this.normalizeStatus(r.status);
      if (normalized === null) {
        throw new Error(r.errorMessage ?? `Document ${id} failed in pipeline.`);
      }
      return {
        status: normalized,
        overallConfidence: Number(r.overallConfidence ?? 0)
      };
    }), catchError(this.handleError));
  }
  // -------------------------------------------------------------------------
  // Pipeline stage data
  // -------------------------------------------------------------------------
  getPages(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/pages`).pipe(map((pages) => pages.map((page) => this.mapPage(page))), catchError(this.handleError));
  }
  getParameters(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/parameters`).pipe(map((items) => items.map((item) => this.mapParameter(item))), catchError(this.handleError));
  }
  getInstances(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/instances`).pipe(map((items) => items.map((item) => this.mapInstance(item))), catchError(this.handleError));
  }
  getCubicleDevices(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/cubicle-devices`).pipe(map((items) => items.map((item) => this.mapCubicleDevice(item))), catchError(this.handleError));
  }
  getLineup(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/lineup`).pipe(map((response) => {
      const payload = response;
      const cubicles = Array.isArray(payload) ? payload : payload.cubicles ?? [];
      return cubicles.map((item) => this.mapCubicle(item));
    }), catchError(this.handleError));
  }
  getLineupDevices(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/lineup/devices`).pipe(catchError(this.handleError));
  }
  getProductMatch(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/product-match`).pipe(map((items) => items.map((item) => this.mapProductMatch(item))), catchError(this.handleError));
  }
  getAllProducts(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/all-products`).pipe(map((items) => items.map((item) => this.mapProductMatch(item))), catchError(this.handleError));
  }
  getDeviations(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/deviations`).pipe(map((items) => items.map((item) => this.mapDeviation(item))), catchError(this.handleError));
  }
  getXml(id) {
    return this.http.get(`${this.base}/api/v1/documents/${id}/xml`, { responseType: "text" }).pipe(catchError(this.handleError));
  }
  // -------------------------------------------------------------------------
  // Review submission
  // -------------------------------------------------------------------------
  submitReview(submission) {
    const body = {
      deviationReviews: submission.parameterOverrides.map((o) => ({
        parameterName: o.parameterName,
        resolution: "Override",
        correctedValue: String(o.newValue),
        comment: o.reviewerNote ?? ""
      })),
      resolvedDeviationIds: submission.resolvedDeviationIds
    };
    return this.http.post(`${this.base}/api/v1/documents/${submission.documentId}/review`, body).pipe(catchError(this.handleError));
  }
  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------
  handleError(err) {
    let message;
    if (err.error instanceof ErrorEvent) {
      message = err.error.message;
    } else {
      if (err.error && typeof err.error === "object" && "error" in err.error) {
        message = `Server error ${err.status}: ${err.error.error}`;
      } else if (err.error && typeof err.error === "string") {
        message = `Server error ${err.status}: ${err.error}`;
      } else {
        message = `Server error ${err.status}: ${err.statusText || "Unknown error"}`;
      }
    }
    console.error("[API Error]", message, err);
    return throwError(() => new Error(message));
  }
  normalizeStatus(rawStatus) {
    const value = (rawStatus ?? "").trim().toLowerCase().replace(/\s+/g, "_");
    const mapped = {
      queued: "uploaded",
      uploaded: "uploaded",
      processing: "processing",
      extracted: "extracted",
      review_required: "review_required",
      completed: "review_required",
      ready_for_xml: "ready_for_xml",
      ready_for_export: "ready_for_xml",
      exported: "exported",
      failed: null,
      error: null
    };
    return mapped[value] ?? "processing";
  }
  mapPage(raw) {
    const page = raw;
    const rawType = page.pageType ?? page.classification ?? "text_tabular";
    const normalizedType = String(rawType).toLowerCase() === "visual_sld" ? "visual_sld" : "text_tabular";
    return {
      pageNumber: Number(page.pageNumber ?? 0),
      pageType: normalizedType,
      confidenceIndex: Number(page.confidenceIndex ?? page.classificationConfidence ?? 0),
      thumbnailUrl: page.thumbnailUrl ?? null
    };
  }
  mapParameter(raw) {
    const item = raw;
    return {
      name: item.name ?? "",
      value: item.value ?? "",
      normalizedValue: item.normalizedValue ?? item.normalized_value ?? void 0,
      unit: item.unit ?? null,
      confidenceIndex: Number(item.confidenceIndex ?? item.confidenceScore ?? 0),
      sourcePage: Number(item.sourcePage ?? item.sourcePageNumber ?? 0),
      flaggedForReview: Boolean(item.flaggedForReview),
      isAbbDefault: Boolean(item.isAbbDefault),
      extractionReason: item.extractionReason ?? null,
      switchgearInstanceId: item.switchgearInstanceId ?? null,
      switchgearInstanceName: item.switchgearInstanceName ?? "",
      extractionPath: item.extractionPath ?? item.extraction_path ?? "",
      sourceText: item.sourceText ?? item.source_text ?? "",
      sourceBoundingBox: item.sourceBoundingBox ?? item.source_bounding_box ?? "",
      deviationReason: item.deviationReason ?? item.deviation_reason ?? ""
    };
  }
  mapInstance(raw) {
    const item = raw;
    return {
      id: Number(item.id ?? 0),
      instanceIndex: Number(item.instanceIndex ?? 1),
      instanceName: item.instanceName ?? "Main Switchgear",
      location: item.location ?? "",
      parameters: (item.parameters ?? []).map((p) => this.mapParameter(p)),
      topologySummary: item.topologySummary ? this.parseTopology(item.topologySummary) : null
    };
  }
  parseTopology(raw) {
    try {
      const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
      return {
        totalPanels: Number(obj["total_panels"] ?? obj["totalPanels"] ?? 0),
        incomers: Number(obj["incomers"] ?? 0),
        feeders: Number(obj["feeders"] ?? 0),
        couplers: Number(obj["couplers"] ?? 0),
        metering: Number(obj["metering"] ?? 0),
        transformers: Number(obj["transformers"] ?? 0),
        busbarSections: Number(obj["busbar_sections"] ?? obj["busbarSections"] ?? 1),
        description: String(obj["description"] ?? "")
      };
    } catch {
      return null;
    }
  }
  mapCubicle(raw) {
    const item = raw;
    return {
      position: Number(item.position ?? 0),
      functionalPosition: item.functionalPosition ?? "",
      type: item.type ?? "outgoer",
      abbProductFamily: item.abbProductFamily ?? "Unknown",
      abbArticleNumber: item.abbArticleNumber ?? null,
      confidenceIndex: Number(item.confidenceIndex ?? item.confidenceScore ?? 0),
      topologyWarning: item.topologyWarning ?? null,
      switchgearInstanceId: item.switchgearInstanceId ?? null,
      devices: (item.devices ?? []).map((device) => ({
        name: device.name ?? device.deviceType ?? "Unknown Device",
        abbArticleNumber: device.abbArticleNumber ?? null,
        quantity: Number(device.quantity ?? 1),
        description: device.description ?? ""
      })),
      cbModel: item.cbModel ?? "",
      cbRating: item.cbRating ?? "",
      ctRatio: item.ctRatio ?? "",
      vtRatio: item.vtRatio ?? "",
      relayModel: item.relayModel ?? "",
      protectionFunctions: item.protectionFunctions ?? []
    };
  }
  mapProductMatch(raw) {
    const item = raw;
    return {
      productKey: item.productKey ?? "",
      productName: item.productName ?? "",
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? null,
      documentationUrl: item.documentationUrl ?? null,
      isRecommended: Boolean(item.isRecommended),
      isCompatible: Boolean(item.isCompatible),
      matchScore: Number(item.matchScore ?? 0),
      matchedCriteria: item.matchedCriteria ?? [],
      mismatches: item.mismatches ?? [],
      insulationType: item.insulationType ?? "",
      markets: item.markets ?? []
    };
  }
  mapCubicleDevice(raw) {
    const d = raw;
    return {
      id: Number(d.id ?? 0),
      functionalPosition: d.functionalPosition ?? "",
      panelType: d.panelType ?? "",
      cbModel: d.cbModel ?? "",
      cbRating: d.cbRating ?? "",
      cbBreakingCapacity: d.cbBreakingCapacity ?? "",
      ctRatio: d.ctRatio ?? "",
      ctAccuracyClass: d.ctAccuracyClass ?? "",
      vtRatio: d.vtRatio ?? "",
      vtAccuracyClass: d.vtAccuracyClass ?? "",
      relayModel: d.relayModel ?? "",
      protectionFunctions: d.protectionFunctions ?? [],
      extractionPath: d.extractionPath ?? "",
      confidenceScore: Number(d.confidenceScore ?? 0),
      sourcePage: Number(d.sourcePage ?? 0),
      flaggedForReview: Boolean(d.flaggedForReview),
      deviationReason: d.deviationReason ?? "",
      switchgearInstanceId: d.switchgearInstanceId ?? null
    };
  }
  mapDeviation(raw) {
    const item = raw;
    const severity = String(item.severity ?? "low").toLowerCase();
    const normalizedSeverity = severity === "high" || severity === "critical" ? "high" : severity === "medium" ? "medium" : "low";
    return {
      id: String(item.id ?? item.deviationId ?? ""),
      field: item.field ?? item.affectedField ?? "Unknown Field",
      reason: item.reason ?? item.description ?? "No description provided",
      sourcePages: item.sourcePages ?? item.sourcePageNumbers ?? [],
      severity: normalizedSeverity,
      resolved: Boolean(item.resolved),
      recommendedAction: item.recommendedAction ?? item.suggestedValue ?? null
    };
  }
  static {
    this.\u0275fac = function PipelineApiService_Factory(t) {
      return new (t || _PipelineApiService)(\u0275\u0275inject(HttpClient));
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _PipelineApiService, factory: _PipelineApiService.\u0275fac, providedIn: "root" });
  }
};

export {
  takeUntilDestroyed,
  PipelineApiService
};
/*! Bundled license information:

@angular/core/fesm2022/rxjs-interop.mjs:
  (**
   * @license Angular v17.3.12
   * (c) 2010-2024 Google LLC. https://angular.io/
   * License: MIT
   *)
*/
//# sourceMappingURL=chunk-ZX6LRHAR.js.map
