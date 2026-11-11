import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import {
  AeroInputComponent,
  AeroSelectComponent,
  AeroFieldComponent,
  AeroNativeControlComponent,
  AeroNativeButtonComponent,
  AeroTextareaComponent,
} from '@components/aero';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import {
  ContaFinanceira,
  DetalhesConta,
  FiltroFinanceiro,
  TipoConta,
} from '@models/financeiro';
import { FinanceiroService } from '@services/financeiro.service';
import { ToastService } from '@services/toast.service';
import { getHttpErrorMessage } from '@utils/http-error.util';
import { finalize } from 'rxjs';

export function dataLocal(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-financeiro-contas',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    AeroInputComponent,
    AeroSelectComponent,
    AeroFieldComponent,
    AeroNativeControlComponent,
    AeroNativeButtonComponent,
    AeroTextareaComponent,
    CurrencyMaskModule,
  ],
  templateUrl: './contas.component.html',
  styleUrls: ['../../../components/aero/list-layout.css', '../financeiro.css'],
})
export class ContasComponent {
  private readonly api = inject(FinanceiroService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  readonly tipo: TipoConta = this.route.snapshot.data['tipo'];
  readonly titulo =
    this.tipo === 'PAGAR' ? 'Contas a pagar' : 'Contas a receber';
  readonly lista = signal<ContaFinanceira[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly detalhes = signal<DetalhesConta | null>(null);
  total = 0;
  page = 1;
  limit = 10;
  pesquisa = '';
  status = '';
  inicio = '';
  fim = '';
  categoria = '';
  modo: 'criar' | 'editar' | 'detalhes' | 'baixa' | 'cancelar' = 'criar';
  selecionada: ContaFinanceira | null = null;
  readonly hoje = dataLocal();
  readonly moneyOptions = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    precision: 2,
    allowNegative: false,
  };
  readonly tamanhos = [10, 25, 50].map((value) => ({
    value,
    label: value + ' por página',
  }));
  readonly statuses = [
    'ABERTA',
    'PARCIAL',
    'VENCIDA',
    'QUITADA',
    'CANCELADA',
  ].map((value) => ({ value, label: value[0] + value.slice(1).toLowerCase() }));
  readonly formas = [
    'PIX',
    'DINHEIRO',
    'CARTAO_CREDITO',
    'CARTAO_DEBITO',
    'BOLETO',
    'TRANSFERENCIA',
    'OUTRO',
  ].map((value) => ({ value, label: value.replaceAll('_', ' ') }));
  readonly form = this.fb.nonNullable.group({
    descricao: ['', [Validators.required, Validators.maxLength(255)]],
    contraparte: ['', [Validators.required, Validators.maxLength(255)]],
    categoria: ['', Validators.maxLength(100)],
    referencia: ['', Validators.maxLength(100)],
    vencimento: [this.hoje, Validators.required],
    valor: [
      0,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(9999999999.99),
      ],
    ],
  });
  readonly baixaForm = this.fb.nonNullable.group({
    data: [this.hoje, Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    formaPagamento: ['PIX', Validators.required],
    observacoes: ['', Validators.maxLength(1000)],
  });
  ngOnInit(): void {
    this.carregar();
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }
  get paginasVisiveis(): number[] {
    const inicio = Math.max(1, Math.min(this.page - 1, this.totalPages - 2));
    return Array.from(
      { length: Math.min(3, this.totalPages) },
      (_, i) => inicio + i,
    );
  }
  get tituloModal(): string {
    return {
      criar: 'Nova conta',
      editar: 'Editar conta',
      detalhes: 'Detalhes da conta',
      baixa:
        this.tipo === 'PAGAR' ? 'Registrar pagamento' : 'Registrar recebimento',
      cancelar: 'Cancelar conta',
    }[this.modo];
  }
  filtro(): FiltroFinanceiro {
    return {
      tipo: this.tipo,
      status: this.status,
      pesquisa: this.pesquisa,
      inicio: this.inicio,
      fim: this.fim,
      categoria: this.categoria,
    };
  }
  carregar(): void {
    if (this.inicio && this.fim && this.inicio > this.fim) {
      this.toast.warning('Verifique o período informado.');
      return;
    }
    this.carregando.set(true);
    this.api
      .listar(this.filtro(), this.page, this.limit)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregando.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.lista.set(response.lista);
          this.total = response.total;
          if (this.page > this.totalPages) {
            this.page = this.totalPages;
            this.carregar();
          }
        },
        error: (error) => {
          this.lista.set([]);
          this.total = 0;
          this.toast.error(
            getHttpErrorMessage(error, 'Não foi possível carregar as contas.'),
          );
        },
      });
  }
  pesquisar(): void {
    this.page = 1;
    this.carregar();
  }
  irParaPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.carregar();
    }
  }
  nova(): void {
    this.selecionada = null;
    this.detalhes.set(null);
    this.modo = 'criar';
    this.form.reset({
      descricao: '',
      contraparte: '',
      categoria: '',
      referencia: '',
      vencimento: this.hoje,
      valor: 0,
    });
    this.dialog.nativeElement.showModal();
  }
  abrir(
    conta: ContaFinanceira,
    modo: 'editar' | 'detalhes' | 'baixa' | 'cancelar',
  ): void {
    this.selecionada = conta;
    this.modo = modo;
    this.detalhes.set(null);
    this.form.reset({
      descricao: conta.descricao,
      contraparte: conta.contraparte,
      categoria: conta.categoria || '',
      referencia: conta.referencia || '',
      vencimento: conta.vencimento,
      valor: conta.valor,
    });
    this.baixaForm.reset({
      data: this.hoje,
      valor: conta.saldo,
      formaPagamento: 'PIX',
      observacoes: '',
    });
    this.dialog.nativeElement.showModal();
    if (modo === 'detalhes')
      this.api
        .detalhes(conta.origem, conta.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (details) => this.detalhes.set(details),
          error: (error) =>
            this.toast.error(
              getHttpErrorMessage(
                error,
                'Não foi possível carregar os detalhes.',
              ),
            ),
        });
  }
  fechar(event?: Event): void {
    if (this.salvando()) {
      event?.preventDefault();
      return;
    }
    this.dialog.nativeElement.close();
  }
  salvar(): void {
    const dados = this.form.getRawValue();
    if (
      this.form.invalid ||
      !dados.descricao.trim() ||
      !dados.contraparte.trim()
    ) {
      this.form.markAllAsTouched();
      this.toast.warning('Preencha os campos obrigatórios.');
      return;
    }
    const payload = {
      ...dados,
      tipo: this.tipo,
      categoria: dados.categoria || null,
      referencia: dados.referencia || null,
      entidadeTipo: this.selecionada?.entidadeTipo || null,
      entidadeId: this.selecionada?.entidadeId || null,
    };
    this.salvando.set(true);
    const request =
      this.modo === 'editar' && this.selecionada
        ? this.api.atualizar(this.selecionada.id, payload)
        : this.api.criar(payload);
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.salvando.set(false)),
      )
      .subscribe({
        next: () => {
          this.dialog.nativeElement.close();
          this.toast.success('Conta salva.');
          this.carregar();
        },
        error: (error) =>
          this.toast.error(
            getHttpErrorMessage(error, 'Não foi possível salvar a conta.'),
          ),
      });
  }
  baixar(): void {
    const conta = this.selecionada;
    const dados = this.baixaForm.getRawValue();
    if (
      !conta ||
      this.baixaForm.invalid ||
      dados.valor > conta.saldo ||
      dados.data > this.hoje
    ) {
      this.baixaForm.markAllAsTouched();
      this.toast.warning('Confira o valor e a data da baixa.');
      return;
    }
    this.salvando.set(true);
    this.api
      .baixar(conta.origem, conta.id, {
        ...dados,
        observacoes: dados.observacoes || null,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.salvando.set(false)),
      )
      .subscribe({
        next: () => {
          this.dialog.nativeElement.close();
          this.toast.success('Baixa registrada.');
          this.carregar();
        },
        error: (error) =>
          this.toast.error(
            getHttpErrorMessage(error, 'Não foi possível registrar a baixa.'),
          ),
      });
  }
  cancelar(): void {
    if (!this.selecionada) return;
    this.salvando.set(true);
    this.api
      .cancelar(this.selecionada.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.salvando.set(false)),
      )
      .subscribe({
        next: () => {
          this.dialog.nativeElement.close();
          this.toast.success('Conta cancelada.');
          this.carregar();
        },
        error: (error) =>
          this.toast.error(
            getHttpErrorMessage(error, 'Não foi possível cancelar a conta.'),
          ),
      });
  }
}
