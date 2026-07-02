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
import { ReviewStateService } from '../../services/review-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PipelineApiService } from '../../services/pipeline-api.service';
import { DocumentPage } from '../../models/models';

type LoadState = 'loading' | 'loaded' | 'error' | 'empty';

@Component({
  selector: 'app-classification-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './classification-view.component.html',
  styleUrls: ['./classification-view.component.scss']
})
export class ClassificationViewComponent implements OnInit {
  private readonly reviewState = inject(ReviewStateService);
  private readonly api = inject(PipelineApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pages = signal<DocumentPage[]>([]);
  readonly loadState = signal<LoadState>('loading');
  readonly errorMessage = signal<string | null>(null);

  readonly sldCount = computed(() =>
    this.pages().filter(p => p.pageType === 'visual_sld').length
  );
  readonly tabularCount = computed(() =>
    this.pages().filter(p => p.pageType === 'text_tabular').length
  );
  readonly lowConfidenceCount = computed(() =>
    this.pages().filter(p => p.confidenceIndex < 0.6).length
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
    this.errorMessage.set(null);
    this.api.getPages(docId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (pages) => {
        if (!pages.length) {
          this.loadState.set('empty');
          return;
        }
        this.pages.set(pages);
        this.loadState.set('loaded');
      },
      error: (err: Error) => {
        this.loadState.set('error');
        this.errorMessage.set(err.message ?? 'Failed to load page classifications.');
      }
    });
  }

  // ── Presentation helpers ─────────────────────────────────────────────────

  confidenceClass(index: number): string {
    if (index >= 0.85) return 'confidence-badge--high';
    if (index >= 0.60) return 'confidence-badge--medium';
    return 'confidence-badge--low';
  }

  confidenceLabel(index: number): string {
    return `${(index * 100).toFixed(0)}%`;
  }

  pageTypeLabel(type: DocumentPage['pageType']): string {
    return type === 'text_tabular' ? 'Text / Tabular' : 'Single-Line Diagram';
  }

  pageTypeClass(type: DocumentPage['pageType']): string {
    return type === 'text_tabular' ? 'chip--tabular' : 'chip--sld';
  }

  trackByPageNumber(_index: number, page: DocumentPage): number {
    return page.pageNumber;
  }
}
