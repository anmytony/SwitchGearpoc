import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './shared/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./components/upload/upload.component').then(m => m.UploadComponent)
  },
  {
    path: 'review/parameters',
    loadComponent: () =>
      import('./components/parameter-review/parameter-review.component').then(
        m => m.ParameterReviewComponent
      ),
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: 'review/products',
    loadComponent: () =>
      import('./components/product-catalog/product-catalog.component').then(
        m => m.ProductCatalogComponent
      )
  },
  {
    path: 'review/lineup',
    loadComponent: () =>
      import('./components/lineup/lineup-view.component').then(
        m => m.LineupViewComponent
      )
  },
  {
    path: 'review/deviations',
    loadComponent: () =>
      import('./components/deviations/deviation-panel.component').then(
        m => m.DeviationPanelComponent
      )
  },
  {
    path: 'review/xml',
    loadComponent: () =>
      import('./components/xml-output/xml-output.component').then(
        m => m.XmlOutputComponent
      )
  },
  {
    path: '**',
    redirectTo: 'upload'
  }
];
