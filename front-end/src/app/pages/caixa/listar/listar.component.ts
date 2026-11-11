import { AeroInputComponent } from '@components/aero';
import { AeroNativeControlComponent } from '@components/aero';
import { AeroNativeButtonComponent } from '@components/aero';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CaixaFechado, CaixaResumoPagamento, ComercialService, FecharCaixaItemPayload } from '@services/comercial.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-caixa-listar',
  standalone: true,
  imports: [AeroInputComponent, AeroNativeControlComponent, AeroNativeButtonComponent, CommonModule, CurrencyPipe, DatePipe, FormsModule, CurrencyMaskModule],
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css', '../../../components/aero/list-layout.css']
})
export class ListarComponent implements OnInit {
  @ViewChild('dialogFechamento', { static: true }) private dialogFechamento!: ElementRef<HTMLDialogElement>;
  private readonly comercialService = inject(ComercialService);
  private readonly toastService = inject(ToastService);

  private readonly formasPagamentoPadrao = ['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'BOLETO'];
  public readonly moneyMaskOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', align: 'left' };

  public readonly resumoCaixaDia = signal<CaixaResumoPagamento[]>([
    { forma_pagamento: 'PIX', valor_total: 0, valor_recebido: 0 },
    { forma_pagamento: 'CARTAO_CREDITO', valor_total: 0, valor_recebido: 0 },
    { forma_pagamento: 'CARTAO_DEBITO', valor_total: 0, valor_recebido: 0 },
    { forma_pagamento: 'DINHEIRO', valor_total: 0, valor_recebido: 0 },
    { forma_pagamento: 'BOLETO', valor_total: 0, valor_recebido: 0 }
  ]);

  public readonly caixasFechados = signal<CaixaFechado[]>([]);
  private readonly periodoPadrao = this.ultimos30Dias();
  public dataInicioFiltro = this.periodoPadrao.inicio;
  public dataFimFiltro = this.periodoPadrao.fim;
  private readonly periodoHistorico = signal(this.periodoPadrao);
  public readonly caixasFiltrados = computed(() => {
    const periodo = this.periodoHistorico();
    return this.caixasFechados().filter(caixa => {
      const data = (caixa.data_referencia || '').slice(0, 10);
      return (!periodo.inicio || data >= periodo.inicio) && (!periodo.fim || data <= periodo.fim);
    });
  });

  public filtrarHistorico(): void {
    if (this.dataInicioFiltro && this.dataFimFiltro && this.dataInicioFiltro > this.dataFimFiltro) {
      this.toastService.warning('A data inicial deve ser anterior ou igual à data final.');
      return;
    }
    this.periodoHistorico.set({ inicio: this.dataInicioFiltro || '', fim: this.dataFimFiltro || '' });
  }

  public limparFiltroHistorico(): void {
    const periodo = this.ultimos30Dias();
    this.dataInicioFiltro = periodo.inicio;
    this.dataFimFiltro = periodo.fim;
    this.periodoHistorico.set(periodo);
  }

  private ultimos30Dias(): { inicio: string; fim: string } {
    const fim = new Date();
    const inicio = new Date(fim);
    inicio.setDate(inicio.getDate() - 29);
    const formatar = (data: Date) => [data.getFullYear(), String(data.getMonth() + 1).padStart(2, '0'), String(data.getDate()).padStart(2, '0')].join('-');
    return { inicio: formatar(inicio), fim: formatar(fim) };
  }

  public readonly modalFechamentoAberto = signal(false);
  public readonly fechandoCaixa = signal(false);
  public resumoFechamento: CaixaResumoPagamento[] = [];
  public conferenciaPorTipo: FecharCaixaItemPayload[] = [];
  public valorEsperadoFechamento = 0;
  public dataReferenciaFechamento: string | null = null;
  public editandoFechamento = false;
  public observacoesFechamento = '';

  public readonly totalCaixaDia = computed(() =>
    this.resumoCaixaDia().reduce((total, item) => total + Number(item.valor_total || 0), 0)
  );

  public readonly totalRecebidoCaixaDia = computed(() =>
    this.resumoCaixaDia().reduce((total, item) => total + Number(item.valor_recebido || 0), 0)
  );

  public readonly hoje = new Date();

  public valorConferido(): number {
    return Number(this.conferenciaPorTipo.reduce((total, item) => total + Number(item.valor_informado || 0), 0).toFixed(2));
  }

  ngOnInit(): void {
    this.carregarResumoCaixaDia();
  }

  public somarConferencia(resumo: CaixaResumoPagamento[], campo: 'valor_entregue' | 'troco'): number | null {
    if (!resumo.length || resumo.some(item => item[campo] == null)) return null;
    return resumo.reduce((total,item) => total + Number(item[campo] || 0),0);
  }

  public quebraCaixa(): number {
    return Number((Number(this.valorConferido() || 0) - Number(this.valorEsperadoFechamento || 0)).toFixed(2));
  }

  public formaPagamentoLabel(forma: string | null | undefined): string {
    const labels: Record<string, string> = {
      PIX: 'PIX',
      BOLETO: 'Boleto',
      CARTAO: 'Cartao credito',
      CARTAO_CREDITO: 'Cartao credito',
      CARTAO_DEBITO: 'Cartao debito',
      DINHEIRO: 'Dinheiro',
      MULTIPLO: 'Multiplo',
      'NAO INFORMADO': 'Nao informado'
    };
    return labels[(forma || '').toUpperCase()] || forma || '-';
  }

  public abrirModalFechamento(): void {
    this.resumoFechamento = this.resumoCaixaDia();
    this.valorEsperadoFechamento = this.totalRecebidoCaixaDia();
    this.conferenciaPorTipo = this.normalizarConferencia(this.resumoCaixaDia());
    this.dataReferenciaFechamento = null;
    this.editandoFechamento = false;
    this.observacoesFechamento = '';
    this.modalFechamentoAberto.set(true);
    this.dialogFechamento.nativeElement.showModal();
  }

  public editarFechamento(caixa: CaixaFechado): void {
    this.resumoFechamento = caixa.itens || [];
    this.valorEsperadoFechamento = Number(caixa.valor_total || 0);
    this.conferenciaPorTipo = this.normalizarConferencia(caixa.itens || []);
    this.dataReferenciaFechamento = caixa.data_referencia || null;
    this.editandoFechamento = true;
    this.observacoesFechamento = caixa.observacoes || '';
    this.modalFechamentoAberto.set(true);
    this.dialogFechamento.nativeElement.showModal();
  }

  public fecharModalFechamento(event?: Event): void {
    if (this.fechandoCaixa()) {
      event?.preventDefault();
      return;
    }
    this.modalFechamentoAberto.set(false);
    this.dialogFechamento.nativeElement.close();
  }

  public confirmarFechamento(): void {
    if (this.conferenciaPorTipo.some((item) => Number(item.valor_informado || 0) < 0)) {
      this.toastService.error('Informe um valor conferido valido.');
      return;
    }

    this.fechandoCaixa.set(true);
    this.comercialService.fecharCaixa({
      data_referencia: this.dataReferenciaFechamento,
      observacoes: this.observacoesFechamento?.trim() || null
    }).subscribe({
      next: () => {
        this.toastService.success(this.editandoFechamento ? 'Fechamento atualizado com sucesso.' : 'Caixa fechado com sucesso.');
        this.modalFechamentoAberto.set(false);
    this.dialogFechamento.nativeElement.close();
        this.fechandoCaixa.set(false);
        this.carregarResumoCaixaDia();
      },
      error: () => {
        this.fechandoCaixa.set(false);
        this.toastService.error('Nao foi possivel fechar o caixa.');
      }
    });
  }

  public trackByFormaPagamento(_index: number, item: FecharCaixaItemPayload): string {
    return item.forma_pagamento;
  }

  private carregarResumoCaixaDia(): void {
    this.comercialService.buscarResumoCaixaDia().subscribe({
      next: (response) => {
        this.resumoCaixaDia.set(this.normalizarResumo(response.resumo || []));
        this.caixasFechados.set(response.fechamentos || []);
      },
      error: () => {
        this.resumoCaixaDia.set(this.normalizarResumo([]));
        this.caixasFechados.set([]);
        this.toastService.error('Nao foi possivel carregar os valores do caixa do dia.');
      }
    });
  }

  private normalizarResumo(resumo: CaixaResumoPagamento[]): CaixaResumoPagamento[] {
    const mapa = new Map<string, CaixaResumoPagamento>();

    for (const formaPagamento of this.formasPagamentoPadrao) {
      mapa.set(formaPagamento, { forma_pagamento: formaPagamento, valor_total: 0, valor_recebido: 0 , valor_entregue: 0, troco: 0 });
    }

    for (const item of resumo) {
      const formaPagamentoBruta = (item.forma_pagamento || 'NAO INFORMADO').toUpperCase();
      const formaPagamento = formaPagamentoBruta === 'CARTAO' ? 'CARTAO_CREDITO' : formaPagamentoBruta;
      const atual = mapa.get(formaPagamento) || { forma_pagamento: formaPagamento, valor_total: 0, valor_recebido: 0 };

      mapa.set(formaPagamento, {
        forma_pagamento: formaPagamento,
        valor_total: Number(atual.valor_total || 0) + Number(item.valor_total || 0),
        valor_recebido: Number(atual.valor_recebido || 0) + Number(item.valor_recebido || 0),
        valor_entregue: atual.valor_entregue == null || item.valor_entregue == null ? null : atual.valor_entregue + item.valor_entregue,
        troco: atual.troco == null || item.troco == null ? null : atual.troco + item.troco
      });
    }

    return Array.from(mapa.values());
  }

  private normalizarConferencia(origem: CaixaResumoPagamento[]): FecharCaixaItemPayload[] {
    const mapa = new Map<string, number>();

    for (const formaPagamento of this.formasPagamentoPadrao) {
      mapa.set(formaPagamento, 0);
    }

    for (const item of origem) {
      const formaPagamentoBruta = (item.forma_pagamento || 'NAO INFORMADO').toUpperCase();
      const formaPagamento = formaPagamentoBruta === 'CARTAO' ? 'CARTAO_CREDITO' : formaPagamentoBruta;
      mapa.set(formaPagamento, Number(item.valor_recebido ?? item.valor_total ?? 0));
    }

    return Array.from(mapa.entries()).map(([forma_pagamento, valor_informado]) => ({
      forma_pagamento,
      valor_informado
    }));
  }
}
