import {
  PipelineApiService,
  takeUntilDestroyed
} from "./chunk-ZX6LRHAR.js";
import {
  CommonModule,
  DestroyRef,
  EventEmitter,
  NgClass,
  ReviewStateService,
  TitleCasePipe,
  computed,
  inject,
  signal,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMapInterpolate1,
  ɵɵclassProp,
  ɵɵcomponentInstance,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-2AGIM5UM.js";

// src/app/components/deviations/deviation-panel.component.ts
var _forTrack0 = ($index, $item) => $item.path;
var _c0 = () => [1, 2, 3, 4];
var _c1 = () => ["all", "high", "medium", "low"];
var _c2 = () => ["open", "resolved", "all"];
function DeviationPanelComponent_Conditional_6_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275element(1, "span", 8)(2, "span", 9)(3, "span", 10)(4, "span", 11);
    \u0275\u0275elementEnd();
  }
}
function DeviationPanelComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 4);
    \u0275\u0275repeaterCreate(1, DeviationPanelComponent_Conditional_6_For_2_Template, 5, 0, "div", 7, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275repeater(\u0275\u0275pureFunction0(0, _c0));
  }
}
function DeviationPanelComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5)(1, "span", 12);
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
    \u0275\u0275textInterpolate((tmp_1_0 = ctx_r0.errorMessage()) !== null && tmp_1_0 !== void 0 ? tmp_1_0 : "Failed to load deviations.");
  }
}
function DeviationPanelComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "span", 13);
    \u0275\u0275text(2, "\u2705");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 14);
    \u0275\u0275text(4, "No deviations detected");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 15);
    \u0275\u0275text(6, " All extractions met the confidence threshold with no contradictions. ");
    \u0275\u0275elementEnd()();
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 22)(1, "span", 18);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 19);
    \u0275\u0275text(4, "High (blocking export)");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.unresolvedHigh());
  }
}
function DeviationPanelComponent_Conditional_9_For_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 28);
    \u0275\u0275listener("click", function DeviationPanelComponent_Conditional_9_For_17_Template_button_click_0_listener() {
      const sev_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.onSeverityClick(sev_r3));
    });
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "titlecase");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sev_r3 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("filter-btn--active", ctx_r0.severityFilter() === sev_r3);
    \u0275\u0275attribute("aria-pressed", ctx_r0.severityFilter() === sev_r3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", sev_r3 === "all" ? "All" : \u0275\u0275pipeBind1(2, 4, sev_r3), " ");
  }
}
function DeviationPanelComponent_Conditional_9_For_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 28);
    \u0275\u0275listener("click", function DeviationPanelComponent_Conditional_9_For_22_Template_button_click_0_listener() {
      const res_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.onResolutionClick(res_r5));
    });
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "titlecase");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const res_r5 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("filter-btn--active", ctx_r0.resolutionFilter() === res_r5);
    \u0275\u0275attribute("aria-pressed", ctx_r0.resolutionFilter() === res_r5);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", res_r5 === "all" ? "All" : \u0275\u0275pipeBind1(2, 4, res_r5), " ");
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "span", 13);
    \u0275\u0275text(2, "\u{1F50D}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 14);
    \u0275\u0275text(4, "No deviations match the current filters");
    \u0275\u0275elementEnd()();
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u{1F534} ");
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u{1F7E1} ");
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u26AA ");
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1, "\u2713 Resolved");
    \u0275\u0275elementEnd();
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_15_For_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span")(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const part_r6 = ctx.$implicit;
    \u0275\u0275classMapInterpolate1("conflict-chip conflict-chip--", part_r6.path.toLowerCase(), "");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(part_r6.path);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(": ", part_r6.value, " ");
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 38)(1, "span", 42);
    \u0275\u0275text(2, "Ensemble conflict");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(3, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_15_For_4_Template, 4, 5, "span", 43, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dev_r7 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r0.parseConflict(dev_r7.reason));
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 39);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dev_r7 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Source: page(s) ", dev_r7.sourcePages.join(", "), " ");
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 40)(1, "strong");
    \u0275\u0275text(2, "Recommended:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dev_r7 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", dev_r7.recommendedAction, " ");
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 44);
    \u0275\u0275listener("click", function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_18_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r8);
      const dev_r7 = \u0275\u0275nextContext().$implicit;
      const ctx_r0 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r0.resolve(dev_r7.id));
    });
    \u0275\u0275text(1, " Mark Resolved ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dev_r7 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275attribute("aria-label", "Mark " + dev_r7.field + " as resolved");
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li", 30)(1, "span", 31);
    \u0275\u0275template(2, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Case_2_Template, 1, 0)(3, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Case_3_Template, 1, 0)(4, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Case_4_Template, 1, 0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 32)(6, "div", 33)(7, "span", 34);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 35);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "titlecase");
    \u0275\u0275elementEnd();
    \u0275\u0275template(12, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_12_Template, 2, 0, "span", 36);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "p", 37);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275template(15, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_15_Template, 5, 0, "div", 38)(16, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_16_Template, 2, 1, "span", 39)(17, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_17_Template, 4, 1, "p", 40);
    \u0275\u0275elementEnd();
    \u0275\u0275template(18, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Conditional_18_Template, 2, 1, "button", 41);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_15_0;
    const dev_r7 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("deviation-item--resolved", ctx_r0.isResolved(dev_r7.id));
    \u0275\u0275attribute("aria-label", dev_r7.field + " deviation, severity " + dev_r7.severity);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.severityClass(dev_r7.severity));
    \u0275\u0275advance();
    \u0275\u0275conditional(2, (tmp_15_0 = dev_r7.severity) === "high" ? 2 : tmp_15_0 === "medium" ? 3 : 4);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(dev_r7.field);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.severityClass(dev_r7.severity));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(11, 14, dev_r7.severity), " ");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(12, ctx_r0.isResolved(dev_r7.id) ? 12 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(dev_r7.reason);
    \u0275\u0275advance();
    \u0275\u0275conditional(15, ctx_r0.isConflictReason(dev_r7.reason) ? 15 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(16, dev_r7.sourcePages.length > 0 ? 16 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(17, dev_r7.recommendedAction ? 17 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(18, !ctx_r0.isResolved(dev_r7.id) ? 18 : -1);
  }
}
function DeviationPanelComponent_Conditional_9_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ul", 27);
    \u0275\u0275repeaterCreate(1, DeviationPanelComponent_Conditional_9_Conditional_24_For_2_Template, 19, 16, "li", 29, \u0275\u0275componentInstance().trackById, true);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r0.filtered());
  }
}
function DeviationPanelComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16)(1, "span", 17)(2, "span", 18);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 19);
    \u0275\u0275text(5, "Total");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(6, "span", 20);
    \u0275\u0275elementStart(7, "span", 21)(8, "span", 18);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 19);
    \u0275\u0275text(11, "Unresolved");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(12, DeviationPanelComponent_Conditional_9_Conditional_12_Template, 5, 1, "span", 22);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "div", 23)(14, "span", 24);
    \u0275\u0275text(15, "Severity:");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(16, DeviationPanelComponent_Conditional_9_For_17_Template, 3, 6, "button", 25, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275element(18, "span", 26);
    \u0275\u0275elementStart(19, "span", 24);
    \u0275\u0275text(20, "Status:");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(21, DeviationPanelComponent_Conditional_9_For_22_Template, 3, 6, "button", 25, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275template(23, DeviationPanelComponent_Conditional_9_Conditional_23_Template, 5, 0, "div", 6)(24, DeviationPanelComponent_Conditional_9_Conditional_24_Template, 3, 0, "ul", 27);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.totalCount());
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r0.unresolvedTotal());
    \u0275\u0275advance(3);
    \u0275\u0275conditional(12, ctx_r0.unresolvedHigh() > 0 ? 12 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(\u0275\u0275pureFunction0(5, _c1));
    \u0275\u0275advance(5);
    \u0275\u0275repeater(\u0275\u0275pureFunction0(6, _c2));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(23, ctx_r0.filtered().length === 0 ? 23 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(24, ctx_r0.filtered().length > 0 ? 24 : -1);
  }
}
var DeviationPanelComponent = class _DeviationPanelComponent {
  constructor() {
    this.reviewState = inject(ReviewStateService);
    this.api = inject(PipelineApiService);
    this.destroyRef = inject(DestroyRef);
    this.unresolvedHighCount = new EventEmitter();
    this.loadState = signal("loading");
    this.errorMessage = signal(null);
    this.deviations = signal([]);
    this.severityFilter = signal("all");
    this.resolutionFilter = signal("open");
    this.filtered = computed(() => {
      const sev = this.severityFilter();
      const res = this.resolutionFilter();
      return this.deviations().filter((d) => {
        const sevMatch = sev === "all" || d.severity === sev;
        const resMatch = res === "all" || res === "open" && !this.isResolved(d.id) || res === "resolved" && this.isResolved(d.id);
        return sevMatch && resMatch;
      });
    });
    this.totalCount = computed(() => this.deviations().length);
    this.unresolvedHigh = computed(() => this.deviations().filter((d) => d.severity === "high" && !this.isResolved(d.id)).length);
    this.unresolvedTotal = computed(() => this.deviations().filter((d) => !this.isResolved(d.id)).length);
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
    this.api.getDeviations(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (devs) => this.applyDeviations(devs),
      error: (err) => {
        this.loadState.set("error");
        this.errorMessage.set(err.message ?? "Failed to load deviations.");
      }
    });
  }
  applyDeviations(devs) {
    if (!devs.length) {
      this.loadState.set("empty");
      return;
    }
    this.deviations.set(devs);
    this.loadState.set("loaded");
    this.syncHighCount();
  }
  // ── Filters ──────────────────────────────────────────────────────────────
  setSeverityFilter(f) {
    this.severityFilter.set(f);
  }
  /** Template-safe wrapper called from @for loop where value is string */
  onSeverityClick(value) {
    this.setSeverityFilter(value);
  }
  setResolutionFilter(f) {
    this.resolutionFilter.set(f);
  }
  /** Template-safe wrapper called from @for loop where value is string */
  onResolutionClick(value) {
    this.setResolutionFilter(value);
  }
  // ── Resolution ───────────────────────────────────────────────────────────
  resolve(id) {
    this.reviewState.resolveDeviation(id);
    this.syncHighCount();
  }
  isResolved(id) {
    return this.reviewState.isDeviationResolved(id);
  }
  syncHighCount() {
    const count = this.unresolvedHigh();
    this.reviewState.setUnresolvedHighCount(count);
    this.unresolvedHighCount.emit(count);
  }
  // ── Presentation helpers ─────────────────────────────────────────────────
  severityClass(severity) {
    const map = {
      high: "sev--high",
      medium: "sev--medium",
      low: "sev--low"
    };
    return map[severity];
  }
  severityLabel(severity) {
    const map = {
      high: "\u{1F534} High",
      medium: "\u{1F7E1} Medium",
      low: "\u26AA Low"
    };
    return map[severity];
  }
  trackById(_index, dev) {
    return dev.id;
  }
  // ── Ensemble conflict helpers ─────────────────────────────────────────────
  /** Returns true when the reason string encodes a PathB/PathC disagreement. */
  isConflictReason(reason) {
    return /PathB=|PathC=|LLM=/.test(reason);
  }
  /** Parses "PathB=20, PathC=24" → [{path:'PathB', value:'20'}, {path:'PathC', value:'24'}] */
  parseConflict(reason) {
    return reason.split(",").flatMap((part) => {
      const match = part.trim().match(/^(PathB|PathC|LLM|Regex)=(.+)$/);
      return match ? [{ path: match[1], value: match[2].trim() }] : [];
    });
  }
  static {
    this.\u0275fac = function DeviationPanelComponent_Factory(t) {
      return new (t || _DeviationPanelComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DeviationPanelComponent, selectors: [["app-deviation-panel"]], outputs: { unresolvedHighCount: "unresolvedHighCount" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 10, vars: 4, consts: [[1, "deviation-page"], [1, "deviation-page__header"], [1, "deviation-page__title"], [1, "deviation-page__subtitle"], ["aria-busy", "true", "aria-label", "Loading deviations", 1, "card"], ["role", "alert", 1, "inline-error"], [1, "empty-state"], [1, "skeleton-row"], [1, "skeleton", "skeleton--sev"], [1, "skeleton", "skeleton--field"], [1, "skeleton", "skeleton--reason"], [1, "skeleton", "skeleton--btn"], ["aria-hidden", "true"], ["aria-hidden", "true", 1, "empty-state__icon"], [1, "empty-state__title"], [1, "empty-state__body"], ["role", "region", "aria-label", "Deviation summary", 1, "summary-bar", "card"], [1, "summary-stat"], [1, "summary-stat__value"], [1, "summary-stat__label"], [1, "summary-divider"], [1, "summary-stat", "summary-stat--warn"], [1, "summary-stat", "summary-stat--error"], ["role", "group", "aria-label", "Filter deviations", 1, "filter-bar"], [1, "filter-bar__label"], ["type", "button", 1, "filter-btn", 3, "filter-btn--active"], [1, "filter-bar__divider"], ["aria-label", "Deviation items", 1, "deviation-list", "card"], ["type", "button", 1, "filter-btn", 3, "click"], [1, "deviation-item", 3, "deviation-item--resolved"], [1, "deviation-item"], ["aria-hidden", "true", 1, "sev-icon", 3, "ngClass"], [1, "deviation-item__body"], [1, "deviation-item__top"], [1, "deviation-item__field"], [1, "sev-chip", 3, "ngClass"], [1, "resolved-chip"], [1, "deviation-item__reason"], [1, "conflict-row"], [1, "deviation-item__pages"], [1, "deviation-item__action"], ["type", "button", 1, "btn", "btn--sm", "btn--outline", "resolve-btn"], [1, "conflict-label"], [3, "class"], ["type", "button", 1, "btn", "btn--sm", "btn--outline", "resolve-btn", 3, "click"]], template: function DeviationPanelComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h2", 2);
        \u0275\u0275text(3, "Deviations & Review Items");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(4, "p", 3);
        \u0275\u0275text(5, " Resolve flagged issues before exporting the XML configuration. ");
        \u0275\u0275elementEnd()();
        \u0275\u0275template(6, DeviationPanelComponent_Conditional_6_Template, 3, 1, "div", 4)(7, DeviationPanelComponent_Conditional_7_Template, 5, 1, "div", 5)(8, DeviationPanelComponent_Conditional_8_Template, 7, 0, "div", 6)(9, DeviationPanelComponent_Conditional_9_Template, 25, 7);
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
    }, dependencies: [CommonModule, NgClass, TitleCasePipe], styles: ['@charset "UTF-8";\n\n\n\n.deviation-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.25rem;\n}\n.deviation-page__title[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n  font-weight: 700;\n  margin: 0 0 0.25rem;\n  color: #1a1a2e;\n}\n.deviation-page__subtitle[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.85rem;\n  color: #616161;\n}\n.summary-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 1.25rem;\n  padding: 0.75rem 1.25rem;\n}\n.summary-stat[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n.summary-stat__value[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  font-weight: 800;\n  line-height: 1;\n  color: #212121;\n}\n.summary-stat__label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #757575;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  margin-top: 2px;\n}\n.summary-stat--warn[_ngcontent-%COMP%]   .summary-stat__value[_ngcontent-%COMP%] {\n  color: #e65100;\n}\n.summary-stat--error[_ngcontent-%COMP%]   .summary-stat__value[_ngcontent-%COMP%] {\n  color: #c62828;\n}\n.summary-divider[_ngcontent-%COMP%] {\n  width: 1px;\n  height: 32px;\n  background: #e0e0e0;\n}\n.filter-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  padding: 0.5rem 0;\n}\n.filter-bar__label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  font-weight: 600;\n  color: #616161;\n  margin-right: 0.25rem;\n}\n.filter-bar__divider[_ngcontent-%COMP%] {\n  width: 1px;\n  height: 20px;\n  background: #e0e0e0;\n  margin: 0 0.4rem;\n}\n.filter-btn[_ngcontent-%COMP%] {\n  padding: 3px 12px;\n  border: 1.5px solid #e0e0e0;\n  border-radius: 12px;\n  background: transparent;\n  font-size: 0.78rem;\n  font-weight: 600;\n  color: #616161;\n  cursor: pointer;\n  transition:\n    border-color 0.12s,\n    color 0.12s,\n    background 0.12s;\n}\n.filter-btn[_ngcontent-%COMP%]:hover {\n  border-color: #1565c0;\n  color: #1565c0;\n}\n.filter-btn--active[_ngcontent-%COMP%] {\n  border-color: #1565c0;\n  background: #e3f2fd;\n  color: #1565c0;\n}\n.deviation-list[_ngcontent-%COMP%] {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  overflow: hidden;\n}\n.deviation-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.75rem;\n  padding: 1rem 1.25rem;\n  border-bottom: 1px solid #f0f0f0;\n  transition: background 0.1s;\n}\n.deviation-item[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.deviation-item[_ngcontent-%COMP%]:hover {\n  background: #fafafa;\n}\n.deviation-item--resolved[_ngcontent-%COMP%] {\n  opacity: 0.55;\n  background: #f9f9f9;\n}\n.sev-icon[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  font-size: 1.1rem;\n  margin-top: 2px;\n}\n.deviation-item__body[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.deviation-item__top[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 0.45rem;\n}\n.deviation-item__field[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 0.9rem;\n  color: #212121;\n}\n.deviation-item__reason[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.85rem;\n  color: #424242;\n  line-height: 1.45;\n}\n.deviation-item__pages[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #9e9e9e;\n}\n.deviation-item__action[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.82rem;\n  color: #1565c0;\n  background: #e3f2fd;\n  padding: 0.35rem 0.6rem;\n  border-radius: 4px;\n  line-height: 1.4;\n}\n.sev-chip[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 2px 8px;\n  border-radius: 10px;\n  font-size: 0.72rem;\n  font-weight: 700;\n}\n.sev-chip.sev--high[_ngcontent-%COMP%] {\n  background: #ffebee;\n  color: #c62828;\n}\n.sev-chip.sev--medium[_ngcontent-%COMP%] {\n  background: #fff8e1;\n  color: #f57f17;\n}\n.sev-chip.sev--low[_ngcontent-%COMP%] {\n  background: #f5f5f5;\n  color: #757575;\n}\n.resolved-chip[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 2px 8px;\n  border-radius: 10px;\n  font-size: 0.72rem;\n  font-weight: 700;\n  background: #e8f5e9;\n  color: #2e7d32;\n}\n.resolve-btn[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  align-self: flex-start;\n  margin-top: 2px;\n}\n.btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.35rem;\n  padding: 0.45rem 1rem;\n  border: none;\n  border-radius: 4px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s, border-color 0.15s;\n}\n.btn--outline[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1.5px solid #bdbdbd;\n  color: #424242;\n}\n.btn--outline[_ngcontent-%COMP%]:hover {\n  border-color: #1565c0;\n  color: #1565c0;\n}\n.btn--sm[_ngcontent-%COMP%] {\n  padding: 0.3rem 0.75rem;\n  font-size: 0.78rem;\n}\n.skeleton-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  padding: 0.9rem 1.25rem;\n  border-bottom: 1px solid #f0f0f0;\n}\n.skeleton-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.skeleton[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #e0e0e0 25%,\n      #eeeeee 50%,\n      #e0e0e0 75%);\n  background-size: 200% 100%;\n  animation: _ngcontent-%COMP%_shimmer 1.4s infinite;\n  border-radius: 4px;\n}\n.skeleton--sev[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.skeleton--field[_ngcontent-%COMP%] {\n  width: 110px;\n  height: 18px;\n}\n.skeleton--reason[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 18px;\n}\n.skeleton--btn[_ngcontent-%COMP%] {\n  width: 100px;\n  height: 28px;\n}\n@keyframes _ngcontent-%COMP%_shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n.conflict-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin-top: 0.35rem;\n}\n.conflict-label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #888;\n  font-weight: 600;\n  white-space: nowrap;\n}\n.conflict-chip[_ngcontent-%COMP%] {\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-size: 0.72rem;\n}\n.conflict-chip[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-weight: 700;\n}\n.conflict-chip--pathb[_ngcontent-%COMP%] {\n  background: #e3f0ff;\n  color: #1558d6;\n}\n.conflict-chip--pathc[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  color: #2e7d32;\n}\n.conflict-chip--llm[_ngcontent-%COMP%] {\n  background: #fff3e0;\n  color: #e65100;\n}\n.conflict-chip--regex[_ngcontent-%COMP%] {\n  background: #f3e5f5;\n  color: #6a1b9a;\n}\n/*# sourceMappingURL=deviation-panel.component.css.map */'], changeDetection: 0 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DeviationPanelComponent, { className: "DeviationPanelComponent", filePath: "src\\app\\components\\deviations\\deviation-panel.component.ts", lineNumber: 30 });
})();
export {
  DeviationPanelComponent
};
//# sourceMappingURL=chunk-4VOUYL2V.js.map
