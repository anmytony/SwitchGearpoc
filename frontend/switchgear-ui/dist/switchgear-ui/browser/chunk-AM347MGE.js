import {
  PipelineApiService,
  takeUntilDestroyed
} from "./chunk-ZX6LRHAR.js";
import {
  CommonModule,
  DestroyRef,
  NgClass,
  ReviewStateService,
  __async,
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
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-2AGIM5UM.js";

// src/app/components/xml-output/xml-output.component.ts
function XmlOutputComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 4);
    \u0275\u0275element(1, "div", 7)(2, "div", 8);
    \u0275\u0275elementEnd();
  }
}
function XmlOutputComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5)(1, "span", 9);
    \u0275\u0275text(2, "\u26A0\uFE0F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate((tmp_1_0 = ctx_r0.errorMessage()) !== null && tmp_1_0 !== void 0 ? tmp_1_0 : "Failed to load XML output.");
  }
}
function XmlOutputComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "span", 10);
    \u0275\u0275text(2, "\u{1F4C4}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 11);
    \u0275\u0275text(4, "XML not yet generated");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 12);
    \u0275\u0275text(6, " Complete the parameter review and lineup validation to generate the XML configuration. ");
    \u0275\u0275elementEnd()();
  }
}
function XmlOutputComponent_Conditional_9_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate1(" \u2713 ", ctx_r0.schemaStatusLabel(), " ");
  }
}
function XmlOutputComponent_Conditional_9_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate1(" \u2717 ", ctx_r0.schemaStatusLabel(), " ");
  }
}
function XmlOutputComponent_Conditional_9_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate1(" \u23F3 ", ctx_r0.schemaStatusLabel(), " ");
  }
}
function XmlOutputComponent_Conditional_9_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 15);
    \u0275\u0275element(1, "div", 23);
    \u0275\u0275elementStart(2, "span", 24);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275attribute("aria-valuenow", ctx_r0.confidencePct())("aria-label", "Overall confidence: " + ctx_r0.confidencePct() + "%");
    \u0275\u0275advance();
    \u0275\u0275styleProp("width", ctx_r0.confidencePct(), "%");
    \u0275\u0275property("ngClass", ctx_r0.confidenceBarClass());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r0.confidencePct(), "% confidence");
  }
}
function XmlOutputComponent_Conditional_9_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.exportBlockReason());
  }
}
function XmlOutputComponent_Conditional_9_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5)(1, "span", 9);
    \u0275\u0275text(2, "\u{1F6A9}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275elementStart(5, "strong");
    \u0275\u0275text(6, "Deviations");
    \u0275\u0275elementEnd();
    \u0275\u0275text(7, " screen before exporting. ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r0.unresolvedHighCount(), " high-severity deviation(s) remain unresolved. Resolve them in the ");
  }
}
function XmlOutputComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 13)(1, "span", 14);
    \u0275\u0275template(2, XmlOutputComponent_Conditional_9_Case_2_Template, 1, 1)(3, XmlOutputComponent_Conditional_9_Case_3_Template, 1, 1)(4, XmlOutputComponent_Conditional_9_Case_4_Template, 1, 1);
    \u0275\u0275elementEnd();
    \u0275\u0275template(5, XmlOutputComponent_Conditional_9_Conditional_5_Template, 4, 6, "div", 15);
    \u0275\u0275element(6, "span", 16);
    \u0275\u0275elementStart(7, "button", 17);
    \u0275\u0275listener("click", function XmlOutputComponent_Conditional_9_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.copyToClipboard());
    });
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 18)(10, "button", 19);
    \u0275\u0275listener("click", function XmlOutputComponent_Conditional_9_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.downloadXml());
    });
    \u0275\u0275text(11, " \u2B07 Export XML ");
    \u0275\u0275elementEnd();
    \u0275\u0275template(12, XmlOutputComponent_Conditional_9_Conditional_12_Template, 2, 1, "span", 20);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(13, XmlOutputComponent_Conditional_9_Conditional_13_Template, 8, 1, "div", 5);
    \u0275\u0275elementStart(14, "div", 21)(15, "pre", 22);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_3_0;
    let tmp_10_0;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.schemaStatusClass());
    \u0275\u0275attribute("aria-label", ctx_r0.schemaStatusLabel());
    \u0275\u0275advance();
    \u0275\u0275conditional(2, (tmp_3_0 = ctx_r0.schemaStatus()) === "valid" ? 2 : tmp_3_0 === "invalid" ? 3 : 4);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(5, ctx_r0.confidencePct() !== null ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("btn--copied", ctx_r0.clipboardState() === "copied")("btn--failed", ctx_r0.clipboardState() === "failed");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.clipboardLabel(), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", !ctx_r0.canExport());
    \u0275\u0275attribute("aria-disabled", !ctx_r0.canExport())("title", (tmp_10_0 = ctx_r0.exportBlockReason()) !== null && tmp_10_0 !== void 0 ? tmp_10_0 : "Download XML configuration file");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(12, ctx_r0.exportBlockReason() ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(13, ctx_r0.unresolvedHighCount() > 0 ? 13 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.xmlContent());
  }
}
var XmlOutputComponent = class _XmlOutputComponent {
  constructor() {
    this.reviewState = inject(ReviewStateService);
    this.api = inject(PipelineApiService);
    this.destroyRef = inject(DestroyRef);
    this.loadState = signal("loading");
    this.errorMessage = signal(null);
    this.xmlContent = signal("");
    this.schemaStatus = signal("pending");
    this.clipboardState = signal("idle");
    this.overallConfidence = this.reviewState.overallConfidence;
    this.unresolvedHighCount = this.reviewState.unresolvedHighCount;
    this.confidencePct = computed(() => {
      const c = this.overallConfidence();
      return c !== null ? Math.round(c * 100) : null;
    });
    this.confidenceBarClass = computed(() => {
      const pct = this.confidencePct();
      if (pct === null)
        return "";
      if (pct >= 85)
        return "confidence-bar__fill--high";
      if (pct >= 60)
        return "confidence-bar__fill--medium";
      return "confidence-bar__fill--low";
    });
    this.exportBlockReason = computed(() => {
      if (this.schemaStatus() === "invalid") {
        return "XML schema validation failed. Fix validation errors before exporting.";
      }
      if (this.schemaStatus() === "pending") {
        return "Schema validation has not completed yet.";
      }
      if (this.unresolvedHighCount() > 0) {
        return `${this.unresolvedHighCount()} high-severity deviation(s) must be resolved before export.`;
      }
      return null;
    });
    this.canExport = computed(() => this.exportBlockReason() === null && this.xmlContent().length > 0);
  }
  ngOnInit() {
    const docId = this.reviewState.documentId();
    if (!docId) {
      this.loadState.set("error");
      this.errorMessage.set("No document selected. Upload a package first.");
      return;
    }
    this.loadFromApi(docId);
  }
  loadFromApi(docId) {
    this.loadState.set("loading");
    this.api.getXml(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (xml) => this.applyXml(xml, null),
      error: (err) => {
        this.loadState.set("error");
        this.errorMessage.set(err.message ?? "Failed to load XML output.");
      }
    });
  }
  applyXml(xml, schemaValid) {
    if (!xml.trim()) {
      this.loadState.set("empty");
      return;
    }
    this.xmlContent.set(this.formatXml(xml));
    this.schemaStatus.set(schemaValid === true ? "valid" : schemaValid === false ? "invalid" : "pending");
    this.loadState.set("loaded");
  }
  // ── Clipboard ────────────────────────────────────────────────────────────
  copyToClipboard() {
    return __async(this, null, function* () {
      try {
        yield navigator.clipboard.writeText(this.xmlContent());
        this.clipboardState.set("copied");
      } catch {
        this.clipboardState.set("failed");
      }
      setTimeout(() => this.clipboardState.set("idle"), 2500);
    });
  }
  // ── Download ─────────────────────────────────────────────────────────────
  downloadXml() {
    if (!this.canExport())
      return;
    const blob = new Blob([this.xmlContent()], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "switchgear-config.xml";
    a.click();
    URL.revokeObjectURL(url);
  }
  // ── Helpers ──────────────────────────────────────────────────────────────
  schemaStatusLabel() {
    const map = {
      valid: "Schema Valid",
      invalid: "Schema Invalid",
      pending: "Validation Pending"
    };
    return map[this.schemaStatus()];
  }
  schemaStatusClass() {
    const map = {
      valid: "schema-badge--valid",
      invalid: "schema-badge--invalid",
      pending: "schema-badge--pending"
    };
    return map[this.schemaStatus()];
  }
  clipboardLabel() {
    const map = {
      idle: "Copy XML",
      copied: "\u2713 Copied!",
      failed: "\u2717 Failed"
    };
    return map[this.clipboardState()];
  }
  /** Minimal XML pretty-printer — adds indentation for readability. */
  formatXml(xml) {
    try {
      let indent = 0;
      const tab = "  ";
      return xml.replace(/>\s*</g, "><").replace(/(<[^/][^>]*[^/]>|<[^/][^>]*[^>]>)(?!<)/g, "$1\n").replace(/(<\/[^>]+>)/g, "\n$1").replace(/(<[^/][^>]*\/>)/g, "\n$1").split("\n").filter((line) => line.trim()).map((line) => {
        const closing = line.match(/^<\//) !== null;
        const selfClose = line.match(/\/>$/) !== null;
        if (closing)
          indent = Math.max(0, indent - 1);
        const out = tab.repeat(indent) + line.trim();
        if (!closing && !selfClose)
          indent++;
        return out;
      }).join("\n");
    } catch {
      return xml;
    }
  }
  static {
    this.\u0275fac = function XmlOutputComponent_Factory(t) {
      return new (t || _XmlOutputComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _XmlOutputComponent, selectors: [["app-xml-output"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 10, vars: 4, consts: [[1, "xml-page"], [1, "xml-page__header"], [1, "xml-page__title"], [1, "xml-page__subtitle"], ["aria-busy", "true", "aria-label", "Loading XML", 1, "card"], ["role", "alert", 1, "inline-error"], [1, "empty-state"], [1, "skeleton", "skeleton--toolbar"], [1, "skeleton", "skeleton--xml-block"], ["aria-hidden", "true"], ["aria-hidden", "true", 1, "empty-state__icon"], [1, "empty-state__title"], [1, "empty-state__body"], [1, "xml-toolbar", "card"], ["role", "status", 1, "schema-badge", 3, "ngClass"], ["role", "meter", "aria-valuemin", "0", "aria-valuemax", "100", 1, "confidence-bar"], [1, "xml-toolbar__spacer"], ["type", "button", "aria-label", "Copy XML to clipboard", 1, "btn", "btn--outline", "btn--sm", 3, "click"], [1, "export-wrapper"], ["type", "button", 1, "btn", "btn--primary", "btn--sm", 3, "click", "disabled"], ["role", "alert", 1, "export-blocked-hint"], [1, "card", "xml-card"], ["aria-label", "Generated XML content", "aria-readonly", "true", 1, "xml-pre"], [1, "confidence-bar__fill", 3, "ngClass"], [1, "confidence-bar__label"]], template: function XmlOutputComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h2", 2);
        \u0275\u0275text(3, "XML Configuration Output");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(4, "p", 3);
        \u0275\u0275text(5, " Generated ABB product configurator XML. Validate and export when all issues are resolved. ");
        \u0275\u0275elementEnd()();
        \u0275\u0275template(6, XmlOutputComponent_Conditional_6_Template, 3, 0, "div", 4)(7, XmlOutputComponent_Conditional_7_Template, 5, 1, "div", 5)(8, XmlOutputComponent_Conditional_8_Template, 7, 0, "div", 6)(9, XmlOutputComponent_Conditional_9_Template, 17, 15);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        \u0275\u0275advance(6);
        \u0275\u0275conditional(6, ctx.loadState() === "loading" ? 6 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(7, ctx.loadState() === "error" ? 7 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(8, ctx.loadState() === "empty" ? 8 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(9, ctx.loadState() === "loaded" ? 9 : -1);
      }
    }, dependencies: [CommonModule, NgClass], styles: ['\n\n.xml-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.25rem;\n}\n.xml-page__title[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n  font-weight: 700;\n  margin: 0 0 0.25rem;\n  color: #1a1a2e;\n}\n.xml-page__subtitle[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.85rem;\n  color: #616161;\n}\n.xml-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  padding: 0.75rem 1rem;\n}\n.xml-toolbar__spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.schema-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.35rem;\n  padding: 4px 12px;\n  border-radius: 12px;\n  font-size: 0.8rem;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.schema-badge--valid[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  color: #2e7d32;\n}\n.schema-badge--invalid[_ngcontent-%COMP%] {\n  background: #ffebee;\n  color: #c62828;\n}\n.schema-badge--pending[_ngcontent-%COMP%] {\n  background: #f5f5f5;\n  color: #757575;\n}\n.confidence-bar[_ngcontent-%COMP%] {\n  position: relative;\n  width: 160px;\n  height: 22px;\n  background: #eeeeee;\n  border-radius: 11px;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n.confidence-bar__fill[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 0;\n  top: 0;\n  height: 100%;\n  border-radius: 11px;\n  transition: width 0.4s ease;\n}\n.confidence-bar__fill--high[_ngcontent-%COMP%] {\n  background: #4caf50;\n}\n.confidence-bar__fill--medium[_ngcontent-%COMP%] {\n  background: #ffc107;\n}\n.confidence-bar__fill--low[_ngcontent-%COMP%] {\n  background: #f44336;\n}\n.confidence-bar__label[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: #fff;\n  text-shadow: 0 0 4px rgba(0, 0, 0, 0.4);\n  pointer-events: none;\n}\n.export-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 0.25rem;\n}\n.export-blocked-hint[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #c62828;\n  max-width: 260px;\n  text-align: right;\n  line-height: 1.3;\n}\n.xml-card[_ngcontent-%COMP%] {\n  padding: 0;\n  overflow: hidden;\n}\n.xml-pre[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 1.25rem;\n  font-family:\n    "Cascadia Code",\n    "Consolas",\n    "Courier New",\n    monospace;\n  font-size: 0.78rem;\n  line-height: 1.55;\n  color: #212121;\n  background: #fafafa;\n  overflow-x: auto;\n  white-space: pre;\n  tab-size: 2;\n  max-height: 520px;\n  overflow-y: auto;\n  border: none;\n}\n.btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.35rem;\n  padding: 0.45rem 1rem;\n  border: none;\n  border-radius: 4px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition:\n    background 0.15s,\n    opacity 0.15s,\n    border-color 0.15s;\n  white-space: nowrap;\n}\n.btn[_ngcontent-%COMP%]:disabled, .btn[aria-disabled=true][_ngcontent-%COMP%] {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n.btn--primary[_ngcontent-%COMP%] {\n  background: #1a1a2e;\n  color: #fff;\n}\n.btn--primary[_ngcontent-%COMP%]:not(:disabled):hover {\n  background: #2c2c54;\n}\n.btn--outline[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1.5px solid #bdbdbd;\n  color: #424242;\n}\n.btn--outline[_ngcontent-%COMP%]:hover {\n  border-color: #1565c0;\n  color: #1565c0;\n}\n.btn--copied[_ngcontent-%COMP%] {\n  border-color: #4caf50 !important;\n  color: #2e7d32 !important;\n}\n.btn--failed[_ngcontent-%COMP%] {\n  border-color: #f44336 !important;\n  color: #c62828 !important;\n}\n.btn--sm[_ngcontent-%COMP%] {\n  padding: 0.35rem 0.85rem;\n  font-size: 0.8rem;\n}\n.skeleton[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #e0e0e0 25%,\n      #eeeeee 50%,\n      #e0e0e0 75%);\n  background-size: 200% 100%;\n  animation: _ngcontent-%COMP%_shimmer 1.4s infinite;\n  border-radius: 4px;\n  margin: 0.75rem 1rem;\n}\n.skeleton--toolbar[_ngcontent-%COMP%] {\n  height: 36px;\n  width: 360px;\n  max-width: 100%;\n}\n.skeleton--xml-block[_ngcontent-%COMP%] {\n  height: 300px;\n}\n@keyframes _ngcontent-%COMP%_shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n/*# sourceMappingURL=xml-output.component.css.map */'], changeDetection: 0 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(XmlOutputComponent, { className: "XmlOutputComponent", filePath: "src\\app\\components\\xml-output\\xml-output.component.ts", lineNumber: 27 });
})();
export {
  XmlOutputComponent
};
//# sourceMappingURL=chunk-AM347MGE.js.map
