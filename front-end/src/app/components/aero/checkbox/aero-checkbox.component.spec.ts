import { TestBed } from '@angular/core/testing';
import { FormHost } from '../../../testing/aero-form.testing';

describe('AeroCheckboxComponent forms', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, element };
  };
  it('syncs checkbox and disabled state', () => {
    const { fixture, host, element } = setup();
    const checkbox = element.querySelector<HTMLInputElement>('#notify')!;
    checkbox.click();
    expect(host.form.controls.notify.value).toBeTrue();
    host.form.disable();
    fixture.detectChanges();
    expect(checkbox.disabled).toBeTrue();
  });
});
