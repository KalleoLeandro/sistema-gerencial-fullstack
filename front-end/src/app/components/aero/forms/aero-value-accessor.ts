import { Directive, EventEmitter, inject, Injector, Input, OnInit, Output, booleanAttribute } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

let nextControlId = 0;

/** Shared Angular forms contract. Native controls remain responsible for focus and keyboard input. */
@Directive()
export abstract class AeroValueAccessor<T> implements ControlValueAccessor, OnInit {
  private readonly injector = inject(Injector);
  private ngControl: NgControl | null = null;
  private change: (value: T | null) => void = () => {};
  private touched: () => void = () => {};

  @Input() controlId = `aero-control-${++nextControlId}`;
  @Input() label = '';
  @Input() hint = '';
  @Input() error = 'Confira o valor informado.';
  @Input() value: T | null = null;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Output() valueChange = new EventEmitter<T | null>();

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, { self: true });
  }

  get showError(): boolean {
    return this.invalid || !!(this.ngControl?.invalid && this.ngControl.touched);
  }

  get describedBy(): string | null {
    return this.showError || this.hint ? `${this.controlId}-message` : null;
  }

  writeValue(value: T | null): void { this.value = value; }
  registerOnChange(fn: (value: T | null) => void): void { this.change = fn; }
  registerOnTouched(fn: () => void): void { this.touched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; }

  protected updateValue(value: T | null): void {
    if (this.disabled) return;
    this.value = value;
    this.change(value);
    this.valueChange.emit(value);
  }

  protected markTouched(): void { this.touched(); }
}
