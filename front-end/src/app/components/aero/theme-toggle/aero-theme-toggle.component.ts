import { Component, inject } from '@angular/core';
import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-aero-theme-toggle',
  standalone: true,
  template: `<button class="aero-button" type="button" (click)="theme.toggle()"
    [attr.aria-pressed]="theme.theme() === 'dark'" aria-label="Modo escuro"
    [title]="theme.theme() === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'">
    <span aria-hidden="true">{{ theme.theme() === 'dark' ? '☾' : '☀' }}</span>
    {{ theme.theme() === 'dark' ? 'Escuro' : 'Claro' }}
  </button>`,
  styles: [':host { display: inline-block; } button { white-space: nowrap; }'],
})
export class AeroThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}
