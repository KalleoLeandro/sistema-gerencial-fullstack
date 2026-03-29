import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmitLoaderComponent } from '@components/form-submit-loader/form-submit-loader.component';
import { Orcamento, OrcamentoItem } from '@models/orcamento';
import { Produto } from '@models/produto';
import { ServicoComercial } from '@models/servico-comercial';
import { Venda } from '@models/venda';
import { ComercialService } from '@services/comercial.service';
import { ProdutoService } from '@services/produto.service';
import { ServicoComercialService } from '@services/servico-comercial.service';
import { ToastService } from '@services/toast.service';
import { getHttpErrorMessage } from '@utils/http-error.util';
import * as bootstrap from 'bootstrap';

interface ItemEdicao extends OrcamentoItem {
  chave: string;
}

@Component({
  selector: 'app-comercial-orcamento',
  imports: [CommonModule, FormsModule, CurrencyPipe, CurrencyMaskModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormSubmitLoaderComponent],
  templateUrl: './orcamento.component.html',
  styleUrl: './orcamento.component.css'
})
export class OrcamentoComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly catalogoPageSize = 10;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly comercialService = inject(ComercialService);
  private readonly produtoService = inject(ProdutoService);
  private readonly servicoService = inject(ServicoComercialService);
  private readonly toastService = inject(ToastService);
  private readonly movedModals: Array<{ element: HTMLElement; parent: ParentNode; nextSibling: Node | null }> = [];
  private destroyed = false;

  public origemTipo = '';
  public origemId = 0;
  public modoPdv = false;
  public somenteLeitura = false;
  public detalheTipo = '';
  public orcamento: Orcamento | null = null;
  public venda: Venda | null = null;
  public produtos: Produto[] = [];
  public servicos: ServicoComercial[] = [];
  public itens: ItemEdicao[] = [];
  public validadeEm = '';
  public descontoFinanceiro = 0;
  public acrescimoFinanceiro = 0;
  public observacoes = '';
  public formaPagamento = 'PIX';
  public quantidadeParcelas = 1;
  public dataPrimeiroVencimento = '';
  public intervaloDias = 30;
  public carregando = false;
  public processando = false;
  public mensagemProcessamento = 'Salvando orcamento...';
  public motivoRejeicao = '';
  public produtoPesquisa = '';
  public servicoPesquisa = '';
  public itemBuscaProdutoIndex: number | null = null;
  public itemBuscaServicoIndex: number | null = null;
  public produtoPaginaAtual = 1;
  public servicoPaginaAtual = 1;
  public readonly moneyMaskOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', align: 'left', allowNegative: false };

  ngOnInit(): void {
    this.modoPdv = this.route.snapshot.data['modo'] === 'pdv' || this.route.snapshot.routeConfig?.path === 'pdv';
    this.somenteLeitura = !!this.route.snapshot.data['readonly'];
    this.detalheTipo = this.route.snapshot.data['detalheTipo'] || '';
    this.origemTipo = (this.route.snapshot.queryParamMap.get('origemTipo') || '').toUpperCase();
    this.origemId = Number(this.route.snapshot.queryParamMap.get('origemId') || '0');
    const orcamentoId = Number(this.route.snapshot.queryParamMap.get('orcamentoId') || '0');
    const detalheId = Number(this.route.snapshot.paramMap.get('id') || '0');
    this.dataPrimeiroVencimento = this.inputDate(new Date());
    this.carregarCatalogo();

    if (this.somenteLeitura && detalheId > 0) {
      if (this.detalheTipo === 'venda') {
        this.carregarVendaDetalhe(detalheId);
        return;
      }

      this.carregarOrcamentoPorId(detalheId);
      return;
    }

    if (this.modoPdv) {
      if (orcamentoId > 0) {
        this.carregarOrcamentoPorId(orcamentoId);
        return;
      }

      this.criarOrcamentoPdv();
      return;
    }

    if (!this.origemTipo || !this.origemId) {
      this.toastService.warning('Informe a origem para carregar o orcamento.');
      return;
    }

    this.carregarOrcamento();
  }

  ngAfterViewInit(): void {
    this.moverModaisParaBody(['modalBuscaProduto', 'modalBuscaServico']);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.restaurarModais();
  }

  public adicionarItem(tipo: 'PRODUTO' | 'SERVICO' = 'SERVICO'): void {
    this.itens.push({
      chave: `${Date.now()}-${Math.random()}`,
      tipo_item: tipo,
      id_produto: null,
      id_servico: null,
      descricao: '',
      quantidade: 1,
      valor_unitario: 0,
      percentual_desconto: 0,
      valor_desconto: 0,
      valor_total: 0,
      ordem: this.itens.length + 1
    });
  }

  public removerItem(index: number): void {
    this.itens.splice(index, 1);
    this.reordenarItens();
  }

  public atualizarTipo(index: number): void {
    const item = this.itens[index];
    item.id_produto = null;
    item.id_servico = null;
    item.descricao = '';
    item.valor_unitario = 0;
    this.recalcularItem(item);
  }

  public aplicarProduto(index: number): void {
    const item = this.itens[index];
    const produto = this.produtos.find((entry) => entry.id === Number(item.id_produto));
    if (!produto) {
      return;
    }

    item.id_servico = null;
    item.descricao = produto.nome;
    item.valor_unitario = Number(produto.valor_venda || 0);
    this.recalcularItem(item);
  }

  public abrirBuscaProduto(index: number): void {
    if (this.orcamentoBloqueado) {
      return;
    }

    this.itemBuscaProdutoIndex = index;
    this.produtoPesquisa = '';
    this.produtoPaginaAtual = 1;
    const modalElement = document.getElementById('modalBuscaProduto');
    if (!modalElement) {
      return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }

  public selecionarProduto(produto: Produto): void {
    if (this.itemBuscaProdutoIndex === null) {
      return;
    }

    const item = this.itens[this.itemBuscaProdutoIndex];
    if (!item) {
      return;
    }

    item.tipo_item = 'PRODUTO';
    item.id_produto = produto.id;
    item.id_servico = null;
    item.descricao = produto.nome;
    item.valor_unitario = Number(produto.valor_venda || 0);
    this.recalcularItem(item);
    this.fecharBuscaProduto();
  }

  public limparProduto(index: number): void {
    const item = this.itens[index];
    item.id_produto = null;
    item.descricao = '';
    item.valor_unitario = 0;
    this.recalcularItem(item);
  }

  public abrirBuscaServico(index: number): void {
    if (this.orcamentoBloqueado) {
      return;
    }

    this.itemBuscaServicoIndex = index;
    this.servicoPesquisa = '';
    this.servicoPaginaAtual = 1;
    const modalElement = document.getElementById('modalBuscaServico');
    if (!modalElement) {
      return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }

  public selecionarServico(servico: ServicoComercial): void {
    if (this.itemBuscaServicoIndex === null) {
      return;
    }

    const item = this.itens[this.itemBuscaServicoIndex];
    if (!item) {
      return;
    }

    item.tipo_item = 'SERVICO';
    item.id_servico = servico.id;
    item.id_produto = null;
    item.descricao = servico.nome;
    item.valor_unitario = Number(servico.valor_padrao || 0);
    this.recalcularItem(item);
    this.fecharBuscaServico();
  }

  public limparServico(index: number): void {
    const item = this.itens[index];
    item.id_servico = null;
    item.descricao = '';
    item.valor_unitario = 0;
    this.recalcularItem(item);
  }

  public aplicarServico(index: number): void {
    const item = this.itens[index];
    const servico = this.servicos.find((entry) => entry.id === Number(item.id_servico));
    if (!servico) {
      return;
    }

    item.id_produto = null;
    item.descricao = servico.nome;
    item.valor_unitario = Number(servico.valor_padrao || 0);
    this.recalcularItem(item);
  }

  public recalcularItem(item: ItemEdicao): void {
    const quantidade = Number(item.quantidade || 0);
    const valorUnitario = Number(item.valor_unitario || 0);
    const percentual = Number(item.percentual_desconto || 0);
    const bruto = quantidade * valorUnitario;
    item.valor_desconto = percentual > 0 ? Number(((bruto * percentual) / 100).toFixed(2)) : Number(item.valor_desconto || 0);
    item.valor_total = Number(Math.max(bruto - Number(item.valor_desconto || 0), 0).toFixed(2));
  }

  public recalcularResumo(): void {
    this.descontoFinanceiro = Number(this.descontoFinanceiro || 0);
    this.acrescimoFinanceiro = Number(this.acrescimoFinanceiro || 0);
  }

  public salvarOrcamento(): void {
    if (!this.orcamento || this.processando) {
      return;
    }

    const payload = {
      id_orcamento: this.orcamento.id,
      validade_em: this.comercialService.formatarData(this.validadeEm),
      desconto_financeiro: Number(this.descontoFinanceiro || 0),
      acrescimo_financeiro: Number(this.acrescimoFinanceiro || 0),
      observacoes: this.observacoes,
      itens: this.itens.map((item, index) => ({
        tipo_item: item.tipo_item,
        id_produto: item.tipo_item === 'PRODUTO' ? Number(item.id_produto || 0) || null : null,
        id_servico: item.tipo_item === 'SERVICO' ? Number(item.id_servico || 0) || null : null,
        descricao: item.descricao,
        quantidade: Number(item.quantidade || 0),
        valor_unitario: Number(item.valor_unitario || 0),
        percentual_desconto: Number(item.percentual_desconto || 0),
        valor_desconto: Number(item.valor_desconto || 0),
        ordem: index + 1
      }))
    };

    this.processando = true;
    this.mensagemProcessamento = this.modoPdv ? 'Salvando venda PDV...' : 'Salvando orcamento...';
    this.comercialService.atualizarItens(payload).subscribe({
      next: (response) => {
        this.processando = false;
        this.toastService.success(this.modoPdv ? 'PDV atualizado com sucesso.' : 'Orcamento atualizado com sucesso.');
        this.preencherOrcamento(response);
      },
      error: (error) => {
        this.processando = false;
        const message = getHttpErrorMessage(error, 'Nao foi possivel atualizar o orcamento.');
        if (message.toLowerCase().includes('aprovado') || message.toLowerCase().includes('rejeitado')) {
          this.toastService.warning(message);
          this.recarregarContexto();
          return;
        }

        this.toastService.error(message);
      }
    });
  }

  public aprovarOrcamento(): void {
    if (!this.orcamento || this.processando) {
      return;
    }

    this.processando = true;
    this.mensagemProcessamento = this.modoPdv ? 'Finalizando venda PDV...' : 'Aprovando orcamento e gerando venda...';
    this.comercialService.aprovarOrcamento({
      id_orcamento: this.orcamento.id,
      forma_pagamento: this.formaPagamento,
      quantidade_parcelas: Number(this.quantidadeParcelas || 1),
      data_primeiro_vencimento: this.comercialService.formatarData(this.dataPrimeiroVencimento),
      intervalo_dias: Number(this.intervaloDias || 30),
      observacoes: this.observacoes
    }).subscribe({
      next: (response) => {
        this.processando = false;
        this.venda = response;
        this.toastService.success(this.modoPdv ? 'Venda PDV gerada com sucesso.' : 'Venda gerada com sucesso.');
        this.recarregarContexto();
      },
      error: (error) => {
        this.processando = false;
        const message = getHttpErrorMessage(error, 'Nao foi possivel aprovar o orcamento.');
        if (message.toLowerCase().includes('aprovado')) {
          this.toastService.info(message);
          this.recarregarContexto();
          return;
        }

        this.toastService.error(message);
      }
    });
  }

  public rejeitarOrcamento(): void {
    if (!this.orcamento || this.processando || this.orcamento.status === 'REJEITADO' || this.modoPdv) {
      return;
    }

    this.processando = true;
    this.mensagemProcessamento = 'Rejeitando orcamento...';
    this.comercialService.rejeitarOrcamento({
      id_orcamento: this.orcamento.id,
      motivo: this.motivoRejeicao
    }).subscribe({
      next: (response) => {
        this.processando = false;
        this.toastService.success(response.origem_tipo === 'ATENDIMENTO'
          ? 'Orcamento rejeitado com sucesso.'
          : 'Orcamento rejeitado e atendimento cancelado com sucesso.');
        this.preencherOrcamento(response);
      },
      error: (error) => {
        this.processando = false;
        const message = getHttpErrorMessage(error, 'Nao foi possivel rejeitar o orcamento.');
        if (message.toLowerCase().includes('rejeitad')) {
          this.toastService.info(message);
          this.recarregarContexto();
          return;
        }

        this.toastService.error(message);
      }
    });
  }

  public reabrirOrcamento(): void {
    if (!this.orcamento || this.processando || !this.podeReabrirOrcamento) {
      return;
    }

    this.processando = true;
    this.mensagemProcessamento = 'Reabrindo orcamento...';
    this.comercialService.reabrirOrcamento({
      id_orcamento: this.orcamento.id
    }).subscribe({
      next: (response) => {
        this.processando = false;
        this.toastService.success('Orcamento reaberto com sucesso.');
        this.preencherOrcamento(response);
      },
      error: (error) => {
        this.processando = false;
        const message = getHttpErrorMessage(error, 'Nao foi possivel reabrir o orcamento.');
        this.toastService.error(message);
      }
    });
  }

  public voltar(): void {
    if (this.somenteLeitura) {
      this.router.navigate([this.detalheTipo === 'venda' ? '/comercial/vendas/listar' : '/comercial/orcamentos/listar']);
      return;
    }

    if (this.modoPdv) {
      this.router.navigate(['/dashboard']);
      return;
    }

    switch (this.origemTipo) {
      case 'ATENDIMENTO':
        this.router.navigate(['/atendimentos/detalhes', this.origemId]);
        return;
      case 'MANUTENCAO':
        this.router.navigate(['/manutencao/detalhes', this.origemId]);
        return;
      case 'AVULSO':
        this.router.navigate(['/avulsos/detalhes', this.origemId]);
        return;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  public get subtotalItens(): number {
    return this.itens.reduce((total, item) => total + Number(item.valor_total || 0), 0);
  }

  public get orcamentoBloqueado(): boolean {
    return this.somenteLeitura || this.orcamento?.status === 'APROVADO' || this.orcamento?.status === 'REJEITADO';
  }

  public get podeReabrirOrcamento(): boolean {
    return !this.modoPdv
      && this.orcamento?.status === 'REJEITADO'
      && this.orcamento?.origem_tipo === 'ATENDIMENTO';
  }

  public get tituloTela(): string {
    if (this.somenteLeitura) {
      return this.detalheTipo === 'venda' ? 'Detalhes da venda' : 'Detalhes do orcamento';
    }

    return this.modoPdv ? 'PDV e venda' : 'Orcamento e venda';
  }

  public get descricaoTela(): string {
    if (this.somenteLeitura && this.detalheTipo === 'venda') {
      return this.venda
        ? `${this.venda.codigo} para ${this.venda.cliente_nome}`
        : 'Consulta detalhada da venda';
    }

    if (this.somenteLeitura) {
      return this.orcamento
        ? `${this.orcamento.codigo || 'Rascunho'} para ${this.orcamento.cliente_nome}`
        : 'Consulta detalhada do orcamento';
    }

    if (this.modoPdv) {
      return this.orcamento
        ? `Venda direta para ${this.orcamento.cliente_nome}`
        : 'Venda direta no caixa';
    }

    return this.orcamento
      ? `Orcamento da origem ${this.orcamento.origem_tipo} #${this.origemReferenciaId} para ${this.orcamento.cliente_nome}`
      : '';
  }

  public get origemReferenciaId(): number {
    if (!this.orcamento) {
      return this.origemId;
    }

    return Number(this.orcamento.id_atendimento || this.orcamento.id_manutencao || this.orcamento.id_avulso || this.origemId || 0);
  }

  public get produtosFiltrados(): Produto[] {
    const termo = this.produtoPesquisa.trim().toLowerCase();
    if (!termo) {
      return this.produtos.slice(0, 25);
    }

    return this.produtos.filter((produto) =>
      (produto.nome || '').toLowerCase().includes(termo)
      || (produto.codigo || '').toLowerCase().includes(termo)
      || (produto.descricao || '').toLowerCase().includes(termo)
    );
  }

  public get produtosPaginados(): Produto[] {
    return this.paginarLista(this.produtosFiltrados, this.produtoPaginaAtual);
  }

  public get totalPaginasProdutos(): number {
    return this.totalPaginas(this.produtosFiltrados.length);
  }

  public get servicosFiltrados(): ServicoComercial[] {
    const termo = this.servicoPesquisa.trim().toLowerCase();
    if (!termo) {
      return [...this.servicos];
    }

    return this.servicos.filter((servico) =>
      (servico.nome || '').toLowerCase().includes(termo)
      || (servico.codigo || '').toLowerCase().includes(termo)
      || (servico.descricao || '').toLowerCase().includes(termo)
    );
  }

  public get servicosPaginados(): ServicoComercial[] {
    return this.paginarLista(this.servicosFiltrados, this.servicoPaginaAtual);
  }

  public get totalPaginasServicos(): number {
    return this.totalPaginas(this.servicosFiltrados.length);
  }

  public produtoSelecionado(item: ItemEdicao): Produto | undefined {
    return this.produtos.find((entry) => entry.id === Number(item.id_produto));
  }

  public servicoSelecionado(item: ItemEdicao): ServicoComercial | undefined {
    return this.servicos.find((entry) => entry.id === Number(item.id_servico));
  }

  public mudarPaginaProduto(direcao: number): void {
    this.produtoPaginaAtual = this.limitarPagina(this.produtoPaginaAtual + direcao, this.totalPaginasProdutos);
  }

  public mudarPaginaServico(direcao: number): void {
    this.servicoPaginaAtual = this.limitarPagina(this.servicoPaginaAtual + direcao, this.totalPaginasServicos);
  }

  private carregarCatalogo(): void {
    this.produtoService.listarAtivos().subscribe({ next: (response) => this.produtos = response });
    this.servicoService.listarAtivos().subscribe({ next: (response) => this.servicos = response });
  }

  private carregarOrcamento(): void {
    this.carregando = true;
    this.comercialService.buscarOrcamentoPorOrigem(this.origemTipo, this.origemId).subscribe({
      next: (response) => {
        this.preencherOrcamento(response);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toastService.error('Nao foi possivel carregar o orcamento desta origem.');
      }
    });
  }

  private carregarOrcamentoPorId(id: number): void {
    this.carregando = true;
    this.comercialService.buscarOrcamentoPorId(id).subscribe({
      next: (response) => {
        this.preencherOrcamento(response);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toastService.error(this.somenteLeitura ? 'Nao foi possivel carregar os detalhes.' : 'Nao foi possivel carregar o PDV.');
      }
    });
  }

  private carregarVendaDetalhe(id: number): void {
    this.carregando = true;
    this.comercialService.buscarVendaPorId(id).subscribe({
      next: (response) => {
        this.venda = response;
        this.formaPagamento = response.forma_pagamento || 'PIX';
        this.quantidadeParcelas = Number(response.quantidade_parcelas || 1);
        this.observacoes = response.observacoes || '';
        this.comercialService.buscarOrcamentoPorId(response.id_orcamento).subscribe({
          next: (orcamento) => {
            this.preencherOrcamento(orcamento);
            this.carregando = false;
          },
          error: () => {
            this.carregando = false;
            this.toastService.error('Nao foi possivel carregar o orcamento vinculado a venda.');
          }
        });
      },
      error: () => {
        this.carregando = false;
        this.toastService.error('Nao foi possivel carregar os detalhes da venda.');
      }
    });
  }

  private criarOrcamentoPdv(): void {
    this.carregando = true;
    this.comercialService.criarOrcamentoPdv().subscribe({
      next: (response) => {
        if (this.destroyed || !this.router.url.startsWith('/comercial/pdv')) {
          return;
        }

        this.preencherOrcamento(response);
        this.carregando = false;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { orcamentoId: response.id },
          replaceUrl: true
        });
      },
      error: () => {
        if (this.destroyed) {
          return;
        }

        this.carregando = false;
        this.toastService.error('Nao foi possivel iniciar o PDV.');
      }
    });
  }

  private recarregarContexto(): void {
    if (this.modoPdv && this.orcamento?.id) {
      this.carregarOrcamentoPorId(this.orcamento.id);
      return;
    }

    this.carregarOrcamento();
  }

  private preencherOrcamento(response: Orcamento): void {
    this.orcamento = response;
    this.validadeEm = this.inputDate(response.validade_em);
    this.descontoFinanceiro = Number(response.desconto_financeiro || 0);
    this.acrescimoFinanceiro = Number(response.acrescimo_financeiro || 0);
    this.observacoes = response.observacoes || '';
    this.motivoRejeicao = '';
    this.itens = (response.itens || []).map((item, index) => ({
      ...item,
      chave: `${response.id}-${item.id || index}`,
      quantidade: Number(item.quantidade || 0),
      valor_unitario: Number(item.valor_unitario || 0),
      percentual_desconto: Number(item.percentual_desconto || 0),
      valor_desconto: Number(item.valor_desconto || 0),
      valor_total: Number(item.valor_total || 0),
      ordem: item.ordem || index + 1
    }));
  }

  private fecharBuscaProduto(): void {
    const modalElement = document.getElementById('modalBuscaProduto');
    if (!modalElement) {
      return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).hide();
    this.itemBuscaProdutoIndex = null;
  }

  private fecharBuscaServico(): void {
    const modalElement = document.getElementById('modalBuscaServico');
    if (!modalElement) {
      return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).hide();
    this.itemBuscaServicoIndex = null;
  }

  private inputDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private reordenarItens(): void {
    this.itens = this.itens.map((item, index) => ({ ...item, ordem: index + 1 }));
  }

  private paginarLista<T>(lista: T[], paginaAtual: number): T[] {
    const pagina = this.limitarPagina(paginaAtual, this.totalPaginas(lista.length));
    const inicio = (pagina - 1) * this.catalogoPageSize;
    return lista.slice(inicio, inicio + this.catalogoPageSize);
  }

  private totalPaginas(totalItens: number): number {
    return Math.max(1, Math.ceil(totalItens / this.catalogoPageSize));
  }

  private limitarPagina(pagina: number, totalPaginas: number): number {
    return Math.min(Math.max(1, pagina), Math.max(1, totalPaginas));
  }

  private moverModaisParaBody(ids: string[]): void {
    ids.forEach((id) => {
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

    this.movedModals.length = 0;
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
  }
}
