import { TestBed } from '@angular/core/testing';
import { FormHost } from '../../../testing/aero-form.testing';

describe('AeroSelectComponent forms', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, element };
  };
  it('preserves option types', () => {
    const { fixture, host, element } = setup();
    const select = element.querySelector<HTMLSelectElement>('#category')!;
    expect(select.value).toBe('0');
    select.value = '1';
    select.dispatchEvent(new Event('change'));
    expect(host.form.controls.category.value).toBe('2');
    host.form.controls.category.setValue(2);
    fixture.detectChanges();
    expect(select.value).toBe('0');
  });
});
