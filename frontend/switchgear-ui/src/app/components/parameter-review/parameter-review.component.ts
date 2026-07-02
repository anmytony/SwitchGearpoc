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
import { ExtractedParameter, SwitchgearInstance, ReviewOverride, ReviewSubmission, ParameterDefinition } from '../../models/models';

type LoadState = 'loading' | 'loaded' | 'error';

export interface ParameterRow extends ExtractedParameter {
  displayLabel: string;
  allowedValues: string[];
  isNotExtracted: boolean;
}

@Component({
  selector: 'app-parameter-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './parameter-review.component.html',
  styleUrls: ['./parameter-review.component.scss']
})
export class ParameterReviewComponent implements OnInit {
  private readonly reviewState = inject(ReviewStateService);
  private readonly api         = inject(PipelineApiService);
  private readonly router      = inject(Router);
  private readonly destroyRef  = inject(DestroyRef);

  readonly instances       = signal<SwitchgearInstance[]>([]);
  readonly selectedInstIdx = signal<number>(0);
  readonly loadState       = signal<LoadState>('loading');
  readonly errorMessage    = signal<string | null>(null);
  readonly overrideValues  = signal<Record<string, string>>({});
  readonly paramDefs        = signal<ParameterDefinition[]>([]);
  readonly paramDefsLoading = signal(true);
  readonly paramDefsError   = signal<string | null>(null);

  readonly isSaving  = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly savedOnce = signal(false);

  readonly isDirty = this.reviewState.isDirty;

  readonly selectedEvidence = signal<{ name: string; text: string; page: number } | null>(null);

  readonly isMultiInstance = computed(() => this.instances().length > 1);

  readonly selectedInstance = computed((): SwitchgearInstance | null => {
    const list = this.instances();
    if (!list.length) return null;
    const idx = this.selectedInstIdx();
    return list[idx] ?? list[0];
  });

  readonly parameters = computed((): ParameterRow[] => {
    const inst = this.selectedInstance();
    if (!inst) return [];
    return this.buildRows(inst.parameters);
  });

  readonly productName = this.reviewState.productName;

  readonly flaggedCount = computed(() =>
    this.parameters().filter(p => p.flaggedForReview && !p.isNotExtracted).length
  );
  readonly notExtractedCount = computed(() =>
    this.parameters().filter(p => p.isNotExtracted).length
  );
  readonly overrideCount = computed(() =>
    Object.values(this.overrideValues()).filter(v => v.trim() !== '').length
  );

