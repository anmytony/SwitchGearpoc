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
import { PipelineApiService } from '../../services/pipeline-api.service';
import { ReviewStateService } from '../../services/review-state.service';
import { DocumentStatus, AbbProductInfo } from '../../models/models';
import { PolledStatus } from '../../services/pipeline-api.service';

interface FileEntry {
  file: File;
  status: 'queued' | 'uploading' | 'processing' | 'done' | 'error';
  errorMessage: string | null;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'text/plain',
  'text/csv',
  'application/json',
  'application/xml',
  'text/xml',
  'text/markdown'
];
const ACCEPTED_EXTENSIONS = '.pdf,.docx,.jpg,.jpeg,.png,.txt,.csv,.json,.xml,.md';

@Component({
  selector: 'app-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  private readonly api = inject(PipelineApiService);
  private readonly reviewState = inject(ReviewStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly acceptedExtensions = ACCEPTED_EXTENSIONS;

  // ── Static product family options — only Switchgear and UniSec ──────────
  readonly products: AbbProductInfo[] = [
    { name: 'Switchgear',          value: 'Switchgear', family: 'Switchgear', description: '', imageUrl: '', docUrl: '' },
    { name: 'SafeRing & SafePlus', value: 'SafeRing',   family: 'SafeRing',   description: '', imageUrl: '', docUrl: '' },
  ];
  readonly selectedProduct   = signal<AbbProductInfo | null>(this.products[0]);
  readonly files = signal<FileEntry[]>([]);
  readonly isDragOver = signal(false);
  readonly isSubmitting = signal(false);
  readonly pollingStatus = signal<DocumentStatus | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly pollingElapsedSecs = signal<number>(0);
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  readonly hasFiles = computed(() => this.files().length > 0);
  readonly canSubmit = computed(
    () => this.hasFiles() && !this.isSubmitting() && this.selectedProduct() !== null
  );

  readonly statusLabel = computed(() => {
    const s = this.pollingStatus();
    if (!s) return '';
    const elapsed = this.pollingElapsedSecs();
    const processingNote = elapsed >= 30
      ? ` (${elapsed}s — large document, please wait…)`
      : elapsed >= 10 ? ` (${elapsed}s)` : '';
    const map: Record<DocumentStatus, string> = {
      uploaded:        'Uploaded — waiting for pipeline…',
      processing:      `Processing document…${processingNote}`,
      extracted:       'Extraction complete',
      review_required: 'Ready for review',
      ready_for_xml:   'Ready for XML export',
      exported:        'Exported'
    };
    return map[s] ?? s;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Products are static — no API call needed
  }

  selectProduct(product: AbbProductInfo): void {
    this.selectedProduct.set(product);
  }

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(dropped);
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    this.addFiles(selected);
    input.value = '';
  }

  private addFiles(incoming: File[]): void {
    const valid = incoming.filter(f => this.isAcceptedFile(f));
    
    if (incoming.length > valid.length) {
      const rejected = incoming.length - valid.length;
      console.warn(`[Upload] ${rejected} file(s) rejected due to unsupported type. Accepted: ${ACCEPTED_TYPES.join(', ')}`);
    }
    
    const entries: FileEntry[] = valid.map(f => ({
      file: f,
      status: 'queued',
      errorMessage: null
    }));
    this.files.update(prev => [...prev, ...entries]);
    this.uploadError.set(null);
  }

  removeFile(index: number): void {
    this.files.update(prev => prev.filter((_, i) => i !== index));
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  submit(): void {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    this.uploadError.set(null);
    this.setAllStatus('uploading');

    const rawFiles = this.files().map(e => e.file);
    
    console.log('[Upload] Submitting files:', rawFiles.length, rawFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));

    const product = this.selectedProduct();
    this.api.uploadDocuments(rawFiles, product?.family ?? 'Switchgear').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        console.log('[Upload] Success:', response);
        const documentId = String(response.id);
        const product = this.selectedProduct();
        this.setAllStatus('processing');
        this.reviewState.setDocument(documentId, 'uploaded', response.overallConfidence ?? 0);
        this.reviewState.setProductName(product?.name ?? product?.family ?? 'Switchgear');
        this.reviewState.setProductFamily(product?.family ?? 'Switchgear');
        this.startPolling(documentId);
      },
      error: (err: Error) => {
        console.error('[Upload] Error:', err);
        this.isSubmitting.set(false);
        this.setAllStatus('error');
        this.uploadError.set(err.message ?? 'Upload failed. Please retry.');
      }
    });
  }

  private startPolling(documentId: string): void {
    this.pollingStatus.set('uploaded');
    this.pollingElapsedSecs.set(0);
    this.pollingTimer = setInterval(() => {
      this.pollingElapsedSecs.update(n => n + 1);
    }, 1000);

    this.api.pollStatus(documentId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result: PolledStatus) => {
        const status = result.status;
        this.pollingStatus.set(status);
        this.reviewState.setOverallConfidence(result.overallConfidence);

        if (status === 'review_required' || status === 'extracted') {
          this.stopPollingTimer();
          this.setAllStatus('done');
          this.reviewState.setDocument(documentId, status, result.overallConfidence);
          this.isSubmitting.set(false);
          this.router.navigate(['/review/parameters']);
          return;
        }

        if (status === 'ready_for_xml' || status === 'exported') {
          this.stopPollingTimer();
          this.setAllStatus('done');
          this.reviewState.setDocument(documentId, status, result.overallConfidence);
          this.isSubmitting.set(false);
          this.router.navigate(['/review/xml']);
        }
      },
      error: (err: Error) => {
        this.stopPollingTimer();
        this.isSubmitting.set(false);
        this.setAllStatus('error');
        this.uploadError.set(err.message ?? 'Polling failed. Please retry.');
      }
    });
  }

  private stopPollingTimer(): void {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  retry(): void {
    this.uploadError.set(null);
    this.pollingStatus.set(null);
    this.setAllStatus('queued');
    this.submit();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private setAllStatus(status: FileEntry['status']): void {
    this.files.update(prev =>
      prev.map(e => ({ ...e, status, errorMessage: null }))
    );
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  statusClass(status: FileEntry['status']): string {
    const map: Record<FileEntry['status'], string> = {
      queued:     'status-chip--info',
      uploading:  'status-chip--info',
      processing: 'status-chip--info',
      done:       'status-chip--ok',
      error:      'status-chip--error'
    };
    return map[status];
  }

  trackByIndex(index: number): number {
    return index;
  }

  private isAcceptedFile(file: File): boolean {
    if (ACCEPTED_TYPES.includes(file.type)) {
      return true;
    }

    const lowerName = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS
      .split(',')
      .some(ext => lowerName.endsWith(ext));
  }
}
