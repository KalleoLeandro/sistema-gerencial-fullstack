import { AeroNativeButtonComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { AeroThemeToggleComponent } from '@components/aero/theme-toggle/aero-theme-toggle.component';
import { AeroButtonComponent } from '@components/aero/button/aero-button.component';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';

import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from '@components/toast/toast.component';
import { LoginService } from '@services/login.service';
import { EMPTY, forkJoin, switchMap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

type NavItem = {
  label: string;
  route: string;
  badge?: string;
  roles: string[];
};

@Component({
  selector: 'app-main-layout',
  imports: [AeroNativeButtonComponent,
    CommonModule,
    AeroThemeToggleComponent,
    AeroButtonComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    ToastComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly desktopBreakpoint = 1024;
  private validatingSession = false;

  protected sidebarOpen = signal(false);
  protected isDesktop = signal(false);
  protected currentYear = new Date().getFullYear();
  protected userName = signal(sessionStorage.getItem('userName') || '');
  protected perfil = signal(sessionStorage.getItem('perfil') || '');

  protected readonly navItems: NavItem[] = [
    { label: 'Clientes', route: '/clientes/listar', roles: ['ADMIN', 'DEV', 'COMERCIAL', 'USER'] },
    { label: 'Ordens de servico', route: '/avulsos/listar', roles: ['ADMIN', 'DEV', 'COMERCIAL', 'USER'] },
    { label: 'Produtos', route: '/produtos/listar', roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
    { label: 'Servicos', route: '/servicos/listar', roles: ['ADMIN', 'DEV', 'COMERCIAL'] },
    { label: 'Usuarios', route: '/usuarios/listar', roles: ['ADMIN', 'DEV'] }
  ];

  ngOnInit(): void {
    this.handleViewport();
    this.validarSessaoAtual();
  }

  @HostListener('window:resize')
  handleViewport(): void {
    const isDesktop = window.innerWidth >= this.desktopBreakpoint;
    const previousMode = this.isDesktop();

    this.isDesktop.set(isDesktop);

    if (previousMode === isDesktop) {
      return;
    }

    this.sidebarOpen.set(isDesktop);
  }

  @HostListener('window:focus')
  handleWindowFocus(): void {
    this.validarSessaoAtual();
  }

  protected visibleNavItems(): NavItem[] {
    const role = this.perfil() || 'USER';
    return this.navItems.filter((item) => item.roles.includes(role));
  }

  protected welcomeLabel(): string {
    const userName = this.userName().trim();
    return userName ? `Bem vindo ${userName}` : 'Bem vindo';
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  protected closeSidebar(): void {
    if (!this.isDesktop()) {
      this.sidebarOpen.set(false);
    }
  }

  protected logout(): void {
    this.loginService.markLogoutRequested();

    this.loginService.logout().subscribe({
      next: () => {
        this.encerrarSessaoLocal();
      },
      error: () => {
        this.encerrarSessaoLocal();
      }
    });
  }

  private validarSessaoAtual(): void {
    if (this.validatingSession || this.loginService.isLogoutRequested()) {
      return;
    }

    this.validatingSession = true;

    this.loginService.validarToken().pipe(
      switchMap((isAuthenticated) => {
        if (isAuthenticated) {
          return this.carregarDadosSessao();
        }

        return this.loginService.refreshToken().pipe(
          switchMap((response) => {
            this.loginService.persistSessionMetadata(response);
            return this.carregarDadosSessao();
          })
        );
      }),
      catchError(() => {
        this.encerrarSessaoLocal();
        return EMPTY;
      }),
      finalize(() => {
        this.validatingSession = false;
      })
    ).subscribe({
      next: ({ perfil, usuario }) => {
        const role = perfil?.role || '';
        const userName = usuario?.nome || '';

        this.userName.set(userName);
        this.perfil.set(role);
        this.loginService.persistSessionMetadata({ userName, perfil: role });
      }
    });
  }

  private carregarDadosSessao() {
    return forkJoin({
      perfil: this.loginService.getPerfil(),
      usuario: this.loginService.buscarPorToken()
    });
  }

  private encerrarSessaoLocal(): void {
    this.loginService.markLogoutRequested();
    this.loginService.clearSessionMetadata();
    this.userName.set('');
    this.perfil.set('');

    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }
}
