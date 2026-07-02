import { Injectable, signal, computed } from '@angular/core';
import { ReviewOverride, DeviationItem, DocumentStatus, ExtractedParameter, ProductMatch, SwitchgearInstance, SwitchgearCubicle, CubicleDevice } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReviewStateService {
  // Selected document
  private readonly _documentId = signal<string | null>(null);
  private readonly _status = signal<DocumentStatus | null>(null);
  private readonly _overallConfidence = signal<number | null>(null);
  private readonly _productName   = signal<string>('Switchgear');
  private readonly _productFamily = signal<string>('Switchgear');

  // Cached API responses — avoids re-fetching on every navigation between steps
  private readonly _cachedParameters    = signal<ExtractedParameter[] | null>(null);
  private readonly _cachedInstances     = signal<SwitchgearInstance[] | null>(null);
  private readonly _cachedCubicles      = signal<SwitchgearCubicle[] | null>(null);
  private readonly _cachedCubicleDevices = signal<CubicleDevice[] | null>(null);
  private readonly _cachedProductMatches = signal<ProductMatch[] | null>(null);

  readonly cachedParameters     = this._cachedParameters.asReadonly();
  readonly cachedInstances      = this._cachedInstances.asReadonly();
  readonly cachedCubicles       = this._cachedCubicles.asReadonly();
  readonly cachedCubicleDevices = this._cachedCubicleDevices.asReadonly();
  readonly cachedProductMatches = this._cachedProductMatches.asReadonly();

  // Per-field overrides: key = parameter name
  private readonly _overrides = signal<Map<string, ReviewOverride>>(new Map());

  // Resolved deviation IDs
  private readonly _resolvedIds = signal<Set<string>>(new Set());

  // Unresolved high-severity deviation count (set by DeviationPanelComponent)
  private readonly _unresolvedHighCount = signal<number>(0);

  // Set to true once parameters are saved; suppresses the unsaved-changes guard
  // so the "Save & Continue" button can navigate without a confirmation prompt.
  private readonly _parametersSaved = signal(false);

  // Product selected from the catalog page
  private readonly _selectedProduct = signal<ProductMatch | null>(null);
  readonly selectedProduct = this._selectedProduct.asReadonly();

  // Dirty state — false once the user explicitly saves parameter overrides
  readonly isDirty = computed(() => this._overrides().size > 0 && !this._parametersSaved());

  // Public readable signals
  readonly documentId = this._documentId.asReadonly();
  readonly status = this._status.asReadonly();
  readonly overallConfidence = this._overallConfidence.asReadonly();
  readonly unresolvedHighCount = this._unresolvedHighCount.asReadonly();
  readonly productName   = this._productName.asReadonly();
  readonly productFamily = this._productFamily.asReadonly();

  setSelectedProduct(product: ProductMatch | null): void {
    this._selectedProduct.set(product);
  }

  setProductName(name: string): void {
    this._productName.set(name);
  }

  setProductFamily(family: string): void {
    this._productFamily.set(family);
  }

  setDocument(id: string, status: DocumentStatus, confidence: number): void {
    // Clear all caches when a new document is selected
    if (id !== this._documentId()) {
      this._cachedParameters.set(null);
      this._cachedInstances.set(null);
      this._cachedCubicles.set(null);
      this._cachedCubicleDevices.set(null);
      this._cachedProductMatches.set(null);
    }
    this._documentId.set(id);
    this._status.set(status);
    this._overallConfidence.set(confidence);
  }

  setCachedParameters(params: ExtractedParameter[] | null): void {
    this._cachedParameters.set(params);
  }

  setCachedInstances(instances: SwitchgearInstance[] | null): void {
    this._cachedInstances.set(instances);
  }

  setCachedCubicles(cubicles: SwitchgearCubicle[] | null): void {
    this._cachedCubicles.set(cubicles);
  }

  setCachedCubicleDevices(devices: CubicleDevice[] | null): void {
    this._cachedCubicleDevices.set(devices);
  }

  setCachedProductMatches(matches: ProductMatch[] | null): void {
    this._cachedProductMatches.set(matches);
  }

  setStatus(status: DocumentStatus): void {
    this._status.set(status);
  }

  setOverallConfidence(confidence: number): void {
    this._overallConfidence.set(confidence);
  }

  markParametersSaved(): void {
    this._parametersSaved.set(true);
  }

  setOverride(override: ReviewOverride): void {
    // Any new override re-dirties the form so the guard activates again
    this._parametersSaved.set(false);
    this._overrides.update(map => {
      const updated = new Map(map);
      updated.set(override.parameterName, override);
      return updated;
    });
  }

  removeOverride(parameterName: string): void {
    this._overrides.update(map => {
      const updated = new Map(map);
      updated.delete(parameterName);
      return updated;
    });
  }

  getOverrides(): ReviewOverride[] {
    return Array.from(this._overrides().values());
  }

  resolveDeviation(id: string): void {
    this._resolvedIds.update(set => new Set([...set, id]));
  }

  isDeviationResolved(id: string): boolean {
    return this._resolvedIds().has(id);
  }

  setUnresolvedHighCount(count: number): void {
    this._unresolvedHighCount.set(count);
  }

  getResolvedDeviationIds(): string[] {
    return Array.from(this._resolvedIds());
  }

  clearState(): void {
    this._documentId.set(null);
    this._status.set(null);
    this._overallConfidence.set(null);
    this._overrides.set(new Map());
    this._resolvedIds.set(new Set());
    this._unresolvedHighCount.set(0);
    this._parametersSaved.set(false);
    this._cachedParameters.set(null);
    this._cachedInstances.set(null);
    this._cachedCubicles.set(null);
    this._cachedCubicleDevices.set(null);
    this._cachedProductMatches.set(null);
    this._selectedProduct.set(null);
    this._productName.set('Switchgear');
    this._productFamily.set('Switchgear');
  }
}
