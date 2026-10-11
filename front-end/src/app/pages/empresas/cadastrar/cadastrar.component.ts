import { AeroCheckboxComponent, AeroNativeControlComponent, AeroNativeButtonComponent, AeroFieldComponent, AeroDateDirective, AeroRadioGroupComponent } from '@components/aero';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmitLoaderComponent } from '@components/form-submit-loader/form-submit-loader.component';
import { NgxMaskDirective } from 'ngx-mask';
import { EmpresasService } from '@services/empresas.service';
import { ToastService } from '@services/toast.service';
import { UtilsService } from '@services/utils.service';
import { getHttpErrorMessage } from 'app/utils/http-error.util';

@Component({
  selector: 'app-cadastrar',
  imports: [AeroCheckboxComponent, AeroNativeControlComponent, AeroNativeButtonComponent, AeroFieldComponent, AeroDateDirective, AeroRadioGroupComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    FormSubmitLoaderComponent
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
    tipo_pessoa: ['j', Validators.required],
    nome_cliente: ['', Validators.required],
    nome_fantasia: ['', Validators.required],
    razao_social: [''],
    cpf_cnpj: ['', Validators.required],
    cnpj: [''],
    ie: [''],
    inscricao: [''],
    possui_contrato: [false],
    teve_contrato: [false],
    contato: [''],
    data_inicio: [''],
    data_fim: ['', [this.dataNaoPodeSerPassadaValidator.bind(this), this.dataFinalMaiorOuIgualInicialValidator.bind(this)]],
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
  public salvando = false;
  public renovandoContrato = false;
  public renovacaoDataInicio: Date | null = null;
  public renovacaoDataFim: Date | null = null;
  public renovacaoObservacoes = '';
  private ultimoCnpjConsultado = '';

  constructor() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id') as unknown as number;
    this.onTipoPessoaChange(this.cadastroForm.get('tipo_pessoa')?.value ?? 'j');
    this.cadastroForm.get('data_inicio')?.valueChanges.subscribe(() => {
      this.cadastroForm.get('data_fim')?.updateValueAndValidity({ emitEvent: false });
    });
    this.cadastroForm.get('possui_contrato')?.valueChanges.subscribe((value) => {
      if (value) {
        this.cadastroForm.get('teve_contrato')?.patchValue(true, { emitEvent: false });
      }
      this.atualizarValidadoresContrato();
    });
    this.cadastroForm.get('teve_contrato')?.valueChanges.subscribe((value) => {
      if (!value) {
        this.cadastroForm.get('possui_contrato')?.patchValue(false, { emitEvent: false });
      }
      this.atualizarValidadoresContrato();
    });
    this.cadastroForm.get('tipo_pessoa')?.valueChanges.subscribe((value) => {
      this.onTipoPessoaChange(value ?? 'j');
    });
    this.atualizarValidadoresContrato();

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

  public buscarCnpj() {
    if (this.cadastroForm.get('tipo_pessoa')?.value !== 'j') {
      return;
    }

    const cnpj = (this.cadastroForm.controls['cpf_cnpj'].value || '').replace(/\D/g, '');
    if (cnpj.length !== 14 || cnpj === this.ultimoCnpjConsultado) {
      return;
    }

    this.ultimoCnpjConsultado = cnpj;
    this.utilsService.buscarDadosPorCnpj(cnpj).subscribe({
      next: (response) => {
        this.preencherDadosPorCnpj(response);
      },
      error: () => {
        this.ultimoCnpjConsultado = '';
      }
    });
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
        this.cadastroForm.controls['tipo_pessoa'].patchValue(response.tipo_pessoa || 'j');
        this.cadastroForm.controls['nome_cliente'].patchValue(response.nome_cliente || response.nome_fantasia);
        this.cadastroForm.controls['nome_fantasia'].patchValue(response.nome_fantasia);
        this.cadastroForm.controls['razao_social'].patchValue(response.razao_social);
        this.cadastroForm.controls['cpf_cnpj'].patchValue(response.cpf_cnpj || response.cnpj);
        this.cadastroForm.controls['cnpj'].patchValue(response.cnpj);
        this.cadastroForm.controls['ie'].patchValue(response.ie || response.inscricao);
        this.cadastroForm.controls['inscricao'].patchValue(response.inscricao);
        this.cadastroForm.controls['possui_contrato'].patchValue(!!response.possui_contrato);
        this.cadastroForm.controls['teve_contrato'].patchValue(!!response.teve_contrato);
        this.cadastroForm.controls['data_inicio'].patchValue(response.data_inicio ? new Date(response.data_inicio) : '');
        this.cadastroForm.controls['data_fim'].patchValue(response.data_fim ? new Date(response.data_fim) : '');
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
        this.onTipoPessoaChange((response.tipo_pessoa === 'f' ? 'f' : 'j'));
        this.atualizarValidadoresContrato();
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
    if (this.salvando) {
      return;
    }

    if (this.verificarFormularioValido()) {
      this.verificarDatas();
      this.salvando = true;
      this.id !== null && this.id !== undefined
        ? this.empresaService.atualizarEmpresa(this.cadastroForm).subscribe({
          next: () => {
            this.toastService.success('Dados atualizados com sucesso!');
            this.redirecionar();
          },
          error: (error) => {
            this.salvando = false;
            this.toastService.error(getHttpErrorMessage(error, 'Erro ao atualizar a empresa!'));
          }
        })
        : this.empresaService.cadastrarEmpresa(this.cadastroForm).subscribe({
          next: () => {
            this.toastService.success('Dados cadastrados com sucesso!');
            this.redirecionar();
          },
          error: (error) => {
            this.salvando = false;
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
    this.router.navigate([`/clientes/listar`]);
  }

  public onTipoPessoaChange(tipo: 'f' | 'j'): void {
    const razaoSocial = this.cadastroForm.get('razao_social');
    const nomeFantasia = this.cadastroForm.get('nome_fantasia');
    const nomeCliente = this.cadastroForm.get('nome_cliente');
    const cpfCnpj = this.cadastroForm.get('cpf_cnpj');
    const inscricaoEstadual = this.cadastroForm.get('ie');

    cpfCnpj?.setValidators([Validators.required]);
    nomeFantasia?.setValidators([Validators.required]);

    if (tipo === 'j') {
      razaoSocial?.setValidators([Validators.required]);
      nomeCliente?.setValidators([Validators.required]);
      inscricaoEstadual?.clearValidators();
    } else {
      razaoSocial?.clearValidators();
      razaoSocial?.patchValue('', { emitEvent: false });
      nomeCliente?.clearValidators();
      nomeCliente?.patchValue('', { emitEvent: false });
      inscricaoEstadual?.clearValidators();
      inscricaoEstadual?.patchValue('', { emitEvent: false });
      this.ultimoCnpjConsultado = '';
    }

    razaoSocial?.updateValueAndValidity({ emitEvent: false });
    nomeFantasia?.updateValueAndValidity({ emitEvent: false });
    nomeCliente?.updateValueAndValidity({ emitEvent: false });
    cpfCnpj?.updateValueAndValidity({ emitEvent: false });
    inscricaoEstadual?.updateValueAndValidity({ emitEvent: false });
  }

  public renovarContrato() {
    if (!this.id || this.renovandoContrato || !this.renovacaoDataInicio || !this.renovacaoDataFim) {
      return;
    }

    const inicio = new Date(this.renovacaoDataInicio);
    const fim = new Date(this.renovacaoDataFim);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);

    if (fim < inicio) {
      this.toastService.error('A data final da renovacao deve ser igual ou maior que a data inicial.');
      return;
    }

    if (fim < this.minDate) {
      this.toastService.error('A data final da renovacao nao pode ser anterior a hoje.');
      return;
    }

    this.renovandoContrato = true;
    this.empresaService.renovarContrato(this.id, {
      data_inicio: this.formatarDataSemHora(this.renovacaoDataInicio),
      data_fim: this.formatarDataSemHora(this.renovacaoDataFim),
      observacoes: this.renovacaoObservacoes?.trim() || ''
    }).subscribe({
      next: () => {
        this.toastService.success('Contrato renovado com sucesso.');
        this.cadastroForm.controls['possui_contrato'].patchValue(true);
        this.cadastroForm.controls['teve_contrato'].patchValue(true);
        this.cadastroForm.controls['data_inicio'].patchValue(new Date(this.renovacaoDataInicio!));
        this.cadastroForm.controls['data_fim'].patchValue(new Date(this.renovacaoDataFim!));
        this.limparRenovacaoContrato();
        this.renovandoContrato = false;
      },
      error: (error) => {
        this.renovandoContrato = false;
        this.toastService.error(getHttpErrorMessage(error, 'Nao foi possivel renovar o contrato agora.'));
      }
    });
  }

  public limparRenovacaoContrato() {
    this.renovacaoDataInicio = null;
    this.renovacaoDataFim = null;
    this.renovacaoObservacoes = '';
  }

  public get possuiHistoricoContrato(): boolean {
    return !!this.cadastroForm?.get('teve_contrato')?.value;
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
    const teveContrato = !!group.get('teve_contrato')?.value;
    if (!teveContrato) {
      return null;
    }
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

  private atualizarValidadoresContrato(): void {
    const dataInicioControl = this.cadastroForm.get('data_inicio');
    const dataFimControl = this.cadastroForm.get('data_fim');
    if (!dataInicioControl || !dataFimControl) {
      return;
    }

    if (this.possuiHistoricoContrato) {
      dataInicioControl.setValidators([Validators.required]);
      dataFimControl.setValidators([
        Validators.required,
        this.dataNaoPodeSerPassadaValidator.bind(this),
        this.dataFinalMaiorOuIgualInicialValidator.bind(this)
      ]);
    } else {
      dataInicioControl.clearValidators();
      dataFimControl.setValidators([
        this.dataNaoPodeSerPassadaValidator.bind(this),
        this.dataFinalMaiorOuIgualInicialValidator.bind(this)
      ]);
      dataInicioControl.patchValue('', { emitEvent: false });
      dataFimControl.patchValue('', { emitEvent: false });
    }

    dataInicioControl.updateValueAndValidity({ emitEvent: false });
    dataFimControl.updateValueAndValidity({ emitEvent: false });
    this.cadastroForm.updateValueAndValidity({ emitEvent: false });
  }

  private preencherDadosPorCnpj(response: any): void {
    const estabelecimento = response?.estabelecimento ?? {};
    const inscricaoEstadual = estabelecimento?.inscricoes_estaduais?.find((item: any) => item?.ativo)?.inscricao_estadual
      || estabelecimento?.inscricoes_estaduais?.[0]?.inscricao_estadual
      || '';
    const endereco = [estabelecimento?.tipo_logradouro, estabelecimento?.logradouro]
      .filter((item: string | null | undefined) => !!item)
      .join(' ');
    const telefone = this.formatarTelefone(estabelecimento?.ddd1, estabelecimento?.telefone1);
    const nomeFantasia = estabelecimento?.nome_fantasia || response?.razao_social || '';

    this.patchSePossuirValor('razao_social', response?.razao_social);
    this.patchSePossuirValor('nome_cliente', nomeFantasia);
    this.patchSePossuirValor('nome_fantasia', nomeFantasia);
    this.patchSePossuirValor('cpf_cnpj', this.cadastroForm.controls['cpf_cnpj'].value);
    this.patchSePossuirValor('ie', inscricaoEstadual);
    this.patchSePossuirValor('inscricao', inscricaoEstadual);
    this.patchSePossuirValor('cep', this.formatarCep(estabelecimento?.cep));
    this.patchSePossuirValor('endereco', endereco);
    this.patchSePossuirValor('numero', this.normalizeNumber(estabelecimento?.numero));
    this.patchSePossuirValor('complemento', estabelecimento?.complemento);
    this.patchSePossuirValor('bairro', estabelecimento?.bairro);
    this.patchSePossuirValor('cidade', estabelecimento?.cidade?.nome);
    this.patchSePossuirValor('uf', estabelecimento?.estado?.sigla);
    this.patchSePossuirValor('telefone', telefone);
    this.patchSePossuirValor('email', estabelecimento?.email);
  }

  private patchSePossuirValor(controlName: string, value: any): void {
    if (value === null || value === undefined || value === '') {
      return;
    }

    this.cadastroForm.get(controlName)?.patchValue(value);
  }

  private formatarCep(cep: string | null | undefined): string {
    const digits = (cep || '').replace(/\D/g, '');
    return digits.length === 8 ? `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}` : '';
  }

  private formatarTelefone(ddd: string | null | undefined, telefone: string | null | undefined): string {
    const digits = `${ddd || ''}${telefone || ''}`.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    return '';
  }

  private normalizeNumber(numero: string | null | undefined): number | null {
    if (!numero) {
      return null;
    }

    const digits = `${numero}`.replace(/\D/g, '');
    return digits ? Number(digits) : null;
  }
}


