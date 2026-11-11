import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AeroValueAccessor } from '../forms/aero-value-accessor';

@Component({
  selector: 'app-aero-checkbox',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeroCheckboxComponent), multi: true }],
  template: `<div class="aero-field"><div class="aero-choice"><label [for]="controlId">
    <input [id]="controlId" type="checkbox" [attr.role]="kind === 'switch' ? 'switch' : null"
      [checked]="value === true" [required]="required" [disabled]="disabled"
      [attr.aria-invalid]="showError" [attr.aria-describedby]="describedBy" (change)="toggle($event)" (blur)="markTouched()">{{ label }}
  </label></div>
  @if (showError || hint) { <small [id]="controlId + '-message'" [class.aero-error]="showError">{{ showError ? error : hint }}</small> }
  </div>`,
  styles: [':host { display: block; }'],
})
export class AeroCheckboxComponent extends AeroValueAccessor<boolean> {
  @Input() kind: 'checkbox' | 'switch' = 'checkbox';
  protected toggle(event: Event): void { this.updateValue((event.target as HTMLInputElement).checked); }
}
