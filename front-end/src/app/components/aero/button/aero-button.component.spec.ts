import { TestBed } from '@angular/core/testing';
import { AeroButtonComponent } from '../index';

describe('Aero button', () => {
  it('bloqueia a ação do botão durante carregamento', () => {
    const fixture = TestBed.createComponent(AeroButtonComponent);
    const pressed = spyOn(fixture.componentInstance.pressed, 'emit');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    button.click();
    expect(button.disabled).toBeTrue();
    expect(pressed).not.toHaveBeenCalled();
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    button.click();
    expect(pressed).toHaveBeenCalledTimes(1);
  });
});
