import {
  Router
} from "./chunk-GHA3ISE3.js";
import {
  PipelineApiService,
  takeUntilDestroyed
} from "./chunk-ZX6LRHAR.js";
import {
  CommonModule,
  DestroyRef,
  NgClass,
  ReviewStateService,
  __spreadProps,
  __spreadValues,
  computed,
  inject,
  signal,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-2AGIM5UM.js";

// src/app/components/upload/upload.component.ts
var _forTrack0 = ($index, $item) => $item.value;
function UploadComponent_For_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 17);
    \u0275\u0275listener("click", function UploadComponent_For_11_Template_button_click_0_listener() {
      const product_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.selectProduct(product_r3));
    });
    \u0275\u0275elementStart(1, "span", 18);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_11_0;
    let tmp_12_0;
    const product_r3 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275classProp("product-card--selected", ((tmp_11_0 = ctx_r3.selectedProduct()) == null ? null : tmp_11_0.value) === product_r3.value);
    \u0275\u0275attribute("aria-pressed", ((tmp_12_0 = ctx_r3.selectedProduct()) == null ? null : tmp_12_0.value) === product_r3.value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(product_r3.name);
  }
}
function UploadComponent_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 11)(1, "span", 19);
    \u0275\u0275text(2, "\u{1F4C2}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 20);
    \u0275\u0275text(4, "Drag & drop files here, or");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 21);
    \u0275\u0275listener("click", function UploadComponent_Conditional_15_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r5);
      \u0275\u0275nextContext();
      const fileInput_r6 = \u0275\u0275reference(14);
      return \u0275\u0275resetView(fileInput_r6.click());
    });
    \u0275\u0275text(6, " Browse files ");
    \u0275\u0275elementEnd()();
  }
}
function UploadComponent_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 22)(1, "button", 23);
    \u0275\u0275listener("click", function UploadComponent_Conditional_16_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r7);
      \u0275\u0275nextContext();
      const fileInput_r6 = \u0275\u0275reference(14);
      return \u0275\u0275resetView(fileInput_r6.click());
    });
    \u0275\u0275text(2, " + Add more files ");
    \u0275\u0275elementEnd()();
  }
}
function UploadComponent_Conditional_17_For_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 30);
    \u0275\u0275listener("click", function UploadComponent_Conditional_17_For_2_Conditional_9_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r8);
      const i_r9 = \u0275\u0275nextContext().$index;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.removeFile(i_r9));
    });
    \u0275\u0275text(1, " \u2715 ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const entry_r10 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275attribute("aria-label", "Remove " + entry_r10.file.name);
  }
}
function UploadComponent_Conditional_17_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li", 24)(1, "span", 25);
    \u0275\u0275text(2, "\u{1F4C4}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 26);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 27);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 28);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275template(9, UploadComponent_Conditional_17_For_2_Conditional_9_Template, 2, 1, "button", 29);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const entry_r10 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275property("title", entry_r10.file.name);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(entry_r10.file.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.formatSize(entry_r10.file.size));
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r3.statusClass(entry_r10.status));
    \u0275\u0275attribute("aria-label", "Status: " + entry_r10.status);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", entry_r10.status, " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(9, !ctx_r3.isSubmitting() ? 9 : -1);
  }
}
function UploadComponent_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ul", 12);
    \u0275\u0275repeaterCreate(1, UploadComponent_Conditional_17_For_2_Template, 10, 7, "li", 24, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.files());
  }
}
function UploadComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 13);
    \u0275\u0275element(1, "span", 31);
    \u0275\u0275elementStart(2, "span", 32);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r3.statusLabel());
  }
}
function UploadComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 14)(1, "span", 33);
    \u0275\u0275text(2, "\u26A0\uFE0F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 34);
    \u0275\u0275listener("click", function UploadComponent_Conditional_19_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.retry());
    });
    \u0275\u0275text(6, " Retry ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r3.uploadError());
  }
}
function UploadComponent_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 35);
    \u0275\u0275text(1, " Analysing\u2026 ");
  }
}
function UploadComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Analyse Documents ");
  }
}
var ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "text/plain",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
  "text/markdown"
];
var ACCEPTED_EXTENSIONS = ".pdf,.docx,.jpg,.jpeg,.png,.txt,.csv,.json,.xml,.md";
var UploadComponent = class _UploadComponent {
  constructor() {
    this.api = inject(PipelineApiService);
    this.reviewState = inject(ReviewStateService);
    this.router = inject(Router);
    this.destroyRef = inject(DestroyRef);
    this.acceptedExtensions = ACCEPTED_EXTENSIONS;
    this.products = [
      { name: "Switchgear", value: "Switchgear", family: "Switchgear", description: "", imageUrl: "", docUrl: "" },
      { name: "SafeRing & SafePlus", value: "SafeRing", family: "SafeRing", description: "", imageUrl: "", docUrl: "" }
    ];
    this.selectedProduct = signal(this.products[0]);
    this.files = signal([]);
    this.isDragOver = signal(false);
    this.isSubmitting = signal(false);
    this.pollingStatus = signal(null);
    this.uploadError = signal(null);
    this.pollingElapsedSecs = signal(0);
    this.pollingTimer = null;
    this.hasFiles = computed(() => this.files().length > 0);
    this.canSubmit = computed(() => this.hasFiles() && !this.isSubmitting() && this.selectedProduct() !== null);
    this.statusLabel = computed(() => {
      const s = this.pollingStatus();
      if (!s)
        return "";
      const elapsed = this.pollingElapsedSecs();
      const processingNote = elapsed >= 30 ? ` (${elapsed}s \u2014 large document, please wait\u2026)` : elapsed >= 10 ? ` (${elapsed}s)` : "";
      const map = {
        uploaded: "Uploaded \u2014 waiting for pipeline\u2026",
        processing: `Processing document\u2026${processingNote}`,
        extracted: "Extraction complete",
        review_required: "Ready for review",
        ready_for_xml: "Ready for XML export",
        exported: "Exported"
      };
      return map[s] ?? s;
    });
  }
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
  }
  selectProduct(product) {
    this.selectedProduct.set(product);
  }
  // ── Drag & Drop ──────────────────────────────────────────────────────────
  onDragOver(event) {
    event.preventDefault();
    this.isDragOver.set(true);
  }
  onDragLeave() {
    this.isDragOver.set(false);
  }
  onDrop(event) {
    event.preventDefault();
    this.isDragOver.set(false);
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(dropped);
  }
  onFileInputChange(event) {
    const input = event.target;
    const selected = Array.from(input.files ?? []);
    this.addFiles(selected);
    input.value = "";
  }
  addFiles(incoming) {
    const valid = incoming.filter((f) => this.isAcceptedFile(f));
    if (incoming.length > valid.length) {
      const rejected = incoming.length - valid.length;
      console.warn(`[Upload] ${rejected} file(s) rejected due to unsupported type. Accepted: ${ACCEPTED_TYPES.join(", ")}`);
    }
    const entries = valid.map((f) => ({
      file: f,
      status: "queued",
      errorMessage: null
    }));
    this.files.update((prev) => [...prev, ...entries]);
    this.uploadError.set(null);
  }
  removeFile(index) {
    this.files.update((prev) => prev.filter((_, i) => i !== index));
  }
  // ── Submit ───────────────────────────────────────────────────────────────
  submit() {
    if (!this.canSubmit())
      return;
    this.isSubmitting.set(true);
    this.uploadError.set(null);
    this.setAllStatus("uploading");
    const rawFiles = this.files().map((e) => e.file);
    console.log("[Upload] Submitting files:", rawFiles.length, rawFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })));
    const product = this.selectedProduct();
    this.api.uploadDocuments(rawFiles, product?.family ?? "Switchgear").pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        console.log("[Upload] Success:", response);
        const documentId = String(response.id);
        const product2 = this.selectedProduct();
        this.setAllStatus("processing");
        this.reviewState.setDocument(documentId, "uploaded", response.overallConfidence ?? 0);
        this.reviewState.setProductName(product2?.name ?? product2?.family ?? "Switchgear");
        this.reviewState.setProductFamily(product2?.family ?? "Switchgear");
        this.startPolling(documentId);
      },
      error: (err) => {
        console.error("[Upload] Error:", err);
        this.isSubmitting.set(false);
        this.setAllStatus("error");
        this.uploadError.set(err.message ?? "Upload failed. Please retry.");
      }
    });
  }
  startPolling(documentId) {
    this.pollingStatus.set("uploaded");
    this.pollingElapsedSecs.set(0);
    this.pollingTimer = setInterval(() => {
      this.pollingElapsedSecs.update((n) => n + 1);
    }, 1e3);
    this.api.pollStatus(documentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        const status = result.status;
        this.pollingStatus.set(status);
        this.reviewState.setOverallConfidence(result.overallConfidence);
        if (status === "review_required" || status === "extracted") {
          this.stopPollingTimer();
          this.setAllStatus("done");
          this.reviewState.setDocument(documentId, status, result.overallConfidence);
          this.isSubmitting.set(false);
          this.router.navigate(["/review/parameters"]);
          return;
        }
        if (status === "ready_for_xml" || status === "exported") {
          this.stopPollingTimer();
          this.setAllStatus("done");
          this.reviewState.setDocument(documentId, status, result.overallConfidence);
          this.isSubmitting.set(false);
          this.router.navigate(["/review/xml"]);
        }
      },
      error: (err) => {
        this.stopPollingTimer();
        this.isSubmitting.set(false);
        this.setAllStatus("error");
        this.uploadError.set(err.message ?? "Polling failed. Please retry.");
      }
    });
  }
  stopPollingTimer() {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
  retry() {
    this.uploadError.set(null);
    this.pollingStatus.set(null);
    this.setAllStatus("queued");
    this.submit();
  }
  // ── Helpers ──────────────────────────────────────────────────────────────
  setAllStatus(status) {
    this.files.update((prev) => prev.map((e) => __spreadProps(__spreadValues({}, e), { status, errorMessage: null })));
  }
  formatSize(bytes) {
    if (bytes < 1024)
      return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  statusClass(status) {
    const map = {
      queued: "status-chip--info",
      uploading: "status-chip--info",
      processing: "status-chip--info",
      done: "status-chip--ok",
      error: "status-chip--error"
    };
    return map[status];
  }
  trackByIndex(index) {
    return index;
  }
  isAcceptedFile(file) {
    if (ACCEPTED_TYPES.includes(file.type)) {
      return true;
    }
    const lowerName = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS.split(",").some((ext) => lowerName.endsWith(ext));
  }
  static {
    this.\u0275fac = function UploadComponent_Factory(t) {
      return new (t || _UploadComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _UploadComponent, selectors: [["app-upload"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 24, vars: 12, consts: [["fileInput", ""], [1, "upload-page"], [1, "upload-page__header"], [1, "upload-page__title"], [1, "upload-page__subtitle"], [1, "product-selector"], [1, "product-selector__label"], [1, "product-selector__options"], ["type", "button", 1, "product-card", 3, "product-card--selected"], ["role", "region", "aria-label", "File drop zone", 1, "drop-zone", 3, "dragover", "dragleave", "drop"], ["type", "file", "multiple", "", "aria-label", "Select files", 1, "drop-zone__input", 3, "change", "accept"], [1, "drop-zone__placeholder"], ["aria-label", "Selected files", 1, "file-list"], ["role", "status", "aria-live", "polite", 1, "polling-indicator"], ["role", "alert", 1, "inline-error"], [1, "upload-page__actions"], ["type", "button", 1, "btn", "btn--primary", 3, "click", "disabled"], ["type", "button", 1, "product-card", 3, "click"], [1, "product-card__name"], ["aria-hidden", "true", 1, "drop-zone__icon"], [1, "drop-zone__text"], ["type", "button", 1, "btn", "btn--outline", 3, "click"], [1, "drop-zone__add-more"], ["type", "button", 1, "btn", "btn--ghost", "btn--sm", 3, "click"], [1, "file-list__row"], ["aria-hidden", "true", 1, "file-list__icon"], [1, "file-list__name", 3, "title"], [1, "file-list__size"], [1, "status-chip", "file-list__status", 3, "ngClass"], ["type", "button", 1, "file-list__remove"], ["type", "button", 1, "file-list__remove", 3, "click"], ["aria-hidden", "true", 1, "polling-indicator__spinner"], [1, "polling-indicator__label"], ["aria-hidden", "true"], ["type", "button", 1, "btn", "btn--sm", "btn--outline", 3, "click"], ["aria-hidden", "true", 1, "btn__spinner"]], template: function UploadComponent_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = \u0275\u0275getCurrentView();
        \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "h1", 3);
        \u0275\u0275text(3, "Upload RFQ Document Package");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(4, "p", 4);
        \u0275\u0275text(5, " Accepted formats: PDF, DOCX, JPG, PNG, TXT, CSV, JSON, XML, MD \u2014 multiple files supported ");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(6, "div", 5)(7, "p", 6);
        \u0275\u0275text(8, "Select product family");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(9, "div", 7);
        \u0275\u0275repeaterCreate(10, UploadComponent_For_11_Template, 3, 4, "button", 8, _forTrack0);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(12, "div", 9);
        \u0275\u0275listener("dragover", function UploadComponent_Template_div_dragover_12_listener($event) {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.onDragOver($event));
        })("dragleave", function UploadComponent_Template_div_dragleave_12_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.onDragLeave());
        })("drop", function UploadComponent_Template_div_drop_12_listener($event) {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.onDrop($event));
        });
        \u0275\u0275elementStart(13, "input", 10, 0);
        \u0275\u0275listener("change", function UploadComponent_Template_input_change_13_listener($event) {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.onFileInputChange($event));
        });
        \u0275\u0275elementEnd();
        \u0275\u0275template(15, UploadComponent_Conditional_15_Template, 7, 0, "div", 11)(16, UploadComponent_Conditional_16_Template, 3, 0);
        \u0275\u0275elementEnd();
        \u0275\u0275template(17, UploadComponent_Conditional_17_Template, 3, 0, "ul", 12)(18, UploadComponent_Conditional_18_Template, 4, 1, "div", 13)(19, UploadComponent_Conditional_19_Template, 7, 1, "div", 14);
        \u0275\u0275elementStart(20, "div", 15)(21, "button", 16);
        \u0275\u0275listener("click", function UploadComponent_Template_button_click_21_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.submit());
        });
        \u0275\u0275template(22, UploadComponent_Conditional_22_Template, 2, 0)(23, UploadComponent_Conditional_23_Template, 1, 0);
        \u0275\u0275elementEnd()()();
      }
      if (rf & 2) {
        \u0275\u0275advance(10);
        \u0275\u0275repeater(ctx.products);
        \u0275\u0275advance(2);
        \u0275\u0275classProp("drop-zone--active", ctx.isDragOver())("drop-zone--has-files", ctx.hasFiles());
        \u0275\u0275advance();
        \u0275\u0275property("accept", ctx.acceptedExtensions);
        \u0275\u0275advance(2);
        \u0275\u0275conditional(15, !ctx.hasFiles() ? 15 : 16);
        \u0275\u0275advance(2);
        \u0275\u0275conditional(17, ctx.hasFiles() ? 17 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(18, ctx.isSubmitting() && ctx.pollingStatus() ? 18 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(19, ctx.uploadError() ? 19 : -1);
        \u0275\u0275advance(2);
        \u0275\u0275property("disabled", !ctx.canSubmit());
        \u0275\u0275attribute("aria-disabled", !ctx.canSubmit());
        \u0275\u0275advance();
        \u0275\u0275conditional(22, ctx.isSubmitting() ? 22 : 23);
      }
    }, dependencies: [CommonModule, NgClass], styles: ["\n\n.upload-page[_ngcontent-%COMP%] {\n  max-width: 760px;\n  margin: 0 auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1.25rem;\n}\n.upload-page__header[_ngcontent-%COMP%] {\n  margin-bottom: 0.25rem;\n}\n.upload-page__title[_ngcontent-%COMP%] {\n  font-size: 1.3rem;\n  font-weight: 700;\n  margin: 0 0 0.3rem;\n  color: #1a1a2e;\n}\n.upload-page__subtitle[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.85rem;\n  color: #616161;\n}\n.demo-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.65rem 1rem;\n  background: #fff3e0;\n  border-left: 4px solid #ff9800;\n  border-radius: 0 4px 4px 0;\n  font-size: 0.85rem;\n  color: #5d4037;\n}\n.demo-banner__icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n.product-selector[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.product-selector__label[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: #424242;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.product-selector__loading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  font-size: 0.85rem;\n  color: #757575;\n  padding: 0.5rem 0;\n}\n.product-load-spinner[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  border: 2px solid #e0e0e0;\n  border-top-color: #1565c0;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\n  flex-shrink: 0;\n}\n.product-selector__error[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.83rem;\n  color: #c62828;\n}\n.product-selector__options[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));\n  gap: 0.75rem;\n}\n.product-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n  padding: 0.85rem 1rem;\n  background: #fff;\n  border: 2px solid #e0e0e0;\n  border-radius: 8px;\n  cursor: pointer;\n  text-align: left;\n  transition:\n    border-color 0.15s,\n    background 0.15s,\n    box-shadow 0.15s;\n}\n.product-card[_ngcontent-%COMP%]:hover {\n  border-color: #90caf9;\n  background: #f5f9ff;\n}\n.product-card--selected[_ngcontent-%COMP%] {\n  border-color: #1565c0;\n  background: #e3f2fd;\n  box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.12);\n}\n.product-card__img[_ngcontent-%COMP%] {\n  width: 100%;\n  max-height: 64px;\n  object-fit: contain;\n  border-radius: 4px;\n  margin-bottom: 0.25rem;\n}\n.product-card__name[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: #1a1a2e;\n}\n.product-card--selected[_ngcontent-%COMP%]   .product-card__name[_ngcontent-%COMP%] {\n  color: #1565c0;\n}\n.product-card__desc[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #757575;\n  line-height: 1.4;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n.drop-zone[_ngcontent-%COMP%] {\n  position: relative;\n  border: 2px dashed #bdbdbd;\n  border-radius: 8px;\n  background: #fafafa;\n  padding: 2rem 1.5rem;\n  text-align: center;\n  transition: border-color 0.15s, background 0.15s;\n  cursor: pointer;\n}\n.drop-zone--active[_ngcontent-%COMP%] {\n  border-color: #1565c0;\n  background: #e3f2fd;\n}\n.drop-zone--has-files[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n}\n.drop-zone__input[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  opacity: 0;\n  pointer-events: none;\n}\n.drop-zone__placeholder[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.75rem;\n  pointer-events: none;\n}\n.drop-zone__icon[_ngcontent-%COMP%] {\n  font-size: 2.5rem;\n  opacity: 0.5;\n}\n.drop-zone__text[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: #616161;\n}\n.drop-zone__add-more[_ngcontent-%COMP%] {\n  pointer-events: auto;\n}\n.file-list[_ngcontent-%COMP%] {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 0.4rem;\n}\n.file-list__row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.55rem 0.75rem;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 4px;\n  font-size: 0.85rem;\n}\n.file-list__icon[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  font-size: 1rem;\n}\n.file-list__name[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-weight: 500;\n}\n.file-list__size[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  color: #757575;\n  font-size: 0.78rem;\n}\n.file-list__status[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n}\n.file-list__remove[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  background: none;\n  border: none;\n  cursor: pointer;\n  color: #9e9e9e;\n  font-size: 0.8rem;\n  padding: 2px 4px;\n  line-height: 1;\n  border-radius: 3px;\n  transition: color 0.1s, background 0.1s;\n}\n.file-list__remove[_ngcontent-%COMP%]:hover {\n  color: #f44336;\n  background: #ffebee;\n}\n.polling-indicator[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 0.75rem 1rem;\n  background: #e3f2fd;\n  border-left: 4px solid #1565c0;\n  border-radius: 0 4px 4px 0;\n  font-size: 0.87rem;\n  color: #0d47a1;\n}\n.polling-indicator__spinner[_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  border: 2px solid #90caf9;\n  border-top-color: #1565c0;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\n  flex-shrink: 0;\n}\n@keyframes _ngcontent-%COMP%_spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.upload-page__actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n}\n.btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0.55rem 1.25rem;\n  border: none;\n  border-radius: 4px;\n  font-size: 0.875rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s, opacity 0.15s;\n}\n.btn[_ngcontent-%COMP%]:disabled, .btn[aria-disabled=true][_ngcontent-%COMP%] {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n.btn--primary[_ngcontent-%COMP%] {\n  background: #1a1a2e;\n  color: #fff;\n}\n.btn--primary[_ngcontent-%COMP%]:not(:disabled):hover {\n  background: #2c2c54;\n}\n.btn--outline[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1.5px solid #bdbdbd;\n  color: #424242;\n  pointer-events: auto;\n}\n.btn--outline[_ngcontent-%COMP%]:hover {\n  border-color: #1565c0;\n  color: #1565c0;\n}\n.btn--ghost[_ngcontent-%COMP%] {\n  background: transparent;\n  color: #1565c0;\n}\n.btn--ghost[_ngcontent-%COMP%]:hover {\n  background: #e3f2fd;\n}\n.btn--sm[_ngcontent-%COMP%] {\n  padding: 0.3rem 0.75rem;\n  font-size: 0.8rem;\n}\n.btn__spinner[_ngcontent-%COMP%] {\n  width: 14px;\n  height: 14px;\n  border: 2px solid rgba(255, 255, 255, 0.4);\n  border-top-color: #fff;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\n}\n/*# sourceMappingURL=upload.component.css.map */"], changeDetection: 0 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(UploadComponent, { className: "UploadComponent", filePath: "src\\app\\components\\upload\\upload.component.ts", lineNumber: 46 });
})();
export {
  UploadComponent
};
//# sourceMappingURL=chunk-JHWTYWQO.js.map
