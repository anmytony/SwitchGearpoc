import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  computed,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewStateService } from '../../services/review-state.service';
import { PipelineApiService } from '../../services/pipeline-api.service';
import { ProductMatch } from '../../models/models';

type LoadState = 'loading' | 'loaded' | 'error';
type SortKey  = 'score' | 'name';

const INSULATION_FILTERS = ['All', 'AIS', 'GIS (Dry Air)', 'GIS (SF6)', 'GIS (SF6-free)'] as const;
const MARKET_FILTERS     = ['All', 'IEC', 'ANSI'] as const;

type InsulationFilter = typeof INSULATION_FILTERS[number];
type MarketFilter     = typeof MARKET_FILTERS[number];

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.scss']
})
export class ProductCatalogComponent implements OnInit {
  private readonly reviewState = inject(ReviewStateService);
  private readonly api         = inject(PipelineApiService);
  private readonly router      = inject(Router);
  private readonly destroyRef  = inject(DestroyRef);

  // ── State ──────────────────────────────────────────────────────────────────

  readonly loadState  = signal<LoadState>('loading');
  readonly errorMsg   = signal<string | null>(null);
  readonly allProducts = signal<ProductMatch[]>([]);

  readonly searchQuery       = signal('');
  readonly insulationFilter  = signal<InsulationFilter>('All');
  readonly marketFilter      = signal<MarketFilter>('All');
  readonly sortKey           = signal<SortKey>('score');
  readonly showOnlyCompatible = signal(false);

  readonly insulationOptions = INSULATION_FILTERS;
  readonly marketOptions     = MARKET_FILTERS;

  // ── Computed ───────────────────────────────────────────────────────────────

  readonly totalCount = computed(() => this.allProducts().length);

  readonly filtered = computed(() => {
    const query  = this.searchQuery().toLowerCase().trim();
    const ins    = this.insulationFilter();
    const market = this.marketFilter();
    const onlyOk = this.showOnlyCompatible();
    const sort   = this.sortKey();

    let list = this.allProducts().filter(p => {
      if (onlyOk && !p.isCompatible && !p.isRecommended) return false;
      if (query && !p.productName.toLowerCase().includes(query) &&
                   !p.description.toLowerCase().includes(query)) return false;
      if (ins !== 'All') {
        // Use structured insulationType field; fall back to description text search
        const byType = p.insulationType === ins;
        const byDesc = p.description.toLowerCase().includes(ins.toLowerCase());
        if (!byType && !byDesc) return false;
      }
      if (market !== 'All') {
        // Use structured markets array; fall back to description/criteria check
        const inMarkets = p.markets.some(m => m.toLowerCase() === market.toLowerCase());
        const matchedMarket = p.matchedCriteria.some(c => c.toLowerCase().includes(market.toLowerCase()));
        if (!inMarkets && !matchedMarket &&
            !p.description.toLowerCase().includes(market.toLowerCase())) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === 'score') return b.matchScore - a.matchScore || a.productName.localeCompare(b.productName);
      return a.productName.localeCompare(b.productName);
    });

    return list;
  });

  readonly recommendedCount = computed(() =>
    this.filtered().filter(p => p.isRecommended).length
  );

  readonly compatibleCount = computed(() =>
    this.filtered().filter(p => p.isCompatible && !p.isRecommended).length
  );

  readonly hasParameters = computed(() =>
    this.allProducts().some(p => p.matchScore > 0)
  );

  readonly selectedProduct = computed(() => this.reviewState.selectedProduct());

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const docId = this.reviewState.documentId();
    if (!docId) {
      this.loadState.set('error');
      this.errorMsg.set('No document selected. Upload a package first.');
      return;
    }
    this.api.getAllProducts(docId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: products => {
        this.allProducts.set(products);
        this.loadState.set('loaded');
      },
      error: (err: Error) => {
        this.loadState.set('error');
        this.errorMsg.set(err.message ?? 'Failed to load product catalog.');
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  statusLabel(p: ProductMatch): string {
    if (p.isRecommended) return 'Recommended';
    if (p.isCompatible)  return 'Compatible';
    if (p.matchScore > 0) return 'Partial';
    return 'Not scored';
  }

  statusClass(p: ProductMatch): string {
    if (p.isRecommended) return 'status--recommended';
    if (p.isCompatible)  return 'status--compatible';
    if (p.matchScore > 0) return 'status--partial';
    return 'status--none';
  }

  scoreBarClass(score: number): string {
    if (score >= 0.85) return 'bar--high';
    if (score >= 0.65) return 'bar--mid';
    if (score > 0)     return 'bar--low';
    return 'bar--zero';
  }

  scorePercent(score: number): string {
    return (score * 100).toFixed(0) + '%';
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setInsulation(f: InsulationFilter): void { this.insulationFilter.set(f); }
  setMarket(f: MarketFilter): void         { this.marketFilter.set(f); }
  setSort(k: SortKey): void                { this.sortKey.set(k); }
  toggleCompatible(): void                 { this.showOnlyCompatible.update(v => !v); }

  clearFilters(): void {
    this.searchQuery.set('');
    this.insulationFilter.set('All');
    this.marketFilter.set('All');
    this.showOnlyCompatible.set(false);
  }

  selectProduct(p: ProductMatch): void {
    this.reviewState.setSelectedProduct(p);
  }

  isSelected(p: ProductMatch): boolean {
    return this.reviewState.selectedProduct()?.productKey === p.productKey;
  }

  navigateNext(): void {
    // Auto-select the top recommended (or best-scored) product if engineer hasn't picked one
    if (!this.reviewState.selectedProduct()) {
      const products = this.allProducts();
      const auto =
        products.find(p => p.isRecommended) ??
        products.find(p => p.isCompatible)  ??
        products[0] ?? null;
      if (auto) this.reviewState.setSelectedProduct(auto);
    }
    this.router.navigate(['/review/lineup']);
  }

  trackByKey(_i: number, p: ProductMatch): string { return p.productKey; }
}