  ngOnInit(): void {
    const docId = this.reviewState.documentId();
    if (!docId) {
      this.loadState.set('error');
      this.errorMessage.set('No document selected. Upload a package first.');
      return;
    }

    const family = this.reviewState.productFamily();
    this.api.getParameterDefinitions(family).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: defs => {
        this.paramDefs.set(defs);
        this.paramDefsLoading.set(false);
      },
      error: (err: Error) => {
        this.paramDefsLoading.set(false);
        this.paramDefsError.set(err?.message ?? 'Could not load filter parameters from ABB API.');
      }
    });

    this.loadFromApi(docId);
  }

  private loadFromApi(docId: string): void {
    // Use cached data when navigating back to this step — avoids redundant API round-trips
    const cached = this.reviewState.cachedInstances();
    if (cached) {
      this.applyInstances(cached);
      return;
    }

    this.loadState.set('loading');
    this.api.getInstances(docId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: instances => {
        this.reviewState.setCachedInstances(instances);
        this.applyInstances(instances);
      },
      error: () => {
        // Fallback to flat parameters endpoint if /instances not available
        this.api.getParameters(docId).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: params => {
            this.reviewState.setCachedParameters(params);
            const fallbackInstance: SwitchgearInstance = {
              id: 0, instanceIndex: 1,
              instanceName: 'Main Switchgear',
              location: '',
              parameters: params,
              topologySummary: null
            };
            this.reviewState.setCachedInstances([fallbackInstance]);
            this.applyInstances([fallbackInstance]);
          },
          error: (err: Error) => {
            this.loadState.set('error');
            this.errorMessage.set(err.message ?? 'Failed to load extracted parameters.');
          }
        });
      }
    });
  }

  private applyInstances(instances: SwitchgearInstance[]): void {
    this.instances.set(instances);
    const allParams = instances.flatMap(i => i.parameters);
    this.reviewState.setCachedParameters(allParams);
    const map: Record<string, string> = {};
    this.reviewState.getOverrides().forEach(o => {
      map[o.parameterName] = String(o.newValue);
    });
    this.overrideValues.set(map);
    this.loadState.set('loaded');
  }

  selectInstance(index: number): void {
    this.selectedInstIdx.set(index);
  }

  private buildRows(extracted: ExtractedParameter[]): ParameterRow[] {
    const defs = this.paramDefs();

    // Defs not yet loaded — show raw extracted params so the table is never blank
    if (defs.length === 0) {
      return extracted.map(p => ({
        ...p,
        displayLabel: this.camelToWords(p.name),
        allowedValues: [],
        isNotExtracted: false,
      }));
    }

    const extractedMap = new Map(extracted.map(p => [p.name, p]));

    const rows: ParameterRow[] = defs.map(def => {
      const found = extractedMap.get(def.key);
      if (found) {
        return { ...found, displayLabel: def.labelWithoutUnit, allowedValues: def.allowedValues, isNotExtracted: false };
      }
      return {
        name: def.key, value: '—', unit: def.unit,
        confidenceIndex: 0, sourcePage: 0,
        flaggedForReview: true, isAbbDefault: false,
        extractionReason: 'Not found in document',
        switchgearInstanceId: null,
        switchgearInstanceName: '',
        extractionPath: '',
        sourceText: '',
        sourceBoundingBox: '',
        deviationReason: '',
        displayLabel: def.labelWithoutUnit, allowedValues: def.allowedValues, isNotExtracted: true,
      };
    });

    return [...rows.filter(r => !r.isNotExtracted), ...rows.filter(r => r.isNotExtracted)];
  }

  // -- Save & Continue -------------------------------------------------------

  saveAndContinue(): void {
    this.isSaving.set(true);
    this.saveError.set(null);

    const overrides = this.reviewState.getOverrides();
    const docId     = this.reviewState.documentId()!;

    if (overrides.length === 0) {
      this.reviewState.markParametersSaved();
      this.isSaving.set(false);
      this.savedOnce.set(true);
      this.router.navigate(['/review/products']);
      return;
    }

    const submission: ReviewSubmission = {
      documentId: docId,
      parameterOverrides: overrides,
      resolvedDeviationIds: []
    };

    this.api.submitReview(submission).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.reviewState.markParametersSaved();
        this.isSaving.set(false);
        this.savedOnce.set(true);
        this.router.navigate(['/review/products']);
      },
      error: (err: Error) => {
        this.isSaving.set(false);
        this.saveError.set(err.message ?? 'Failed to save overrides. Please try again.');
      }
    });
  }

  // -- Override handling -----------------------------------------------------

  getOverrideValue(name: string): string {
    return this.overrideValues()[name] ?? '';
  }

  onOverrideSelect(param: ParameterRow, event: Event): void {
    this.onOverrideChange(param, (event.target as HTMLSelectElement).value);
  }

  onOverrideChange(param: ParameterRow, newValueStr: string): void {
    this.overrideValues.update(map => ({ ...map, [param.name]: newValueStr }));
    if (newValueStr.trim() === '') {
      this.reviewState.removeOverride(param.name);
      return;
    }
    const override: ReviewOverride = {
      parameterName: param.name,
      newValue: isNaN(Number(newValueStr)) ? newValueStr : Number(newValueStr),
      unit: param.unit,
      reviewerNote: null
    };
    this.reviewState.setOverride(override);
  }

  // -- Presentation helpers --------------------------------------------------

  confidenceClass(index: number): string {
    if (index >= 0.85) return 'badge--high';
    if (index >= 0.60) return 'badge--medium';
    return 'badge--low';
  }

  confidenceLabel(index: number): string {
    if (index === 0) return '—';
    return `${(index * 100).toFixed(0)}%`;
  }

  hasOverride(name: string): boolean {
    const v = this.overrideValues()[name];
    return v !== undefined && v.trim() !== '';
  }

  hasNormalizedHint(param: ParameterRow): boolean {
    return !!param.normalizedValue &&
      param.normalizedValue.trim() !== '' &&
      param.normalizedValue !== String(param.value);
  }

  trackByName(_index: number, param: ParameterRow): string {
    return param.name;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // -- Evidence panel --------------------------------------------------------

  showEvidence(param: ExtractedParameter): void {
    if (!param.sourceText) return;
    this.selectedEvidence.set({ name: param.name, text: param.sourceText, page: param.sourcePage });
  }

  clearEvidence(): void {
    this.selectedEvidence.set(null);
  }

  // -- Extraction path helpers -----------------------------------------------

  extractionPathLabel(path: string): string {
    return ({ PathB: 'RAG', PathC: 'Vision', LLM: 'LLM', Regex: 'Regex' } as Record<string, string>)[path] ?? path;
  }

  extractionPathClass(path: string): string {
    return ({ PathB: 'badge-path--rag', PathC: 'badge-path--vision', LLM: 'badge-path--llm', Regex: 'badge-path--regex' } as Record<string, string>)[path] ?? '';
  }

  downloadCsv(): void {
    const rows = this.parameters();
    const inst = this.selectedInstance();
    const overrides = this.overrideValues();
    const product = this.productName() ?? 'Switchgear';
    const instanceName = inst?.instanceName ?? '';

    const headers = ['Parameter', 'Extracted Value', 'Override', 'Confidence', 'Source', 'Page'];

    const csvRows = rows.map(p => {
      const rawValue = p.isNotExtracted
        ? ''
        : `${p.value}${p.unit ? ' ' + p.unit : ''}`;
      const override = overrides[p.name] ?? '';
      const conf = p.isNotExtracted ? '' : p.confidenceIndex === 0 ? '' : `${(p.confidenceIndex * 100).toFixed(0)}%`;
      const source = p.extractionPath ? this.extractionPathLabel(p.extractionPath) : '';
      const page = p.sourcePage > 0 ? `p.${p.sourcePage}` : '';
      return [p.displayLabel, rawValue, override, conf, source, page];
    });

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      `# Product: ${product}  Installation: ${instanceName}`,
      headers.map(escape).join(','),
      ...csvRows.map(r => r.map(escape).join(','))
    ];

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parameters_${product.replace(/\s+/g, '_')}_${instanceName.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private camelToWords(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }
}
