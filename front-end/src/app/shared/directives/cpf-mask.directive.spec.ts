import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { CpfMaskDirective } from './cpf-mask.directive';

describe('CpfMaskDirective', () => {
  for (const bound of [false, true])
    it(`masks CPF and synchronizes optional Angular control=${bound}`, () => {
      const input = document.createElement('input');
      input.value = '12345678901xx99';
      const control = new FormControl('');
      TestBed.configureTestingModule({
        providers: [
          { provide: ElementRef, useValue: new ElementRef(input) },
          ...(bound ? [{ provide: NgControl, useValue: { control } }] : []),
        ],
      });
      const directive = TestBed.runInInjectionContext(
        () => new CpfMaskDirective(),
      );
      directive.onInput();
      expect(input.value).toBe('123.456.789-01');
      if (bound) expect(control.value).toBe('123.456.789-01');
    });
});
