import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from '@components/toast/toast.component';
import { LoginService } from '@services/login.service';

type NavItem = {
  label: string;
  route: string;
  badge?: string;
  roles: string[];
};

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    ToastComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly desktopBreakpoint = 1024;

  protected sidebarOpen = signal(false);
  protected isDesktop = signal(false);
  protected currentYear = new Date().getFullYear();
  protected userName = signal(sessionStorage.getItem('userName') || '');
  protected perfil = signal(sessionStorage.getItem('perfil') || '');

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', roles: ['ADMIN', 'DEV', 'COMERCIAL', 'USER'] },
    { label: 'Agenda', route: '/agenda', roles: ['ADMIN', 'DEV', 'COMERCIAL', 'USER'] },
    { label: 'Empresas', route: '/empresas/listar', roles: ['ADMIN', 'DEV', 'COMERCIAL', 'USER'] },
    { label: 'Ordens de servico', route: '/avulsos/listar', roles: ['ADMIN', 'DEV', 'COMERCIAL', 'USER'] },
    { label: 'Usuarios', route: '/usuarios/listar', roles: ['ADMIN', 'DEV'] }
  ];

  ngOnInit(): void {
    this.handleViewport();
    this.loginService.getPerfil().subscribe({
      next: (response) => {
        const perfil = response.role || '';
        this.perfil.set(perfil);
        this.loginService.persistSessionMetadata({ userName: this.userName(), perfil });
      },
      error: () => undefined
    });
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
        this.loginService.clearSessionMetadata();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loginService.clearSessionMetadata();
        this.router.navigate(['/login']);
      }
    });
  }
}
