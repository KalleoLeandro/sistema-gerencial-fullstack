import { TestBed } from '@angular/core/testing';
import { AeroPaginationComponent } from '../index';

describe('Aero pagination', () => {
  it('limita paginação e emite a página solicitada', () => {
    const fixture = TestBed.createComponent(AeroPaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.detectChanges();
    const changed = spyOn(fixture.componentInstance.pageChange, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBeTrue();
    buttons[1].click();
    expect(changed).toHaveBeenCalledWith(2);
    fixture.componentRef.setInput('page', 999);
    fixture.detectChanges();
    expect(buttons[1].disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Página 3 de 3');
  });
});
