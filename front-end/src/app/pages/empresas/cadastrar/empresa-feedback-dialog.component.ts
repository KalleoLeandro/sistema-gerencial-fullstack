import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empresa-feedback-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Cadastro de Empresas</h2>
    <mat-dialog-content>
      <span>{{ data.message }}</span>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button class="dialog-close-button" (click)="fechar()">Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    span {
      color: rgb(33, 37, 41);
    }

    .dialog-close-button {
      background: #212529;
      color: #D99E04;
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
