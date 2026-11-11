import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AeroValueAccessor } from '../forms/aero-value-accessor';
import { AeroOption } from '../select/aero-select.component';

@Component({
  selector: 'app-aero-radio-group',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeroRadioGroupComponent), multi: true }],
  template: `<div class="aero-field"><fieldset class="aero-choice" [disabled]="disabled" [attr.aria-describedby]="describedBy" [attr.aria-invalid]="showError">
    <legend>{{ label }}</legend>
    @for (option of options; track $index) {
      <label><input type="radio" [name]="controlId" [checked]="value === option.value" [required]="required"
        [disabled]="disabled || !!option.disabled" (change)="updateValue(option.value)" (blur)="markTouched()">{{ option.label }}</label>
    }
  </fieldset>
  @if (showError || hint) { <small [id]="controlId + '-message'" [class.aero-error]="showError">{{ showError ? error : hint }}</small> }
  </div>`,
  styles: [':host { display: block; }'],
})
export class AeroRadioGroupComponent extends AeroValueAccessor<string | number> {
  @Input() options: AeroOption[] = [];
}
