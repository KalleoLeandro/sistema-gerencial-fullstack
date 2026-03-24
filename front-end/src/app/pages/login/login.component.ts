import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private loginService = inject(LoginService);
  private toastService = inject(ToastService);

  public invalido = false;

  public loginForm: FormGroup = this.formBuilder.group({
    login: ['', [Validators.required]],
    senha: ['', [Validators.required]]
  });

  public change(): void {
    if (this.loginForm.controls['login'].value !== '' || this.loginForm.controls['senha'].value !== '') {
      this.invalido = false;
    }
  }

  public isInvalid(field: 'login' | 'senha'): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  public logar(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginService.validarLogin(this.loginForm).subscribe({
      next: (res) => {
        this.loginService.persistSessionMetadata(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errorMessage = this.getErrorMessage(err);
        this.toastService.error(errorMessage);

        if (err.status === 401) {
          this.loginForm.patchValue({
            login: '',
            senha: ''
          });
          this.invalido = true;
        }
      }
    });
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    return err?.error?.message || err?.error?.error || err?.message || 'Erro ao validar login.';
  }
}
