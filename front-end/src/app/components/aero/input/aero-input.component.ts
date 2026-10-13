import { Component, forwardRef, Input, booleanAttribute } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { AeroValueAccessor } from '../forms/aero-value-accessor';

@Component({
  selector: 'app-aero-input',
  standalone: true,
  imports: [FormsModule, NgxMaskDirective],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeroInputComponent), multi: true }],
  template: `<div class="aero-field">
    <label [for]="controlId">{{ label }} @if (required) { <span aria-hidden="true">*</span> }</label>
    @if (mask) {
      <input class="aero-input" [id]="controlId" [type]="type" [ngModel]="value ?? ''"
        [ngModelOptions]="{ standalone: true }" [mask]="mask" (ngModelChange)="updateValue($event)"
        [placeholder]="placeholder" [disabled]="disabled" [readOnly]="readonly" [required]="required"
        [attr.autocomplete]="autocomplete" [attr.aria-invalid]="showError" [attr.aria-describedby]="describedBy"
        (blur)="markTouched()">
    } @else {
    <input class="aero-input" [id]="controlId" [type]="type" [value]="value ?? ''"
      [placeholder]="placeholder" [disabled]="disabled" [readOnly]="readonly" [required]="required"
      [attr.autocomplete]="autocomplete" [attr.min]="min" [attr.max]="max" [attr.step]="step"
      [attr.list]="suggestions.length ? controlId + '-suggestions' : null"
      [attr.aria-invalid]="showError" [attr.aria-describedby]="describedBy"
      (input)="onInput($event)" (blur)="markTouched()">
    }
    @if (suggestions.length) {
      <datalist [id]="controlId + '-suggestions'">@for (suggestion of suggestions; track suggestion) { <option [value]="suggestion"></option> }</datalist>
    }
    @if (showError || hint) { <small [id]="controlId + '-message'" [class.aero-error]="showError">{{ showError ? error : hint }}</small> }
  </div>`,
  styles: [':host { display: block; min-width: 0; }'],
})
export class AeroInputComponent extends AeroValueAccessor<string | number> {
  @Input() type: 'text' | 'email' | 'password' | 'search' | 'number' | 'date' | 'time' | 'datetime-local' | 'tel' | 'url' | 'range' = 'text';
  @Input() placeholder = '';
  @Input() mask = '';
  @Input() autocomplete = 'off';
  @Input() min: string | number | null = null;
  @Input() max: string | number | null = null;
  @Input() step: string | number | null = null;
  @Input() suggestions: string[] = [];
  @Input({ transform: booleanAttribute }) readonly = false;

  protected onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numeric = this.type === 'number' || this.type === 'range';
    this.updateValue(numeric ? (Number.isNaN(input.valueAsNumber) ? null : input.valueAsNumber) : input.value);
  }
}
