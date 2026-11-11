import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { AeroDateDirective } from './aero-date.directive';

describe('AeroDateDirective', () => {
  it('formats/validates native dates and times before form callbacks are registered', () => {
    const input = document.createElement('input');
    TestBed.configureTestingModule({
      providers: [{ provide: ElementRef, useValue: new ElementRef(input) }],
    });
    const c: any = TestBed.runInInjectionContext(() => new AeroDateDirective());
    c.ngOnChanges();
    c.onTouched();
    c.onInput({ target: { value: '' } });
    expect(c.format('invalid')).toBeNull();
    expect(c.format(new Date(NaN))).toBeNull();
    expect(c.format('13/10/2026')).toBe('2026-10-13');
    expect(c.format('13/10/2026 12:30')).toBe('2026-10-13');
    c.aeroDate = 'time';
    expect(c.format('12:30')).toBe('12:30');
    c.onInput({ target: { value: '12:30' } });
    c.writeValue(new Date(2026, 9, 13, 12, 30));
    c.onInput({ target: { value: '13:00' } });
    expect(input.value).toBe('12:30');
    c.min = '12:00';
    c.max = '14:00';
    expect(c.validate(new FormControl(new Date(2026, 9, 13, 13)))).toBeNull();
    c.setDisabledState(true);
    expect(input.disabled).toBeTrue();
  });
});
