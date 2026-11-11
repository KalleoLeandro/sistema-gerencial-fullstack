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
        path: 'agenda',
        children: [
{
            path: '',
            loadComponent: () => import('@pages/agenda/agenda.component').then((c) => c.AgendaComponent),
          },
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/agenda/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent),
          },
{
            path: 'cadastrar/:id',
            loadComponent: () => import('@pages/agenda/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent),
          },
{
            path: 'detalhes/:id',
            loadComponent: () => import('@pages/agenda/detalhes/detalhes.component').then((c) => c.DetalhesComponent),
          }
]
      },
{
        path: 'empresas',
        children: [
{
            path: 'cadastrar',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
            loadComponent: () => import('@pages/empresas/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'cadastrar/:id',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
            loadComponent: () => import('@pages/empresas/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'listar',
            loadComponent: () => import('@pages/empresas/listar/listar.component').then((c) => c.ListarComponent)
          },
{
            path: 'detalhes/:id',
            loadComponent: () => import('@pages/empresas/detalhes/detalhes.component').then((c) => c.DetalhesComponent)
          }
]
      },
{
        path: 'equipamentos',
        children: [
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/empresas/equipamentos/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'detalhes/:id',
            loadComponent: () => import('@pages/empresas/equipamentos/detalhes/detalhes.component').then((c) => c.DetalhesComponent)
          }
]
      },
{
        path: 'manutencao',
        children: [
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/empresas/manutencao/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'detalhes/:id',
            loadComponent: () => import('@pages/empresas/manutencao/detalhes/detalhes.component').then((c) => c.DetalhesComponent)
          }
]
      },
{
        path: 'atendimentos',
        children: [
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/empresas/atendimentos/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'detalhes/:id',
            loadComponent: () => import('@pages/empresas/atendimentos/detalhes/detalhes.component').then((c) => c.DetalhesComponent)
          }
]
      },
{
        path: 'avulsos',
        children: [
{
            path: 'listar',
            loadComponent: () => import('@pages/avulsos/listar/listar.component').then((c) => c.ListarComponent)
          },
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/avulsos/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'detalhes/:id',
            loadComponent: () => import('@pages/avulsos/detalhes/detalhes.component').then((c) => c.DetalhesComponent)
          }
]
      },
{
        path: 'ordens-servico',
        children: [
{
            path: 'cadastrar',
            loadComponent: () => import('@pages/empresas/atendimentos/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'detalhes/:id',
            loadComponent: () => import('@pages/empresas/atendimentos/detalhes/detalhes.component').then((c) => c.DetalhesComponent)
          }
]
      },
{
        path: 'clientes',
        children: [
{
            path: 'cadastrar',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
            loadComponent: () => import('@pages/empresas/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'cadastrar/:id',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
            loadComponent: () => import('@pages/empresas/cadastrar/cadastrar.component').then((c) => c.CadastrarComponent)
          },
{
            path: 'listar',
            loadComponent: () => import('@pages/empresas/listar/listar.component').then((c) => c.ListarComponent)
          },
{
            path: 'detalhes/:id',
            loadComponent: () => import('@pages/empresas/detalhes/detalhes.component').then((c) => c.DetalhesComponent)
          }
]
      },
{
        path: 'financeiro',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DEV'] },
        children: [
{ path: '', redirectTo: 'receber', pathMatch: 'full' },
{ path: 'pagar', data: { tipo: 'PAGAR' }, loadComponent: () => import('@pages/financeiro/contas/contas.component').then(c => c.ContasComponent) },
{ path: 'receber', data: { tipo: 'RECEBER' }, loadComponent: () => import('@pages/financeiro/contas/contas.component').then(c => c.ContasComponent) },
{ path: 'relatorios', loadComponent: () => import('@pages/financeiro/relatorios/relatorios.component').then(c => c.RelatoriosComponent) }
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
          },
{
            path: 'listar',
            loadComponent: () => import('@pages/caixa/listar/listar.component').then((c) => c.ListarComponent)
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
            path: 'vendas/listar',
            loadComponent: () => import('@pages/comercial/vendas/listar/listar.component').then((c) => c.ListarComponent)
          },
{
            path: 'vendas',
            children: [
{
                path: '',
                redirectTo: 'listar',
                pathMatch: 'full'
              },
{
                path: 'listar',
                loadComponent: () => import('@pages/comercial/vendas/listar/listar.component').then((c) => c.ListarComponent)
              },
{
                path: 'pdv',
                data: { modo: 'pdv' },
                loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
              },
{
                path: 'editar/:id',
                data: { detalheTipo: 'venda', modo: 'pdv', edicao: true },
                loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
              },
{
                path: 'detalhes/:id',
                data: { readonly: true, detalheTipo: 'venda', modo: 'pdv' },
                loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
              },
{
                path: 'orcamento',
                data: { modo: 'orcamento' },
                loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
              },
{
                path: 'orcamentos/listar',
                loadComponent: () => import('@pages/comercial/orcamentos/listar/listar.component').then((c) => c.ListarComponent)
              },
{
                path: 'orcamentos/editar/:id',
                data: { detalheTipo: 'orcamento', modo: 'orcamento', edicao: true },
                loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
              },
{
                path: 'orcamentos/detalhes/:id',
                data: { readonly: true, detalheTipo: 'orcamento', modo: 'orcamento' },
                loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
              }
]
          },
{
            path: 'pdv',
            data: { modo: 'pdv' },
            loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
          },
{
            path: 'orcamento',
            data: { modo: 'orcamento' },
            loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
          },
{
            path: 'orcamentos/listar',
            loadComponent: () => import('@pages/comercial/orcamentos/listar/listar.component').then((c) => c.ListarComponent)
          },
{
            path: 'orcamentos/editar/:id',
            data: { detalheTipo: 'orcamento', modo: 'orcamento', edicao: true },
            loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
          },
{
            path: 'orcamentos/detalhes/:id',
            data: { readonly: true, detalheTipo: 'orcamento', modo: 'orcamento' },
            loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
          },
{
            path: 'vendas/editar/:id',
            data: { detalheTipo: 'venda', modo: 'pdv', edicao: true },
            loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
          },
{
            path: 'vendas/detalhes/:id',
            data: { readonly: true, detalheTipo: 'venda', modo: 'pdv' },
            loadComponent: () => import('@pages/comercial/orcamento/orcamento.component').then((c) => c.OrcamentoComponent)
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
