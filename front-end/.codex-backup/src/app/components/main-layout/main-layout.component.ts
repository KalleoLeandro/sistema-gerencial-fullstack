import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { ToastComponent } from '@components/toast/toast.component';

type NavItem = {
  label: string;
  route: string;
  badge?: string;
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
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected sidebarOpen = signal(false);
  protected currentYear = new Date().getFullYear();
  protected readonly navItems: NavItem[] = [
    { label: 'Visao geral', route: '/' },
    { label: 'Operacao', route: '/' , badge: '24h' },
    { label: 'Equipes', route: '/' },
    { label: 'Relatorios', route: '/' }
  ];

  protected toggleSidebar() {
    this.sidebarOpen.update((value) => !value);
  }

  protected closeSidebar() {
    this.sidebarOpen.set(false);
  }

  protected logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
