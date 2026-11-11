import { TestBed } from '@angular/core/testing';
import { FormHost } from '../../../testing/aero-form.testing';

describe('AeroTextareaComponent forms', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, element };
  };
  it('syncs textarea and disabled state', () => {
    const { fixture, host, element } = setup();
    const notes = element.querySelector<HTMLTextAreaElement>('#notes')!;
    notes.value = 'Detalhes';
    notes.dispatchEvent(new Event('input'));
    expect(host.form.controls.notes.value).toBe('Detalhes');
    host.form.disable();
    fixture.detectChanges();
    expect(notes.disabled).toBeTrue();
  });
});
