import { Routes } from '@angular/router';
import { AERO_USAGE_DOCS } from './docs/aero-usage.data';

export const DESIGN_SYSTEM_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'button' },
  {
    path: 'classes-css',
    title: 'Classes CSS · Design system Aero',
    loadComponent: () => import('./css-guide/css-guide.component').then(c => c.CssGuideComponent),
  },
  ...AERO_USAGE_DOCS.map(doc => ({
    path: doc.id,
    title: `${doc.name} · Design system Aero`,
    data: { componentId: doc.id },
    loadComponent: () => import('./component-page/component-page.component').then(c => c.ComponentPageComponent),
  })),
  { path: '**', redirectTo: '/404' },
];
