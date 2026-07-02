import {
  FormsModule,
  NgSelectOption,
  ɵNgSelectMultipleOption
} from "./chunk-2JMSUHNL.js";
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
  ɵɵcomponentInstance,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
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
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-2AGIM5UM.js";

// src/app/components/parameter-review/parameter-review.component.ts
function _forTrack0($index, $item) {
  return this.trackByIndex($index);
}
var _c0 = () => [1, 2, 3, 4, 5, 6, 7, 8, 9];
function ParameterReviewComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 6);
    \u0275\u0275text(1, "Loading filter parameters\u2026");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 7);
    \u0275\u0275text(1, " \u26A0 ABB filter API unavailable \u2014 showing extracted values only ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("title", ctx_r0.paramDefsError());
  }
}
function ParameterReviewComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 8);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u26A0 ", ctx_r0.saveError(), "");
  }
}
function ParameterReviewComponent_Conditional_13_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11);
    \u0275\u0275element(1, "span", 12)(2, "span", 13)(3, "span", 14)(4, "span", 15);
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 9);
    \u0275\u0275repeaterCreate(1, ParameterReviewComponent_Conditional_13_For_2_Template, 5, 0, "div", 11, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275repeater(\u0275\u0275pureFunction0(0, _c0));
  }
}
function ParameterReviewComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 10);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate((tmp_1_0 = ctx_r0.errorMessage()) !== null && tmp_1_0 !== void 0 ? tmp_1_0 : "Failed to load parameters.");
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_0_For_5_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const inst_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(inst_r5.location);
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_0_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 34);
    \u0275\u0275listener("click", function ParameterReviewComponent_Conditional_15_Conditional_0_For_5_Template_button_click_0_listener() {
      const $index_r4 = \u0275\u0275restoreView(_r3).$index;
      const ctx_r0 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r0.selectInstance($index_r4));
    });
    \u0275\u0275elementStart(1, "span", 35);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 36);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275template(5, ParameterReviewComponent_Conditional_15_Conditional_0_For_5_Conditional_5_Template, 2, 1, "span", 37);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const inst_r5 = ctx.$implicit;
    const $index_r4 = ctx.$index;
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("instance-tab--active", ctx_r0.selectedInstIdx() === $index_r4);
    \u0275\u0275attribute("aria-selected", ctx_r0.selectedInstIdx() === $index_r4);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(inst_r5.instanceIndex);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(inst_r5.instanceName);
    \u0275\u0275advance();
    \u0275\u0275conditional(5, inst_r5.location ? 5 : -1);
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16)(1, "div", 31);
    \u0275\u0275text(2, "Installations:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 32);
    \u0275\u0275repeaterCreate(4, ParameterReviewComponent_Conditional_15_Conditional_0_For_5_Template, 6, 6, "button", 33, _forTrack0, true);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r0.instances());
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 40);
    \u0275\u0275text(1, "\u25CF");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 41);
    \u0275\u0275text(1, "\u25CF");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 42);
    \u0275\u0275text(1, "\u2014");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_8_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 49);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const param_r6 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275property("title", "Mapped to: " + param_r6.normalizedValue);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" \u2192 ", param_r6.normalizedValue, " ");
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 48);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275template(2, ParameterReviewComponent_Conditional_15_For_18_Conditional_8_Conditional_2_Template, 2, 2, "span", 49);
  }
  if (rf & 2) {
    const param_r6 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("val--struck", ctx_r0.hasOverride(param_r6.name));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", param_r6.value, "", param_r6.unit ? " " + param_r6.unit : "", " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(2, ctx_r0.hasNormalizedHint(param_r6) ? 2 : -1);
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 43);
    \u0275\u0275text(1, "\u2014");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 50);
    \u0275\u0275text(1, "Default");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 51);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const param_r6 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(param_r6.confidenceIndex));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(param_r6.confidenceIndex), " ");
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_14_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 53);
    \u0275\u0275text(1, "\u26A1");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const param_r6 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275property("title", param_r6.deviationReason);
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_14_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 55);
    \u0275\u0275listener("click", function ParameterReviewComponent_Conditional_15_For_18_Conditional_14_Conditional_3_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r7);
      const param_r6 = \u0275\u0275nextContext(2).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.showEvidence(param_r6));
    });
    \u0275\u0275text(1, "\u{1F50D}");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 52);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275template(2, ParameterReviewComponent_Conditional_15_For_18_Conditional_14_Conditional_2_Template, 2, 1, "span", 53)(3, ParameterReviewComponent_Conditional_15_For_18_Conditional_14_Conditional_3_Template, 2, 0, "button", 54);
  }
  if (rf & 2) {
    const param_r6 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("ngClass", ctx_r0.extractionPathClass(param_r6.extractionPath))("title", param_r6.deviationReason || param_r6.extractionReason || "");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.extractionPathLabel(param_r6.extractionPath), " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(2, param_r6.deviationReason ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(3, param_r6.sourceText ? 3 : -1);
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 56);
    \u0275\u0275text(1, "\u2014");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 44);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const param_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("p.", param_r6.sourcePage, "");
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 56);
    \u0275\u0275text(1, "\u2014");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_21_For_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 59);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const v_r9 = ctx.$implicit;
    const param_r6 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("value", v_r9)("selected", ctx_r0.getOverrideValue(param_r6.name) === v_r9);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", v_r9, "", param_r6.unit ? " " + param_r6.unit : "", " ");
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "select", 57);
    \u0275\u0275listener("change", function ParameterReviewComponent_Conditional_15_For_18_Conditional_21_Template_select_change_0_listener($event) {
      \u0275\u0275restoreView(_r8);
      const param_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.onOverrideSelect(param_r6, $event));
    });
    \u0275\u0275elementStart(1, "option", 58);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(3, ParameterReviewComponent_Conditional_15_For_18_Conditional_21_For_4_Template, 2, 4, "option", 59, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const param_r6 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("ov-select--active", ctx_r0.hasOverride(param_r6.name))("ov-select--required", param_r6.isNotExtracted && !ctx_r0.hasOverride(param_r6.name));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(param_r6.isNotExtracted ? "\u2014 select \u2014" : "\u2014 keep \u2014");
    \u0275\u0275advance();
    \u0275\u0275repeater(param_r6.allowedValues);
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 60);
    \u0275\u0275listener("input", function ParameterReviewComponent_Conditional_15_For_18_Conditional_22_Template_input_input_0_listener($event) {
      \u0275\u0275restoreView(_r10);
      const param_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.onOverrideChange(param_r6, $event.target.value));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const param_r6 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("ov-input--active", ctx_r0.hasOverride(param_r6.name));
    \u0275\u0275property("placeholder", param_r6.isNotExtracted ? "Enter value" : "Override\u2026")("value", ctx_r0.getOverrideValue(param_r6.name));
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 61);
    \u0275\u0275listener("click", function ParameterReviewComponent_Conditional_15_For_18_Conditional_23_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r11);
      const param_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.onOverrideChange(param_r6, ""));
    });
    \u0275\u0275text(1, "\u2715");
    \u0275\u0275elementEnd();
  }
}
function ParameterReviewComponent_Conditional_15_For_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr", 38)(1, "td", 18)(2, "span", 39);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275template(4, ParameterReviewComponent_Conditional_15_For_18_Conditional_4_Template, 2, 0, "span", 40)(5, ParameterReviewComponent_Conditional_15_For_18_Conditional_5_Template, 2, 0, "span", 41);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "td", 19);
    \u0275\u0275template(7, ParameterReviewComponent_Conditional_15_For_18_Conditional_7_Template, 2, 0, "span", 42)(8, ParameterReviewComponent_Conditional_15_For_18_Conditional_8_Template, 3, 5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "td", 20);
    \u0275\u0275template(10, ParameterReviewComponent_Conditional_15_For_18_Conditional_10_Template, 2, 0, "span", 43)(11, ParameterReviewComponent_Conditional_15_For_18_Conditional_11_Template, 2, 0)(12, ParameterReviewComponent_Conditional_15_For_18_Conditional_12_Template, 2, 2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td", 21);
    \u0275\u0275template(14, ParameterReviewComponent_Conditional_15_For_18_Conditional_14_Template, 4, 5)(15, ParameterReviewComponent_Conditional_15_For_18_Conditional_15_Template, 2, 0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "td", 22);
    \u0275\u0275template(17, ParameterReviewComponent_Conditional_15_For_18_Conditional_17_Template, 2, 1, "span", 44)(18, ParameterReviewComponent_Conditional_15_For_18_Conditional_18_Template, 2, 0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "td", 23)(20, "div", 45);
    \u0275\u0275template(21, ParameterReviewComponent_Conditional_15_For_18_Conditional_21_Template, 5, 5, "select", 46)(22, ParameterReviewComponent_Conditional_15_For_18_Conditional_22_Template, 1, 4)(23, ParameterReviewComponent_Conditional_15_For_18_Conditional_23_Template, 2, 0, "button", 47);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const param_r6 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("row--flagged", param_r6.flaggedForReview && !param_r6.isNotExtracted)("row--missing", param_r6.isNotExtracted)("row--overridden", ctx_r0.hasOverride(param_r6.name));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(param_r6.displayLabel);
    \u0275\u0275advance();
    \u0275\u0275conditional(4, param_r6.flaggedForReview && !param_r6.isNotExtracted ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(5, param_r6.isAbbDefault ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(7, param_r6.isNotExtracted ? 7 : 8);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(10, param_r6.isNotExtracted ? 10 : param_r6.isAbbDefault ? 11 : 12);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(14, param_r6.extractionPath ? 14 : 15);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(17, param_r6.sourcePage > 0 ? 17 : 18);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(21, param_r6.allowedValues.length > 0 ? 21 : 22);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(23, ctx_r0.hasOverride(param_r6.name) ? 23 : -1);
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 25)(1, "div", 62)(2, "span", 63);
    \u0275\u0275text(3, " Source evidence \u2014 ");
    \u0275\u0275elementStart(4, "strong");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 64);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "button", 65);
    \u0275\u0275listener("click", function ParameterReviewComponent_Conditional_15_Conditional_19_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.clearEvidence());
    });
    \u0275\u0275text(9, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "blockquote", 66);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.selectedEvidence().name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Page ", ctx_r0.selectedEvidence().page, "");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r0.selectedEvidence().text);
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate1(" ", ctx_r0.instances().length, " installations detected \u2014 ");
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate1(" ", ctx_r0.overrideCount(), " override(s) pending ");
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u2713 Saved ");
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Saving\u2026 ");
  }
}
function ParameterReviewComponent_Conditional_15_Conditional_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Save & Continue \u2192 ");
  }
}
function ParameterReviewComponent_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275template(0, ParameterReviewComponent_Conditional_15_Conditional_0_Template, 6, 0, "div", 16);
    \u0275\u0275elementStart(1, "table", 17)(2, "thead")(3, "tr")(4, "th", 18);
    \u0275\u0275text(5, "Parameter");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th", 19);
    \u0275\u0275text(7, "Extracted Value");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th", 20);
    \u0275\u0275text(9, "Confidence");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th", 21);
    \u0275\u0275text(11, "Source");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th", 22);
    \u0275\u0275text(13, "Page");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th", 23);
    \u0275\u0275text(15, "Override");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "tbody");
    \u0275\u0275repeaterCreate(17, ParameterReviewComponent_Conditional_15_For_18_Template, 24, 15, "tr", 24, \u0275\u0275componentInstance().trackByName, true);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(19, ParameterReviewComponent_Conditional_15_Conditional_19_Template, 12, 3, "div", 25);
    \u0275\u0275elementStart(20, "div", 26)(21, "span", 27);
    \u0275\u0275template(22, ParameterReviewComponent_Conditional_15_Conditional_22_Template, 1, 1)(23, ParameterReviewComponent_Conditional_15_Conditional_23_Template, 1, 1)(24, ParameterReviewComponent_Conditional_15_Conditional_24_Template, 1, 0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "div", 28)(26, "button", 29);
    \u0275\u0275listener("click", function ParameterReviewComponent_Conditional_15_Template_button_click_26_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.downloadCsv());
    });
    \u0275\u0275text(27, " \u2193 Export CSV ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "button", 30);
    \u0275\u0275listener("click", function ParameterReviewComponent_Conditional_15_Template_button_click_28_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.saveAndContinue());
    });
    \u0275\u0275template(29, ParameterReviewComponent_Conditional_15_Conditional_29_Template, 1, 0)(30, ParameterReviewComponent_Conditional_15_Conditional_30_Template, 1, 0);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275conditional(0, ctx_r0.isMultiInstance() ? 0 : -1);
    \u0275\u0275advance(17);
    \u0275\u0275repeater(ctx_r0.parameters());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(19, ctx_r0.selectedEvidence() ? 19 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(22, ctx_r0.isMultiInstance() ? 22 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(23, ctx_r0.overrideCount() > 0 ? 23 : ctx_r0.savedOnce() ? 24 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275property("disabled", ctx_r0.isSaving());
    \u0275\u0275advance();
    \u0275\u0275conditional(29, ctx_r0.isSaving() ? 29 : 30);
  }
}
var ParameterReviewComponent = class _ParameterReviewComponent {
  constructor() {
    this.reviewState = inject(ReviewStateService);
    this.api = inject(PipelineApiService);
    this.router = inject(Router);
    this.destroyRef = inject(DestroyRef);
    this.instances = signal([]);
    this.selectedInstIdx = signal(0);
    this.loadState = signal("loading");
    this.errorMessage = signal(null);
    this.overrideValues = signal({});
    this.paramDefs = signal([]);
    this.paramDefsLoading = signal(true);
    this.paramDefsError = signal(null);
    this.isSaving = signal(false);
    this.saveError = signal(null);
    this.savedOnce = signal(false);
    this.isDirty = this.reviewState.isDirty;
    this.selectedEvidence = signal(null);
    this.isMultiInstance = computed(() => this.instances().length > 1);
    this.selectedInstance = computed(() => {
      const list = this.instances();
      if (!list.length)
        return null;
      const idx = this.selectedInstIdx();
      return list[idx] ?? list[0];
    });
    this.parameters = computed(() => {
      const inst = this.selectedInstance();
      if (!inst)
        return [];
      return this.buildRows(inst.parameters);
    });
    this.productName = this.reviewState.productName;
    this.flaggedCount = computed(() => this.parameters().filter((p) => p.flaggedForReview && !p.isNotExtracted).length);
    this.notExtractedCount = computed(() => this.parameters().filter((p) => p.isNotExtracted).length);
    this.overrideCount = computed(() => Object.values(this.overrideValues()).filter((v) => v.trim() !== "").length);
  }
  ngOnInit() {
    const docId = this.reviewState.documentId();
    if (!docId) {
      this.loadState.set("error");
      this.errorMessage.set("No document selected. Upload a package first.");
      return;
    }
    const family = this.reviewState.productFamily();
    this.api.getParameterDefinitions(family).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (defs) => {
        this.paramDefs.set(defs);
        this.paramDefsLoading.set(false);
      },
      error: (err) => {
        this.paramDefsLoading.set(false);
        this.paramDefsError.set(err?.message ?? "Could not load filter parameters from ABB API.");
      }
    });
    this.loadFromApi(docId);
  }
  loadFromApi(docId) {
    const cached = this.reviewState.cachedInstances();
    if (cached) {
      this.applyInstances(cached);
      return;
    }
    this.loadState.set("loading");
    this.api.getInstances(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (instances) => {
        this.reviewState.setCachedInstances(instances);
        this.applyInstances(instances);
      },
      error: () => {
        this.api.getParameters(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (params) => {
            this.reviewState.setCachedParameters(params);
            const fallbackInstance = {
              id: 0,
              instanceIndex: 1,
              instanceName: "Main Switchgear",
              location: "",
              parameters: params,
              topologySummary: null
            };
            this.reviewState.setCachedInstances([fallbackInstance]);
            this.applyInstances([fallbackInstance]);
          },
          error: (err) => {
            this.loadState.set("error");
            this.errorMessage.set(err.message ?? "Failed to load extracted parameters.");
          }
        });
      }
    });
  }
  applyInstances(instances) {
    this.instances.set(instances);
    const allParams = instances.flatMap((i) => i.parameters);
    this.reviewState.setCachedParameters(allParams);
    const map = {};
    this.reviewState.getOverrides().forEach((o) => {
      map[o.parameterName] = String(o.newValue);
    });
    this.overrideValues.set(map);
    this.loadState.set("loaded");
  }
  selectInstance(index) {
    this.selectedInstIdx.set(index);
  }
  buildRows(extracted) {
    const defs = this.paramDefs();
    if (defs.length === 0) {
      return extracted.map((p) => __spreadProps(__spreadValues({}, p), {
        displayLabel: this.camelToWords(p.name),
        allowedValues: [],
        isNotExtracted: false
      }));
    }
    const extractedMap = new Map(extracted.map((p) => [p.name, p]));
    const rows = defs.map((def) => {
      const found = extractedMap.get(def.key);
      if (found) {
        return __spreadProps(__spreadValues({}, found), { displayLabel: def.labelWithoutUnit, allowedValues: def.allowedValues, isNotExtracted: false });
      }
      return {
        name: def.key,
        value: "\u2014",
        unit: def.unit,
        confidenceIndex: 0,
        sourcePage: 0,
        flaggedForReview: true,
        isAbbDefault: false,
        extractionReason: "Not found in document",
        switchgearInstanceId: null,
        switchgearInstanceName: "",
        extractionPath: "",
        sourceText: "",
        sourceBoundingBox: "",
        deviationReason: "",
        displayLabel: def.labelWithoutUnit,
        allowedValues: def.allowedValues,
        isNotExtracted: true
      };
    });
    return [...rows.filter((r) => !r.isNotExtracted), ...rows.filter((r) => r.isNotExtracted)];
  }
  // -- Save & Continue -------------------------------------------------------
  saveAndContinue() {
    this.isSaving.set(true);
    this.saveError.set(null);
    const overrides = this.reviewState.getOverrides();
    const docId = this.reviewState.documentId();
    if (overrides.length === 0) {
      this.reviewState.markParametersSaved();
      this.isSaving.set(false);
      this.savedOnce.set(true);
      this.router.navigate(["/review/products"]);
      return;
    }
    const submission = {
      documentId: docId,
      parameterOverrides: overrides,
      resolvedDeviationIds: []
    };
    this.api.submitReview(submission).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.reviewState.markParametersSaved();
        this.isSaving.set(false);
        this.savedOnce.set(true);
        this.router.navigate(["/review/products"]);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.saveError.set(err.message ?? "Failed to save overrides. Please try again.");
      }
    });
  }
  // -- Override handling -----------------------------------------------------
  getOverrideValue(name) {
    return this.overrideValues()[name] ?? "";
  }
  onOverrideSelect(param, event) {
    this.onOverrideChange(param, event.target.value);
  }
  onOverrideChange(param, newValueStr) {
    this.overrideValues.update((map) => __spreadProps(__spreadValues({}, map), { [param.name]: newValueStr }));
    if (newValueStr.trim() === "") {
      this.reviewState.removeOverride(param.name);
      return;
    }
    const override = {
      parameterName: param.name,
      newValue: isNaN(Number(newValueStr)) ? newValueStr : Number(newValueStr),
      unit: param.unit,
      reviewerNote: null
    };
    this.reviewState.setOverride(override);
  }
  // -- Presentation helpers --------------------------------------------------
  confidenceClass(index) {
    if (index >= 0.85)
      return "badge--high";
    if (index >= 0.6)
      return "badge--medium";
    return "badge--low";
  }
  confidenceLabel(index) {
    if (index === 0)
      return "\u2014";
    return `${(index * 100).toFixed(0)}%`;
  }
  hasOverride(name) {
    const v = this.overrideValues()[name];
    return v !== void 0 && v.trim() !== "";
  }
  hasNormalizedHint(param) {
    return !!param.normalizedValue && param.normalizedValue.trim() !== "" && param.normalizedValue !== String(param.value);
  }
  trackByName(_index, param) {
    return param.name;
  }
  trackByIndex(index) {
    return index;
  }
  // -- Evidence panel --------------------------------------------------------
  showEvidence(param) {
    if (!param.sourceText)
      return;
    this.selectedEvidence.set({ name: param.name, text: param.sourceText, page: param.sourcePage });
  }
  clearEvidence() {
    this.selectedEvidence.set(null);
  }
  // -- Extraction path helpers -----------------------------------------------
  extractionPathLabel(path) {
    return { PathB: "RAG", PathC: "Vision", LLM: "LLM", Regex: "Regex" }[path] ?? path;
  }
  extractionPathClass(path) {
    return { PathB: "badge-path--rag", PathC: "badge-path--vision", LLM: "badge-path--llm", Regex: "badge-path--regex" }[path] ?? "";
  }
  downloadCsv() {
    const rows = this.parameters();
    const inst = this.selectedInstance();
    const overrides = this.overrideValues();
    const product = this.productName() ?? "Switchgear";
    const instanceName = inst?.instanceName ?? "";
    const headers = ["Parameter", "Extracted Value", "Override", "Confidence", "Source", "Page"];
    const csvRows = rows.map((p) => {
      const rawValue = p.isNotExtracted ? "" : `${p.value}${p.unit ? " " + p.unit : ""}`;
      const override = overrides[p.name] ?? "";
      const conf = p.isNotExtracted ? "" : p.confidenceIndex === 0 ? "" : `${(p.confidenceIndex * 100).toFixed(0)}%`;
      const source = p.extractionPath ? this.extractionPathLabel(p.extractionPath) : "";
      const page = p.sourcePage > 0 ? `p.${p.sourcePage}` : "";
      return [p.displayLabel, rawValue, override, conf, source, page];
    });
    const escape = (v) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      `# Product: ${product}  Installation: ${instanceName}`,
      headers.map(escape).join(","),
      ...csvRows.map((r) => r.map(escape).join(","))
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parameters_${product.replace(/\s+/g, "_")}_${instanceName.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  camelToWords(name) {
    return name.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
  }
  static {
    this.\u0275fac = function ParameterReviewComponent_Factory(t) {
      return new (t || _ParameterReviewComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ParameterReviewComponent, selectors: [["app-parameter-review"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 16, vars: 7, consts: [[1, "param-review-page"], [1, "page-header"], [1, "page-title"], [1, "page-sub"], [1, "product-badge"], [1, "header-actions"], [1, "defs-loading"], [1, "defs-error", 3, "title"], [1, "save-error"], [1, "skeleton-block"], [1, "error-msg"], [1, "skeleton-row"], [1, "sk", "sk--name"], [1, "sk", "sk--value"], [1, "sk", "sk--badge"], [1, "sk", "sk--input"], [1, "instance-tabs-wrapper"], [1, "param-table"], [1, "col-name"], [1, "col-value"], [1, "col-conf"], [1, "col-path"], [1, "col-page"], [1, "col-override"], [1, "param-row", 3, "row--flagged", "row--missing", "row--overridden"], ["role", "region", "aria-label", "Source evidence", 1, "evidence-panel"], [1, "footer"], [1, "footer-info"], [1, "footer-btns"], ["type", "button", "title", "Download parameters as CSV", 1, "btn-csv", 3, "click"], ["type", "button", 1, "btn-save", 3, "click", "disabled"], [1, "instance-tabs-label"], ["role", "tablist", 1, "instance-tabs"], ["role", "tab", 1, "instance-tab", 3, "instance-tab--active"], ["role", "tab", 1, "instance-tab", 3, "click"], [1, "tab-index"], [1, "tab-name"], [1, "tab-loc"], [1, "param-row"], [1, "p-name"], ["title", "Low confidence", 1, "dot", "dot--warn"], ["title", "ABB default", 1, "dot", "dot--default"], [1, "val", "val--missing"], [1, "badge", "badge--none"], [1, "page-badge"], [1, "ov-cell"], [1, "ov-select", 3, "ov-select--active", "ov-select--required"], ["type", "button", 1, "clr-btn"], [1, "val"], [1, "val-normalized", 3, "title"], [1, "badge", "badge--default"], [1, "badge", 3, "ngClass"], [1, "badge-path", 3, "ngClass", "title"], [1, "conflict-icon", 3, "title"], ["type", "button", "title", "Show source text", 1, "btn-evidence"], ["type", "button", "title", "Show source text", 1, "btn-evidence", 3, "click"], [1, "text-dim"], [1, "ov-select", 3, "change"], ["value", ""], [3, "value", "selected"], ["type", "text", 1, "ov-input", 3, "input", "placeholder", "value"], ["type", "button", 1, "clr-btn", 3, "click"], [1, "evidence-header"], [1, "evidence-title"], [1, "evidence-page"], ["type", "button", "aria-label", "Close evidence", 1, "evidence-close", 3, "click"], [1, "evidence-text"]], template: function ParameterReviewComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div")(3, "h2", 2);
        \u0275\u0275text(4, "Configuration Parameters");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(5, "p", 3);
        \u0275\u0275text(6, " Review extracted values and set overrides before continuing. ");
        \u0275\u0275elementStart(7, "span", 4);
        \u0275\u0275text(8);
        \u0275\u0275elementEnd()()();
        \u0275\u0275elementStart(9, "div", 5);
        \u0275\u0275template(10, ParameterReviewComponent_Conditional_10_Template, 2, 0, "span", 6)(11, ParameterReviewComponent_Conditional_11_Template, 2, 1, "span", 7)(12, ParameterReviewComponent_Conditional_12_Template, 2, 1, "span", 8);
        \u0275\u0275elementEnd()();
        \u0275\u0275template(13, ParameterReviewComponent_Conditional_13_Template, 3, 1, "div", 9)(14, ParameterReviewComponent_Conditional_14_Template, 2, 1, "p", 10)(15, ParameterReviewComponent_Conditional_15_Template, 31, 6);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        \u0275\u0275advance(8);
        \u0275\u0275textInterpolate(ctx.productName());
        \u0275\u0275advance(2);
        \u0275\u0275conditional(10, ctx.paramDefsLoading() ? 10 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(11, ctx.paramDefsError() ? 11 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(12, ctx.saveError() ? 12 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(13, ctx.loadState() === "loading" ? 13 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(14, ctx.loadState() === "error" ? 14 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(15, ctx.loadState() === "loaded" ? 15 : -1);
      }
    }, dependencies: [CommonModule, NgClass, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption], styles: ["\n\n.param-review-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  flex-shrink: 0;\n}\n.page-title[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  font-weight: 700;\n  margin: 0 0 0.15rem;\n  color: #1a1a1a;\n}\n.page-sub[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.8rem;\n  color: #757575;\n}\n.product-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  margin-left: 0.5rem;\n  padding: 0.1rem 0.5rem;\n  background: #e3f2fd;\n  color: #1565c0;\n  border: 1px solid #90caf9;\n  border-radius: 20px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  vertical-align: middle;\n}\n.save-error[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: #c62828;\n  white-space: nowrap;\n}\n.defs-loading[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #888;\n  font-style: italic;\n  white-space: nowrap;\n}\n.defs-error[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #e65100;\n  white-space: nowrap;\n  cursor: help;\n}\n.instance-tabs-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.6rem;\n  flex-wrap: wrap;\n  padding: 0.5rem 0 0.25rem;\n  border-bottom: 2px solid #e0e0e0;\n  margin-bottom: 0.25rem;\n}\n.instance-tabs-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: #757575;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  padding-top: 0.35rem;\n  white-space: nowrap;\n}\n.instance-tabs[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.35rem;\n}\n.instance-tab[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 0.3rem 0.85rem;\n  background: #f5f5f5;\n  border: 1.5px solid #d0d0d0;\n  border-bottom: none;\n  border-radius: 4px 4px 0 0;\n  cursor: pointer;\n  font-size: 0.78rem;\n  color: #555;\n  transition: background 0.1s, border-color 0.1s;\n  line-height: 1.3;\n  position: relative;\n  bottom: -2px;\n}\n.instance-tab[_ngcontent-%COMP%]:hover {\n  background: #fff;\n  border-color: #bbb;\n  color: #1a1a1a;\n}\n.instance-tab--active[_ngcontent-%COMP%] {\n  background: #fff;\n  border-color: #cc0000;\n  border-bottom: 2px solid #fff;\n  color: #1a1a1a;\n}\n.instance-tab--active[_ngcontent-%COMP%]   .tab-index[_ngcontent-%COMP%] {\n  background: #cc0000;\n  color: #fff;\n}\n.tab-index[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 1.3em;\n  height: 1.3em;\n  border-radius: 50%;\n  background: #bdbdbd;\n  color: #fff;\n  font-size: 0.68rem;\n  font-weight: 700;\n  margin-bottom: 1px;\n}\n.tab-name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 0.78rem;\n  color: inherit;\n}\n.tab-loc[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: #9e9e9e;\n}\n.param-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.82rem;\n  border: 1px solid #e0e0e0;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.param-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], .param-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 0.38rem 0.75rem;\n  text-align: left;\n  border-bottom: 1px solid #f0f0f0;\n  vertical-align: middle;\n}\n.param-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #1a1a1a;\n  color: #fff;\n  font-size: 0.72rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  white-space: nowrap;\n  border-bottom: 2px solid #cc0000;\n}\n.col-name[_ngcontent-%COMP%] {\n  width: 18%;\n}\n.col-value[_ngcontent-%COMP%] {\n  width: 18%;\n}\n.col-conf[_ngcontent-%COMP%] {\n  width: 10%;\n}\n.col-path[_ngcontent-%COMP%] {\n  width: 10%;\n  text-align: center;\n}\n.col-page[_ngcontent-%COMP%] {\n  width: 6%;\n  text-align: center;\n}\n.col-override[_ngcontent-%COMP%] {\n  width: 38%;\n}\n.param-row[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%] {\n  border-bottom: none;\n}\n.param-row[_ngcontent-%COMP%]:hover {\n  background: #fafafa;\n}\n.param-row.row--flagged[_ngcontent-%COMP%] {\n  background: #fffaf5;\n}\n.param-row.row--missing[_ngcontent-%COMP%] {\n  background: #f8f8f8;\n  color: #9e9e9e;\n}\n.param-row.row--overridden[_ngcontent-%COMP%]   td.col-value[_ngcontent-%COMP%] {\n  opacity: 0.6;\n}\n.p-name[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: #212121;\n  margin-right: 0.3rem;\n}\n.dot[_ngcontent-%COMP%] {\n  font-size: 0.55rem;\n  vertical-align: middle;\n}\n.dot--warn[_ngcontent-%COMP%] {\n  color: #e65100;\n}\n.dot--default[_ngcontent-%COMP%] {\n  color: #1565c0;\n}\n.val[_ngcontent-%COMP%] {\n  color: #212121;\n}\n.val--struck[_ngcontent-%COMP%] {\n  text-decoration: line-through;\n  opacity: 0.5;\n}\n.val--missing[_ngcontent-%COMP%] {\n  color: #bdbdbd;\n}\n.val-normalized[_ngcontent-%COMP%] {\n  display: inline-block;\n  margin-left: 4px;\n  font-size: 0.78rem;\n  color: #1565c0;\n  font-style: italic;\n  white-space: nowrap;\n}\n.badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 1px 7px;\n  border-radius: 10px;\n  font-size: 0.72rem;\n  font-weight: 600;\n  white-space: nowrap;\n}\n.badge--high[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  color: #2e7d32;\n}\n.badge--medium[_ngcontent-%COMP%] {\n  background: #fff8e1;\n  color: #f57f17;\n}\n.badge--low[_ngcontent-%COMP%] {\n  background: #ffebee;\n  color: #c62828;\n}\n.badge--default[_ngcontent-%COMP%] {\n  background: #e3f2fd;\n  color: #1565c0;\n}\n.badge--none[_ngcontent-%COMP%] {\n  color: #bdbdbd;\n}\n.ov-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n}\n.ov-select[_ngcontent-%COMP%] {\n  flex: 1;\n  max-width: 200px;\n  padding: 0.28rem 0.4rem;\n  border: 1px solid #d0d0d0;\n  border-radius: 3px;\n  font-size: 0.8rem;\n  background: #fff;\n  color: #212121;\n  cursor: pointer;\n}\n.ov-select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #cc0000;\n  box-shadow: 0 0 0 2px rgba(204, 0, 0, 0.1);\n}\n.ov-select--active[_ngcontent-%COMP%] {\n  border-color: #cc0000;\n  background: #fff8f8;\n  color: #990000;\n  font-weight: 600;\n}\n.ov-select--required[_ngcontent-%COMP%] {\n  border: 1.5px dashed #cc0000;\n  background: #fff8f8;\n}\n.ov-input[_ngcontent-%COMP%] {\n  flex: 1;\n  max-width: 200px;\n  padding: 0.28rem 0.4rem;\n  border: 1px solid #d0d0d0;\n  border-radius: 3px;\n  font-size: 0.8rem;\n  background: #fff;\n  color: #212121;\n}\n.ov-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #cc0000;\n  box-shadow: 0 0 0 2px rgba(204, 0, 0, 0.1);\n}\n.ov-input--active[_ngcontent-%COMP%] {\n  border-color: #cc0000;\n  background: #fff8f8;\n  color: #990000;\n  font-weight: 600;\n}\n.clr-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #bdbdbd;\n  cursor: pointer;\n  font-size: 0.72rem;\n  padding: 2px 5px;\n  border-radius: 3px;\n  line-height: 1;\n}\n.clr-btn[_ngcontent-%COMP%]:hover {\n  background: #ffebee;\n  color: #c62828;\n}\n.footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0.6rem 0.25rem 0.25rem;\n  border-top: 1px solid #e0e0e0;\n}\n.footer-info[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #757575;\n}\n.footer-btns[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n}\n.btn-csv[_ngcontent-%COMP%] {\n  padding: 0.4rem 1rem;\n  background: #fff;\n  color: #444;\n  border: 1px solid #bbb;\n  border-radius: 4px;\n  font-size: 0.84rem;\n  font-weight: 500;\n  cursor: pointer;\n  transition: background 0.15s, border-color 0.15s;\n}\n.btn-csv[_ngcontent-%COMP%]:hover {\n  background: #f5f5f5;\n  border-color: #888;\n}\n.btn-save[_ngcontent-%COMP%] {\n  padding: 0.4rem 1.2rem;\n  background: #cc0000;\n  color: #fff;\n  border: none;\n  border-radius: 4px;\n  font-size: 0.84rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.btn-save[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #990000;\n}\n.btn-save[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.skeleton-block[_ngcontent-%COMP%] {\n  border: 1px solid #f0f0f0;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.skeleton-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  padding: 0.5rem 0.75rem;\n  border-bottom: 1px solid #f5f5f5;\n}\n.skeleton-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.sk[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #e0e0e0 25%,\n      #eeeeee 50%,\n      #e0e0e0 75%);\n  background-size: 200% 100%;\n  animation: _ngcontent-%COMP%_shimmer 1.4s infinite;\n  border-radius: 3px;\n  height: 16px;\n}\n.sk--name[_ngcontent-%COMP%] {\n  width: 22%;\n}\n.sk--value[_ngcontent-%COMP%] {\n  width: 20%;\n}\n.sk--badge[_ngcontent-%COMP%] {\n  width: 10%;\n}\n.sk--input[_ngcontent-%COMP%] {\n  width: 35%;\n  margin-left: auto;\n}\n@keyframes _ngcontent-%COMP%_shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n.error-msg[_ngcontent-%COMP%] {\n  font-size: 0.84rem;\n  color: #c62828;\n  margin: 0;\n}\n.badge-path[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 1px 6px;\n  border-radius: 4px;\n  font-size: 0.68rem;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.badge-path--rag[_ngcontent-%COMP%] {\n  background: #e3f0ff;\n  color: #1558d6;\n}\n.badge-path--vision[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  color: #2e7d32;\n}\n.badge-path--llm[_ngcontent-%COMP%] {\n  background: #fff3e0;\n  color: #e65100;\n}\n.badge-path--regex[_ngcontent-%COMP%] {\n  background: #f3e5f5;\n  color: #6a1b9a;\n}\n.conflict-icon[_ngcontent-%COMP%] {\n  margin-left: 3px;\n  font-size: 0.7rem;\n  cursor: help;\n  vertical-align: middle;\n}\n.btn-evidence[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  cursor: pointer;\n  font-size: 0.7rem;\n  padding: 0 2px;\n  margin-left: 2px;\n  vertical-align: middle;\n  opacity: 0.7;\n}\n.btn-evidence[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n.page-badge[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: #666;\n  font-family: monospace;\n}\n.text-dim[_ngcontent-%COMP%] {\n  color: #bdbdbd;\n  font-size: 0.75rem;\n}\n.evidence-panel[_ngcontent-%COMP%] {\n  margin-top: 0.5rem;\n  padding: 0.75rem 1rem;\n  background: #fafafa;\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  border-left: 4px solid #1558d6;\n}\n.evidence-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.evidence-title[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 600;\n  color: #333;\n}\n.evidence-page[_ngcontent-%COMP%] {\n  margin-left: 0.5rem;\n  font-size: 0.7rem;\n  color: #888;\n  font-weight: 400;\n}\n.evidence-close[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  cursor: pointer;\n  font-size: 0.9rem;\n  color: #999;\n  padding: 0 4px;\n  line-height: 1;\n}\n.evidence-close[_ngcontent-%COMP%]:hover {\n  color: #c62828;\n}\n.evidence-text[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0.5rem 0.75rem;\n  background: #fff;\n  border-left: 3px solid #e0e0e0;\n  font-family: monospace;\n  font-size: 0.75rem;\n  color: #444;\n  white-space: pre-wrap;\n  word-break: break-word;\n  line-height: 1.5;\n}\n/*# sourceMappingURL=parameter-review.component.css.map */"], changeDetection: 0 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ParameterReviewComponent, { className: "ParameterReviewComponent", filePath: "src\\app\\components\\parameter-review\\parameter-review.component.ts", lineNumber: 34 });
})();
export {
  ParameterReviewComponent
};
//# sourceMappingURL=chunk-NFTRBNJ6.js.map
