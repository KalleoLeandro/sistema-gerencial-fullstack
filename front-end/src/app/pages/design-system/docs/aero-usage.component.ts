import { Component, Input, signal } from '@angular/core';
import { AeroButtonComponent } from '@components/aero';
import { AERO_USAGE_DOCS, AeroUsageDoc } from './aero-usage.data';

@Component({
  selector: 'app-aero-usage',
  standalone: true,
  imports: [AeroButtonComponent],
  templateUrl: './aero-usage.component.html',
  styleUrl: './aero-usage.component.css',
})
export class AeroUsageComponent {
  protected readonly docs = AERO_USAGE_DOCS;
  protected readonly selected = signal(AERO_USAGE_DOCS[0]);
  protected readonly copyStatus = signal('');
  protected fixedComponent = false;

  @Input() set documentation(doc: AeroUsageDoc | null) {
    this.fixedComponent = doc !== null;
    if (doc) this.selected.set(doc);
    this.copyStatus.set('');
  }

  protected selectComponent(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const doc = this.docs.find(item => item.id === id);
    if (doc) this.selected.set(doc);
    this.copyStatus.set('');
  }

  protected async copyCode(code: string, language: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.copyStatus.set(`Código ${language} copiado.`);
    } catch {
      this.copyStatus.set('Não foi possível copiar automaticamente. Selecione o código e copie manualmente.');
    }
  }
}
