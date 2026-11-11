import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AeroButtonComponent } from '@components/aero';
import { CSS_RECIPES } from './css-guide.data';

@Component({
  selector: 'app-aero-css-guide',
  standalone: true,
  imports: [AeroButtonComponent],
  templateUrl: './css-guide.component.html',
  styleUrl: './css-guide.component.css',
})
export class CssGuideComponent {
  private readonly document = inject(DOCUMENT);
  protected readonly recipes = CSS_RECIPES;
  protected readonly copyStatus = signal('');

  protected goTo(id: string): void {
    const section = this.document.getElementById('css-' + id);
    section?.scrollIntoView();
  }

  protected async copyCode(code: string, label: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.copyStatus.set(label + ': código copiado.');
    } catch {
      this.copyStatus.set('Não foi possível copiar automaticamente. Selecione o código e copie manualmente.');
    }
  }
}
