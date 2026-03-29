import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { FormSubmitLoaderComponent } from '@components/form-submit-loader/form-submit-loader.component';
import { LoginService } from '@services/login.service';
import { ManutencaoService } from '@services/manutencao.service';
import { ToastService } from '@services/toast.service';
import { UtilsService } from '@services/utils.service';
import { getHttpErrorMessage } from 'app/utils/http-error.util';

declare const bootstrap: any;

@Component({
  selector: 'app-cadastrar',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyMaskModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTimepickerModule, FormSubmitLoaderComponent],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent implements AfterViewInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private manutencaoService = inject(ManutencaoService);
  private utilsService = inject(UtilsService);
  private loginService = inject(LoginService);
  private toastService = inject(ToastService);

  public idManutencao: number | null;
  public idEquipamento: number | null;
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
  public cadastroForm: FormGroup = this.formBuilder.group({
    id: [''],
    id_equipamento: [''],
    data_inicio: ['', Validators.required],
    data_fim: ['', Validators.required],
    tipo_servico: [''],
    tipo_atendimento: [''],
    valor_servico: ['', Validators.required],
    descricao: ['', Validators.required],
    executores: [''],
    observacoes: [''],
    justificativa_alteracao_data: ['']
  }, { validators: [this.intervaloDatasValidator()] });

  public resposta = '';
  public salvando = false;
  private originalDataInicio = '';
  private originalDataFim = '';
  private movedModals: Array<{ element: HTMLElement; parent: ParentNode; nextSibling: Node | null }> = [];

  readonly MAX_VALUE = 10000;
  private lastValidValues: Record<string, number> = { valor_servico: 0 };

  constructor() {
    this.idEquipamento = this.activatedRoute.snapshot.queryParamMap.get('id_equipamento') as unknown as number;
    this.idManutencao = this.activatedRoute.snapshot.queryParamMap.get('id_manutencao') as unknown as number;
    this.cadastroForm.controls['id'].patchValue(this.idManutencao);
    this.cadastroForm.controls['id_equipamento'].patchValue(this.idEquipamento);

    if (this.idManutencao != null && this.idManutencao != undefined) {
      this.carregarManutencao();
    }

    this.consultarExecutores();
  }

  ngAfterViewInit(): void {
    this.moverModaisParaBody(['modalConfirmacao', 'modalBusca', 'modalJustificativaData']);
  }

  ngOnDestroy(): void {
    this.restaurarModais();
  }

  onChangePreco(event: any) {
    const field = event.target.name;
    const control = this.cadastroForm.get(field);
    const value = control?.value ?? 0;

    if (value <= this.MAX_VALUE) {
      this.lastValidValues[field] = value;
    } else {
      control?.setValue(this.lastValidValues[field]);
    }
  }

  public cadastrar() {
    if (this.salvando) {
      return;
    }

    this.sincronizarDatas();
    this.cadastroForm.controls['justificativa_alteracao_data'].patchValue('');
    this.salvando = true;
    this.manutencaoService.cadastrarManutencao(this.cadastroForm).subscribe({
      next: () => {
        this.toastService.success('Dados cadastrados com sucesso!');
        this.navegarAposSalvar();
      },
      error: err => {
        this.salvando = false;
        this.toastService.error(getHttpErrorMessage(err, 'Erro ao cadastrar a manutencao!'));
      }
    });
  }

  public atualizar() {
    if (this.salvando) {
      return;
    }

    this.sincronizarDatas();
    this.salvando = true;
    this.manutencaoService.atualizarManutencao(this.cadastroForm).subscribe({
      next: () => {
        this.toastService.success('Dados atualizados com sucesso!');
        this.navegarAposSalvar();
      },
      error: err => {
        this.salvando = false;
        this.toastService.error(getHttpErrorMessage(err, 'Erro ao atualizar a manutencao!'));
      }
    });
  }

  public cadastrarAtualizarManutencao() {
    if (this.verificarFormularioValido()) {
      if (this.idManutencao !== null && this.idManutencao !== undefined) {
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

  public carregarManutencao() {
    this.manutencaoService.buscarPorId(this.idManutencao).subscribe({
      next: response => {
        this.cadastroForm.controls['id'].patchValue(response.id);
        this.cadastroForm.controls['id_equipamento'].patchValue(response.id_equipamento);
        this.definirDataHora('inicio', response.data_inicio);
        this.definirDataHora('fim', response.data_fim);
        this.cadastroForm.controls['tipo_servico'].patchValue(response.tipo_servico);
        this.cadastroForm.controls['tipo_atendimento'].patchValue(response.tipo_atendimento);
        this.cadastroForm.controls['valor_servico'].patchValue(response.valor_servico);
        this.cadastroForm.controls['descricao'].patchValue(response.descricao);
        this.historicoObservacoes = response.observacoes ?? '';
        this.cadastroForm.controls['observacoes'].patchValue('');
        this.cadastroForm.controls['justificativa_alteracao_data'].patchValue('');
        this.cadastroForm.controls['executores'].patchValue(response.executores);
        this.listaExecutores.set(JSON.parse(response.executores));
        this.sincronizarDatas();
        this.atualizarDatasOriginais();
      },
      error: error => console.log(error)
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
    this.router.navigate([`/manutencao/detalhes/${this.idManutencao}`], { queryParams: { id_equipamento: this.idEquipamento } });
  }

  private navegarAposSalvar() {
    this.fecharModalJustificativa();
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    this.redirecionar();
  }

  public limparFormulario() {
    if (this.idManutencao !== null && this.idManutencao !== undefined) {
      this.carregarManutencao();
    } else {
      this.cadastroForm.reset();
      this.cadastroForm.controls['id_equipamento'].patchValue(this.idEquipamento);
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
        return;
      }
      parent.appendChild(element);
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
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
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
}
