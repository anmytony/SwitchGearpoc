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
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewStateService } from '../../services/review-state.service';
import { PipelineApiService } from '../../services/pipeline-api.service';
import { SwitchgearCubicle, SwitchgearInstance, CubicleDevice, CubicleType, ProductMatch, TopologySummary, LineupDevicesResponse, CubicleDeviceDetails, DeviceParameter } from '../../models/models';
import { CubicleDeviceDetailsComponent } from './cubicle-device-details.component';

type LoadState = 'loading' | 'loaded' | 'error' | 'empty';

interface TopologyWarning {
  severity: 'high' | 'medium';
  message: string;
}

@Component({
  selector: 'app-lineup-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CubicleDeviceDetailsComponent],
  templateUrl: './lineup-view.component.html',
  styleUrls: ['./lineup-view.component.scss']
})
export class LineupViewComponent implements OnInit {
  private readonly reviewState = inject(ReviewStateService);
  private readonly api = inject(PipelineApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loadState = signal<LoadState>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly cubicles = signal<SwitchgearCubicle[]>([]);
  readonly instances = signal<SwitchgearInstance[]>([]);
  readonly selectedInstanceId = signal<number | null>(null);
  readonly cubicleDevices = signal<CubicleDevice[]>([]);
  readonly cubicleDevicesLoadState = signal<'loading' | 'loaded' | 'empty'>('loading');
  readonly selectedDiagramPos = signal<number | null>(null);
  
  // New: Enhanced device details
  readonly lineupDevicesResponse = signal<LineupDevicesResponse | null>(null);
  readonly lineupDevicesLoadState = signal<'loading' | 'loaded' | 'error' | 'empty'>('loading');

  readonly isMultiInstance = computed(() => this.instances().length > 1);

  readonly instanceCubicles = computed(() => {
    const instId = this.selectedInstanceId();
    const all = this.cubicles();
    if (instId === null) return all;
    const filtered = all.filter(c => c.switchgearInstanceId === instId);
    return filtered.length > 0 ? filtered : all.filter(c => c.switchgearInstanceId === null);
  });

  readonly selectedDiagramCubicle = computed(() => {
    const pos = this.selectedDiagramPos();
    return pos !== null ? (this.instanceCubicles().find(c => c.position === pos) ?? null) : null;
  });

  readonly selectedCubicleDevices = computed(() => {
    const pos = this.selectedDiagramPos();
    const instId = this.selectedInstanceId();
    const devs = this.cubicleDevices();
    const instanceDevs = instId !== null
      ? devs.filter(d => d.switchgearInstanceId === instId || d.switchgearInstanceId === null)
      : devs;
    if (pos === null) return instanceDevs;
    const posStr = String(pos);
    const filtered = instanceDevs.filter(d =>
      d.functionalPosition === posStr ||
      d.functionalPosition === posStr.padStart(2, '0') ||
      d.functionalPosition === posStr.padStart(3, '0')
    );
    return filtered.length > 0 ? filtered : instanceDevs.filter(d => d.functionalPosition === posStr);
  });

  // Get device details for the selected cubicle.
  // Priority: (1) detailed API data from CubicleDeviceExtractions, (2) inline fields on SwitchgearCubicle.
  readonly selectedDeviceDetails = computed<CubicleDeviceDetails | null>(() => {
    const diagramCubicle = this.selectedDiagramCubicle();
    if (!diagramCubicle) return null;

    const response = this.lineupDevicesResponse();
    if (response?.switchgearInstances?.length) {
      const selectedInstance = this.selectedInstanceId();
      const instance = selectedInstance !== null
        ? response.switchgearInstances.find(i => i.instanceId === selectedInstance)
        : response.switchgearInstances[0];

      if (instance) {
        const fp = diagramCubicle.functionalPosition;
        if (fp) {
          const byFp = instance.cubicles.find(c => c.functionalPosition === fp);
          if (byFp) return byFp;
        }
        const byPos = instance.cubicles.find(c => c.position === diagramCubicle.position);
        if (byPos) return byPos;
      }
    }

    // Fallback: build from the inline fields stored on SwitchgearCubicle (populated by lineup reconstruction)
    return this.buildFallbackDetails(diagramCubicle);
  });

  private buildFallbackDetails(cub: SwitchgearCubicle): CubicleDeviceDetails {
    const p = (value: string): DeviceParameter => ({ value: value ?? '', confidence: 0.7, source: 'SLD', sourcePage: 0 });
    const devDesc = (typeName: string, fallback = ''): string => {
      const dev = cub.devices.find(d => d.name === typeName);
      return (dev?.description && dev.description !== 'Detected from SLD') ? dev.description : fallback;
    };
    const hasCB = cub.devices.some(d => d.name === 'Circuit Breaker');
    return {
      position: cub.position,
      functionalPosition: cub.functionalPosition ?? '',
      panelType: cub.type,
      circuitBreaker: {
        model: p(devDesc('Circuit Breaker', cub.cbModel) || (hasCB ? 'Present' : '')),
        rating: p(cub.cbRating)
      },
      currentTransformer: { ratio: p(devDesc('CT', cub.ctRatio)) },
      voltageTransformer: { ratio: p(devDesc('VT', cub.vtRatio)) },
      protectionRelay: {
        model: p(devDesc('Protection Relay', cub.relayModel)),
        protectionFunctions: cub.protectionFunctions ?? [],
        protectionFunctionsConfidence: 0.7,
        protectionFunctionsSource: 'SLD',
        communicationProtocol: [],
      },
      disconnector: {},
      earthingSwitch: { present: false },
      surgeArrester: { present: false },
      auxiliary: {},
    };
  }

  deviceDesc(cub: SwitchgearCubicle, typeName: string): string {
    const dev = cub.devices.find(d => d.name === typeName);
    if (!dev) return '—';
    if (dev.description && dev.description !== 'Detected from SLD') return dev.description;
    return '✓';
  }

  deviceChips(cub: SwitchgearCubicle): { label: string; value: string }[] {
    const chips: { label: string; value: string }[] = [];
    const abbrev: Record<string, string> = {
      'Circuit Breaker': 'CB',
      'CT': 'CT',
      'VT': 'VT',
      'Protection Relay': 'Relay'
    };
    for (const dev of cub.devices) {
      const label = abbrev[dev.name] ?? dev.name;
      const value = (dev.description && dev.description !== 'Detected from SLD') ? dev.description : '✓';
      chips.push({ label, value });
    }
    return chips;
  }

  /** Find the CubicleDevice record for a given cubicle, matching by functionalPosition name or position number. */
  getDeviceForCubicle(cub: SwitchgearCubicle): CubicleDevice | undefined {
    const devs = this.cubicleDevices();
    if (!devs.length) return undefined;
    const fp = (cub.functionalPosition ?? '').trim().toLowerCase();
    if (fp) {
      const exact = devs.find(d => d.functionalPosition.trim().toLowerCase() === fp);
      if (exact) return exact;
      const partial = devs.find(d => {
        const dfp = d.functionalPosition.trim().toLowerCase();
        return dfp.startsWith(fp) || fp.startsWith(dfp);
      });
      if (partial) return partial;
    }
    const pos = String(cub.position);
    return devs.find(d =>
      d.functionalPosition === pos ||
      d.functionalPosition === pos.padStart(2, '0') ||
      d.functionalPosition === pos.padStart(3, '0')
    );
  }

  isTransformerPanel(cub: SwitchgearCubicle): boolean {
    const dev = this.getDeviceForCubicle(cub);
    if (dev?.panelType) {
      const pt = dev.panelType.toLowerCase();
      return pt.includes('transformer') || pt === 'trafo';
    }
    return (cub.type as string) === 'transformer';
  }

  /** Return a display string for a specific device field, preferring cubicleDevices over inline lineup data. */
  getDeviceField(cub: SwitchgearCubicle, field: 'cb' | 'ct' | 'vt' | 'relay'): string {
    const dev = this.getDeviceForCubicle(cub);
    if (dev) {
      switch (field) {
        case 'cb': {
          const parts = [dev.cbModel, dev.cbRating].filter(Boolean);
          return parts.length ? parts.join(' ') : '—';
        }
        case 'ct': return dev.ctRatio || '—';
        case 'vt': return dev.vtRatio || '—';
        case 'relay': return dev.relayModel || '—';
      }
    }
    switch (field) {
      case 'cb': {
        const m = cub.cbModel || this.deviceDesc(cub, 'Circuit Breaker');
        const r = cub.cbRating ? ' ' + cub.cbRating : '';
        return m !== '—' ? m + r : '—';
      }
      case 'ct': return cub.ctRatio || this.deviceDesc(cub, 'CT');
      case 'vt': return cub.vtRatio || this.deviceDesc(cub, 'VT');
      case 'relay': return cub.relayModel || this.deviceDesc(cub, 'Protection Relay');
    }
  }

  /** Device chips enriched with cubicleDevices data. Falls back to inline lineup chips. */
  deviceChipsEnriched(cub: SwitchgearCubicle): { label: string; value: string }[] {
    const dev = this.getDeviceForCubicle(cub);
    if (dev) {
      const chips: { label: string; value: string }[] = [];
      const cbLabel = [dev.cbModel, dev.cbRating].filter(Boolean).join(' ');
      if (cbLabel) chips.push({ label: 'CB', value: cbLabel });
      if (dev.ctRatio) chips.push({ label: 'CT', value: dev.ctRatio });
      if (dev.relayModel) chips.push({ label: 'Relay', value: dev.relayModel });
      if (chips.length) return chips;
    }
    return this.deviceChips(cub);
  }

  panelTypeLabel(cub: SwitchgearCubicle): string {
    const dev = this.getDeviceForCubicle(cub);
    if (dev?.panelType) return dev.panelType;
    return this.typeLabel(cub.type);
  }

  readonly productMatches = signal<ProductMatch[]>([]);
  readonly expandedPosition = signal<number | null>(null);
  readonly matchLoadState = signal<'loading' | 'loaded' | 'empty'>('loading');
  readonly selectedProductKey = signal<string | null>(null);
  readonly topology = signal<TopologySummary | null>(null);

  readonly recommendedMatches = computed(() =>
    this.productMatches().filter(p => p.isRecommended)
  );

  readonly compatibleMatches = computed(() =>
    this.productMatches().filter(p => p.isCompatible && !p.isRecommended)
  );

  readonly topologyWarnings = computed<TopologyWarning[]>(() => {
    const warnings: TopologyWarning[] = [];
    const topo = this.topology();

    if (topo) {
      if (topo.incomers === 0)
        warnings.push({ severity: 'high', message: 'No incomer panel detected in the lineup.' });
      if (topo.feeders === 0)
        warnings.push({ severity: 'medium', message: 'No feeder panels detected — lineup may be incomplete.' });
      if (topo.couplers > 1)
        warnings.push({ severity: 'medium', message: `${topo.couplers} couplers detected — verify busbar section split.` });
    } else {
      const types = this.instanceCubicles().map(c => c.type);
      if (!types.includes('incomer'))
        warnings.push({ severity: 'high', message: 'No incomer cubicle detected in the lineup.' });
      if (!types.includes('outgoer'))
        warnings.push({ severity: 'high', message: 'No outgoer cubicle detected in the lineup.' });
      const couplerCount = types.filter(t => t === 'coupler').length;
      if (couplerCount > 1)
        warnings.push({ severity: 'medium', message: `${couplerCount} coupler cubicles detected — verify bus-tie topology.` });
    }

    this.cubicles().forEach(c => {
      if (c.topologyWarning)
        warnings.push({ severity: 'medium', message: c.topologyWarning });
    });

    return warnings;
  });

  readonly highWarningCount = computed(() =>
    this.topologyWarnings().filter(w => w.severity === 'high').length
  );

  ngOnInit(): void {
    const docId = this.reviewState.documentId();
    if (!docId) {
      this.loadState.set('error');
      this.errorMessage.set('No document selected. Upload a package first.');
      return;
    }
    const prior = this.reviewState.selectedProduct();
    if (prior) this.selectedProductKey.set(prior.productKey);
    this.loadFromApi(docId);
  }

  private loadFromApi(docId: string): void {
    const cachedCubicles = this.reviewState.cachedCubicles();
    if (cachedCubicles) {
      this.applyCubicles(cachedCubicles);
    } else {
      this.loadState.set('loading');
      this.api.getLineup(docId).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: cubs => {
          this.reviewState.setCachedCubicles(cubs);
          this.applyCubicles(cubs);
        },
        error: (err: Error) => {
          this.loadState.set('error');
          this.errorMessage.set(err.message ?? 'Failed to load lineup.');
        }
      });
    }

