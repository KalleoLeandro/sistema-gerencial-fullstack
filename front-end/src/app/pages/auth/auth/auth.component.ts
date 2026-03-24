import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth/auth.service';
import { ToastService } from 'app/services/toast/toast.service';

@Component({
  selector: 'app-Auth',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);
  private AuthService = inject(AuthService);
  public toastService = inject(ToastService);
  public hidePassword = true;

  public AuthForm = this.fb.group({
    login: ['', Validators.required],
    senha: ['', Validators.required],
  });



  constructor() { }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  entrar() {
    if (this.AuthForm.invalid) return;

    this.AuthService.validarAuth(this.AuthForm).subscribe({
      next: (res) => {
        if (res.perfil === 'admin') {
          this.router.navigate(['/selecao']);
        } else {
          this.router.navigate(['/']);
        }


      },
      error: (err) => {
        if (err.status === 401) {
          this.AuthForm.patchValue({
            login: '',
            senha: ''
          });
          this.toastService.show("Login e/ou senha inválidos");
        } else {
          this.toastService.show("Erro ao efetuar o login. A API pode estar fora do ar " +
            "ou o caminho de destino do recurso foi modificado");
        }
      }

    });
  }
}
