import { TestBed } from '@angular/core/testing';
import { AeroDialogComponent } from '../index';

describe('Aero dialog', () => {
  it('abre diálogo modal e distingue confirmação e cancelamento', async () => {
    const fixture = TestBed.createComponent(AeroDialogComponent);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement;
    const confirmed = spyOn(fixture.componentInstance.confirmed, 'emit');
    const cancelled = spyOn(fixture.componentInstance.cancelled, 'emit');
    fixture.componentInstance.open();
    expect(dialog.open).toBeTrue();
    (dialog.querySelectorAll('button')[0] as HTMLButtonElement).click();
    expect(dialog.open).toBeFalse();
    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(confirmed).not.toHaveBeenCalled();
    fixture.componentInstance.open();
    (dialog.querySelectorAll('button')[1] as HTMLButtonElement).click();
    expect(dialog.returnValue).toBe('confirm');
    expect(confirmed).toHaveBeenCalledTimes(1);
    await fixture.whenStable();
  });
});
