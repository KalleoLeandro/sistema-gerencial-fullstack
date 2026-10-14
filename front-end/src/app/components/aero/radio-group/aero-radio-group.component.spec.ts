import { TestBed } from '@angular/core/testing';
import { FormHost } from '../../../testing/aero-form.testing';

describe('AeroRadioGroupComponent forms', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, element };
  };
  it('syncs radio and disabled state', () => {
    const { fixture, host, element } = setup();
    const radios =
      element.querySelectorAll<HTMLInputElement>('input[type=radio]');
    radios[1].click();
    expect(host.form.controls.service.value).toBe('2');
    host.form.disable();
    fixture.detectChanges();
    expect(radios[0].disabled).toBeTrue();
  });
});
