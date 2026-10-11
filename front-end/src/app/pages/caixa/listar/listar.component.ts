import { AeroNativeButtonComponent } from '@components/aero';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CaixaFechado, CaixaResumoPagamento, ComercialService, FecharCaixaItemPayload } from '@services/comercial.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-caixa-listar',
  standalone: true,
  imports: [AeroNativeButtonComponent, CommonModule, CurrencyPipe, DatePipe, FormsModule, CurrencyMaskModule],
  templateUrl: './listar.component.html',
  styleUrl: './listar.component.css'
})
export class ListarComponent implements OnInit {
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
  public readonly modalFechamentoAberto = signal(false);
  public readonly fechandoCaixa = signal(false);
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

  public readonly valorConferido = computed(() =>
    this.conferenciaPorTipo.reduce((total, item) => total + Number(item.valor_informado || 0), 0)
  );

  ngOnInit(): void {
    this.carregarResumoCaixaDia();
  }

  public quebraCaixa(): number {
    return Number(this.valorConferido() || 0) - Number(this.valorEsperadoFechamento || 0);
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
    this.valorEsperadoFechamento = this.totalRecebidoCaixaDia();
    this.conferenciaPorTipo = this.normalizarConferencia(this.resumoCaixaDia());
    this.dataReferenciaFechamento = null;
    this.editandoFechamento = false;
    this.observacoesFechamento = '';
    this.modalFechamentoAberto.set(true);
  }

  public editarFechamento(caixa: CaixaFechado): void {
    this.valorEsperadoFechamento = Number(caixa.valor_total || 0);
    this.conferenciaPorTipo = this.normalizarConferencia(caixa.itens?.length ? caixa.itens : this.resumoCaixaDia());
    this.dataReferenciaFechamento = caixa.data_referencia || null;
    this.editandoFechamento = true;
    this.observacoesFechamento = caixa.observacoes || '';
    this.modalFechamentoAberto.set(true);
  }

  public fecharModalFechamento(): void {
    if (this.fechandoCaixa()) {
      return;
    }
    this.modalFechamentoAberto.set(false);
  }

  public confirmarFechamento(): void {
    if (this.conferenciaPorTipo.some((item) => Number(item.valor_informado || 0) < 0)) {
      this.toastService.error('Informe um valor conferido valido.');
      return;
    }

    this.fechandoCaixa.set(true);
    this.comercialService.fecharCaixa({
      data_referencia: this.dataReferenciaFechamento,
      valor_informado: Number(this.valorConferido() || 0),
      observacoes: this.observacoesFechamento?.trim() || null,
      itens: this.conferenciaPorTipo.map((item) => ({
        forma_pagamento: item.forma_pagamento,
        valor_informado: Number(item.valor_informado || 0)
      }))
    }).subscribe({
      next: () => {
        this.toastService.success(this.editandoFechamento ? 'Fechamento atualizado com sucesso.' : 'Caixa fechado com sucesso.');
        this.modalFechamentoAberto.set(false);
        this.fechandoCaixa.set(false);
        this.carregarResumoCaixaDia();
      },
      error: () => {
        this.fechandoCaixa.set(false);
        this.toastService.error('Nao foi possivel fechar o caixa.');
      }
    });
  }

  public atualizarValorConferido(index: number, valor: number | string): void {
    const item = this.conferenciaPorTipo[index];
    if (!item) {
      return;
    }

    const valorNormalizado = Number(valor || 0);
    item.valor_informado = Number.isFinite(valorNormalizado) ? valorNormalizado : 0;
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
      mapa.set(formaPagamento, { forma_pagamento: formaPagamento, valor_total: 0, valor_recebido: 0 });
    }

    for (const item of resumo) {
      const formaPagamentoBruta = (item.forma_pagamento || 'NAO INFORMADO').toUpperCase();
      const formaPagamento = formaPagamentoBruta === 'CARTAO' ? 'CARTAO_CREDITO' : formaPagamentoBruta;
      const atual = mapa.get(formaPagamento) || { forma_pagamento: formaPagamento, valor_total: 0, valor_recebido: 0 };

      mapa.set(formaPagamento, {
        forma_pagamento: formaPagamento,
        valor_total: Number(atual.valor_total || 0) + Number(item.valor_total || 0),
        valor_recebido: Number(atual.valor_recebido || 0) + Number(item.valor_recebido || 0)
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
