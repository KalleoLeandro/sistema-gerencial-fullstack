import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AeroOption } from '../select/aero-select.component';

@Component({
  selector: 'app-aero-segmented', standalone: true,
  template: `<div role="group" [attr.aria-label]="label">
    @for (option of options; track $index) {
      <button type="button" class="aero-button" [class.aero-button--primary]="value === option.value"
        [disabled]="option.disabled ?? false" [attr.aria-pressed]="value === option.value" (click)="valueChange.emit(option.value)">{{ option.label }}</button>
    }
  </div>`,
  styles: ['div { display: flex; flex-wrap: wrap; gap: .75rem; }'],
})
export class AeroSegmentedComponent {
  @Input() label = 'Visualização';
  @Input() options: AeroOption[] = [];
  @Input() value: string | number | null = null;
  @Output() valueChange = new EventEmitter<string | number>();
}
