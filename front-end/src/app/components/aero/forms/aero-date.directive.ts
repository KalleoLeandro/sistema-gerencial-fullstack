import { Directive, ElementRef, Input, forwardRef, inject } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

/** Native date/time UI, with local Date values compatible with the business forms. */
@Directive({
  selector: 'input[aeroDate]', standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeroDateDirective), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => AeroDateDirective), multi: true },
  ],
  host: {
    '[type]': 'aeroDate', '[attr.min]': 'format(min)', '[attr.max]': 'format(max)',
    '(input)': 'onInput($event)', '(blur)': 'onTouched()',
  },
})
export class AeroDateDirective implements ControlValueAccessor, Validator {
  private readonly element = inject(ElementRef<HTMLInputElement>);
  private current: Date | null = null;
  private onChange: (value: Date | null) => void = () => {};
  protected onTouched: () => void = () => {};
  private validatorChange = () => {};
  @Input() aeroDate: 'date' | 'time' = 'date';
  @Input() min: Date | string | null = null;
  @Input() max: Date | string | null = null;
  ngOnChanges(): void { this.validatorChange(); }

  format(value: Date | string | null): string | null {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value) && this.aeroDate === 'time') return value;
    const date = this.parse(value);
    if (!date) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    return this.aeroDate === 'time'
      ? `${pad(date.getHours())}:${pad(date.getMinutes())}`
      : `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  writeValue(value: Date | string | null): void {
    this.current = this.parse(value);
    this.element.nativeElement.value = this.format(this.current) ?? '';
  }
  private parse(value: Date | string | null): Date | null {
    // Business forms can retain the serialized API value after a failed save.
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (!value) return null;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
    const local = /^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}))?$/.exec(value);
    if (local) return new Date(+local[3], +local[2] - 1, +local[1], +(local[4] ?? 0), +(local[5] ?? 0));
    return null;
  }
  registerOnChange(fn: (value: Date | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.element.nativeElement.disabled = disabled; }
  registerOnValidatorChange(fn: () => void): void { this.validatorChange = fn; }
  validate(control: AbstractControl): ValidationErrors | null {
    const value = this.format(control.value);
    if (!value) return null;
    const min = this.format(this.min), max = this.format(this.max);
    if (min && value < min) return { aeroMin: { min: this.min, actual: control.value } };
    if (max && value > max) return { aeroMax: { max: this.max, actual: control.value } };
    return null;
  }
  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    let value: Date | null = null;
    if (raw && this.aeroDate === 'date') {
      const [year, month, day] = raw.split('-').map(Number);
      value = new Date(year, month - 1, day);
    } else if (raw) {
      const [hour, minute] = raw.split(':').map(Number);
      value = this.current ? new Date(this.current) : new Date();
      value.setHours(hour, minute, 0, 0);
    }
    this.current = value;
    this.onChange(value);
  }
}
