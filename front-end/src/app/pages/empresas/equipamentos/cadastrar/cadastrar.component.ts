import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { EquipamentoService } from '@services/equipamento.service';
import { ToastService } from '@services/toast.service';
import { getHttpErrorMessage } from 'app/utils/http-error.util';


@Component({
  selector: 'app-cadastrar',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent {

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private equipamentoService = inject(EquipamentoService);
  private toastService = inject(ToastService);
  public id_empresa: number | undefined;
  public setores = ['Financeiro', 'RH', 'Gerencia', 'Operacional', 'Comercial', 'Almoxarifado', 'Supervisao', 'Produção', 'Expedição'];
  public tipo_equipamento = ['Desktop', 'Notebook'];

  public cadastroForm: FormGroup = this.formBuilder.group({
    id: [{ value: '', disabled: true }],
    nome_maquina: ['', Validators.required],
    setor: ['', Validators.required],
    tipo_equipamento: ['', Validators.required],
    placa_mae: [''],
    marca: [''],
    modelo: [''],
    numero_serie: [''],
    processador: [''],
    memoria: [''],
    hd_ssd: [''],
    fonte: [''],
    gabinete: [''],
    id_empresa: ['', Validators.required],
    observacoes: ['']
  });

  public resposta: string = "";
  public id: number | null = null;



  constructor() {
    this.id_empresa = this.activatedRoute.snapshot.queryParamMap.get('id_empresa') as unknown as number;
    this.id = this.activatedRoute.snapshot.queryParamMap.get('id') as unknown as number;
    if (this.id != null && this.id != undefined) {
      this.carregarEquipamento();
    }
    this.cadastroForm.controls['id_empresa'].patchValue(this.id_empresa);
    this.cadastroForm.controls['id'].patchValue(this.id_empresa);
  }

  public carregarEquipamento() {
    this.equipamentoService.buscarEquipamentoPorId(this.id!).subscribe({
      next: (response) => {
        this.cadastroForm.controls['id'].patchValue(response.id);
        this.cadastroForm.controls['id_empresa'].patchValue(response.id_empresa);
        this.cadastroForm.controls['nome_maquina'].patchValue(response.nome_maquina);
        this.cadastroForm.controls['setor'].patchValue(response.setor);
        this.cadastroForm.controls['tipo_equipamento'].patchValue(response.tipo_equipamento);
        this.cadastroForm.controls['placa_mae'].patchValue(response.placa_mae);
        this.cadastroForm.controls['marca'].patchValue(response.marca);
        this.cadastroForm.controls['modelo'].patchValue(response.modelo);
        this.cadastroForm.controls['numero_serie'].patchValue(response.numero_serie);
        this.cadastroForm.controls['processador'].patchValue(response.processador);
        this.cadastroForm.controls['memoria'].patchValue(response.memoria);
        this.cadastroForm.controls['hd_ssd'].patchValue(response.hd_ssd);
        this.cadastroForm.controls['fonte'].patchValue(response.fonte);
        this.cadastroForm.controls['gabinete'].patchValue(response.gabinete);
        this.cadastroForm.controls['observacoes'].patchValue(response.observacoes);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }


  public cadastrarAtualizarEquipamento() {
    if (this.verificarFormularioValido()) {
      this.mudarTipoEquipamento();
      this.id !== null && this.id !== undefined ?
        this.equipamentoService.atualizarEquipamento(this.cadastroForm).subscribe({
          next: () => {
            this.toastService.success('Dados atualizados com sucesso!');
            this.redirecionar();
          },
          error: (err) => {
            this.toastService.error(getHttpErrorMessage(err, 'Erro ao atualizar o equipamento!'));
          }
        }) :
        this.equipamentoService.cadastrarEquipamento(this.cadastroForm).subscribe({
          next: () => {
            this.toastService.success('Dados cadastrados com sucesso!');
            this.redirecionar();
          },
          error: (err) => {
            this.toastService.error(getHttpErrorMessage(err, 'Erro ao cadastrar o equipamento!'));
          }
        })
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

  public mudarTipoEquipamento() {
    if (this.cadastroForm.controls['tipo_equipamento'].value === 'Notebook') {
      this.cadastroForm.controls['placa_mae'].patchValue('');
      this.cadastroForm.controls['gabinete'].patchValue('');
    }

    if (this.cadastroForm.controls['tipo_equipamento'].value === 'Desktop') {
      this.cadastroForm.controls['marca'].patchValue('');
      this.cadastroForm.controls['modelo'].patchValue('');
      this.cadastroForm.controls['numero_serie'].patchValue('');
    }
  }

  public redirecionar() {
    this.router.navigate(
      [`/empresas/detalhes/${this.id_empresa}`],
      { queryParams: { aba: 2 } }
    );
  }

  public limparFormulario() {
    if (this.id !== null && this.id !== undefined) {
      this.carregarEquipamento();
    } else {
      this.cadastroForm.reset();
      this.cadastroForm.controls['id_empresa'].patchValue(this.id_empresa);
    }
  }
}




