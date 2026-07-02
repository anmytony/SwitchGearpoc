import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReviewStateService } from './services/review-state.service';

interface NavStep {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      <!-- Top Navigation Bar -->
      <header class="app-header">
        <div class="app-header__brand">
          <span class="app-header__logo">ABB</span>
          <span class="app-header__title">MV Switchgear Co-Engineer</span>
        </div>

        <nav class="pipeline-stepper" aria-label="Pipeline stages">
          <ol class="pipeline-stepper__list">
            @for (step of navSteps; track step.route; let i = $index) {
              <li
                class="pipeline-stepper__item"
                [class.pipeline-stepper__item--active]="isActive(step.route)"
                [class.pipeline-stepper__item--done]="isDone(step.route)"
              >
                <a
                  [routerLink]="step.route"
                  class="pipeline-stepper__link"
                  [attr.aria-current]="isActive(step.route) ? 'step' : null"
                >
                  <span class="pipeline-stepper__index">{{ i + 1 }}</span>
                  <span class="pipeline-stepper__label">{{ step.label }}</span>
                  @if (step.route === 'review/deviations' && unresolvedCount() > 0) {
                    <span class="badge badge--warn" [attr.aria-label]="unresolvedCount() + ' unresolved deviations'">
                      {{ unresolvedCount() }}
                    </span>
                  }
                </a>
              </li>
            }
          </ol>
        </nav>

        <div class="app-header__meta">
          @if (overallConfidence() !== null) {
            <span class="confidence-pill" [class.confidence-pill--low]="overallConfidence()! < 0.6">
              Confidence: {{ (overallConfidence()! * 100).toFixed(0) }}%
            </span>
          }
        </div>
      </header>

      <!-- Main Content -->
      <main class="app-main">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly navSteps: NavStep[] = [
    { label: 'Upload',      route: 'upload',              icon: 'upload' },
    { label: 'Parameters',  route: 'review/parameters',   icon: 'tune'   },
    { label: 'Products',    route: 'review/products',     icon: 'grid_view' },
    { label: 'Lineup',      route: 'review/lineup',       icon: 'view_column' },
    { label: 'Deviations',  route: 'review/deviations',   icon: 'warning' },
    { label: 'XML Export',  route: 'review/xml',          icon: 'code'   }
  ];

  private readonly routeOrder: string[] = this.navSteps.map(s => s.route);

  constructor(
    private readonly router: Router,
    private readonly reviewState: ReviewStateService
  ) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isDone(route: string): boolean {
    const currentIdx = this.routeOrder.findIndex(r => this.router.url.includes(r));
    const stepIdx = this.routeOrder.indexOf(route);
    return stepIdx < currentIdx;
  }

  unresolvedCount(): number {
    return this.reviewState.unresolvedHighCount();
  }

  overallConfidence(): number | null {
    return this.reviewState.overallConfidence();
  }
}