    const cachedInstances = this.reviewState.cachedInstances();
    if (cachedInstances) {
      this.applyInstances(cachedInstances);
    } else {
      this.api.getInstances(docId).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: insts => {
          this.reviewState.setCachedInstances(insts);
          this.applyInstances(insts);
        },
        error: () => { /* instances optional */ }
      });
    }

    const cachedDevices = this.reviewState.cachedCubicleDevices();
    if (cachedDevices) {
      this.cubicleDevices.set(cachedDevices);
      this.cubicleDevicesLoadState.set(cachedDevices.length ? 'loaded' : 'empty');
    } else {
      this.api.getCubicleDevices(docId).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: devs => {
          this.reviewState.setCachedCubicleDevices(devs);
          this.cubicleDevices.set(devs);
          this.cubicleDevicesLoadState.set(devs.length ? 'loaded' : 'empty');
        },
        error: () => this.cubicleDevicesLoadState.set('empty')
      });
    }

    // NEW: Load enhanced lineup devices
    this.lineupDevicesLoadState.set('loading');
    this.api.getLineupDevices(docId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: LineupDevicesResponse) => {
        this.lineupDevicesResponse.set(response);
        this.lineupDevicesLoadState.set(response?.switchgearInstances?.length ? 'loaded' : 'empty');
      },
      error: (err: Error) => {
        console.warn('Failed to load lineup devices:', err);
        this.lineupDevicesLoadState.set('error');
      }
    });

    const cachedMatches = this.reviewState.cachedProductMatches();
    if (cachedMatches) {
      this.applyProductMatches(cachedMatches);
    } else {
      this.api.getProductMatch(docId).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: matches => {
          this.reviewState.setCachedProductMatches(matches);
          this.applyProductMatches(matches);
        },
        error: () => this.matchLoadState.set('empty')
      });
    }
  }

  private applyCubicles(cubs: SwitchgearCubicle[]): void {
    this.cubicles.set(cubs);
    this.loadState.set(cubs.length ? 'loaded' : 'empty');
    this.autoSelectFirstCubicle();
  }

  private applyInstances(insts: SwitchgearInstance[]): void {
    this.instances.set(insts);
    const withTopo = insts.find(i => i.topologySummary != null);
    if (withTopo?.topologySummary) {
      this.topology.set(withTopo.topologySummary);
    }
    if (insts.length > 0 && this.selectedInstanceId() === null) {
      this.selectedInstanceId.set(insts[0].id);
      this.autoSelectFirstCubicle();
    }
  }

  private applyProductMatches(matches: ProductMatch[]): void {
    this.productMatches.set(matches);
    this.matchLoadState.set(matches.length ? 'loaded' : 'empty');

    const selectedProduct = this.reviewState.selectedProduct();
    const selectedKey = selectedProduct?.productKey;
    const matchFound = selectedKey && matches.some(m => m.productKey === selectedKey);

    if (selectedKey && !matchFound) {
      this.selectedProductKey.set(null);
      this.reviewState.setSelectedProduct(null);
    }

    if (!this.selectedProductKey() && matches.length) {
      this.selectedProductKey.set(matches[0].productKey);
      this.reviewState.setSelectedProduct(matches[0]);
    }
  }

  toggleCubicle(position: number): void {
    this.expandedPosition.update(cur => cur === position ? null : position);
  }

  isExpanded(position: number): boolean {
    return this.expandedPosition() === position;
  }

  badgeClass(type: CubicleType): string {
    return `cubicle-badge cubicle-badge--${type.replace('_', '-')}`;
  }

  typeLabel(type: CubicleType): string {
    const labels: Record<CubicleType, string> = {
      incomer: 'Incomer',
      outgoer: 'Outgoer',
      coupler: 'Coupler',
      metering: 'Metering',
      busbar_section: 'Busbar Section'
    };
    return labels[type] ?? type;
  }

  confidenceClass(score: number): string {
    if (score >= 0.75) return 'conf conf--high';
    if (score >= 0.5)  return 'conf conf--mid';
    return 'conf conf--low';
  }

  deviceConfClass(score: number): string {
    if (score >= 0.75) return 'conf conf--high';
    if (score >= 0.5)  return 'conf conf--mid';
    return 'conf conf--low';
  }

  selectInstance(instId: number): void {
    this.selectedInstanceId.set(instId);
    this.selectedDiagramPos.set(null);
    this.autoSelectFirstCubicle();
  }

  private autoSelectFirstCubicle(): void {
    if (this.selectedDiagramPos() !== null) return;
    const cubs = this.instanceCubicles();
    if (cubs.length > 0) {
      this.selectedDiagramPos.set(cubs[0].position);
    }
  }

  selectDiagramCubicle(pos: number): void {
    this.selectedDiagramPos.set(pos);
  }

  navigateNext(): void {
    this.router.navigate(['/review/products']);
  }

  selectProduct(key: string): void {
    this.selectedProductKey.set(key);
    const match = this.productMatches().find(p => p.productKey === key) ?? null;
    this.reviewState.setSelectedProduct(match);
  }

  selectedProductDetails = computed(() => {
    const key = this.selectedProductKey();
    return key ? (this.productMatches().find(p => p.productKey === key) ?? null) : null;
  });

  isSelectedProduct(key: string): boolean {
    return this.selectedProductKey() === key;
  }

  scorePercent(score: number): string {
    return (score * 100).toFixed(0) + '%';
  }

  scoreClass(score: number): string {
    if (score >= 0.85) return 'score-bar--high';
    if (score >= 0.65) return 'score-bar--mid';
    return 'score-bar--low';
  }

  cubicleCountForInstance(instId: number): number {
    const filtered = this.cubicles().filter(c => c.switchgearInstanceId === instId);
    return filtered.length > 0 ? filtered.length : this.cubicles().filter(c => c.switchgearInstanceId === null).length;
  }

  trackByPosition(_i: number, c: SwitchgearCubicle): number {
    return c.position;
  }

  trackByKey(_i: number, p: ProductMatch): string {
    return p.productKey;
  }
}
