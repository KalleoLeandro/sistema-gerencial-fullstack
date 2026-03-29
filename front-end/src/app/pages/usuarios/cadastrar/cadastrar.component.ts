import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmitLoaderComponent } from '@components/form-submit-loader/form-submit-loader.component';
import { TiposLogin } from '@models/tipoLogin';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';
import { getHttpErrorMessage } from 'app/utils/http-error.util';

@Component({
  selector: 'app-cadastrar',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormSubmitLoaderComponent],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private loginService = inject(LoginService);
  private toastService = inject(ToastService);

  public cadastroForm: FormGroup = this.formBuilder.group({
    id: [{ value: '', disabled: true }],
    nome: ['', Validators.required],
    login: ['', Validators.required],
    senha: ['', Validators.required],
    perfil: ['', Validators.required]
  });

  public perfil: Array<string> = TiposLogin;
  public id: number | null = null;
  public salvando = false;

  constructor() {
    this.id = this.activatedRoute.snapshot.queryParamMap.get('id') as unknown as number;
    if (this.id != null && this.id != undefined) {
      this.carregarUsuario();
    }
  }

  public carregarUsuario() {
    this.loginService.buscarPorId(this.id).subscribe({
      next: (response) => {
        this.cadastroForm.controls['id'].patchValue(response.id);
        this.cadastroForm.controls['nome'].patchValue(response.nome);
        this.cadastroForm.controls['login'].patchValue(response.login);
        this.cadastroForm.controls['senha'].patchValue(response.senha);
        this.cadastroForm.controls['perfil'].patchValue(response.perfil);
      },
      error: (error) => {
        this.toastService.error(getHttpErrorMessage(error, 'Erro ao carregar o usuÃ¡rio!'));
      }
    });
  }

  public cadastrarAtualizarUsuario() {
    this.id !== null && this.id !== undefined ? this.atualizar() : this.cadastrar();
  }

  public cadastrar() {
    if (this.salvando) {
      return;
    }

    this.salvando = true;
    this.loginService.cadastrarUsuario(this.cadastroForm).subscribe({
      next: () => {
        this.toastService.success('Dados cadastrados com sucesso!');
        this.redirecionar();
      },
      error: (err) => {
        this.salvando = false;
        this.toastService.error(getHttpErrorMessage(err, 'Erro ao cadastrar o usuÃ¡rio!'));
      }
    });
  }

  public atualizar() {
    if (this.salvando) {
      return;
    }

    this.salvando = true;
    this.loginService.atualizarUsuario(this.cadastroForm).subscribe({
      next: () => {
        this.toastService.success('Dados atualizados com sucesso!');
        this.redirecionar();
      },
      error: (err) => {
        this.salvando = false;
        this.toastService.error(getHttpErrorMessage(err, 'Erro ao atualizar o usuÃ¡rio!'));
      }
    });
  }

  public limparFormulario() {
    this.cadastroForm.reset();
    if (this.id !== null && this.id !== undefined) {
      this.cadastroForm.controls['id'].patchValue(this.id);
    }
  }

  public redirecionar() {
    this.router.navigate([`/usuarios/listar`]);
  }
}
