import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { EmpresasService } from '@services/empresas.service';
import { ToastService } from '@services/toast.service';
import { UtilsService } from '@services/utils.service';
import { getHttpErrorMessage } from 'app/utils/http-error.util';

@Component({
  selector: 'app-cadastrar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private empresaService = inject(EmpresasService);
  private utilsService = inject(UtilsService);
  private toastService = inject(ToastService);

  public minDate = this.criarDataHoje();
  public cadastroForm: FormGroup = this.formBuilder.group({
    id: [{ value: '', disabled: true }],
    nome_fantasia: ['', Validators.required],
    razao_social: ['', Validators.required],
    cnpj: [''],
    inscricao: [''],
    contato: [''],
    data_inicio: ['', Validators.required],
    data_fim: ['', [Validators.required, this.dataNaoPodeSerPassadaValidator.bind(this), this.dataFinalMaiorOuIgualInicialValidator.bind(this)]],
    cep: [''],
    endereco: [{ value: '', disabled: true }],
    numero: [null, Validators.min(0)],
    complemento: [''],
    bairro: [{ value: '', disabled: true }],
    cidade: [{ value: '', disabled: true }],
    uf: [{ value: '', disabled: true }],
    telefone: [''],
    celular: ['', this.apenasNumerosMinLength(11)],
    email: ['']
  }, {
    validators: this.validarIntervaloDatas.bind(this)
  });

  public resposta = '';
  public id: number | null = null;

  constructor() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id') as unknown as number;
    this.cadastroForm.get('data_inicio')?.valueChanges.subscribe(() => {
      this.cadastroForm.get('data_fim')?.updateValueAndValidity({ emitEvent: false });
    });

    if (this.id != null && this.id != undefined) {
      this.carregarEmpresa();
    }
  }

  apenasNumerosMinLength(min: number) {
    return (control: any) => {
      const valor = control.value || '';
      const numeros = valor.replace(/\D/g, '');

      if (numeros.length === 0) {
        return null;
      }

      return numeros.length < min ? { minDigits: true } : null;
    };
  }

  public buscarCep() {
    const cep = this.cadastroForm.controls['cep'].value.replace(/\D/g, '');
    if (cep.length === 8) {
      this.utilsService.buscarEnderecoPorCep(cep).subscribe({
        next: (response) => {
          this.cadastroForm.controls['endereco'].patchValue(response.logradouro);
          this.cadastroForm.controls['numero'].patchValue(response.numero || null);
          this.cadastroForm.controls['complemento'].patchValue(response.complemento);
          this.cadastroForm.controls['bairro'].patchValue(response.bairro);
          this.cadastroForm.controls['cidade'].patchValue(response.localidade);
          this.cadastroForm.controls['uf'].patchValue(response.uf);
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }

  public imprimir() {
    Object.keys(this.cadastroForm.controls).forEach(key => {
      const control = this.cadastroForm.get(key);
      if (control?.invalid) {
        console.log('Campo invÃ¡lido:', key, control.errors);
      }
    });
  }

  public carregarEmpresa() {
    this.empresaService.buscarPorId(this.id).subscribe({
      next: (response) => {
        this.cadastroForm.controls['id'].patchValue(response.id);
        this.cadastroForm.controls['nome_fantasia'].patchValue(response.nome_fantasia);
        this.cadastroForm.controls['razao_social'].patchValue(response.razao_social);
        this.cadastroForm.controls['cnpj'].patchValue(response.cnpj);
        this.cadastroForm.controls['inscricao'].patchValue(response.inscricao);
        this.cadastroForm.controls['data_inicio'].patchValue(new Date(response.data_inicio));
        this.cadastroForm.controls['data_fim'].patchValue(new Date(response.data_fim));
        this.cadastroForm.controls['cep'].patchValue(response.cep);
        this.cadastroForm.controls['endereco'].patchValue(response.endereco);
        this.cadastroForm.controls['numero'].patchValue(response.numero || null);
        this.cadastroForm.controls['complemento'].patchValue(response.complemento);
        this.cadastroForm.controls['bairro'].patchValue(response.bairro);
        this.cadastroForm.controls['cidade'].patchValue(response.cidade);
        this.cadastroForm.controls['uf'].patchValue(response.uf);
        this.cadastroForm.controls['telefone'].patchValue(response.telefone);
        this.cadastroForm.controls['celular'].patchValue(response.celular);
        this.cadastroForm.controls['contato'].patchValue(response.contato);
        this.cadastroForm.controls['email'].patchValue(response.email);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  public verificarDatas() {
    const dataInicio = this.cadastroForm.controls['data_inicio'].value;
    if (dataInicio instanceof Date) {
      this.cadastroForm.controls['data_inicio'].patchValue(this.formatarDataSemHora(dataInicio));
    }

    const dataFim = this.cadastroForm.controls['data_fim'].value;
    if (dataFim instanceof Date) {
      this.cadastroForm.controls['data_fim'].patchValue(this.formatarDataSemHora(dataFim));
    }
  }

  verificarFormularioValido() {
    const form = this.cadastroForm;
    Object.keys(form.controls).forEach(campo => {
      const control = form.get(campo);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });

    if (form.invalid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    return true;
  }

  public cadastrarAtualizarEmpresa() {
    if (this.verificarFormularioValido()) {
      this.verificarDatas();
      this.id !== null && this.id !== undefined
        ? this.empresaService.atualizarEmpresa(this.cadastroForm).subscribe({
          next: () => {
            this.toastService.success('Dados atualizados com sucesso!');
            this.redirecionar();
          },
          error: (error) => {
            this.toastService.error(getHttpErrorMessage(error, 'Erro ao atualizar a empresa!'));
          }
        })
        : this.empresaService.cadastrarEmpresa(this.cadastroForm).subscribe({
          next: () => {
            this.toastService.success('Dados cadastrados com sucesso!');
            this.redirecionar();
          },
          error: (error) => {
            this.toastService.error(getHttpErrorMessage(error, 'Erro ao cadastrar a empresa!'));
          }
        });
    }
  }

  public limparFormulario() {
    if (this.id !== null && this.id !== undefined) {
      this.carregarEmpresa();
    } else {
      this.cadastroForm.reset();
    }
  }

  public redirecionar() {
    this.router.navigate([`/empresas/listar`]);
  }

  public isInvalid(controlName: string): boolean {
    const control = this.cadastroForm.get(controlName);
    return !!control && control.touched && control.invalid;
  }

  public hasDateRangeError(controlName: 'data_inicio' | 'data_fim'): boolean {
    const control = this.cadastroForm.get(controlName);
    return !!control && (control.touched || control.dirty) && (
      control.hasError('dataFinalMenorQueDataInicial') ||
      this.cadastroForm.hasError('dataInicioMaiorQueDataFim')
    );
  }

  private formatarDataSemHora(data: Date): string {
    const dataNormalizada = new Date(data);
    dataNormalizada.setHours(0, 0, 0, 0);
    return this.utilsService.formatarDatas(dataNormalizada);
  }

  private dataNaoPodeSerPassadaValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !(control.value instanceof Date)) {
      return null;
    }

    const data = new Date(control.value);
    data.setHours(0, 0, 0, 0);

    return data < this.minDate ? { dataPassada: true } : null;
  }

  private dataFinalMaiorOuIgualInicialValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !(control.value instanceof Date) || !control.parent) {
      return null;
    }

    const dataInicio = control.parent.get('data_inicio')?.value;
    if (!(dataInicio instanceof Date)) {
      return null;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(control.value);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);

    return fim < inicio ? { dataFinalMenorQueDataInicial: true } : null;
  }

  private validarIntervaloDatas(group: AbstractControl): ValidationErrors | null {
    const dataInicio = group.get('data_inicio')?.value;
    const dataFim = group.get('data_fim')?.value;

    if (!(dataInicio instanceof Date) || !(dataFim instanceof Date)) {
      return null;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);

    return inicio > fim ? { dataInicioMaiorQueDataFim: true } : null;
  }

  private criarDataHoje(): Date {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  }
}


