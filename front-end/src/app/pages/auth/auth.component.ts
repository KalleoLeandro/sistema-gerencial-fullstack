import { AeroNativeControlComponent, AeroFieldComponent } from '@components/aero';
import { AeroNativeButtonComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { AeroThemeToggleComponent } from '@components/aero/theme-toggle/aero-theme-toggle.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-auth',
  imports: [AeroNativeControlComponent, AeroFieldComponent, AeroNativeButtonComponent,
    CommonModule,
    AeroThemeToggleComponent,
    ReactiveFormsModule,
    MatCardModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly toastService = inject(ToastService);

  public hidePassword = true;

  public AuthForm = this.fb.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
  });

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  entrar() {
    if (this.AuthForm.invalid) {
      this.AuthForm.markAllAsTouched();
      return;
    }

    this.loginService.validarLogin(this.AuthForm).subscribe({
      next: (res) => {
        this.loginService.persistSessionMetadata(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.AuthForm.patchValue({ login: '', senha: '' });
          this.toastService.error('Login e/ou senha invalidos');
          return;
        }

        this.toastService.error(
          err?.error?.message ||
          'Erro ao efetuar o login. A API pode estar fora do ar ou o recurso foi alterado.'
        );
      }
    });
  }
}
