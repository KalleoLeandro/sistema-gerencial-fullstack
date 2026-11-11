import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AeroValueAccessor } from '../forms/aero-value-accessor';

export interface AeroOption { label: string; value: string | number; disabled?: boolean; }

@Component({
  selector: 'app-aero-select',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeroSelectComponent), multi: true }],
  template: `<div class="aero-field"><label [for]="controlId">{{ label }} @if (required) { <span aria-hidden="true">*</span> }</label>
    <select #selectElement class="aero-select" [id]="controlId" [disabled]="disabled" [required]="required"
      [attr.aria-invalid]="showError" [attr.aria-describedby]="describedBy" (change)="select($event)" (blur)="markTouched()">
      <option value="" [disabled]="required" [selected]="selectedIndex === -1">{{ placeholder }}</option>
      @for (option of options; track $index) {
        <option [value]="$index" [selected]="selectedIndex === $index" [disabled]="option.disabled ?? false">{{ option.label }}</option>
      }
    </select>
    @if (showError || hint) { <small [id]="controlId + '-message'" [class.aero-error]="showError">{{ showError ? error : hint }}</small> }
  </div>`,
  styles: [':host { display: block; min-width: 0; }'],
})
export class AeroSelectComponent extends AeroValueAccessor<string | number> {
  @ViewChild('selectElement', { static: true }) private selectElement?: ElementRef<HTMLSelectElement>;
  @Input() options: AeroOption[] = [];
  @Input() placeholder = 'Selecione';
  protected get selectedIndex(): number { return this.options.findIndex(option => option.value === this.value); }
  override writeValue(value: string | number | null): void {
    super.writeValue(value);
    // A model write must also restore a selection changed before the next change-detection pass.
    if (this.selectElement) this.selectElement.nativeElement.selectedIndex = this.selectedIndex + 1;
  }
  protected select(event: Event): void {
    const index = (event.target as HTMLSelectElement).value;
    this.updateValue(index === '' ? null : this.options[Number(index)].value);
  }
}
