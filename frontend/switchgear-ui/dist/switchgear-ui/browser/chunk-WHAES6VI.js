import {
  FormsModule
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
  ReviewStateService,
  computed,
  inject,
  signal,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
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
  ɵɵpureFunction0,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-2AGIM5UM.js";

// src/app/components/product-catalog/product-catalog.component.ts
var _forTrack0 = ($index, $item) => $item.productKey;
var _c0 = () => [1, 2, 3, 4, 5, 6];
function ProductCatalogComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u2014 scored against your extracted configuration parameters. ");
  }
}
function ProductCatalogComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " . Upload and process an RFQ to see match scores. ");
  }
}
function ProductCatalogComponent_Conditional_11_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 9);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 10);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2605 ", ctx_r0.recommendedCount(), " recommended");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\u2713 ", ctx_r0.compatibleCount(), " compatible");
  }
}
function ProductCatalogComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6);
    \u0275\u0275template(1, ProductCatalogComponent_Conditional_11_Conditional_1_Template, 4, 2);
    \u0275\u0275elementStart(2, "span", 8);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275conditional(1, ctx_r0.hasParameters() ? 1 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r0.filtered().length, " shown");
  }
}
function ProductCatalogComponent_Conditional_12_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 14);
    \u0275\u0275element(1, "div", 15);
    \u0275\u0275elementStart(2, "div", 16);
    \u0275\u0275element(3, "div", 17)(4, "div", 18)(5, "div", 19)(6, "div", 20);
    \u0275\u0275elementEnd()();
  }
}
function ProductCatalogComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11)(1, "span", 12);
    \u0275\u0275text(2, "\u26A1");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3, " Fetching live ABB catalog\u2026 ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 13);
    \u0275\u0275repeaterCreate(5, ProductCatalogComponent_Conditional_12_For_6_Template, 7, 0, "div", 14, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(5);
    \u0275\u0275repeater(\u0275\u0275pureFunction0(0, _c0));
  }
}
function ProductCatalogComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u26A0\uFE0F ", ctx_r0.errorMsg(), "");
  }
}
function ProductCatalogComponent_Conditional_14_For_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 31);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_For_9_Template_button_click_0_listener() {
      const opt_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.setInsulation(opt_r4));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const opt_r4 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("chip--active", ctx_r0.insulationFilter() === opt_r4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(opt_r4);
  }
}
function ProductCatalogComponent_Conditional_14_For_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 31);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_For_14_Template_button_click_0_listener() {
      const opt_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.setMarket(opt_r6));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const opt_r6 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("chip--active", ctx_r0.marketFilter() === opt_r6);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(opt_r6);
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 38);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_Conditional_15_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.toggleCompatible());
    });
    \u0275\u0275text(1, " Compatible only ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("chip--active", ctx_r0.showOnlyCompatible());
    \u0275\u0275attribute("aria-pressed", ctx_r0.showOnlyCompatible());
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 39);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_Conditional_23_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.clearFilters());
    });
    \u0275\u0275text(1, "Clear filters");
    \u0275\u0275elementEnd();
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 33)(1, "span", 40);
    \u0275\u0275text(2, "\u{1F50D}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 41);
    \u0275\u0275text(4, "No products match your filters");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 42);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_Conditional_24_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.clearFilters());
    });
    \u0275\u0275text(6, "Clear filters");
    \u0275\u0275elementEnd()();
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 46);
  }
  if (rf & 2) {
    const p_r11 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", p_r11.imageUrl, \u0275\u0275sanitizeUrl)("alt", p_r11.productName);
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 54);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 55);
    \u0275\u0275element(2, "rect", 56)(3, "rect", 57)(4, "rect", 58)(5, "rect", 59)(6, "rect", 60)(7, "rect", 61)(8, "circle", 62);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(9, "span", 63);
    \u0275\u0275text(10, "No image");
    \u0275\u0275elementEnd()();
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 49)(1, "span", 64);
    \u0275\u0275text(2, "Match");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 65);
    \u0275\u0275element(4, "div", 66);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 67);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r11 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275classMapInterpolate1("score-fill ", ctx_r0.scoreBarClass(p_r11.matchScore), "");
    \u0275\u0275styleProp("width", ctx_r0.scorePercent(p_r11.matchScore));
    \u0275\u0275attribute("aria-valuenow", (p_r11.matchScore * 100).toFixed(0));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.scorePercent(p_r11.matchScore));
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_12_For_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li", 69);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r12 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2713 ", c_r12, "");
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 50)(1, "ul", 68);
    \u0275\u0275repeaterCreate(2, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_12_For_3_Template, 2, 1, "li", 69, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r11 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275repeater(p_r11.matchedCriteria);
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_13_For_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li", 70);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const m_r13 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2717 ", m_r13, "");
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 50)(1, "ul", 68);
    \u0275\u0275repeaterCreate(2, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_13_For_3_Template, 2, 1, "li", 70, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r11 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275repeater(p_r11.mismatches);
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 52);
    \u0275\u0275text(1, " View documentation \u2197 ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const p_r11 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("href", p_r11.documentationUrl, \u0275\u0275sanitizeUrl);
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span");
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u2713 Selected ");
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Select ");
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "article", 44)(1, "div", 45);
    \u0275\u0275template(2, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_2_Template, 1, 2, "img", 46)(3, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_3_Template, 11, 0);
    \u0275\u0275elementStart(4, "span");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 16)(7, "h3", 47);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 48);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275template(11, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_11_Template, 7, 7, "div", 49)(12, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_12_Template, 4, 0, "div", 50)(13, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_13_Template, 4, 0, "div", 50);
    \u0275\u0275elementStart(14, "div", 51);
    \u0275\u0275template(15, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_15_Template, 2, 1, "a", 52)(16, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_16_Template, 1, 0);
    \u0275\u0275elementStart(17, "button", 53);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Template_button_click_17_listener() {
      const p_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r0.selectProduct(p_r11));
    });
    \u0275\u0275template(18, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_18_Template, 1, 0)(19, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Conditional_19_Template, 1, 0);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const p_r11 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("product-card--recommended", p_r11.isRecommended)("product-card--compatible", p_r11.isCompatible && !p_r11.isRecommended)("product-card--unscored", p_r11.matchScore === 0)("product-card--selected", ctx_r0.isSelected(p_r11));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(2, p_r11.imageUrl ? 2 : 3);
    \u0275\u0275advance(2);
    \u0275\u0275classMapInterpolate1("product-card__status-badge ", ctx_r0.statusClass(p_r11), "");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.statusLabel(p_r11), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(p_r11.productName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r11.description);
    \u0275\u0275advance();
    \u0275\u0275conditional(11, ctx_r0.hasParameters() ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(12, p_r11.matchedCriteria.length > 0 ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(13, p_r11.mismatches.length > 0 ? 13 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(15, p_r11.documentationUrl ? 15 : 16);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("select-btn--selected", ctx_r0.isSelected(p_r11));
    \u0275\u0275advance();
    \u0275\u0275conditional(18, ctx_r0.isSelected(p_r11) ? 18 : 19);
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 34);
    \u0275\u0275repeaterCreate(1, ProductCatalogComponent_Conditional_14_Conditional_25_For_2_Template, 20, 22, "article", 43, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r0.filtered());
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 36)(1, "span", 71);
    \u0275\u0275text(2, "\u2713");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 72)(4, "strong");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275text(6, " selected for lineup ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 73);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_Conditional_27_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r14);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.selectProduct(ctx_r0.selectedProduct()));
    });
    \u0275\u0275text(8, " Change ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.selectedProduct().productName);
  }
}
function ProductCatalogComponent_Conditional_14_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 74);
    \u0275\u0275text(1, "No product selected \u2014 the top recommended will be auto-selected.");
    \u0275\u0275elementEnd();
  }
}
function ProductCatalogComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 21)(1, "div", 22)(2, "span", 23);
    \u0275\u0275text(3, "\u{1F50D}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 24);
    \u0275\u0275listener("input", function ProductCatalogComponent_Conditional_14_Template_input_input_4_listener($event) {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onSearch($event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 25)(6, "span", 26);
    \u0275\u0275text(7, "Insulation");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(8, ProductCatalogComponent_Conditional_14_For_9_Template, 2, 3, "button", 27, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 28)(11, "span", 26);
    \u0275\u0275text(12, "Market");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(13, ProductCatalogComponent_Conditional_14_For_14_Template, 2, 3, "button", 27, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275template(15, ProductCatalogComponent_Conditional_14_Conditional_15_Template, 2, 3, "button", 29);
    \u0275\u0275elementStart(16, "div", 30)(17, "span", 26);
    \u0275\u0275text(18, "Sort");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "button", 31);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_Template_button_click_19_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.setSort("score"));
    });
    \u0275\u0275text(20, " Match score ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "button", 31);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_Template_button_click_21_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.setSort("name"));
    });
    \u0275\u0275text(22, " Name ");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(23, ProductCatalogComponent_Conditional_14_Conditional_23_Template, 2, 0, "button", 32);
    \u0275\u0275elementEnd();
    \u0275\u0275template(24, ProductCatalogComponent_Conditional_14_Conditional_24_Template, 7, 0, "div", 33)(25, ProductCatalogComponent_Conditional_14_Conditional_25_Template, 3, 0, "div", 34);
    \u0275\u0275elementStart(26, "div", 35);
    \u0275\u0275template(27, ProductCatalogComponent_Conditional_14_Conditional_27_Template, 9, 1, "div", 36)(28, ProductCatalogComponent_Conditional_14_Conditional_28_Template, 2, 0);
    \u0275\u0275elementStart(29, "button", 37);
    \u0275\u0275listener("click", function ProductCatalogComponent_Conditional_14_Template_button_click_29_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.navigateNext());
    });
    \u0275\u0275text(30, " Continue to Lineup \u2192 ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r0.searchQuery());
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r0.insulationOptions);
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r0.marketOptions);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(15, ctx_r0.hasParameters() ? 15 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275classProp("chip--active", ctx_r0.sortKey() === "score");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("chip--active", ctx_r0.sortKey() === "name");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(23, ctx_r0.searchQuery() || ctx_r0.insulationFilter() !== "All" || ctx_r0.marketFilter() !== "All" || ctx_r0.showOnlyCompatible() ? 23 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(24, ctx_r0.filtered().length === 0 ? 24 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(25, ctx_r0.filtered().length > 0 ? 25 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(27, ctx_r0.selectedProduct() ? 27 : 28);
  }
}
var INSULATION_FILTERS = ["All", "AIS", "GIS (Dry Air)", "GIS (SF6)", "GIS (SF6-free)"];
var MARKET_FILTERS = ["All", "IEC", "ANSI"];
var ProductCatalogComponent = class _ProductCatalogComponent {
  constructor() {
    this.reviewState = inject(ReviewStateService);
    this.api = inject(PipelineApiService);
    this.router = inject(Router);
    this.destroyRef = inject(DestroyRef);
    this.loadState = signal("loading");
    this.errorMsg = signal(null);
    this.allProducts = signal([]);
    this.searchQuery = signal("");
    this.insulationFilter = signal("All");
    this.marketFilter = signal("All");
    this.sortKey = signal("score");
    this.showOnlyCompatible = signal(false);
    this.insulationOptions = INSULATION_FILTERS;
    this.marketOptions = MARKET_FILTERS;
    this.totalCount = computed(() => this.allProducts().length);
    this.filtered = computed(() => {
      const query = this.searchQuery().toLowerCase().trim();
      const ins = this.insulationFilter();
      const market = this.marketFilter();
      const onlyOk = this.showOnlyCompatible();
      const sort = this.sortKey();
      let list = this.allProducts().filter((p) => {
        if (onlyOk && !p.isCompatible && !p.isRecommended)
          return false;
        if (query && !p.productName.toLowerCase().includes(query) && !p.description.toLowerCase().includes(query))
          return false;
        if (ins !== "All") {
          const byType = p.insulationType === ins;
          const byDesc = p.description.toLowerCase().includes(ins.toLowerCase());
          if (!byType && !byDesc)
            return false;
        }
        if (market !== "All") {
          const inMarkets = p.markets.some((m) => m.toLowerCase() === market.toLowerCase());
          const matchedMarket = p.matchedCriteria.some((c) => c.toLowerCase().includes(market.toLowerCase()));
          if (!inMarkets && !matchedMarket && !p.description.toLowerCase().includes(market.toLowerCase()))
            return false;
        }
        return true;
      });
      list = [...list].sort((a, b) => {
        if (sort === "score")
          return b.matchScore - a.matchScore || a.productName.localeCompare(b.productName);
        return a.productName.localeCompare(b.productName);
      });
      return list;
    });
    this.recommendedCount = computed(() => this.filtered().filter((p) => p.isRecommended).length);
    this.compatibleCount = computed(() => this.filtered().filter((p) => p.isCompatible && !p.isRecommended).length);
    this.hasParameters = computed(() => this.allProducts().some((p) => p.matchScore > 0));
    this.selectedProduct = computed(() => this.reviewState.selectedProduct());
  }
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    const docId = this.reviewState.documentId();
    if (!docId) {
      this.loadState.set("error");
      this.errorMsg.set("No document selected. Upload a package first.");
      return;
    }
    this.api.getAllProducts(docId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.loadState.set("loaded");
      },
      error: (err) => {
        this.loadState.set("error");
        this.errorMsg.set(err.message ?? "Failed to load product catalog.");
      }
    });
  }
  // ── Helpers ────────────────────────────────────────────────────────────────
  statusLabel(p) {
    if (p.isRecommended)
      return "Recommended";
    if (p.isCompatible)
      return "Compatible";
    if (p.matchScore > 0)
      return "Partial";
    return "Not scored";
  }
  statusClass(p) {
    if (p.isRecommended)
      return "status--recommended";
    if (p.isCompatible)
      return "status--compatible";
    if (p.matchScore > 0)
      return "status--partial";
    return "status--none";
  }
  scoreBarClass(score) {
    if (score >= 0.85)
      return "bar--high";
    if (score >= 0.65)
      return "bar--mid";
    if (score > 0)
      return "bar--low";
    return "bar--zero";
  }
  scorePercent(score) {
    return (score * 100).toFixed(0) + "%";
  }
  onSearch(event) {
    this.searchQuery.set(event.target.value);
  }
  setInsulation(f) {
    this.insulationFilter.set(f);
  }
  setMarket(f) {
    this.marketFilter.set(f);
  }
  setSort(k) {
    this.sortKey.set(k);
  }
  toggleCompatible() {
    this.showOnlyCompatible.update((v) => !v);
  }
  clearFilters() {
    this.searchQuery.set("");
    this.insulationFilter.set("All");
    this.marketFilter.set("All");
    this.showOnlyCompatible.set(false);
  }
  selectProduct(p) {
    this.reviewState.setSelectedProduct(p);
  }
  isSelected(p) {
    return this.reviewState.selectedProduct()?.productKey === p.productKey;
  }
  navigateNext() {
    if (!this.reviewState.selectedProduct()) {
      const products = this.allProducts();
      const auto = products.find((p) => p.isRecommended) ?? products.find((p) => p.isCompatible) ?? products[0] ?? null;
      if (auto)
        this.reviewState.setSelectedProduct(auto);
    }
    this.router.navigate(["/review/lineup"]);
  }
  trackByKey(_i, p) {
    return p.productKey;
  }
  static {
    this.\u0275fac = function ProductCatalogComponent_Factory(t) {
      return new (t || _ProductCatalogComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ProductCatalogComponent, selectors: [["app-product-catalog"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 15, vars: 6, consts: [[1, "catalog-page"], [1, "catalog-header"], [1, "catalog-header__text"], [1, "catalog-header__title"], ["title", "Data fetched live from ABB Sales Configurator API", 1, "live-badge"], [1, "catalog-header__subtitle"], [1, "catalog-header__stats"], ["role", "alert", 1, "inline-error"], [1, "stat", "stat--total"], [1, "stat", "stat--recommended"], [1, "stat", "stat--compatible"], [1, "loading-message"], ["aria-hidden", "true", 1, "loading-message__icon"], [1, "skeleton-grid"], [1, "product-card", "product-card--skeleton"], [1, "skeleton", "skeleton--img"], [1, "product-card__body"], [1, "skeleton", "skeleton--title"], [1, "skeleton", "skeleton--desc"], [1, "skeleton", "skeleton--desc", "skeleton--desc-short"], [1, "skeleton", "skeleton--bar"], [1, "filter-bar", "card"], [1, "filter-bar__search"], ["aria-hidden", "true", 1, "filter-bar__search-icon"], ["type", "search", "placeholder", "Search products\u2026", "aria-label", "Search products", 1, "filter-bar__input", 3, "input", "value"], ["role", "group", "aria-label", "Filter by insulation", 1, "filter-group"], [1, "filter-group__label"], [1, "chip", 3, "chip--active"], ["role", "group", "aria-label", "Filter by market", 1, "filter-group"], [1, "chip", "chip--toggle", 3, "chip--active"], ["role", "group", "aria-label", "Sort", 1, "filter-group", "filter-group--right"], [1, "chip", 3, "click"], [1, "clear-btn"], [1, "empty-state"], [1, "product-grid"], [1, "catalog-footer"], [1, "selection-summary"], [1, "btn", "btn--primary", 3, "click"], [1, "chip", "chip--toggle", 3, "click"], [1, "clear-btn", 3, "click"], [1, "empty-state__icon"], [1, "empty-state__title"], [1, "chip", "chip--active", 3, "click"], [1, "product-card", 3, "product-card--recommended", "product-card--compatible", "product-card--unscored", "product-card--selected"], [1, "product-card"], [1, "product-card__img-wrap"], ["loading", "lazy", 1, "product-card__img", 3, "src", "alt"], [1, "product-card__name"], [1, "product-card__desc"], [1, "score-row"], [1, "criteria-section"], [1, "product-card__footer"], ["target", "_blank", "rel", "noopener noreferrer", 1, "doc-link", 3, "href"], [1, "select-btn", 3, "click"], ["aria-hidden", "true", 1, "product-card__placeholder"], ["viewBox", "0 0 80 80", "fill", "none", "xmlns", "http://www.w3.org/2000/svg", 1, "product-card__placeholder-svg"], ["width", "80", "height", "80", "rx", "8", "fill", "#e8eaf6"], ["x", "22", "y", "16", "width", "36", "height", "48", "rx", "4", "fill", "#9fa8da"], ["x", "28", "y", "22", "width", "10", "height", "10", "rx", "2", "fill", "#fff", "opacity", ".85"], ["x", "42", "y", "22", "width", "10", "height", "10", "rx", "2", "fill", "#fff", "opacity", ".85"], ["x", "28", "y", "38", "width", "24", "height", "4", "rx", "2", "fill", "#fff", "opacity", ".7"], ["x", "28", "y", "46", "width", "18", "height", "4", "rx", "2", "fill", "#fff", "opacity", ".5"], ["cx", "40", "cy", "60", "r", "4", "fill", "#5c6bc0"], [1, "product-card__placeholder-label"], [1, "score-row__label"], [1, "score-track"], ["role", "progressbar", "aria-valuemin", "0", "aria-valuemax", "100"], [1, "score-row__value"], [1, "chip-list"], [1, "criterion", "criterion--match"], [1, "criterion", "criterion--miss"], [1, "selection-summary__check"], [1, "selection-summary__text"], ["title", "Change selection", 1, "selection-summary__clear", 3, "click"], [1, "selection-hint"]], template: function ProductCatalogComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "h2", 3);
        \u0275\u0275text(4, " ABB Switchgear Catalog ");
        \u0275\u0275elementStart(5, "span", 4);
        \u0275\u0275text(6, "Live");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(7, "p", 5);
        \u0275\u0275text(8);
        \u0275\u0275template(9, ProductCatalogComponent_Conditional_9_Template, 1, 0)(10, ProductCatalogComponent_Conditional_10_Template, 1, 0);
        \u0275\u0275elementEnd()();
        \u0275\u0275template(11, ProductCatalogComponent_Conditional_11_Template, 4, 2, "div", 6);
        \u0275\u0275elementEnd();
        \u0275\u0275template(12, ProductCatalogComponent_Conditional_12_Template, 7, 1)(13, ProductCatalogComponent_Conditional_13_Template, 2, 1, "div", 7)(14, ProductCatalogComponent_Conditional_14_Template, 31, 10);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        \u0275\u0275advance(8);
        \u0275\u0275textInterpolate1(" All ", ctx.totalCount(), " products in the ABB medium-voltage switchgear catalog ");
        \u0275\u0275advance();
        \u0275\u0275conditional(9, ctx.hasParameters() ? 9 : 10);
        \u0275\u0275advance(2);
        \u0275\u0275conditional(11, ctx.loadState() === "loaded" ? 11 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(12, ctx.loadState() === "loading" ? 12 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(13, ctx.loadState() === "error" ? 13 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(14, ctx.loadState() === "loaded" ? 14 : -1);
      }
    }, dependencies: [CommonModule, FormsModule], styles: ['@charset "UTF-8";\n\n\n\n.catalog-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.25rem;\n}\n.catalog-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n.catalog-header__title[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n  font-weight: 700;\n  margin: 0 0 0.2rem;\n  color: #1a1a2e;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.catalog-header__subtitle[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: #616161;\n  margin: 0;\n}\n.catalog-header__stats[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  flex-wrap: wrap;\n  padding-top: 0.15rem;\n}\n.live-badge[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  padding: 0.1rem 0.45rem;\n  border-radius: 8px;\n  background: #e8f5e9;\n  color: #2e7d32;\n  border: 1px solid #a5d6a7;\n  vertical-align: middle;\n}\n.loading-message[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: #616161;\n  margin-bottom: 0.5rem;\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n.loading-message__icon[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_pulse 1.2s ease-in-out infinite;\n}\n@keyframes _ngcontent-%COMP%_pulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.4;\n  }\n}\n.stat[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  padding: 0.18rem 0.6rem;\n  border-radius: 10px;\n}\n.stat--recommended[_ngcontent-%COMP%] {\n  background: #fff8e1;\n  color: #f57f17;\n  border: 1px solid #ffe082;\n}\n.stat--compatible[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  color: #2e7d32;\n  border: 1px solid #a5d6a7;\n}\n.stat--total[_ngcontent-%COMP%] {\n  background: #e3f2fd;\n  color: #1565c0;\n  border: 1px solid #90caf9;\n}\n.filter-bar[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 0.75rem 1rem;\n}\n.filter-bar__search[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  background: #f5f5f5;\n  border: 1px solid #e0e0e0;\n  border-radius: 6px;\n  padding: 0.3rem 0.65rem;\n  flex: 1;\n  min-width: 180px;\n}\n.filter-bar__search-icon[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n}\n.filter-bar__input[_ngcontent-%COMP%] {\n  border: none;\n  background: transparent;\n  outline: none;\n  font-size: 0.85rem;\n  color: #212121;\n  width: 100%;\n}\n.filter-bar__input[_ngcontent-%COMP%]::placeholder {\n  color: #9e9e9e;\n}\n.filter-group[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n  flex-wrap: wrap;\n}\n.filter-group__label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: #9e9e9e;\n  white-space: nowrap;\n}\n.filter-group--right[_ngcontent-%COMP%] {\n  margin-left: auto;\n}\n.chip[_ngcontent-%COMP%] {\n  padding: 0.22rem 0.65rem;\n  border-radius: 14px;\n  font-size: 0.75rem;\n  font-weight: 500;\n  border: 1px solid #e0e0e0;\n  background: #fafafa;\n  color: #424242;\n  cursor: pointer;\n  transition:\n    background 0.12s,\n    border-color 0.12s,\n    color 0.12s;\n  white-space: nowrap;\n}\n.chip[_ngcontent-%COMP%]:hover {\n  border-color: #90caf9;\n  background: #e3f2fd;\n  color: #1565c0;\n}\n.chip--active[_ngcontent-%COMP%] {\n  background: #1565c0;\n  border-color: #1565c0;\n  color: #fff;\n}\n.chip--active[_ngcontent-%COMP%]:hover {\n  background: #0d47a1;\n  border-color: #0d47a1;\n}\n.chip--toggle[_ngcontent-%COMP%] {\n  border-style: dashed;\n}\n.clear-btn[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #1565c0;\n  background: none;\n  border: none;\n  cursor: pointer;\n  padding: 0 0.2rem;\n  text-decoration: underline;\n}\n.clear-btn[_ngcontent-%COMP%]:hover {\n  color: #0d47a1;\n}\n.skeleton-grid[_ngcontent-%COMP%], .product-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));\n  gap: 1.1rem;\n}\n.product-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  border: 2px solid #e0e0e0;\n  border-radius: 10px;\n  overflow: hidden;\n  background: #fff;\n  transition:\n    box-shadow 0.15s,\n    border-color 0.15s,\n    transform 0.1s;\n}\n.product-card[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);\n  border-color: #90caf9;\n  transform: translateY(-2px);\n}\n.product-card--recommended[_ngcontent-%COMP%] {\n  border-color: #ffb300;\n}\n.product-card--recommended[_ngcontent-%COMP%]:hover {\n  border-color: #f57f17;\n  box-shadow: 0 4px 16px rgba(255, 160, 0, 0.2);\n}\n.product-card--compatible[_ngcontent-%COMP%] {\n  border-color: #66bb6a;\n}\n.product-card--compatible[_ngcontent-%COMP%]:hover {\n  border-color: #2e7d32;\n  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.15);\n}\n.product-card--unscored[_ngcontent-%COMP%] {\n  opacity: 0.72;\n  border-color: #e0e0e0;\n}\n.product-card--selected[_ngcontent-%COMP%] {\n  border-color: #1565c0 !important;\n  box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.18);\n}\n.product-card--selected[_ngcontent-%COMP%]   .product-card__img-wrap[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  border: 3px solid #1565c0;\n  border-radius: inherit;\n  pointer-events: none;\n}\n.product-card--skeleton[_ngcontent-%COMP%] {\n  pointer-events: none;\n}\n.product-card__img-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  background: #f5f5f5;\n  height: 180px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n.product-card__img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 180px;\n  object-fit: contain;\n  padding: 0.75rem;\n}\n.product-card__placeholder[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.4rem;\n  opacity: 0.55;\n}\n.product-card__placeholder-svg[_ngcontent-%COMP%] {\n  width: 72px;\n  height: 72px;\n}\n.product-card__placeholder-label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: #9e9e9e;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.product-card__status-badge[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  font-size: 0.68rem;\n  font-weight: 700;\n  padding: 0.15rem 0.5rem;\n  border-radius: 10px;\n}\n.product-card__body[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.55rem;\n  padding: 0.9rem;\n  flex: 1;\n}\n.product-card__name[_ngcontent-%COMP%] {\n  font-size: 0.95rem;\n  font-weight: 700;\n  margin: 0;\n  color: #1a1a2e;\n  line-height: 1.3;\n}\n.product-card__desc[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #616161;\n  margin: 0;\n  line-height: 1.5;\n}\n.product-card__footer[_ngcontent-%COMP%] {\n  margin-top: auto;\n  padding-top: 0.4rem;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.select-btn[_ngcontent-%COMP%] {\n  padding: 0.22rem 0.75rem;\n  border-radius: 14px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  border: 1.5px solid #1565c0;\n  background: transparent;\n  color: #1565c0;\n  cursor: pointer;\n  transition: background 0.12s, color 0.12s;\n  white-space: nowrap;\n}\n.select-btn[_ngcontent-%COMP%]:hover {\n  background: #e3f2fd;\n}\n.select-btn--selected[_ngcontent-%COMP%] {\n  background: #1565c0;\n  color: #fff;\n}\n.select-btn--selected[_ngcontent-%COMP%]:hover {\n  background: #0d47a1;\n  border-color: #0d47a1;\n}\n.status--recommended[_ngcontent-%COMP%] {\n  background: #fff8e1;\n  color: #f57f17;\n  border: 1px solid #ffe082;\n}\n.status--compatible[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  color: #2e7d32;\n  border: 1px solid #a5d6a7;\n}\n.status--partial[_ngcontent-%COMP%] {\n  background: #e3f2fd;\n  color: #1565c0;\n  border: 1px solid #90caf9;\n}\n.status--none[_ngcontent-%COMP%] {\n  background: #f5f5f5;\n  color: #9e9e9e;\n  border: 1px solid #e0e0e0;\n}\n.score-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.score-row__label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: #9e9e9e;\n  white-space: nowrap;\n}\n.score-row__value[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: #212121;\n  white-space: nowrap;\n  min-width: 2.5rem;\n  text-align: right;\n}\n.score-track[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 6px;\n  background: #e0e0e0;\n  border-radius: 3px;\n  overflow: hidden;\n}\n.score-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  border-radius: 3px;\n  transition: width 0.5s ease;\n}\n.score-fill.bar--high[_ngcontent-%COMP%] {\n  background: #2e7d32;\n}\n.score-fill.bar--mid[_ngcontent-%COMP%] {\n  background: #f57f17;\n}\n.score-fill.bar--low[_ngcontent-%COMP%] {\n  background: #c62828;\n}\n.score-fill.bar--zero[_ngcontent-%COMP%] {\n  background: #e0e0e0;\n  width: 0 !important;\n}\n.criteria-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.chip-list[_ngcontent-%COMP%] {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n}\n.criterion[_ngcontent-%COMP%] {\n  font-size: 0.66rem;\n  padding: 0.08rem 0.4rem;\n  border-radius: 10px;\n  white-space: nowrap;\n}\n.criterion--match[_ngcontent-%COMP%] {\n  background: #e8f5e9;\n  color: #2e7d32;\n}\n.criterion--miss[_ngcontent-%COMP%] {\n  background: #fce4ec;\n  color: #b71c1c;\n}\n.doc-link[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: #1565c0;\n  text-decoration: none;\n}\n.doc-link[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n.skeleton[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #e0e0e0 25%,\n      #f5f5f5 50%,\n      #e0e0e0 75%);\n  background-size: 200% 100%;\n  animation: _ngcontent-%COMP%_shimmer 1.4s infinite;\n  border-radius: 4px;\n}\n.skeleton--img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 180px;\n  border-radius: 0;\n}\n.skeleton--title[_ngcontent-%COMP%] {\n  width: 65%;\n  height: 16px;\n  margin: 0 0 0.25rem;\n}\n.skeleton--desc[_ngcontent-%COMP%] {\n  width: 95%;\n  height: 12px;\n}\n.skeleton--desc-short[_ngcontent-%COMP%] {\n  width: 70% !important;\n}\n.skeleton--bar[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 8px;\n  margin-top: 0.3rem;\n}\n@keyframes _ngcontent-%COMP%_shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 3rem 1rem;\n  text-align: center;\n}\n.empty-state__icon[_ngcontent-%COMP%] {\n  font-size: 2.5rem;\n}\n.empty-state__title[_ngcontent-%COMP%] {\n  font-size: 0.95rem;\n  font-weight: 700;\n  color: #424242;\n  margin: 0;\n}\n.inline-error[_ngcontent-%COMP%] {\n  padding: 0.75rem 1rem;\n  background: #fce4ec;\n  border-left: 4px solid #c62828;\n  border-radius: 4px;\n  font-size: 0.85rem;\n  color: #b71c1c;\n}\n.catalog-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: 1rem;\n  padding-top: 0.5rem;\n  flex-wrap: wrap;\n}\n.selection-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  background: #e8f5e9;\n  border: 1px solid #a5d6a7;\n  border-radius: 8px;\n  padding: 0.35rem 0.75rem;\n  font-size: 0.82rem;\n  color: #1b5e20;\n}\n.selection-summary__check[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  color: #2e7d32;\n}\n.selection-summary__text[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.selection-summary__clear[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  font-size: 0.75rem;\n  color: #1565c0;\n  cursor: pointer;\n  text-decoration: underline;\n  padding: 0;\n}\n.selection-summary__clear[_ngcontent-%COMP%]:hover {\n  color: #0d47a1;\n}\n.selection-hint[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #9e9e9e;\n  margin: 0;\n  font-style: italic;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 0.55rem 1.4rem;\n  border-radius: 6px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.btn--primary[_ngcontent-%COMP%] {\n  background: #1565c0;\n  color: #fff;\n}\n.btn--primary[_ngcontent-%COMP%]:hover {\n  background: #0d47a1;\n}\n/*# sourceMappingURL=product-catalog.component.css.map */'], changeDetection: 0 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ProductCatalogComponent, { className: "ProductCatalogComponent", filePath: "src\\app\\components\\product-catalog\\product-catalog.component.ts", lineNumber: 35 });
})();
export {
  ProductCatalogComponent
};
//# sourceMappingURL=chunk-WHAES6VI.js.map
