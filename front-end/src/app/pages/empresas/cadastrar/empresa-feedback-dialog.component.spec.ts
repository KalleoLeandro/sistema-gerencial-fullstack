import { TestBed } from '@angular/core/testing';
import { EmpresaFeedbackDialogComponent } from './empresa-feedback-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('EmpresaFeedbackDialogComponent', () => {
  it('closes customer feedback dialogs', () => {
    const close = jasmine.createSpy();
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Salvo' } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const c = TestBed.runInInjectionContext(
      () => new EmpresaFeedbackDialogComponent(),
    );
    expect(c.data.message).toBe('Salvo');
    c.fechar();
    expect(close).toHaveBeenCalled();
  });
});
