import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  computed,
  inject,
  Output,
  EventEmitter,
  DestroyRef
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewStateService } from '../../services/review-state.service';
import { PipelineApiService } from '../../services/pipeline-api.service';
import { DeviationItem, DeviationSeverity } from '../../models/models';

type LoadState = 'loading' | 'loaded' | 'error' | 'empty';
type SeverityFilter = 'all' | DeviationSeverity;
type ResolutionFilter = 'all' | 'open' | 'resolved';

@Component({
  selector: 'app-deviation-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './deviation-panel.component.html',
  styleUrls: ['./deviation-panel.component.scss']
})
export class DeviationPanelComponent implements OnInit {
  private readonly reviewState = inject(ReviewStateService);
  private readonly api = inject(PipelineApiService);
  private readonly destroyRef = inject(DestroyRef);

  /** Emits the current unresolved high-severity count to parent/nav bar. */
  @Output() unresolvedHighCount = new EventEmitter<number>();

  readonly loadState = signal<LoadState>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly deviations = signal<DeviationItem[]>([]);
  readonly severityFilter = signal<SeverityFilter>('all');
  readonly resolutionFilter = signal<ResolutionFilter>('open');

  // ── Computed ─────────────────────────────────────────────────────────────

  readonly filtered = computed(() => {
    const sev = this.severityFilter();
    const res = this.resolutionFilter();
    return this.deviations().filter(d => {
      const sevMatch = sev === 'all' || d.severity === sev;
      const resMatch =
        res === 'all' ||
        (res === 'open' && !this.isResolved(d.id)) ||
        (res === 'resolved' && this.isResolved(d.id));
      return sevMatch && resMatch;
    });
  });

  readonly totalCount = computed(() => this.deviations().length);

  readonly unresolvedHigh = computed(() =>
    this.deviations().filter(
      d => d.severity === 'high' && !this.isResolved(d.id)
    ).length
  );

  readonly unresolvedTotal = computed(() =>
    this.deviations().filter(d => !this.isResolved(d.id)).length
  );

  ngOnInit(): void {
    const docId = this.reviewState.documentId();
    if (!docId) {
      this.loadState.set('error');
      this.errorMessage.set('No document selected. Upload a package first.');
      return;
    }
    this.loadFromApi(docId);
  }

  private loadFromApi(docId: string): void {
    this.loadState.set('loading');
    this.api.getDeviations(docId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: devs => this.applyDeviations(devs),
      error: (err: Error) => {
        this.loadState.set('error');
        this.errorMessage.set(err.message ?? 'Failed to load deviations.');
      }
    });
  }

  private applyDeviations(devs: DeviationItem[]): void {
    if (!devs.length) {
      this.loadState.set('empty');
      return;
    }
    this.deviations.set(devs);
    this.loadState.set('loaded');
    this.syncHighCount();
  }

  // ── Filters ──────────────────────────────────────────────────────────────

  setSeverityFilter(f: SeverityFilter): void {
    this.severityFilter.set(f);
  }

  /** Template-safe wrapper called from @for loop where value is string */
  onSeverityClick(value: string): void {
    this.setSeverityFilter(value as SeverityFilter);
  }

  setResolutionFilter(f: ResolutionFilter): void {
    this.resolutionFilter.set(f);
  }

  /** Template-safe wrapper called from @for loop where value is string */
  onResolutionClick(value: string): void {
    this.setResolutionFilter(value as ResolutionFilter);
  }

  // ── Resolution ───────────────────────────────────────────────────────────

  resolve(id: string): void {
    this.reviewState.resolveDeviation(id);
    this.syncHighCount();
  }

  isResolved(id: string): boolean {
    return this.reviewState.isDeviationResolved(id);
  }

  private syncHighCount(): void {
    const count = this.unresolvedHigh();
    this.reviewState.setUnresolvedHighCount(count);
    this.unresolvedHighCount.emit(count);
  }

  // ── Presentation helpers ─────────────────────────────────────────────────

  severityClass(severity: DeviationSeverity): string {
    const map: Record<DeviationSeverity, string> = {
      high:   'sev--high',
      medium: 'sev--medium',
      low:    'sev--low'
    };
    return map[severity];
  }

  severityLabel(severity: DeviationSeverity): string {
    const map: Record<DeviationSeverity, string> = {
      high:   '🔴 High',
      medium: '🟡 Medium',
      low:    '⚪ Low'
    };
    return map[severity];
  }

  trackById(_index: number, dev: DeviationItem): string {
    return dev.id;
  }

  // ── Ensemble conflict helpers ─────────────────────────────────────────────

  /** Returns true when the reason string encodes a PathB/PathC disagreement. */
  isConflictReason(reason: string): boolean {
    return /PathB=|PathC=|LLM=/.test(reason);
  }

  /** Parses "PathB=20, PathC=24" → [{path:'PathB', value:'20'}, {path:'PathC', value:'24'}] */
  parseConflict(reason: string): Array<{ path: string; value: string }> {
    return reason.split(',').flatMap(part => {
      const match = part.trim().match(/^(PathB|PathC|LLM|Regex)=(.+)$/);
      return match ? [{ path: match[1], value: match[2].trim() }] : [];
    });
  }
}
