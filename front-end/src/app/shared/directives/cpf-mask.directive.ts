import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCpfMask]',
  standalone: true
})
export class CpfMaskDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  @HostListener('input')
  onInput() {
    const input = this.elementRef.nativeElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    const masked = digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');

    input.value = masked;
    this.ngControl?.control?.setValue(masked, { emitEvent: false });
  }
}
