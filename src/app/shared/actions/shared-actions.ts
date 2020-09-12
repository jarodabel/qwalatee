import { createAction, props } from '@ngrx/store';

export const AddBreadcrumbActionName = 'Add Breadcrumb';
export const RemoveBreadcrumbActionName = 'Remove Breadcrumb';
export const ResetBreadcrumbActionName = 'Reset Breadcrumb';

export const addBreadcrumb = createAction(
  AddBreadcrumbActionName,
  props<{ [key: string]: string }>()
);

export const removeBreadcrumb = createAction(
  RemoveBreadcrumbActionName,
  props<{ keysToRemove: string[], next: string }>()
);

export const resetBreadcrumb = createAction(ResetBreadcrumbActionName);
