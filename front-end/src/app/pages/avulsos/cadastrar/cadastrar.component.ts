import { AeroNativeControlComponent, AeroNativeButtonComponent, AeroFieldComponent, AeroDateDirective, AeroRadioGroupComponent } from '@components/aero';
﻿import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmitLoaderComponent } from '@components/form-submit-loader/form-submit-loader.component';
import { AvulsoService } from '@services/avulso.service';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';
import { UtilsService } from '@services/utils.service';
import { getHttpErrorMessage } from 'app/utils/http-error.util';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { NgxMaskDirective } from 'ngx-mask';
import { merge } from 'rxjs';

declare const bootstrap: any;

@Component({
  selector: 'app-cadastrar',
  imports: [AeroNativeControlComponent, AeroNativeButtonComponent, AeroFieldComponent, AeroDateDirective, AeroRadioGroupComponent, CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, CurrencyMaskModule, FormSubmitLoaderComponent],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private utilsService = inject(UtilsService);
  private avulsoService = inject(AvulsoService);
  private loginService = inject(LoginService);
  private toastService = inject(ToastService);

  public id: number | null = null;
  private formBuilder = inject(FormBuilder);
  public tipo_atendimento: string[] = ['Remoto', 'Presencial'];
  public executores = signal<any[]>([]);
  public listaExecutores = signal<any[]>([]);
  public mostrarOutro = signal(false);
  public outroNome = signal('');
  public minDate = this.startOfDay(new Date());
  public inicioData: Date | null = null;
  public inicioHora: Date | null = null;
  public fimData: Date | null = null;
  public fimHora: Date | null = null;
  public historicoObservacoes = '';
  public salvando = false;
  private ultimoCnpjConsultado = '';
  private originalDataInicio = '';
  private originalDataFim = '';
  private movedModals: Array<{ element: HTMLElement; parent: ParentNode; nextSibling: Node | null }> = [];

  public cadastroForm: FormGroup = this.formBuilder.group({
    id: [{ value: '', disabled: true }],
    nome_cliente: ['', Validators.required],
    tipo_pessoa: ['f', Validators.required],
    cpf_cnpj: ['', Validators.required],
    ie: [''],
    razao_social: [''],
    contato: [''],
    tipo_atendimento: [''],
    data_inicio: ['', Validators.required],
    data_fim: ['', Validators.required],
    executores: ['', Validators.required],
    descricao: ['', Validators.required],
    valor_servico: [null, Validators.required],
    cep: [''],
    endereco: [{ value: '', disabled: true }],
    numero: [null, Validators.min(0)],
    complemento: [''],
    bairro: [{ value: '', disabled: true }],
    cidade: [{ value: '', disabled: true }],
    uf: [{ value: '', disabled: true }],
    telefone: [''],
    celular: ['', this.apenasNumerosMinLength(11)],
    email: [''],
    deslocamento: [null],
    valor_deslocamento: [null],
    total: [null],
    observacoes: [''],
    justificativa_alteracao_data: ['']
  }, { validators: [this.intervaloDatasValidator()] });

  readonly MAX_VALUE = 10000;
  private lastValidValues: Record<string, number> = { valor_servico: 0 };

  constructor() {
    this.id = this.activatedRoute.snapshot.queryParamMap.get('id') as unknown as number;
    this.cadastroForm.controls['id'].patchValue(this.id);
    if (this.id != null && this.id != undefined) {
      this.carregarAtendimentoAvulso();
    }
    this.consultarExecutores();
  }

  ngOnInit(): void {
    const km$ = this.cadastroForm.get('deslocamento')!.valueChanges;
    const valorKm$ = this.cadastroForm.get('valor_deslocamento')!.valueChanges;

    merge(km$, valorKm$).subscribe(() => {
      queueMicrotask(() => this.calcularTotal());
    });
  }

  ngAfterViewInit(): void {
    this.moverModaisParaBody(['modalBusca', 'modalJustificativaData']);
  }

  ngOnDestroy(): void {
    this.restaurarModais();
  }

  apenasNumerosMinLength(min: number) {
    return (control: any) => {
      const valor = control.value || '';
      const numeros = valor.replace(/\D/g, '');
      if (numeros.length === 0) return null;
      return numeros.length < min ? { minDigits: true } : null;
    };
  }

  onChangePreco(event: any) {
    const field = event.target.name;
    const control = this.cadastroForm.get(field);
    const value = control?.value ?? 0;

    if (value <= this.MAX_VALUE) {
      this.lastValidValues[field] = value;
    } else {
      control?.setValue(this.lastValidValues[field]);
      if (field === 'deslocamento' || field === 'valor_deslocamento') {
        this.calcularTotal();
      }
    }
  }

  public calcularTotal(): void {
    const km = Number(this.cadastroForm.get('deslocamento')?.value) || 0;
    const valorKm = Number(this.cadastroForm.get('valor_deslocamento')?.value) || 0;
    this.cadastroForm.get('total')?.setValue(km * valorKm, { emitEvent: false });
  }

  onTipoPessoaChange(tipo: 'f' | 'j'): void {
    const cpfCnpj = this.cadastroForm.get('cpf_cnpj');
    const razao = this.cadastroForm.get('razao_social');
    const ie = this.cadastroForm.get('ie');

    cpfCnpj?.setValidators([Validators.required]);
    cpfCnpj?.setValue('');
    razao?.clearValidators();

    if (tipo === 'j') {
      razao?.setValidators([Validators.required]);
    } else {
      razao?.setValue(null);
      this.ultimoCnpjConsultado = '';
    }

    ie?.clearValidators();
    ie?.updateValueAndValidity();
    cpfCnpj?.updateValueAndValidity();
    razao?.updateValueAndValidity();
  }

  public buscarCep() {
    const cep = this.cadastroForm.controls['cep'].value.replace(/\D/g, '');
    if (cep.length === 8) {
      this.utilsService.buscarEnderecoPorCep(cep).subscribe({
        next: response => {
          this.cadastroForm.controls['endereco'].patchValue(response.logradouro);
          this.cadastroForm.controls['bairro'].patchValue(response.bairro);
          this.cadastroForm.controls['cidade'].patchValue(response.localidade);
          this.cadastroForm.controls['uf'].patchValue(response.uf);
        },
        error: error => console.log(error)
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

  public consultarExecutores() {
    this.loginService.buscarTodos().subscribe({
      next: response => this.executores.set(response),
      error: error => console.log(error)
    });
  }

  public setExecutor(item: any) {
    if (item?.id === 0) {
      const outro = this.listaExecutores().find(e => e.id === 0);
      if (outro) {
        this.outroNome.set(outro.nome);
      }
      this.mostrarOutro.set(true);
      return;
    }

    this.listaExecutores.update(lista => {
      const safeLista = Array.isArray(lista) ? lista : [];
      return safeLista.some(e => e.id === item.id) ? safeLista : [...safeLista, item];
    });

    this.atualizarExecutoresForm();
  }

  public confirmarOutro() {
    const nome = this.outroNome().trim();
    if (!nome) {
      return;
    }

    this.listaExecutores.update(lista => {
      const index = lista.findIndex(e => e.id === 0);
      if (index !== -1) {
        return lista.map(e => e.id === 0 ? { id: 0, nome } : e);
      }
      return [...lista, { id: 0, nome }];
    });

    this.outroNome.set('');
    this.mostrarOutro.set(false);
    this.atualizarExecutoresForm();
  }

  public removerExecutor(id: number) {
    this.listaExecutores.update(lista => lista.filter(item => item.id !== id));
    this.atualizarExecutoresForm();
  }

  private atualizarExecutoresForm() {
    this.cadastroForm.controls['executores'].patchValue(JSON.stringify(this.listaExecutores()));
  }

  public carregarAtendimentoAvulso() {
    this.avulsoService.buscarPorId(this.id).subscribe({
      next: response => {
        this.cadastroForm.controls['id'].patchValue(response.id);
        this.cadastroForm.controls['nome_cliente'].patchValue(response.nome_cliente);
        this.cadastroForm.controls['razao_social'].patchValue(response.razao_social);
        this.cadastroForm.controls['tipo_pessoa'].patchValue(response.tipo_pessoa);
        this.cadastroForm.controls['cpf_cnpj'].patchValue(response.cpf_cnpj);
        this.cadastroForm.controls['ie'].patchValue(response.ie);
        this.definirDataHora('inicio', response.data_inicio);
        this.definirDataHora('fim', response.data_fim);
        this.cadastroForm.controls['descricao'].patchValue(response.descricao);
        this.cadastroForm.controls['valor_servico'].patchValue(response.valor_servico);
        this.cadastroForm.controls['tipo_atendimento'].patchValue(response.tipo_atendimento);
        this.cadastroForm.controls['executores'].patchValue(response.executores);
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
        this.cadastroForm.controls['deslocamento'].patchValue(response.deslocamento, { emitEvent: false });
        this.cadastroForm.controls['valor_deslocamento'].patchValue(response.valor_deslocamento, { emitEvent: false });
        this.cadastroForm.controls['total'].patchValue(response.total, { emitEvent: false });
        this.historicoObservacoes = response.observacoes ?? '';
        this.cadastroForm.controls['observacoes'].patchValue('');
        this.cadastroForm.controls['justificativa_alteracao_data'].patchValue('');
        this.listaExecutores.set(JSON.parse(response.executores));
        this.sincronizarDatas();
        this.atualizarDatasOriginais();
      },
      error: error => console.log(error)
    });
  }

  public cadastrarAtualizarAvulso() {
    if (this.verificarFormularioValido()) {
      if (this.id !== null && this.id !== undefined) {
        if (this.possuiAlteracaoDataHorario()) {
          this.abrirModalJustificativa();
          return;
        }
        this.cadastroForm.controls['justificativa_alteracao_data'].patchValue('');
        this.atualizar();
        return;
      }
      this.cadastrar();
    }
  }

  public confirmarJustificativaAlteracao() {
    const justificativa = (this.cadastroForm.controls['justificativa_alteracao_data'].value || '').trim();
    if (!justificativa) {
      this.cadastroForm.controls['justificativa_alteracao_data'].markAsTouched();
      return;
    }

    this.fecharModalJustificativa();
    this.atualizar();
  }

  verificarFormularioValido() {
    this.sincronizarDatas();
    const form = this.cadastroForm;
    Object.keys(form.controls).forEach(campo => {
      const control = form.get(campo);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });

    if (!this.inicioData || !this.inicioHora || !this.fimData || !this.fimHora) {
      return false;
    }

    if (form.invalid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  }

  public cadastrar() {
    if (this.salvando) {
      return;
    }

    this.sincronizarDatas();
    this.cadastroForm.controls['justificativa_alteracao_data'].patchValue('');
    this.salvando = true;
    this.avulsoService.cadastrarAvulso(this.cadastroForm).subscribe({
      next: () => {
        this.toastService.success('Dados cadastrados com sucesso!');
        this.navegarAposSalvar();
      },
      error: err => {
        this.salvando = false;
        this.toastService.error(getHttpErrorMessage(err, 'Erro ao cadastrar o atendimento avulso!'));
      }
    });
  }

  public atualizar() {
    if (this.salvando) {
      return;
    }

    this.sincronizarDatas();
    this.salvando = true;
    this.avulsoService.atualizarAvulso(this.cadastroForm).subscribe({
      next: () => {
        this.toastService.success('Dados atualizados com sucesso!');
        this.navegarAposSalvar();
      },
      error: err => {
        this.salvando = false;
        this.toastService.error(getHttpErrorMessage(err, 'Erro ao atualizar o atendimento avulso!'));
      }
    });
  }

  public onInicioDataChange(value: unknown) { this.inicioData = this.parseDateOnlyValue(value); this.ajustarHoraFimSeNecessario(); this.sincronizarDatas(); }
  public onInicioHoraChange(value: Date | null) { this.inicioHora = value; this.ajustarHoraFimSeNecessario(); this.sincronizarDatas(); }
  public onFimDataChange(value: unknown) { this.fimData = this.parseDateOnlyValue(value); this.ajustarHoraFimSeNecessario(); this.sincronizarDatas(); }
  public onFimHoraChange(value: Date | null) { this.fimHora = value; this.ajustarHoraFimSeNecessario(); this.sincronizarDatas(); }

  public getMinFimData(): Date {
    return this.inicioData ?? this.minDate;
  }

  public getMinFimHora(): Date | null {
    if (!this.inicioData || !this.fimData) {
      return null;
    }
    return this.startOfDay(this.inicioData).getTime() === this.startOfDay(this.fimData).getTime() ? this.inicioHora : null;
  }

  public redirecionar() {
    this.router.navigate([`/avulsos/detalhes/${this.id}`]);
  }

  private navegarAposSalvar() {
    this.fecharModalJustificativa();
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    this.redirecionar();
  }

  public limparFormulario() {
    if (this.id !== null && this.id !== undefined) {
      this.carregarAtendimentoAvulso();
    } else {
      this.cadastroForm.reset();
      this.cadastroForm.controls['tipo_pessoa'].patchValue('f');
      this.cadastroForm.controls['observacoes'].patchValue('');
      this.cadastroForm.controls['justificativa_alteracao_data'].patchValue('');
      this.inicioData = null;
      this.inicioHora = null;
      this.fimData = null;
      this.fimHora = null;
      this.historicoObservacoes = '';
      this.originalDataInicio = '';
      this.originalDataFim = '';
      this.listaExecutores.set([]);
      this.atualizarExecutoresForm();
    }
  }

  private moverModaisParaBody(ids: string[]): void {
    ids.forEach(id => {
      const modal = document.getElementById(id);
      const parent = modal?.parentNode;
      if (!modal || !parent || parent === document.body) {
        return;
      }

      this.movedModals.push({ element: modal, parent, nextSibling: modal.nextSibling });
      document.body.appendChild(modal);
    });
  }

  private restaurarModais(): void {
    this.movedModals.forEach(({ element, parent, nextSibling }) => {
      if (nextSibling && parent.contains(nextSibling)) {
        parent.insertBefore(element, nextSibling);
      } else {
        parent.appendChild(element);
      }
    });
  }

  private possuiAlteracaoDataHorario(): boolean {
    this.sincronizarDatas();
    return this.cadastroForm.controls['data_inicio'].value !== this.originalDataInicio
      || this.cadastroForm.controls['data_fim'].value !== this.originalDataFim;
  }

  private atualizarDatasOriginais(): void {
    this.originalDataInicio = this.cadastroForm.controls['data_inicio'].value ?? '';
    this.originalDataFim = this.cadastroForm.controls['data_fim'].value ?? '';
  }

  private abrirModalJustificativa(): void {
    this.cadastroForm.controls['justificativa_alteracao_data'].patchValue('');
    const modalElement = document.getElementById('modalJustificativaData');
    if (!modalElement) {
      return;
    }
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }

  private fecharModalJustificativa(): void {
    const modalElement = document.getElementById('modalJustificativaData');
    if (!modalElement) {
      return;
    }
    bootstrap.Modal.getOrCreateInstance(modalElement).hide();
  }

  private sincronizarDatas(): void {
    this.cadastroForm.controls['data_inicio'].patchValue(this.buildPayloadDate(this.inicioData, this.inicioHora), { emitEvent: false });
    this.cadastroForm.controls['data_fim'].patchValue(this.buildPayloadDate(this.fimData, this.fimHora), { emitEvent: false });
    this.cadastroForm.updateValueAndValidity({ emitEvent: false });
  }

  private definirDataHora(prefixo: 'inicio' | 'fim', value: unknown): void {
    const parsed = this.parseDateTimeValue(value);
    if (!parsed) {
      return;
    }

    const data = this.startOfDay(parsed);
    const hora = new Date();
    hora.setHours(parsed.getHours(), parsed.getMinutes(), 0, 0);

    if (prefixo === 'inicio') {
      this.inicioData = data;
      this.inicioHora = hora;
      return;
    }

    this.fimData = data;
    this.fimHora = hora;
  }

  private buildPayloadDate(data: Date | null, hora: Date | null): string {
    if (!data || !hora) {
      return '';
    }
    const merged = new Date(data);
    merged.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
    return this.utilsService.formatarDatas(merged);
  }

  private ajustarHoraFimSeNecessario(): void {
    if (!this.inicioData || !this.inicioHora || !this.fimData || !this.fimHora) {
      return;
    }

    const mesmoDia = this.startOfDay(this.inicioData).getTime() === this.startOfDay(this.fimData).getTime();
    if (!mesmoDia) {
      return;
    }

    const inicioMinutos = this.inicioHora.getHours() * 60 + this.inicioHora.getMinutes();
    const fimMinutos = this.fimHora.getHours() * 60 + this.fimHora.getMinutes();

    if (fimMinutos < inicioMinutos) {
      this.fimHora = null;
    }
  }

  private intervaloDatasValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inicio = this.parseDateTimeValue(control.get('data_inicio')?.value);
      const fim = this.parseDateTimeValue(control.get('data_fim')?.value);
      if (!inicio || !fim) {
        return null;
      }
      return inicio.getTime() > fim.getTime() ? { intervaloInvalido: true } : null;
    };
  }

  private parseDateTimeValue(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'string') {
      const parsedBrazilian = this.parseBrazilianDateString(value);
      if (parsedBrazilian) {
        return parsedBrazilian;
      }

      const normalized = value.includes('T') ? value : value.replace(' ', 'T');
      const parsed = new Date(normalized);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  private parseDateOnlyValue(value: unknown): Date | null {
    const parsed = this.parseDateTimeValue(value);
    return parsed ? this.startOfDay(parsed) : null;
  }

  private parseBrazilianDateString(value: string): Date | null {
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
    if (!match) {
      return null;
    }

    const [, dia, mes, ano, hora = '00', minuto = '00'] = match;
    const parsed = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), 0, 0);

    if (
      parsed.getFullYear() !== Number(ano)
      || parsed.getMonth() !== Number(mes) - 1
      || parsed.getDate() !== Number(dia)
    ) {
      return null;
    }

    return parsed;
  }

  private startOfDay(data: Date): Date {
    const clone = new Date(data);
    clone.setHours(0, 0, 0, 0);
    return clone;
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
    this.patchSePossuirValor('ie', inscricaoEstadual);
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
