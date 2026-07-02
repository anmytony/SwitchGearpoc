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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewStateService } from '../../services/review-state.service';
import { PipelineApiService } from '../../services/pipeline-api.service';

type LoadState = 'loading' | 'loaded' | 'error' | 'empty';
type SchemaStatus = 'valid' | 'invalid' | 'pending';
type ClipboardState = 'idle' | 'copied' | 'failed';

@Component({
  selector: 'app-xml-output',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './xml-output.component.html',
  styleUrls: ['./xml-output.component.scss']
})
export class XmlOutputComponent implements OnInit {
  private readonly reviewState = inject(ReviewStateService);
  private readonly api = inject(PipelineApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loadState = signal<LoadState>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly xmlContent = signal<string>('');
  readonly schemaStatus = signal<SchemaStatus>('pending');
  readonly clipboardState = signal<ClipboardState>('idle');

  // Confidence from ReviewStateService (set during upload/polling)
  readonly overallConfidence = this.reviewState.overallConfidence;
  readonly unresolvedHighCount = this.reviewState.unresolvedHighCount;

  readonly confidencePct = computed(() => {
    const c = this.overallConfidence();
    return c !== null ? Math.round(c * 100) : null;
  });

  readonly confidenceBarClass = computed(() => {
    const pct = this.confidencePct();
    if (pct === null) return '';
    if (pct >= 85) return 'confidence-bar__fill--high';
    if (pct >= 60) return 'confidence-bar__fill--medium';
    return 'confidence-bar__fill--low';
  });

  /** Reason why export is disabled, or null when export is allowed. */
  readonly exportBlockReason = computed<string | null>(() => {
    if (this.schemaStatus() === 'invalid') {
      return 'XML schema validation failed. Fix validation errors before exporting.';
    }
    if (this.schemaStatus() === 'pending') {
      return 'Schema validation has not completed yet.';
    }
    if (this.unresolvedHighCount() > 0) {
      return `${this.unresolvedHighCount()} high-severity deviation(s) must be resolved before export.`;
    }
    return null;
  });

  readonly canExport = computed(() => this.exportBlockReason() === null && this.xmlContent().length > 0);

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
    this.api.getXml(docId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: xml => this.applyXml(xml, null),
      error: (err: Error) => {
        this.loadState.set('error');
        this.errorMessage.set(err.message ?? 'Failed to load XML output.');
      }
    });
  }

  private applyXml(xml: string, schemaValid: boolean | null): void {
    if (!xml.trim()) {
      this.loadState.set('empty');
      return;
    }
    this.xmlContent.set(this.formatXml(xml));
    this.schemaStatus.set(
      schemaValid === true ? 'valid' : schemaValid === false ? 'invalid' : 'pending'
    );
    this.loadState.set('loaded');
  }

  // ── Clipboard ────────────────────────────────────────────────────────────

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.xmlContent());
      this.clipboardState.set('copied');
    } catch {
      this.clipboardState.set('failed');
    }
    setTimeout(() => this.clipboardState.set('idle'), 2500);
  }

  // ── Download ─────────────────────────────────────────────────────────────

  downloadXml(): void {
    if (!this.canExport()) return;
    const blob = new Blob([this.xmlContent()], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'switchgear-config.xml';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  schemaStatusLabel(): string {
    const map: Record<SchemaStatus, string> = {
      valid:   'Schema Valid',
      invalid: 'Schema Invalid',
      pending: 'Validation Pending'
    };
    return map[this.schemaStatus()];
  }

  schemaStatusClass(): string {
    const map: Record<SchemaStatus, string> = {
      valid:   'schema-badge--valid',
      invalid: 'schema-badge--invalid',
      pending: 'schema-badge--pending'
    };
    return map[this.schemaStatus()];
  }

  clipboardLabel(): string {
    const map: Record<ClipboardState, string> = {
      idle:   'Copy XML',
      copied: '✓ Copied!',
      failed: '✗ Failed'
    };
    return map[this.clipboardState()];
  }

  /** Minimal XML pretty-printer — adds indentation for readability. */
  private formatXml(xml: string): string {
    try {
      let indent = 0;
      const tab = '  ';
      return xml
        .replace(/>\s*</g, '><')
        .replace(/(<[^/][^>]*[^/]>|<[^/][^>]*[^>]>)(?!<)/g, '$1\n')
        .replace(/(<\/[^>]+>)/g, '\n$1')
        .replace(/(<[^/][^>]*\/>)/g, '\n$1')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const closing = line.match(/^<\//) !== null;
          const selfClose = line.match(/\/>$/) !== null;
          if (closing) indent = Math.max(0, indent - 1);
          const out = tab.repeat(indent) + line.trim();
          if (!closing && !selfClose) indent++;
          return out;
        })
        .join('\n');
    } catch {
      return xml;
    }
  }
}
