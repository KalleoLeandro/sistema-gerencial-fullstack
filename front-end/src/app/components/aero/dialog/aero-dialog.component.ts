import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, booleanAttribute } from '@angular/core';
import { AeroButtonComponent } from '../button/aero-button.component';

let nextDialogId = 0;
@Component({
  selector: 'app-aero-dialog', standalone: true,
  imports: [AeroButtonComponent],
  template: `<dialog #dialog class="aero-dialog aero-card" [attr.aria-labelledby]="dialogId + '-title'"
    [attr.aria-describedby]="description ? dialogId + '-description' : null" (close)="closed.emit(dialog.returnValue)" (cancel)="onCancel()">
    <h2 [id]="dialogId + '-title'">{{ title }}</h2>
    @if (description) { <p [id]="dialogId + '-description'">{{ description }}</p> }
    <ng-content />
    <div class="aero-dialog-actions">
      <app-aero-button [label]="cancelLabel" (pressed)="cancel()" />
      <app-aero-button [label]="confirmLabel" [variant]="destructive ? 'danger' : 'primary'" (pressed)="confirm()" />
    </div>
  </dialog>`,
  styles: ['.aero-dialog-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.25rem; }'],
})
export class AeroDialogComponent {
  @ViewChild('dialog', { static: true }) private dialog!: ElementRef<HTMLDialogElement>;
  readonly dialogId = `aero-dialog-${++nextDialogId}`;
  @Input() title = 'Confirmar ação';
  @Input() description = '';
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmLabel = 'Confirmar';
  @Input({ transform: booleanAttribute }) destructive = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<string>();

  open(): void { if (!this.dialog.nativeElement.open) this.dialog.nativeElement.showModal(); }
  close(result = ''): void { this.dialog.nativeElement.close(result); }
  protected confirm(): void { this.confirmed.emit(); this.close('confirm'); }
  protected cancel(): void { this.cancelled.emit(); this.close('cancel'); }
  protected onCancel(): void {
    this.dialog.nativeElement.returnValue = 'cancel';
    this.cancelled.emit();
  }
}
