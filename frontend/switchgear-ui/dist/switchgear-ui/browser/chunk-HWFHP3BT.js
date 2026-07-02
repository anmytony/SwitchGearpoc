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
  computed,
  inject,
  signal,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassMapInterpolate1,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpropertyInterpolate,
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

// src/app/components/lineup/cubicle-device-details.component.ts
function CubicleDeviceDetailsComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1)(1, "p");
    \u0275\u0275text(2, "Select a panel to view device parameters");
    \u0275\u0275elementEnd()();
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 3);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.cubicle.functionalPosition);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 4);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.cubicle.panelType);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Breaking Capacity");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 15);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.circuitBreaker.breakingCapacity.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.circuitBreaker.breakingCapacity.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.circuitBreaker.breakingCapacity.confidence), " ");
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Making Capacity");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 15);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.circuitBreaker.makingCapacity.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.circuitBreaker.makingCapacity.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.circuitBreaker.makingCapacity.confidence), " ");
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Mechanism");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.circuitBreaker.mechanismType.value);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Conditional_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Poles");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.circuitBreaker.numberOfPoles.value);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 9)(2, "span", 10);
    \u0275\u0275text(3, "Circuit Breaker");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 11)(5, "div", 12)(6, "label");
    \u0275\u0275text(7, "Model");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 13)(9, "span", 14);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 15);
    \u0275\u0275text(12);
    \u0275\u0275elementStart(13, "span", 16);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "span", 17);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(17, "div", 12)(18, "label");
    \u0275\u0275text(19, "Rating");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "div", 13)(21, "span", 14);
    \u0275\u0275text(22);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "span", 15);
    \u0275\u0275text(24);
    \u0275\u0275elementStart(25, "span", 16);
    \u0275\u0275text(26);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275template(27, CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Conditional_27_Template, 8, 3, "div", 12)(28, CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Conditional_28_Template, 8, 3, "div", 12)(29, CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Conditional_29_Template, 6, 1, "div", 12)(30, CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Conditional_30_Template, 6, 1, "div", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.circuitBreaker.model.value || "\u2014");
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.circuitBreaker.model.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.circuitBreaker.model.confidence), " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("(", (ctx_r0.cubicle.circuitBreaker.model.confidence * 100).toFixed(0), "%)");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.circuitBreaker.model.source);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.circuitBreaker.rating.value || "\u2014");
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.circuitBreaker.rating.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.circuitBreaker.rating.confidence), " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("(", (ctx_r0.cubicle.circuitBreaker.rating.confidence * 100).toFixed(0), "%)");
    \u0275\u0275advance();
    \u0275\u0275conditional(27, (ctx_r0.cubicle.circuitBreaker.breakingCapacity == null ? null : ctx_r0.cubicle.circuitBreaker.breakingCapacity.value) ? 27 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(28, (ctx_r0.cubicle.circuitBreaker.makingCapacity == null ? null : ctx_r0.cubicle.circuitBreaker.makingCapacity.value) ? 28 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(29, (ctx_r0.cubicle.circuitBreaker.mechanismType == null ? null : ctx_r0.cubicle.circuitBreaker.mechanismType.value) ? 29 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(30, (ctx_r0.cubicle.circuitBreaker.numberOfPoles == null ? null : ctx_r0.cubicle.circuitBreaker.numberOfPoles.value) ? 30 : -1);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_7_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Accuracy Class");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 15);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.currentTransformer.accuracyClass.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.currentTransformer.accuracyClass.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.currentTransformer.accuracyClass.confidence), " ");
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_7_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Burden");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.currentTransformer.burden.value);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_7_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Core Type");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.currentTransformer.coreType.value);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 9)(2, "span", 10);
    \u0275\u0275text(3, "Current Transformer (CT)");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 11)(5, "div", 12)(6, "label");
    \u0275\u0275text(7, "Ratio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 13)(9, "span", 14);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 15);
    \u0275\u0275text(12);
    \u0275\u0275elementStart(13, "span", 16);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "span", 17);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(17, CubicleDeviceDetailsComponent_Conditional_2_Conditional_7_Conditional_17_Template, 8, 3, "div", 12)(18, CubicleDeviceDetailsComponent_Conditional_2_Conditional_7_Conditional_18_Template, 6, 1, "div", 12)(19, CubicleDeviceDetailsComponent_Conditional_2_Conditional_7_Conditional_19_Template, 6, 1, "div", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.currentTransformer.ratio.value || "\u2014");
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.currentTransformer.ratio.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.currentTransformer.ratio.confidence), " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("(", (ctx_r0.cubicle.currentTransformer.ratio.confidence * 100).toFixed(0), "%)");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.currentTransformer.ratio.source);
    \u0275\u0275advance();
    \u0275\u0275conditional(17, (ctx_r0.cubicle.currentTransformer.accuracyClass == null ? null : ctx_r0.cubicle.currentTransformer.accuracyClass.value) ? 17 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(18, (ctx_r0.cubicle.currentTransformer.burden == null ? null : ctx_r0.cubicle.currentTransformer.burden.value) ? 18 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(19, (ctx_r0.cubicle.currentTransformer.coreType == null ? null : ctx_r0.cubicle.currentTransformer.coreType.value) ? 19 : -1);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_8_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Accuracy Class");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 15);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.voltageTransformer.accuracyClass.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.voltageTransformer.accuracyClass.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.voltageTransformer.accuracyClass.confidence), " ");
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_8_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Burden");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.voltageTransformer.burden.value);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_8_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Insulation Level");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.voltageTransformer.insulationLevel.value);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 9)(2, "span", 10);
    \u0275\u0275text(3, "Voltage Transformer (VT)");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 11)(5, "div", 12)(6, "label");
    \u0275\u0275text(7, "Ratio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 13)(9, "span", 14);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 15);
    \u0275\u0275text(12);
    \u0275\u0275elementStart(13, "span", 16);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "span", 17);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(17, CubicleDeviceDetailsComponent_Conditional_2_Conditional_8_Conditional_17_Template, 8, 3, "div", 12)(18, CubicleDeviceDetailsComponent_Conditional_2_Conditional_8_Conditional_18_Template, 6, 1, "div", 12)(19, CubicleDeviceDetailsComponent_Conditional_2_Conditional_8_Conditional_19_Template, 6, 1, "div", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.voltageTransformer.ratio.value || "\u2014");
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.voltageTransformer.ratio.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.voltageTransformer.ratio.confidence), " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("(", (ctx_r0.cubicle.voltageTransformer.ratio.confidence * 100).toFixed(0), "%)");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.voltageTransformer.ratio.source);
    \u0275\u0275advance();
    \u0275\u0275conditional(17, (ctx_r0.cubicle.voltageTransformer.accuracyClass == null ? null : ctx_r0.cubicle.voltageTransformer.accuracyClass.value) ? 17 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(18, (ctx_r0.cubicle.voltageTransformer.burden == null ? null : ctx_r0.cubicle.voltageTransformer.burden.value) ? 18 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(19, (ctx_r0.cubicle.voltageTransformer.insulationLevel == null ? null : ctx_r0.cubicle.voltageTransformer.insulationLevel.value) ? 19 : -1);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_17_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 19);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const func_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(func_r2);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Protection Functions");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "div", 18);
    \u0275\u0275repeaterCreate(5, CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_17_For_6_Template, 2, 1, "span", 19, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 15);
    \u0275\u0275text(8);
    \u0275\u0275elementStart(9, "span", 16);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "span", 17);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r0.cubicle.protectionRelay.protectionFunctions);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.protectionRelay.protectionFunctionsConfidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.protectionRelay.protectionFunctionsConfidence), " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("(", (ctx_r0.cubicle.protectionRelay.protectionFunctionsConfidence * 100).toFixed(0), "%)");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.protectionRelay.protectionFunctionsSource);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Aux Voltage");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.protectionRelay.auxVoltage.value);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_19_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const proto_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(proto_r3);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Communication");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "div", 18);
    \u0275\u0275repeaterCreate(5, CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_19_For_6_Template, 2, 1, "span", 20, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r0.cubicle.protectionRelay.communicationProtocol);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 9)(2, "span", 10);
    \u0275\u0275text(3, "Protection Relay");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 11)(5, "div", 12)(6, "label");
    \u0275\u0275text(7, "Model");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 13)(9, "span", 14);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 15);
    \u0275\u0275text(12);
    \u0275\u0275elementStart(13, "span", 16);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "span", 17);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(17, CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_17_Template, 13, 4, "div", 12)(18, CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_18_Template, 6, 1, "div", 12)(19, CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Conditional_19_Template, 7, 0, "div", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.protectionRelay.model.value || "\u2014");
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.protectionRelay.model.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.protectionRelay.model.confidence), " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("(", (ctx_r0.cubicle.protectionRelay.model.confidence * 100).toFixed(0), "%)");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.protectionRelay.model.source);
    \u0275\u0275advance();
    \u0275\u0275conditional(17, ctx_r0.cubicle.protectionRelay.protectionFunctions && ctx_r0.cubicle.protectionRelay.protectionFunctions.length > 0 ? 17 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(18, (ctx_r0.cubicle.protectionRelay.auxVoltage == null ? null : ctx_r0.cubicle.protectionRelay.auxVoltage.value) ? 18 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(19, ctx_r0.cubicle.protectionRelay.communicationProtocol && ctx_r0.cubicle.protectionRelay.communicationProtocol.length > 0 ? 19 : -1);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_10_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Count");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 15);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.disconnector.count.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.disconnector.count.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.disconnector.count.confidence), " ");
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_10_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Operating Mode");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.disconnector.operatingMode.value);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 9)(2, "span", 10);
    \u0275\u0275text(3, "Disconnector / Isolator");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 11);
    \u0275\u0275template(5, CubicleDeviceDetailsComponent_Conditional_2_Conditional_10_Conditional_5_Template, 8, 3, "div", 12)(6, CubicleDeviceDetailsComponent_Conditional_2_Conditional_10_Conditional_6_Template, 6, 1, "div", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275conditional(5, (ctx_r0.cubicle.disconnector.count == null ? null : ctx_r0.cubicle.disconnector.count.value) ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(6, (ctx_r0.cubicle.disconnector.operatingMode == null ? null : ctx_r0.cubicle.disconnector.operatingMode.value) ? 6 : -1);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_11_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "ID");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 13)(4, "span", 14);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 15);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.earthingSwitch.id.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.earthingSwitch.id.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.earthingSwitch.id.confidence), " ");
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7)(1, "div", 9)(2, "span", 10);
    \u0275\u0275text(3, "Earthing Switch");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 21);
    \u0275\u0275text(5, "Present");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 11);
    \u0275\u0275template(7, CubicleDeviceDetailsComponent_Conditional_2_Conditional_11_Conditional_7_Template, 8, 3, "div", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(7);
    \u0275\u0275conditional(7, (ctx_r0.cubicle.earthingSwitch.id == null ? null : ctx_r0.cubicle.earthingSwitch.id.value) ? 7 : -1);
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7)(1, "div", 9)(2, "span", 10);
    \u0275\u0275text(3, "Surge Arrester");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 21);
    \u0275\u0275text(5, "Present");
    \u0275\u0275elementEnd()()();
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 9)(2, "span", 10);
    \u0275\u0275text(3, "Auxiliary / Control");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 11)(5, "div", 12)(6, "label");
    \u0275\u0275text(7, "Control Voltage");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 13)(9, "span", 14);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 15);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(ctx_r0.cubicle.auxiliary.controlVoltage.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.confidenceClass(ctx_r0.cubicle.auxiliary.controlVoltage.confidence));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.confidenceLabel(ctx_r0.cubicle.auxiliary.controlVoltage.confidence), " ");
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8)(1, "p");
    \u0275\u0275text(2, "No device parameters were extracted for this panel.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 22);
    \u0275\u0275text(4, "Detailed parameters (CT/VT ratios, relay model) are extracted from SLD images and cubicle schedule tables.");
    \u0275\u0275elementEnd()();
  }
}
function CubicleDeviceDetailsComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2)(1, "h3");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275template(3, CubicleDeviceDetailsComponent_Conditional_2_Conditional_3_Template, 2, 1, "p", 3)(4, CubicleDeviceDetailsComponent_Conditional_2_Conditional_4_Template, 2, 1, "span", 4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 5);
    \u0275\u0275template(6, CubicleDeviceDetailsComponent_Conditional_2_Conditional_6_Template, 31, 13, "div", 6)(7, CubicleDeviceDetailsComponent_Conditional_2_Conditional_7_Template, 20, 8, "div", 6)(8, CubicleDeviceDetailsComponent_Conditional_2_Conditional_8_Template, 20, 8, "div", 6)(9, CubicleDeviceDetailsComponent_Conditional_2_Conditional_9_Template, 20, 8, "div", 6)(10, CubicleDeviceDetailsComponent_Conditional_2_Conditional_10_Template, 7, 2, "div", 6)(11, CubicleDeviceDetailsComponent_Conditional_2_Conditional_11_Template, 8, 1, "div", 7)(12, CubicleDeviceDetailsComponent_Conditional_2_Conditional_12_Template, 6, 0, "div", 7)(13, CubicleDeviceDetailsComponent_Conditional_2_Conditional_13_Template, 13, 3, "div", 6)(14, CubicleDeviceDetailsComponent_Conditional_2_Conditional_14_Template, 5, 0, "div", 8);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate((tmp_1_0 = ctx_r0.panelLabel) !== null && tmp_1_0 !== void 0 ? tmp_1_0 : "Panel " + ctx_r0.cubicle.position);
    \u0275\u0275advance();
    \u0275\u0275conditional(3, ctx_r0.cubicle.functionalPosition ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(4, ctx_r0.cubicle.panelType ? 4 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(6, ctx_r0.cubicle.circuitBreaker.model.value || ctx_r0.cubicle.circuitBreaker.rating.value || (ctx_r0.cubicle.circuitBreaker.breakingCapacity == null ? null : ctx_r0.cubicle.circuitBreaker.breakingCapacity.value) ? 6 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(7, ctx_r0.cubicle.currentTransformer.ratio.value ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(8, ctx_r0.cubicle.voltageTransformer.ratio.value ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(9, ctx_r0.cubicle.protectionRelay.model.value ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(10, (ctx_r0.cubicle.disconnector == null ? null : ctx_r0.cubicle.disconnector.count == null ? null : ctx_r0.cubicle.disconnector.count.value) || (ctx_r0.cubicle.disconnector == null ? null : ctx_r0.cubicle.disconnector.operatingMode == null ? null : ctx_r0.cubicle.disconnector.operatingMode.value) ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(11, (ctx_r0.cubicle.earthingSwitch == null ? null : ctx_r0.cubicle.earthingSwitch.present) ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(12, (ctx_r0.cubicle.surgeArrester == null ? null : ctx_r0.cubicle.surgeArrester.present) ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(13, (ctx_r0.cubicle.auxiliary == null ? null : ctx_r0.cubicle.auxiliary.controlVoltage == null ? null : ctx_r0.cubicle.auxiliary.controlVoltage.value) ? 13 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(14, !ctx_r0.hasData() ? 14 : -1);
  }
}
var CubicleDeviceDetailsComponent = class _CubicleDeviceDetailsComponent {
  constructor() {
    this.cubicle = null;
    this.recommendedDevices = [];
    this.panelLabel = null;
  }
  confidenceClass(confidence) {
    if (confidence >= 0.95)
      return "confidence-high";
    if (confidence >= 0.8)
      return "confidence-medium";
    return "confidence-low";
  }
  confidenceLabel(confidence) {
    if (confidence >= 0.95)
      return "High";
    if (confidence >= 0.8)
      return "Medium";
    return "Low";
  }
  hasData() {
    return this.cubicle !== null && (!!this.cubicle.circuitBreaker?.model?.value || !!this.cubicle.circuitBreaker?.rating?.value || !!this.cubicle.circuitBreaker?.breakingCapacity?.value || !!this.cubicle.currentTransformer?.ratio?.value || !!this.cubicle.voltageTransformer?.ratio?.value || !!this.cubicle.protectionRelay?.model?.value || !!this.cubicle.disconnector?.count?.value || !!this.cubicle.earthingSwitch?.present || !!this.cubicle.surgeArrester?.present || !!this.cubicle.auxiliary?.controlVoltage?.value);
  }
  static {
    this.\u0275fac = function CubicleDeviceDetailsComponent_Factory(t) {
      return new (t || _CubicleDeviceDetailsComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CubicleDeviceDetailsComponent, selectors: [["app-cubicle-device-details"]], inputs: { cubicle: "cubicle", recommendedDevices: "recommendedDevices", panelLabel: "panelLabel" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 3, vars: 1, consts: [[1, "device-details-panel"], [1, "empty-state"], [1, "device-details-header"], [1, "functional-pos"], [1, "panel-type-badge"], [1, "device-cards"], [1, "device-card"], [1, "device-card", "device-card--present"], [1, "no-data-notice"], [1, "card-header"], [1, "card-title"], [1, "card-body"], [1, "param-row"], [1, "param-value"], [1, "value"], [1, "confidence-badge", 3, "ngClass"], [1, "score"], [1, "source-label"], [1, "protection-functions"], [1, "prot-badge"], [1, "prot-badge", "prot-badge--comm"], [1, "present-badge"], [1, "no-data-hint"]], template: function CubicleDeviceDetailsComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0);
        \u0275\u0275template(1, CubicleDeviceDetailsComponent_Conditional_1_Template, 3, 0, "div", 1)(2, CubicleDeviceDetailsComponent_Conditional_2_Template, 15, 12);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        \u0275\u0275advance();
        \u0275\u0275conditional(1, !ctx.cubicle ? 1 : 2);
      }
    }, dependencies: [CommonModule, NgClass], styles: ["\n\n.device-details-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1.5rem;\n  background: #fafafa;\n  border-radius: 8px;\n  height: 100%;\n  overflow-y: auto;\n}\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  color: #999;\n  font-style: italic;\n  text-align: center;\n}\n.device-details-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  gap: 0.75rem;\n  padding-bottom: 1rem;\n  border-bottom: 2px solid #e0e0e0;\n  margin-bottom: 0.5rem;\n}\n.device-details-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.4rem;\n  font-weight: 600;\n  color: #333;\n}\n.device-details-header[_ngcontent-%COMP%]   .functional-pos[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.95rem;\n  color: #666;\n  font-weight: 500;\n}\n.device-details-header[_ngcontent-%COMP%]   .panel-type-badge[_ngcontent-%COMP%] {\n  background: #e3f2fd;\n  color: #1565c0;\n  padding: 0.3rem 0.7rem;\n  border-radius: 4px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  margin-left: auto;\n}\n.device-cards[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.device-card[_ngcontent-%COMP%] {\n  background: white;\n  border: 1px solid #d0d0d0;\n  border-radius: 6px;\n  overflow: hidden;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);\n}\n.device-card[_ngcontent-%COMP%]   .card-header[_ngcontent-%COMP%] {\n  background: #f5f5f5;\n  padding: 0.75rem 1rem;\n  border-bottom: 1px solid #e0e0e0;\n}\n.device-card[_ngcontent-%COMP%]   .card-header[_ngcontent-%COMP%]   .card-title[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 0.95rem;\n  color: #333;\n  margin: 0;\n}\n.device-card[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%] {\n  padding: 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n.param-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 1rem;\n  padding: 0.5rem 0;\n}\n.param-row[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #555;\n  font-size: 0.9rem;\n  min-width: 100px;\n  flex-shrink: 0;\n}\n.param-row[_ngcontent-%COMP%]   .param-value[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n  align-items: flex-start;\n}\n.param-row[_ngcontent-%COMP%]   .param-value[_ngcontent-%COMP%]   .value[_ngcontent-%COMP%] {\n  font-size: 0.95rem;\n  font-weight: 500;\n  color: #333;\n  word-break: break-word;\n}\n.param-row[_ngcontent-%COMP%]   .param-value[_ngcontent-%COMP%]   .confidence-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.3rem;\n  padding: 0.25rem 0.6rem;\n  border-radius: 3px;\n  font-size: 0.75rem;\n  font-weight: 600;\n}\n.param-row[_ngcontent-%COMP%]   .param-value[_ngcontent-%COMP%]   .confidence-badge[_ngcontent-%COMP%]   .score[_ngcontent-%COMP%] {\n  font-weight: 400;\n  opacity: 0.85;\n}\n.param-row[_ngcontent-%COMP%]   .param-value[_ngcontent-%COMP%]   .confidence-badge.confidence-high[_ngcontent-%COMP%] {\n  background: #c8e6c9;\n  color: #2e7d32;\n}\n.param-row[_ngcontent-%COMP%]   .param-value[_ngcontent-%COMP%]   .confidence-badge.confidence-medium[_ngcontent-%COMP%] {\n  background: #fff9c4;\n  color: #f57f17;\n}\n.param-row[_ngcontent-%COMP%]   .param-value[_ngcontent-%COMP%]   .confidence-badge.confidence-low[_ngcontent-%COMP%] {\n  background: #ffccbc;\n  color: #d84315;\n}\n.param-row[_ngcontent-%COMP%]   .param-value[_ngcontent-%COMP%]   .source-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: #999;\n  font-style: italic;\n}\n.protection-functions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin: 0.3rem 0;\n}\n.protection-functions[_ngcontent-%COMP%]   .prot-badge[_ngcontent-%COMP%] {\n  background: #e8eaf6;\n  color: #3f51b5;\n  padding: 0.25rem 0.5rem;\n  border-radius: 3px;\n  font-size: 0.8rem;\n  font-weight: 600;\n}\n.device-card--recommended[_ngcontent-%COMP%] {\n  border-color: #b0bec5;\n}\n.device-card--recommended[_ngcontent-%COMP%]   .card-header[_ngcontent-%COMP%] {\n  background: #eceff1;\n}\n.device-card--recommended[_ngcontent-%COMP%]   .article-code[_ngcontent-%COMP%] {\n  background: #e3f2fd;\n  color: #1565c0;\n  padding: 0.2rem 0.5rem;\n  border-radius: 3px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  font-family: monospace;\n}\n.device-card--recommended[_ngcontent-%COMP%]   .qty-badge[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: #666;\n  font-weight: 500;\n}\n.no-data-notice[_ngcontent-%COMP%] {\n  padding: 1rem;\n  background: #f9f9f9;\n  border: 1px dashed #ccc;\n  border-radius: 6px;\n  color: #777;\n  font-size: 0.9rem;\n}\n.no-data-notice[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 0.3rem;\n}\n.no-data-notice[_ngcontent-%COMP%]   .no-data-hint[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  color: #aaa;\n  font-style: italic;\n}\n@media (max-width: 768px) {\n  .device-details-panel[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .param-row[_ngcontent-%COMP%] {\n    flex-direction: column;\n    gap: 0.3rem;\n  }\n  .param-row[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n    margin-bottom: 0.25rem;\n  }\n  .device-details-header[_ngcontent-%COMP%] {\n    flex-wrap: wrap;\n  }\n  .device-details-header[_ngcontent-%COMP%]   .panel-type-badge[_ngcontent-%COMP%] {\n    order: 3;\n    margin-left: 0;\n    width: 100%;\n  }\n}\n/*# sourceMappingURL=cubicle-device-details.component.css.map */"], changeDetection: 0 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CubicleDeviceDetailsComponent, { className: "CubicleDeviceDetailsComponent", filePath: "src\\app\\components\\lineup\\cubicle-device-details.component.ts", lineNumber: 82 });
})();

// src/app/components/lineup/lineup-view.component.ts
var _forTrack0 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.position;
var _forTrack2 = ($index, $item) => $item.label;
var _c0 = () => [1, 2, 3, 4, 5, 6, 7];
var _c1 = () => [];
function LineupViewComponent_Conditional_1_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const inst_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(inst_r2.location);
  }
}
function LineupViewComponent_Conditional_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 11);
    \u0275\u0275listener("click", function LineupViewComponent_Conditional_1_For_2_Template_button_click_0_listener() {
      const inst_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.selectInstance(inst_r2.id));
    });
    \u0275\u0275elementStart(1, "span", 12);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 13);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275template(5, LineupViewComponent_Conditional_1_For_2_Conditional_5_Template, 2, 1, "span", 14);
    \u0275\u0275elementStart(6, "span", 15);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const inst_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("inst-tab--active", ctx_r2.selectedInstanceId() === inst_r2.id);
    \u0275\u0275attribute("aria-selected", ctx_r2.selectedInstanceId() === inst_r2.id);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(inst_r2.instanceIndex);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(inst_r2.instanceName);
    \u0275\u0275advance();
    \u0275\u0275conditional(5, inst_r2.location ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r2.cubicleCountForInstance(inst_r2.id), " panels");
  }
}
function LineupViewComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275repeaterCreate(1, LineupViewComponent_Conditional_1_For_2_Template, 8, 7, "button", 10, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.instances());
  }
}
function LineupViewComponent_Conditional_9_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275element(1, "div", 17)(2, "div", 18);
    \u0275\u0275elementEnd();
  }
}
function LineupViewComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275repeaterCreate(1, LineupViewComponent_Conditional_9_For_2_Template, 3, 0, "div", 16, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275repeater(\u0275\u0275pureFunction0(0, _c0));
  }
}
function LineupViewComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19)(1, "span", 20);
    \u0275\u0275text(2, "\u{1F50C}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p");
    \u0275\u0275text(4, "No cubicle layout data available for this document.");
    \u0275\u0275elementEnd()();
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 44)(1, "line", 45)(2, "line", 46);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 38);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_8_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "rect", 50);
    \u0275\u0275elementStart(1, "text", 51);
    \u0275\u0275text(2, "R");
    \u0275\u0275elementEnd();
    \u0275\u0275element(3, "line", 52)(4, "line", 53)(5, "line", 54)(6, "line", 55)(7, "line", 56)(8, "line", 57);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_8_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 58)(1, "line", 59)(2, "line", 60)(3, "line", 61)(4, "line", 62);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "circle", 47)(1, "circle", 48)(2, "line", 49);
    \u0275\u0275template(3, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_8_Conditional_3_Template, 9, 0)(4, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_8_Conditional_4_Template, 5, 0);
  }
  if (rf & 2) {
    const cub_r5 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(3, ctx_r2.getDeviceField(cub_r5, "relay") !== "\u2014" ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(4, ctx_r2.getDeviceField(cub_r5, "relay") === "\u2014" ? 4 : -1);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 63)(1, "line", 64)(2, "line", 65)(3, "line", 66)(4, "line", 67);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "polygon", 68)(1, "line", 69);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 70)(1, "polygon", 71);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 72)(1, "line", 73);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 37);
    \u0275\u0275template(1, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_1_Template, 3, 0)(2, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_2_Template, 1, 0, ":svg:line", 38);
    \u0275\u0275element(3, "line", 39)(4, "rect", 40)(5, "line", 41)(6, "line", 42)(7, "line", 43);
    \u0275\u0275template(8, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_8_Template, 5, 2)(9, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_9_Template, 5, 0)(10, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_10_Template, 2, 0)(11, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_11_Template, 2, 0)(12, LineupViewComponent_Conditional_11_For_7_Conditional_4_Conditional_12_Template, 2, 0);
  }
  if (rf & 2) {
    const cub_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(1, cub_r5.type === "incomer" || cub_r5.type === "outgoer" ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(2, cub_r5.type !== "incomer" && cub_r5.type !== "outgoer" ? 2 : -1);
    \u0275\u0275advance(6);
    \u0275\u0275conditional(8, ctx_r2.getDeviceField(cub_r5, "ct") !== "\u2014" ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(9, ctx_r2.getDeviceField(cub_r5, "ct") === "\u2014" ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(10, cub_r5.type === "incomer" ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(11, cub_r5.type === "outgoer" ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(12, cub_r5.type === "coupler" ? 12 : -1);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_5_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 84)(1, "rect", 85)(2, "line", 86)(3, "line", 87)(4, "line", 88);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_5_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 75);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 74);
    \u0275\u0275template(1, LineupViewComponent_Conditional_11_For_7_Conditional_5_Conditional_1_Template, 5, 0)(2, LineupViewComponent_Conditional_11_For_7_Conditional_5_Conditional_2_Template, 1, 0, ":svg:line", 75);
    \u0275\u0275element(3, "circle", 76)(4, "circle", 77)(5, "circle", 78)(6, "circle", 79)(7, "line", 80)(8, "line", 81)(9, "line", 82)(10, "line", 83);
  }
  if (rf & 2) {
    const cub_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(1, ctx_r2.getDeviceField(cub_r5, "cb") !== "\u2014" ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(2, ctx_r2.getDeviceField(cub_r5, "cb") === "\u2014" ? 2 : -1);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_12_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 89)(1, "span", 90);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 91);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const chip_r6 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(chip_r6.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(chip_r6.value);
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 35);
    \u0275\u0275repeaterCreate(1, LineupViewComponent_Conditional_11_For_7_Conditional_12_For_2_Template, 5, 2, "span", 89, _forTrack2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cub_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.deviceChipsEnriched(cub_r5));
  }
}
function LineupViewComponent_Conditional_11_For_7_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1, "\u26A0");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cub_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275propertyInterpolate("title", cub_r5.topologyWarning);
  }
}
function LineupViewComponent_Conditional_11_For_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 28);
    \u0275\u0275listener("click", function LineupViewComponent_Conditional_11_For_7_Template_button_click_0_listener() {
      const cub_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.selectDiagramCubicle(cub_r5.position));
    });
    \u0275\u0275element(1, "div", 29);
    \u0275\u0275elementStart(2, "div", 30);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(3, "svg", 31);
    \u0275\u0275template(4, LineupViewComponent_Conditional_11_For_7_Conditional_4_Template, 13, 7)(5, LineupViewComponent_Conditional_11_For_7_Conditional_5_Template, 11, 2);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(6, "span", 32);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 33);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 34);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275template(12, LineupViewComponent_Conditional_11_For_7_Conditional_12_Template, 3, 0, "div", 35)(13, LineupViewComponent_Conditional_11_For_7_Conditional_13_Template, 2, 1, "span", 36);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const cub_r5 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap("cub-item cub-item--" + cub_r5.type + (ctx_r2.selectedDiagramPos() === cub_r5.position ? " cub-item--active" : "") + (cub_r5.topologyWarning ? " cub-item--warn" : "") + (ctx_r2.isTransformerPanel(cub_r5) ? " cub-item--transformer" : ""));
    \u0275\u0275attribute("aria-pressed", ctx_r2.selectedDiagramPos() === cub_r5.position)("aria-label", ctx_r2.panelTypeLabel(cub_r5) + " panel " + cub_r5.position);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(4, !ctx_r2.isTransformerPanel(cub_r5) ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(5, ctx_r2.isTransformerPanel(cub_r5) ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(cub_r5.functionalPosition || cub_r5.position);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.panelTypeLabel(cub_r5));
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r2.confidenceClass(cub_r5.confidenceIndex));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", (cub_r5.confidenceIndex * 100).toFixed(0), "% ");
    \u0275\u0275advance();
    \u0275\u0275conditional(12, ctx_r2.deviceChipsEnriched(cub_r5).length > 0 ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(13, cub_r5.topologyWarning ? 13 : -1);
  }
}
function LineupViewComponent_Conditional_11_Conditional_8_For_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 93);
    \u0275\u0275listener("click", function LineupViewComponent_Conditional_11_Conditional_8_For_20_Template_tr_click_0_listener() {
      const cub_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.selectDiagramCubicle(cub_r8.position));
    });
    \u0275\u0275elementStart(1, "td", 94);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td")(4, "span");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "td");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "td");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "td");
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "td");
    \u0275\u0275text(13);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "td")(15, "span", 34);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const cub_r8 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("row--selected", ctx_r2.selectedDiagramPos() === cub_r8.position);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(cub_r8.position);
    \u0275\u0275advance(2);
    \u0275\u0275classMapInterpolate1("type-badge type-badge--", cub_r8.type, "");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.panelTypeLabel(cub_r8));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.getDeviceField(cub_r8, "cb"));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.getDeviceField(cub_r8, "ct"));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.getDeviceField(cub_r8, "vt"));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.getDeviceField(cub_r8, "relay"));
    \u0275\u0275advance(2);
    \u0275\u0275classMap(ctx_r2.confidenceClass(cub_r8.confidenceIndex));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", (cub_r8.confidenceIndex * 100).toFixed(0), "%");
  }
}
function LineupViewComponent_Conditional_11_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 27)(1, "table")(2, "thead")(3, "tr")(4, "th");
    \u0275\u0275text(5, "#");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th");
    \u0275\u0275text(7, "Type");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th");
    \u0275\u0275text(9, "Circuit Breaker");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th");
    \u0275\u0275text(11, "CT Ratio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th");
    \u0275\u0275text(13, "VT Ratio");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th");
    \u0275\u0275text(15, "Protection Relay");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "th");
    \u0275\u0275text(17, "Conf.");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(18, "tbody");
    \u0275\u0275repeaterCreate(19, LineupViewComponent_Conditional_11_Conditional_8_For_20_Template, 17, 14, "tr", 92, _forTrack1);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(19);
    \u0275\u0275repeater(ctx_r2.instanceCubicles());
  }
}
function LineupViewComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21)(1, "div", 22)(2, "span", 23);
    \u0275\u0275text(3, "MV Busbar");
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "div", 24);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 25);
    \u0275\u0275repeaterCreate(6, LineupViewComponent_Conditional_11_For_7_Template, 14, 13, "button", 26, _forTrack1);
    \u0275\u0275elementEnd();
    \u0275\u0275template(8, LineupViewComponent_Conditional_11_Conditional_8_Template, 21, 0, "div", 27);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275repeater(ctx_r2.instanceCubicles());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(8, ctx_r2.instanceCubicles().length > 0 ? 8 : -1);
  }
}
function LineupViewComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 9);
    \u0275\u0275element(1, "div", 95)(2, "div", 96)(3, "div", 96);
    \u0275\u0275elementEnd();
  }
}
function LineupViewComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-cubicle-device-details", 97);
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("cubicle", ctx_r2.selectedDeviceDetails())("recommendedDevices", (tmp_2_0 = (tmp_2_0 = ctx_r2.selectedDiagramCubicle()) == null ? null : tmp_2_0.devices) !== null && tmp_2_0 !== void 0 ? tmp_2_0 : \u0275\u0275pureFunction0(3, _c1))("panelLabel", ctx_r2.selectedDiagramCubicle() ? "Panel #" + ctx_r2.selectedDiagramCubicle().position + " \u2014 " + ctx_r2.typeLabel(ctx_r2.selectedDiagramCubicle().type) : null);
  }
}
var LineupViewComponent = class _LineupViewComponent {
  constructor() {
    this.reviewState = inject(ReviewStateService);
    this.api = inject(PipelineApiService);
    this.router = inject(Router);
    this.destroyRef = inject(DestroyRef);
    this.loadState = signal("loading");
    this.errorMessage = signal(null);
    this.cubicles = signal([]);
    this.instances = signal([]);
    this.selectedInstanceId = signal(null);
    this.cubicleDevices = signal([]);
    this.cubicleDevicesLoadState = signal("loading");
    this.selectedDiagramPos = signal(null);
    this.lineupDevicesResponse = signal(null);
    this.lineupDevicesLoadState = signal("loading");
    this.isMultiInstance = computed(() => this.instances().length > 1);
    this.instanceCubicles = computed(() => {
      const instId = this.selectedInstanceId();
      const all = this.cubicles();
      if (instId === null)
        return all;
      const filtered = all.filter((c) => c.switchgearInstanceId === instId);
      return filtered.length > 0 ? filtered : all.filter((c) => c.switchgearInstanceId === null);
    });
    this.selectedDiagramCubicle = computed(() => {
      const pos = this.selectedDiagramPos();
      return pos !== null ? this.instanceCubicles().find((c) => c.position === pos) ?? null : null;
    });
    this.selectedCubicleDevices = computed(() => {
      const pos = this.selectedDiagramPos();
      const instId = this.selectedInstanceId();
      const devs = this.cubicleDevices();
      const instanceDevs = instId !== null ? devs.filter((d) => d.switchgearInstanceId === instId || d.switchgearInstanceId === null) : devs;
      if (pos === null)
        return instanceDevs;
      const posStr = String(pos);
      const filtered = instanceDevs.filter((d) => d.functionalPosition === posStr || d.functionalPosition === posStr.padStart(2, "0") || d.functionalPosition === posStr.padStart(3, "0"));
      return filtered.length > 0 ? filtered : instanceDevs.filter((d) => d.functionalPosition === posStr);
    });
    this.selectedDeviceDetails = computed(() => {
      const diagramCubicle = this.selectedDiagramCubicle();
      if (!diagramCubicle)
        return null;
      const response = this.lineupDevicesResponse();
      if (response?.switchgearInstances?.length) {
        const selectedInstance = this.selectedInstanceId();
        const instance = selectedInstance !== null ? response.switchgearInstances.find((i) => i.instanceId === selectedInstance) : response.switchgearInstances[0];
        if (instance) {
          const fp = diagramCubicle.functionalPosition;
          if (fp) {
            const byFp = instance.cubicles.find((c) => c.functionalPosition === fp);
            if (byFp)
              return byFp;
          }
          const byPos = instance.cubicles.find((c) => c.position === diagramCubicle.position);
          if (byPos)
            return byPos;
        }
      }
      return this.buildFallbackDetails(diagramCubicle);
    });
    this.productMatches = signal([]);
    this.expandedPosition = signal(null);
    this.matchLoadState = signal("loading");
    this.selectedProductKey = signal(null);
    this.topology = signal(null);
    this.recommendedMatches = computed(() => this.productMatches().filter((p) => p.isRecommended));
    this.compatibleMatches = computed(() => this.productMatches().filter((p) => p.isCompatible && !p.isRecommended));
    this.topologyWarnings = computed(() => {
      const warnings = [];
      const topo = this.topology();
      if (topo) {
        if (topo.incomers === 0)
          warnings.push({ severity: "high", message: "No incomer panel detected in the lineup." });
        if (topo.feeders === 0)
          warnings.push({ severity: "medium", message: "No feeder panels detected \u2014 lineup may be incomplete." });
        if (topo.couplers > 1)
          warnings.push({ severity: "medium", message: `${topo.couplers} couplers detected \u2014 verify busbar section split.` });
      } else {
        const types = this.instanceCubicles().map((c) => c.type);
        if (!types.includes("incomer"))
          warnings.push({ severity: "high", message: "No incomer cubicle detected in the lineup." });
        if (!types.includes("outgoer"))
          warnings.push({ severity: "high", message: "No outgoer cubicle detected in the lineup." });
        const couplerCount = types.filter((t) => t === "coupler").length;
        if (couplerCount > 1)
          warnings.push({ severity: "medium", message: `${couplerCount} coupler cubicles detected \u2014 verify bus-tie topology.` });
      }
      this.cubicles().forEach((c) => {
        if (c.topologyWarning)
          warnings.push({ severity: "medium", message: c.topologyWarning });
      });
      return warnings;
    });
    this.highWarningCount = computed(() => this.topologyWarnings().filter((w) => w.severity === "high").length);
    this.selectedProductDetails = computed(() => {
      const key = this.selectedProductKey();
      return key ? this.productMatches().find((p) => p.productKey === key) ?? null : null;
    });
  }
  buildFallbackDetails(cub) {
    const p = (value) => ({ value: value ?? "", confidence: 0.7, source: "SLD", sourcePage: 0 });
    const devDesc = (typeName, fallback = "") => {
      const dev = cub.devices.find((d) => d.name === typeName);
      return dev?.description && dev.description !== "Detected from SLD" ? dev.description : fallback;
    };
    const hasCB = cub.devices.some((d) => d.name === "Circuit Breaker");
    return {
      position: cub.position,
      functionalPosition: cub.functionalPosition ?? "",
      panelType: cub.type,
      circuitBreaker: {
        model: p(devDesc("Circuit Breaker", cub.cbModel) || (hasCB ? "Present" : "")),
        rating: p(cub.cbRating)
      },
      currentTransformer: { ratio: p(devDesc("CT", cub.ctRatio)) },
      voltageTransformer: { ratio: p(devDesc("VT", cub.vtRatio)) },
      protectionRelay: {
        model: p(devDesc("Protection Relay", cub.relayModel)),
        protectionFunctions: cub.protectionFunctions ?? [],
        protectionFunctionsConfidence: 0.7,
        protectionFunctionsSource: "SLD",
        communicationProtocol: []
      },
      disconnector: {},
      earthingSwitch: { present: false },
      surgeArrester: { present: false },
      auxiliary: {}
    };
  }
  deviceDesc(cub, typeName) {
    const dev = cub.devices.find((d) => d.name === typeName);
    if (!dev)
      return "\u2014";
    if (dev.description && dev.description !== "Detected from SLD")
      return dev.description;
    return "\u2713";
  }
  deviceChips(cub) {
    const chips = [];
    const abbrev = {
      "Circuit Breaker": "CB",
      "CT": "CT",
      "VT": "VT",
      "Protection Relay": "Relay"
    };
    for (const dev of cub.devices) {
      const label = abbrev[dev.name] ?? dev.name;
      const value = dev.description && dev.description !== "Detected from SLD" ? dev.description : "\u2713";
      chips.push({ label, value });
    }
    return chips;
  }
  /** Find the CubicleDevice record for a given cubicle, matching by functionalPosition name or position number. */
  getDeviceForCubicle(cub) {
    const devs = this.cubicleDevices();
    if (!devs.length)
      return void 0;
    const fp = (cub.functionalPosition ?? "").trim().toLowerCase();
    if (fp) {
      const exact = devs.find((d) => d.functionalPosition.trim().toLowerCase() === fp);
      if (exact)
        return exact;
      const partial = devs.find((d) => {
        const dfp = d.functionalPosition.trim().toLowerCase();
        return dfp.startsWith(fp) || fp.startsWith(dfp);
      });
      if (partial)
        return partial;
    }
    const pos = String(cub.position);
    return devs.find((d) => d.functionalPosition === pos || d.functionalPosition === pos.padStart(2, "0") || d.functionalPosition === pos.padStart(3, "0"));
  }
  isTransformerPanel(cub) {
    const dev = this.getDeviceForCubicle(cub);
    if (dev?.panelType) {
      const pt = dev.panelType.toLowerCase();
      return pt.includes("transformer") || pt === "trafo";
    }
    return cub.type === "transformer";
  }
  /** Return a display string for a specific device field, preferring cubicleDevices over inline lineup data. */
  getDeviceField(cub, field) {
    const dev = this.getDeviceForCubicle(cub);
    if (dev) {
      switch (field) {
        case "cb": {
          const parts = [dev.cbModel, dev.cbRating].filter(Boolean);
          return parts.length ? parts.join(" ") : "\u2014";
        }
        case "ct":
          return dev.ctRatio || "\u2014";
        case "vt":
          return dev.vtRatio || "\u2014";
        case "relay":
          return dev.relayModel || "\u2014";
      }
    }
    switch (field) {
      case "cb": {
        const m = cub.cbModel || this.deviceDesc(cub, "Circuit Breaker");
        const r = cub.cbRating ? " " + cub.cbRating : "";
        return m !== "\u2014" ? m + r : "\u2014";
      }
      case "ct":
        return cub.ctRatio || this.deviceDesc(cub, "CT");
      case "vt":
        return cub.vtRatio || this.deviceDesc(cub, "VT");
      case "relay":
        return cub.relayModel || this.deviceDesc(cub, "Protection Relay");
    }
  }
  /** Device chips enriched with cubicleDevices data. Falls back to inline lineup chips. */
  deviceChipsEnriched(cub) {
    const dev = this.getDeviceForCubicle(cub);
    if (dev) {
      const chips = [];
      const cbLabel = [dev.cbModel, dev.cbRating].filter(Boolean).join(" ");
      if (cbLabel)
        chips.push({ label: "CB", value: cbLabel });
      if (dev.ctRatio)
        chips.push({ label: "CT", value: dev.ctRatio });
      if (dev.relayModel)
        chips.push({ label: "Relay", value: dev.relayModel });
      if (chips.length)
        return chips;
    }
    return this.deviceChips(cub);
  }
  panelTypeLabel(cub) {
    const dev = this.getDeviceForCubicle(cub);
    if (dev?.panelType)
      return dev.panelType;
    return this.typeLabel(cub.type);
  }
  ngOnInit() {
    const docId = this.reviewState.documentId();
    if (!docId) {
      this.loadState.set("error");
      this.errorMessage.set("No document selected. Upload a package first.");
      return;
    }
    const prior = this.reviewState.selectedProduct();
    if (prior)
      this.selectedProductKey.set(prior.productKey);
    this.loadFromApi(docId);
  }
  loadFromApi(docId) {
    const cachedCubicles = this.reviewState.cachedCubicles();
    if (cachedCubicles) {
      this.applyCubicles(cachedCubicles);
    } else {
      this.loadState.set("loading");
      this.api.getLineup(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (cubs) => {
          this.reviewState.setCachedCubicles(cubs);
          this.applyCubicles(cubs);
        },
        error: (err) => {
          this.loadState.set("error");
          this.errorMessage.set(err.message ?? "Failed to load lineup.");
        }
      });
    }
    const cachedInstances = this.reviewState.cachedInstances();
    if (cachedInstances) {
      this.applyInstances(cachedInstances);
    } else {
      this.api.getInstances(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (insts) => {
          this.reviewState.setCachedInstances(insts);
          this.applyInstances(insts);
        },
        error: () => {
        }
      });
    }
    const cachedDevices = this.reviewState.cachedCubicleDevices();
    if (cachedDevices) {
      this.cubicleDevices.set(cachedDevices);
      this.cubicleDevicesLoadState.set(cachedDevices.length ? "loaded" : "empty");
    } else {
      this.api.getCubicleDevices(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (devs) => {
          this.reviewState.setCachedCubicleDevices(devs);
          this.cubicleDevices.set(devs);
          this.cubicleDevicesLoadState.set(devs.length ? "loaded" : "empty");
        },
        error: () => this.cubicleDevicesLoadState.set("empty")
      });
    }
    this.lineupDevicesLoadState.set("loading");
    this.api.getLineupDevices(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.lineupDevicesResponse.set(response);
        this.lineupDevicesLoadState.set(response?.switchgearInstances?.length ? "loaded" : "empty");
      },
      error: (err) => {
        console.warn("Failed to load lineup devices:", err);
        this.lineupDevicesLoadState.set("error");
      }
    });
    const cachedMatches = this.reviewState.cachedProductMatches();
    if (cachedMatches) {
      this.applyProductMatches(cachedMatches);
    } else {
      this.api.getProductMatch(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (matches) => {
          this.reviewState.setCachedProductMatches(matches);
          this.applyProductMatches(matches);
        },
        error: () => this.matchLoadState.set("empty")
      });
    }
  }
  applyCubicles(cubs) {
    this.cubicles.set(cubs);
    this.loadState.set(cubs.length ? "loaded" : "empty");
    this.autoSelectFirstCubicle();
  }
  applyInstances(insts) {
    this.instances.set(insts);
    const withTopo = insts.find((i) => i.topologySummary != null);
    if (withTopo?.topologySummary) {
      this.topology.set(withTopo.topologySummary);
    }
    if (insts.length > 0 && this.selectedInstanceId() === null) {
      this.selectedInstanceId.set(insts[0].id);
      this.autoSelectFirstCubicle();
    }
  }
  applyProductMatches(matches) {
    this.productMatches.set(matches);
    this.matchLoadState.set(matches.length ? "loaded" : "empty");
    const selectedProduct = this.reviewState.selectedProduct();
    const selectedKey = selectedProduct?.productKey;
    const matchFound = selectedKey && matches.some((m) => m.productKey === selectedKey);
    if (selectedKey && !matchFound) {
      this.selectedProductKey.set(null);
      this.reviewState.setSelectedProduct(null);
    }
    if (!this.selectedProductKey() && matches.length) {
      this.selectedProductKey.set(matches[0].productKey);
      this.reviewState.setSelectedProduct(matches[0]);
    }
  }
  toggleCubicle(position) {
    this.expandedPosition.update((cur) => cur === position ? null : position);
  }
  isExpanded(position) {
    return this.expandedPosition() === position;
  }
  badgeClass(type) {
    return `cubicle-badge cubicle-badge--${type.replace("_", "-")}`;
  }
  typeLabel(type) {
    const labels = {
      incomer: "Incomer",
      outgoer: "Outgoer",
      coupler: "Coupler",
      metering: "Metering",
      busbar_section: "Busbar Section"
    };
    return labels[type] ?? type;
  }
  confidenceClass(score) {
    if (score >= 0.75)
      return "conf conf--high";
    if (score >= 0.5)
      return "conf conf--mid";
    return "conf conf--low";
  }
  deviceConfClass(score) {
    if (score >= 0.75)
      return "conf conf--high";
    if (score >= 0.5)
      return "conf conf--mid";
    return "conf conf--low";
  }
  selectInstance(instId) {
    this.selectedInstanceId.set(instId);
    this.selectedDiagramPos.set(null);
    this.autoSelectFirstCubicle();
  }
  autoSelectFirstCubicle() {
    if (this.selectedDiagramPos() !== null)
      return;
    const cubs = this.instanceCubicles();
    if (cubs.length > 0) {
      this.selectedDiagramPos.set(cubs[0].position);
    }
  }
  selectDiagramCubicle(pos) {
    this.selectedDiagramPos.set(pos);
  }
  navigateNext() {
    this.router.navigate(["/review/products"]);
  }
  selectProduct(key) {
    this.selectedProductKey.set(key);
    const match = this.productMatches().find((p) => p.productKey === key) ?? null;
    this.reviewState.setSelectedProduct(match);
  }
  isSelectedProduct(key) {
    return this.selectedProductKey() === key;
  }
  scorePercent(score) {
    return (score * 100).toFixed(0) + "%";
  }
  scoreClass(score) {
    if (score >= 0.85)
      return "score-bar--high";
    if (score >= 0.65)
      return "score-bar--mid";
    return "score-bar--low";
  }
  cubicleCountForInstance(instId) {
    const filtered = this.cubicles().filter((c) => c.switchgearInstanceId === instId);
    return filtered.length > 0 ? filtered.length : this.cubicles().filter((c) => c.switchgearInstanceId === null).length;
  }
  trackByPosition(_i, c) {
    return c.position;
  }
  trackByKey(_i, p) {
    return p.productKey;
  }
  static {
    this.\u0275fac = function LineupViewComponent_Factory(t) {
      return new (t || _LineupViewComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LineupViewComponent, selectors: [["app-lineup-view"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 15, vars: 3, consts: [[1, "lineup-page"], ["role", "tablist", "aria-label", "Product installations", 1, "instance-tabs-bar"], [1, "lineup-container"], ["aria-label", "Cubicle lineup diagram", 1, "diagram-section", "card"], [1, "diagram-section__header"], [1, "diagram-section__title"], [1, "diagram-section__sub"], [1, "diagram-skeleton"], ["aria-label", "Device parameters panel", 1, "device-details-section", "card"], [1, "device-details-skeleton"], ["role", "tab", 1, "inst-tab", 3, "inst-tab--active"], ["role", "tab", 1, "inst-tab", 3, "click"], [1, "inst-tab__index"], [1, "inst-tab__name"], [1, "inst-tab__loc"], [1, "inst-tab__count"], [1, "dskel-panel"], [1, "skeleton", "skeleton--badge"], [1, "skeleton", "skeleton--label"], [1, "diagram-empty"], ["aria-hidden", "true"], [1, "diagram-outer"], [1, "diagram-bus-row"], [1, "diagram-bus-lbl"], [1, "diagram-bus-rail"], ["role", "list", 1, "diagram-panels-row"], ["role", "listitem", 1, "cub-item", 3, "class"], [1, "device-summary-table"], ["role", "listitem", 1, "cub-item", 3, "click"], [1, "cub-item__stem"], [1, "cub-item__box"], ["viewBox", "0 0 56 160", "aria-hidden", "true", 1, "cub-item__cb"], [1, "cub-item__fp"], [1, "cub-item__lbl"], [1, "cub-item__conf"], [1, "cub-item__devices"], ["aria-label", "Warning", 1, "cub-item__warn-dot", 3, "title"], ["x1", "28", "y1", "0", "x2", "28", "y2", "10", "stroke", "currentColor", "stroke-width", "1.8"], ["x1", "28", "y1", "10", "x2", "28", "y2", "20", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "28", "y1", "20", "x2", "28", "y2", "26", "stroke", "currentColor", "stroke-width", "1.6"], ["x", "16", "y", "26", "width", "24", "height", "18", "rx", "1.5", "fill", "none", "stroke", "currentColor", "stroke-width", "1.5"], ["x1", "19", "y1", "29", "x2", "37", "y2", "42", "stroke", "currentColor", "stroke-width", "1.2"], ["x1", "37", "y1", "29", "x2", "19", "y2", "42", "stroke", "currentColor", "stroke-width", "1.2"], ["x1", "28", "y1", "44", "x2", "28", "y2", "52", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "20", "y1", "10", "x2", "36", "y2", "10", "stroke", "currentColor", "stroke-width", "1.4"], ["x1", "28", "y1", "10", "x2", "36", "y2", "7", "stroke", "currentColor", "stroke-width", "1.4"], ["x1", "28", "y1", "14", "x2", "28", "y2", "20", "stroke", "currentColor", "stroke-width", "1.6"], ["cx", "28", "cy", "57", "r", "5.5", "fill", "none", "stroke", "currentColor", "stroke-width", "1.2"], ["cx", "28", "cy", "67", "r", "5.5", "fill", "none", "stroke", "currentColor", "stroke-width", "1.2"], ["x1", "28", "y1", "72", "x2", "28", "y2", "80", "stroke", "currentColor", "stroke-width", "1.6"], ["x", "18", "y", "80", "width", "20", "height", "14", "rx", "1", "fill", "none", "stroke", "currentColor", "stroke-width", "1.2"], ["x", "28", "y", "91", "text-anchor", "middle", "font-size", "8", "fill", "currentColor", "font-family", "monospace", "font-weight", "600"], ["x1", "28", "y1", "94", "x2", "28", "y2", "102", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "28", "y1", "102", "x2", "28", "y2", "110", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "20", "y1", "110", "x2", "36", "y2", "110", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "21", "y1", "114", "x2", "35", "y2", "114", "stroke", "currentColor", "stroke-width", "1.3"], ["x1", "23", "y1", "118", "x2", "33", "y2", "118", "stroke", "currentColor", "stroke-width", "1"], ["x1", "25", "y1", "122", "x2", "31", "y2", "122", "stroke", "currentColor", "stroke-width", "0.8"], ["x1", "28", "y1", "80", "x2", "28", "y2", "90", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "20", "y1", "90", "x2", "36", "y2", "90", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "21", "y1", "94", "x2", "35", "y2", "94", "stroke", "currentColor", "stroke-width", "1.3"], ["x1", "23", "y1", "98", "x2", "33", "y2", "98", "stroke", "currentColor", "stroke-width", "1"], ["x1", "25", "y1", "102", "x2", "31", "y2", "102", "stroke", "currentColor", "stroke-width", "0.8"], ["x1", "28", "y1", "52", "x2", "28", "y2", "64", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "20", "y1", "64", "x2", "36", "y2", "64", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "21", "y1", "68", "x2", "35", "y2", "68", "stroke", "currentColor", "stroke-width", "1.3"], ["x1", "23", "y1", "72", "x2", "33", "y2", "72", "stroke", "currentColor", "stroke-width", "1"], ["x1", "25", "y1", "76", "x2", "31", "y2", "76", "stroke", "currentColor", "stroke-width", "0.8"], ["points", "22,154 34,154 28,146", "fill", "currentColor"], ["x1", "28", "y1", "154", "x2", "28", "y2", "160", "stroke", "currentColor", "stroke-width", "1.5"], ["x1", "28", "y1", "128", "x2", "28", "y2", "148", "stroke", "currentColor", "stroke-width", "1.5"], ["points", "22,142 34,142 28,150", "fill", "none", "stroke", "currentColor", "stroke-width", "1.2"], ["x1", "0", "y1", "35", "x2", "16", "y2", "35", "stroke", "currentColor", "stroke-width", "2"], ["x1", "40", "y1", "35", "x2", "56", "y2", "35", "stroke", "currentColor", "stroke-width", "2"], ["x1", "28", "y1", "0", "x2", "28", "y2", "18", "stroke", "currentColor", "stroke-width", "1.8"], ["x1", "28", "y1", "18", "x2", "28", "y2", "52", "stroke", "currentColor", "stroke-width", "1.6"], ["cx", "28", "cy", "64", "r", "12", "fill", "none", "stroke", "currentColor", "stroke-width", "1.8"], ["cx", "28", "cy", "88", "r", "12", "fill", "none", "stroke", "currentColor", "stroke-width", "1.8"], ["cx", "24", "cy", "60", "r", "1.5", "fill", "currentColor"], ["cx", "32", "cy", "60", "r", "1.5", "fill", "currentColor"], ["x1", "28", "y1", "100", "x2", "28", "y2", "116", "stroke", "currentColor", "stroke-width", "1.6"], ["x1", "20", "y1", "116", "x2", "36", "y2", "116", "stroke", "currentColor", "stroke-width", "1.5"], ["x1", "22", "y1", "120", "x2", "34", "y2", "120", "stroke", "currentColor", "stroke-width", "1.2"], ["x1", "24", "y1", "124", "x2", "32", "y2", "124", "stroke", "currentColor", "stroke-width", "1"], ["x1", "28", "y1", "18", "x2", "28", "y2", "24", "stroke", "currentColor", "stroke-width", "1.6"], ["x", "16", "y", "24", "width", "24", "height", "18", "rx", "1.5", "fill", "none", "stroke", "currentColor", "stroke-width", "1.5"], ["x1", "19", "y1", "27", "x2", "37", "y2", "40", "stroke", "currentColor", "stroke-width", "1.2"], ["x1", "37", "y1", "27", "x2", "19", "y2", "40", "stroke", "currentColor", "stroke-width", "1.2"], ["x1", "28", "y1", "42", "x2", "28", "y2", "52", "stroke", "currentColor", "stroke-width", "1.6"], [1, "cub-item__dev-chip"], [1, "chip-lbl"], [1, "chip-val"], [3, "row--selected"], [3, "click"], [1, "cell-pos"], [1, "skeleton", "skeleton--header"], [1, "skeleton", "skeleton--card"], [3, "cubicle", "recommendedDevices", "panelLabel"]], template: function LineupViewComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0);
        \u0275\u0275template(1, LineupViewComponent_Conditional_1_Template, 3, 0, "div", 1);
        \u0275\u0275elementStart(2, "div", 2)(3, "section", 3)(4, "div", 4)(5, "h3", 5);
        \u0275\u0275text(6, "Panel Lineup Diagram");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(7, "p", 6);
        \u0275\u0275text(8, "Click a panel to view device parameters.");
        \u0275\u0275elementEnd()();
        \u0275\u0275template(9, LineupViewComponent_Conditional_9_Template, 3, 1, "div", 7)(10, LineupViewComponent_Conditional_10_Template, 5, 0)(11, LineupViewComponent_Conditional_11_Template, 9, 1);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(12, "section", 8);
        \u0275\u0275template(13, LineupViewComponent_Conditional_13_Template, 4, 0, "div", 9)(14, LineupViewComponent_Conditional_14_Template, 1, 4);
        \u0275\u0275elementEnd()()();
      }
      if (rf & 2) {
        \u0275\u0275advance();
        \u0275\u0275conditional(1, ctx.isMultiInstance() ? 1 : -1);
        \u0275\u0275advance(8);
        \u0275\u0275conditional(9, ctx.loadState() === "loading" ? 9 : ctx.loadState() === "error" || ctx.loadState() === "empty" ? 10 : 11);
        \u0275\u0275advance(4);
        \u0275\u0275conditional(13, ctx.lineupDevicesLoadState() === "loading" ? 13 : 14);
      }
    }, dependencies: [CommonModule, CubicleDeviceDetailsComponent], styles: ['@charset "UTF-8";\n\n\n\n.lineup-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n.instance-tabs-bar[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0 0 0.25rem;\n  border-bottom: 2px solid #e0e0e0;\n}\n.inst-tab[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 0.35rem 1rem;\n  background: #f5f5f5;\n  border: 1.5px solid #d0d0d0;\n  border-bottom: none;\n  border-radius: 6px 6px 0 0;\n  cursor: pointer;\n  font-size: 0.78rem;\n  color: #555;\n  transition: background 0.12s, border-color 0.12s;\n  position: relative;\n  bottom: -2px;\n  min-width: 120px;\n  text-align: left;\n}\n.inst-tab[_ngcontent-%COMP%]:hover {\n  background: #fff;\n  border-color: #aaa;\n  color: #1a1a1a;\n}\n.inst-tab--active[_ngcontent-%COMP%] {\n  background: #fff;\n  border-color: #cc0000;\n  border-bottom: 2px solid #fff;\n  color: #1a1a1a;\n}\n.inst-tab--active[_ngcontent-%COMP%]   .inst-tab__index[_ngcontent-%COMP%] {\n  background: #cc0000;\n  color: #fff;\n}\n.inst-tab__index[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 24px;\n  height: 20px;\n  background: #d0d0d0;\n  color: #555;\n  border-radius: 3px;\n  font-weight: 600;\n  font-size: 0.7rem;\n  margin-right: 0.5rem;\n}\n.inst-tab__name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: inherit;\n}\n.inst-tab__loc[_ngcontent-%COMP%] {\n  color: #999;\n  font-size: 0.7rem;\n  margin-top: 0.1rem;\n}\n.inst-tab__count[_ngcontent-%COMP%] {\n  background: rgba(204, 0, 0, 0.1);\n  color: #cc0000;\n  padding: 0.15rem 0.4rem;\n  border-radius: 2px;\n  font-size: 0.65rem;\n  font-weight: 600;\n  margin-top: 0.2rem;\n}\n.lineup-container[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1.5rem;\n  min-height: 600px;\n}\n.diagram-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n.device-details-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-height: 600px;\n  max-height: 800px;\n  overflow: hidden;\n}\n.diagram-section__header[_ngcontent-%COMP%] {\n  padding-bottom: 1rem;\n  border-bottom: 2px solid #e0e0e0;\n  margin-bottom: 1rem;\n}\n.diagram-section__title[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 1.2rem;\n  font-weight: 600;\n  color: #333;\n}\n.diagram-section__sub[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9rem;\n  color: #999;\n}\n.diagram-outer[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.diagram-bus-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 0.5rem 0;\n}\n.diagram-bus-lbl[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: #555;\n  min-width: 80px;\n}\n.diagram-bus-rail[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 3px;\n  background:\n    linear-gradient(\n      to right,\n      #333 0%,\n      #333 100%);\n  position: relative;\n}\n.diagram-bus-rail[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  left: -4px;\n  top: 50%;\n  transform: translateY(-50%);\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: #333;\n}\n.diagram-bus-rail[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  right: -4px;\n  top: 50%;\n  transform: translateY(-50%);\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: #333;\n}\n.diagram-panels-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-around;\n  align-items: flex-start;\n  gap: 0.75rem;\n  padding: 1.5rem 0.5rem;\n  min-height: 200px;\n  background: #fafafa;\n  border: 1px solid #e0e0e0;\n  border-radius: 6px;\n  overflow-x: auto;\n  scroll-behavior: smooth;\n}\n.cub-item[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 0;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  flex-shrink: 0;\n  width: 108px;\n  min-height: 200px;\n  transition: transform 0.15s, filter 0.15s;\n}\n.cub-item[_ngcontent-%COMP%]:hover {\n  transform: scale(1.05);\n  filter: brightness(1.1);\n}\n.cub-item--active[_ngcontent-%COMP%]   .cub-item__box[_ngcontent-%COMP%] {\n  box-shadow: 0 0 0 3px #cc0000, 0 4px 8px rgba(204, 0, 0, 0.3);\n}\n.cub-item--active[_ngcontent-%COMP%]   .cub-item__pos[_ngcontent-%COMP%], .cub-item--active[_ngcontent-%COMP%]   .cub-item__lbl[_ngcontent-%COMP%] {\n  color: #cc0000;\n  font-weight: 700;\n}\n.cub-item--warn[_ngcontent-%COMP%]   .cub-item__box[_ngcontent-%COMP%] {\n  border: 2px solid #ffa500;\n}\n.cub-item--incomer[_ngcontent-%COMP%]   .cub-item__box[_ngcontent-%COMP%] {\n  background: #e3f2fd;\n  border: 2px solid #1565c0;\n}\n.cub-item--outgoer[_ngcontent-%COMP%]   .cub-item__box[_ngcontent-%COMP%] {\n  background: #fff3e0;\n  border: 2px solid #e65100;\n}\n.cub-item--coupler[_ngcontent-%COMP%]   .cub-item__box[_ngcontent-%COMP%] {\n  background: #f3e5f5;\n  border: 2px solid #6a1b9a;\n}\n.cub-item--metering[_ngcontent-%COMP%]   .cub-item__box[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  border: 2px solid #2e7d32;\n}\n.cub-item--busbar_section[_ngcontent-%COMP%]   .cub-item__box[_ngcontent-%COMP%] {\n  background: #fce4ec;\n  border: 2px solid #c2185b;\n}\n.cub-item--transformer[_ngcontent-%COMP%]   .cub-item__box[_ngcontent-%COMP%] {\n  background: #fff8e1;\n  border: 2px solid #f9a825;\n}\n.cub-item__stem[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -15px;\n  left: 50%;\n  transform: translateX(-50%);\n  width: 1px;\n  height: 15px;\n  background: #999;\n}\n.cub-item__box[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 0.4rem;\n  width: 100%;\n  padding: 0.6rem 0.5rem;\n  border: 2px solid #999;\n  border-radius: 4px;\n  background: white;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  transition: all 0.15s;\n  position: relative;\n}\n.cub-item__cb[_ngcontent-%COMP%] {\n  width: 52px;\n  height: 128px;\n  color: #333;\n}\n.cub-item__fp[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: #222;\n  text-align: center;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 96px;\n}\n.cub-item__pos[_ngcontent-%COMP%] {\n  font-size: 0.95rem;\n  font-weight: 600;\n  color: #333;\n}\n.cub-item__lbl[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 500;\n  color: #666;\n  text-align: center;\n}\n.cub-item__conf[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 600;\n  padding: 0.2rem 0.4rem;\n  border-radius: 2px;\n  white-space: nowrap;\n}\n.cub-item__conf.conf--high[_ngcontent-%COMP%] {\n  background: #c8e6c9;\n  color: #2e7d32;\n}\n.cub-item__conf.conf--mid[_ngcontent-%COMP%] {\n  background: #fff9c4;\n  color: #f57f17;\n}\n.cub-item__conf.conf--low[_ngcontent-%COMP%] {\n  background: #ffccbc;\n  color: #d84315;\n}\n.cub-item__warn-dot[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 2px;\n  right: 2px;\n  font-size: 1rem;\n}\n.cub-item__devices[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  width: 100%;\n  margin-top: 2px;\n}\n.cub-item__dev-chip[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 3px;\n  padding: 1px 3px;\n  background: rgba(0, 0, 0, 0.05);\n  border-radius: 2px;\n  font-size: 0.58rem;\n  line-height: 1.3;\n  width: 100%;\n  overflow: hidden;\n}\n.cub-item__dev-chip[_ngcontent-%COMP%]   .chip-lbl[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #555;\n  flex-shrink: 0;\n}\n.cub-item__dev-chip[_ngcontent-%COMP%]   .chip-val[_ngcontent-%COMP%] {\n  color: #222;\n  font-weight: 500;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  white-space: nowrap;\n  max-width: 52px;\n}\n.cub-detail[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 0.75rem 1rem;\n  background: #f5f5f5;\n  border: 1px solid #d0d0d0;\n  border-top: 3px solid #cc0000;\n  border-radius: 4px;\n  font-size: 0.85rem;\n}\n.cub-detail__pos[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #333;\n}\n.cub-detail__family[_ngcontent-%COMP%], .cub-detail__devices[_ngcontent-%COMP%] {\n  color: #666;\n}\n.cub-detail__article[_ngcontent-%COMP%] {\n  background: #e0e0e0;\n  padding: 0.2rem 0.5rem;\n  border-radius: 3px;\n  font-size: 0.8rem;\n  font-family:\n    "Monaco",\n    "Courier New",\n    monospace;\n}\n.cub-detail__dev-code[_ngcontent-%COMP%] {\n  background: #e3f2fd;\n  color: #1565c0;\n  padding: 0.2rem 0.4rem;\n  border-radius: 2px;\n  font-size: 0.75rem;\n  font-family:\n    "Monaco",\n    "Courier New",\n    monospace;\n  margin: 0 0.2rem;\n}\n.cub-detail__warn[_ngcontent-%COMP%] {\n  color: #d84315;\n  font-weight: 500;\n  flex: 0 0 100%;\n}\n.device-summary-table[_ngcontent-%COMP%] {\n  margin-top: 1.25rem;\n  overflow-x: auto;\n}\n.device-summary-table[_ngcontent-%COMP%]   table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.85rem;\n}\n.device-summary-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: #f0f0f0;\n  padding: 0.5rem 0.75rem;\n  text-align: left;\n  font-weight: 600;\n  color: #444;\n  border-bottom: 2px solid #d0d0d0;\n  white-space: nowrap;\n}\n.device-summary-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 0.5rem 0.75rem;\n  border-bottom: 1px solid #eee;\n  color: #333;\n  white-space: nowrap;\n}\n.device-summary-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  cursor: pointer;\n  transition: background 0.1s;\n}\n.device-summary-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: #f9f9f9;\n}\n.device-summary-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr.row--selected[_ngcontent-%COMP%] {\n  background: #fff3e8;\n}\n.device-summary-table[_ngcontent-%COMP%]   .cell-pos[_ngcontent-%COMP%] {\n  font-weight: 700;\n  color: #555;\n  width: 36px;\n}\n.device-summary-table[_ngcontent-%COMP%]   .type-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 0.15rem 0.5rem;\n  border-radius: 3px;\n  font-size: 0.78rem;\n  font-weight: 600;\n}\n.device-summary-table[_ngcontent-%COMP%]   .type-badge--incomer[_ngcontent-%COMP%] {\n  background: #e3f2fd;\n  color: #1565c0;\n}\n.device-summary-table[_ngcontent-%COMP%]   .type-badge--outgoer[_ngcontent-%COMP%] {\n  background: #fff3e0;\n  color: #e65100;\n}\n.device-summary-table[_ngcontent-%COMP%]   .type-badge--coupler[_ngcontent-%COMP%] {\n  background: #f3e5f5;\n  color: #6a1b9a;\n}\n.device-summary-table[_ngcontent-%COMP%]   .type-badge--metering[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  color: #2e7d32;\n}\n.device-summary-table[_ngcontent-%COMP%]   .type-badge--busbar_section[_ngcontent-%COMP%] {\n  background: #fce4ec;\n  color: #c2185b;\n}\n.diagram-skeleton[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  padding: 1.5rem;\n  background: #fafafa;\n}\n.dskel-panel[_ngcontent-%COMP%] {\n  flex: 0 0 60px;\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.skeleton[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #e0e0e0,\n      #f0f0f0,\n      #e0e0e0);\n  background-size: 200% 100%;\n  animation: _ngcontent-%COMP%_shimmer 1.5s infinite;\n  border-radius: 4px;\n}\n.skeleton--badge[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 16px;\n}\n.skeleton--label[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 12px;\n}\n.skeleton--header[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 24px;\n  margin-bottom: 1rem;\n}\n.skeleton--card[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 60px;\n  margin-bottom: 0.75rem;\n}\n.device-details-skeleton[_ngcontent-%COMP%] {\n  padding: 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n@keyframes _ngcontent-%COMP%_shimmer {\n  0% {\n    background-position: -200% 0;\n  }\n  100% {\n    background-position: 200% 0;\n  }\n}\n.diagram-empty[_ngcontent-%COMP%], .device-details-empty[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 300px;\n  color: #999;\n  font-size: 1rem;\n  text-align: center;\n}\n.diagram-empty[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .device-details-empty[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  font-size: 3rem;\n  margin-bottom: 0.5rem;\n}\n.diagram-empty[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .device-details-empty[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n}\n.cubicle-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.3rem 0.7rem;\n  border-radius: 4px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  white-space: nowrap;\n}\n.cubicle-badge--incomer[_ngcontent-%COMP%] {\n  background: #1565c0;\n  color: white;\n}\n.cubicle-badge--outgoer[_ngcontent-%COMP%] {\n  background: #e65100;\n  color: white;\n}\n.cubicle-badge--coupler[_ngcontent-%COMP%] {\n  background: #6a1b9a;\n  color: white;\n}\n.cubicle-badge--metering[_ngcontent-%COMP%] {\n  background: #2e7d32;\n  color: white;\n}\n.cubicle-badge--busbar-section[_ngcontent-%COMP%] {\n  background: #c2185b;\n  color: white;\n}\n.conf[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.25rem 0.5rem;\n  border-radius: 3px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  white-space: nowrap;\n}\n.conf--high[_ngcontent-%COMP%] {\n  background: #c8e6c9;\n  color: #2e7d32;\n}\n.conf--mid[_ngcontent-%COMP%] {\n  background: #fff9c4;\n  color: #f57f17;\n}\n.conf--low[_ngcontent-%COMP%] {\n  background: #ffccbc;\n  color: #d84315;\n}\n@media (max-width: 1200px) {\n  .lineup-container[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n    gap: 1rem;\n  }\n  .device-details-section[_ngcontent-%COMP%] {\n    min-height: auto;\n    max-height: 400px;\n  }\n}\n@media (max-width: 768px) {\n  .lineup-page[_ngcontent-%COMP%] {\n    gap: 1rem;\n  }\n  .diagram-panels-row[_ngcontent-%COMP%] {\n    overflow-x: auto;\n    scroll-snap-type: x mandatory;\n  }\n  .cub-item[_ngcontent-%COMP%] {\n    scroll-snap-align: center;\n  }\n  .cub-detail[_ngcontent-%COMP%] {\n    font-size: 0.75rem;\n    gap: 0.5rem;\n  }\n  .device-details-section[_ngcontent-%COMP%] {\n    max-height: 500px;\n  }\n  .diagram-section__title[_ngcontent-%COMP%] {\n    font-size: 1rem;\n  }\n}\n@media (max-width: 480px) {\n  .cub-item[_ngcontent-%COMP%] {\n    width: 80px;\n    min-height: 180px;\n  }\n  .cub-item__cb[_ngcontent-%COMP%] {\n    width: 40px;\n    height: 100px;\n  }\n  .diagram-panels-row[_ngcontent-%COMP%] {\n    padding: 1rem 0.25rem;\n  }\n  .cubicle-badge[_ngcontent-%COMP%] {\n    font-size: 0.7rem;\n    padding: 0.2rem 0.5rem;\n  }\n}\n.card[_ngcontent-%COMP%] {\n  background: white;\n  border: 1px solid #d0d0d0;\n  border-radius: 8px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);\n  padding: 1.25rem;\n}\n/*# sourceMappingURL=lineup-view.component.css.map */'], changeDetection: 0 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LineupViewComponent, { className: "LineupViewComponent", filePath: "src\\app\\components\\lineup\\lineup-view.component.ts", lineNumber: 33 });
})();
export {
  LineupViewComponent
};
//# sourceMappingURL=chunk-HWFHP3BT.js.map
