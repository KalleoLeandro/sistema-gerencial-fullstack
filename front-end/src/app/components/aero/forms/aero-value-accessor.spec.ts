import { TestBed } from '@angular/core/testing';
import { FormHost } from '../../../testing/aero-form.testing';

describe('AeroValueAccessor forms', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, element };
  };
  it('propagates disabled state to bound controls', () => {
    const { fixture, host, element } = setup();
    host.form.disable();
    fixture.detectChanges();
    expect(
      element.querySelector<HTMLSelectElement>('#category')!.disabled,
    ).toBeTrue();
    expect(
      element.querySelector<HTMLInputElement>('#name')!.disabled,
    ).toBeTrue();
  });
});
