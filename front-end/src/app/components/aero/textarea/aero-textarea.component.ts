import { Component, forwardRef, Input, booleanAttribute } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AeroValueAccessor } from '../forms/aero-value-accessor';

@Component({
  selector: 'app-aero-textarea',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeroTextareaComponent), multi: true }],
  template: `<div class="aero-field"><label [for]="controlId">{{ label }} @if (required) { <span aria-hidden="true">*</span> }</label>
    <textarea class="aero-textarea" [id]="controlId" [value]="value ?? ''" [rows]="rows"
      [placeholder]="placeholder" [disabled]="disabled" [readOnly]="readonly" [required]="required"
      [attr.maxlength]="maxLength" [attr.aria-invalid]="showError" [attr.aria-describedby]="describedBy"
      (input)="onInput($event)" (blur)="markTouched()"></textarea>
    @if (showError || hint) { <small [id]="controlId + '-message'" [class.aero-error]="showError">{{ showError ? error : hint }}</small> }
  </div>`,
  styles: [':host { display: block; min-width: 0; }'],
})
export class AeroTextareaComponent extends AeroValueAccessor<string> {
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() maxLength: number | null = null;
  @Input({ transform: booleanAttribute }) readonly = false;
  protected onInput(event: Event): void { this.updateValue((event.target as HTMLTextAreaElement).value); }
}
