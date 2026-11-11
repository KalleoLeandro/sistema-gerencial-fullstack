import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';
import { loginGuard } from './guard/login.guard';
import { roleGuard } from './guard/role.guard';

export const routes: Routes = [
{
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('@pages/auth/auth.component').then((c) => c.AuthComponent)
  },
{
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
{
    path: '',
    loadComponent: () => import('@components/main-layout/main-layout.component').then((c) => c.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
{
        path: 'financeiro',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DEV'] },
        children: [
{ path: '', redirectTo: 'receber', pathMatch: 'full' }
]
      },
{
        path: 'caixa',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DEV'] },
        children: [
{
            path: '',
            redirectTo: 'listar',
            pathMatch: 'full'
          }
]
      },
{
        path: 'produtos',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
        children: [
{
            path: 'listar',
            loadComponent: () => import('@pages/produtos/listar/listar.component').then((c) => c.ListarComponent)
          },
{
            path: 'em-falta',
            loadComponent: () => import('@pages/produtos/em-falta/em-falta.component').then((c) => c.EmFaltaComponent)
          },
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/produtos/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'cadastrar/:id',
            loadComponent: () => import('@pages/produtos/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          }
]
      },
{
        path: 'servicos',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
        children: [
{
            path: 'listar',
            loadComponent: () => import('@pages/servicos/listar/listar.component').then((c) => c.ListarComponent)
          },
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/servicos/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'cadastrar/:id',
            loadComponent: () => import('@pages/servicos/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          }
]
      },
{
        path: 'comercial',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
        children: [
{
            path: 'vendas',
            children: [
{
                path: '',
                redirectTo: 'listar',
                pathMatch: 'full'
              }
]
          }
]
      },
{
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DEV'] },
        children: [
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/usuarios/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'listar',
            loadComponent: () => import('@pages/usuarios/listar/listar.component').then((c) => c.ListarComponent)
          }
]
      }
]
  },
{
    path: '401',
    loadComponent: () => import('@pages/errors/unauthorized/unauthorized.component').then((c) => c.UnauthorizedComponent)
  },
{
    path: '404',
    loadComponent: () => import('@pages/errors/not-found/not-found.component').then((c) => c.NotFoundComponent)
  },
{
    path: '**',
    redirectTo: '404'
  }
];
