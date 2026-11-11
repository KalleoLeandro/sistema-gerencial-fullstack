import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AeroNativeButtonComponent } from '@components/aero';

@Component({
  selector: 'app-empresa-feedback-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, AeroNativeButtonComponent],
  template: `
    <h2 mat-dialog-title>Cadastro de Empresas</h2>
    <mat-dialog-content>
      <span>{{ data.message }}</span>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button aeroButton="primary" type="button" (click)="fechar()">Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    span {
      color: rgb(33, 37, 41);
    }

  `]
})
export class EmpresaFeedbackDialogComponent {
  private dialogRef = inject(MatDialogRef<EmpresaFeedbackDialogComponent>);
  public data = inject<{ message: string }>(MAT_DIALOG_DATA);

  public fechar(): void {
    this.dialogRef.close();
  }
}
