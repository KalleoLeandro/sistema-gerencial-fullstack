import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AeroButtonComponent } from '../button/aero-button.component';

@Component({
  selector: 'app-aero-pagination', standalone: true,
  imports: [AeroButtonComponent],
  template: `<nav [attr.aria-label]="label">
    <app-aero-button label="Anterior" [disabled]="current <= 1" (pressed)="pageChange.emit(current - 1)" />
    <span aria-live="polite">Página {{ current }} de {{ count }}</span>
    <app-aero-button label="Próxima" [disabled]="current >= count" (pressed)="pageChange.emit(current + 1)" />
  </nav>`,
  styles: ['nav { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; }'],
})
export class AeroPaginationComponent {
  @Input() label = 'Paginação';
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();
  get count(): number { return Number.isFinite(this.totalPages) ? Math.max(1, Math.floor(this.totalPages)) : 1; }
  get current(): number { return Number.isFinite(this.page) ? Math.min(this.count, Math.max(1, Math.floor(this.page))) : 1; }
}
