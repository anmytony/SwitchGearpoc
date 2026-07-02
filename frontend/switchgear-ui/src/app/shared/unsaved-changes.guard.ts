import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ParameterReviewComponent } from '../components/parameter-review/parameter-review.component';

export const unsavedChangesGuard: CanDeactivateFn<ParameterReviewComponent> = (
  component: ParameterReviewComponent
) => {
  if (component.isDirty()) {
    return window.confirm(
      'You have unsaved review changes. Leave and discard them?'
    );
  }
  return true;
};
