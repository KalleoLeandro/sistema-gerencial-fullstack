import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@pages/auth/auth.component').then((c) => c.AuthComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@components/main-layout/main-layout.component').then((c) => c.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/home/home.component').then((c) => c.HomeComponent)
      },
      {
        path: 'selecao',
        loadComponent: () => import('@pages/home/home.component').then((c) => c.HomeComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
