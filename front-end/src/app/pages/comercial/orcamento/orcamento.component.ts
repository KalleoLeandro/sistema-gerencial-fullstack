import { AeroNativeControlComponent, AeroNativeButtonComponent, AeroFieldComponent, AeroDateDirective } from '@components/aero';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { NgxMaskDirective } from 'ngx-mask';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmitLoaderComponent } from '@components/form-submit-loader/form-submit-loader.component';
import { Cliente } from '@models/cliente';
import { Orcamento, OrcamentoItem } from '@models/orcamento';
import { Produto } from '@models/produto';
import { ServicoComercial } from '@models/servico-comercial';
import { PagamentoVenda, Venda } from '@models/venda';
import { ComercialService } from '@services/comercial.service';
import { PdfExportService } from '@services/pdf-export.service';
import { ProdutoService } from '@services/produto.service';
import { ServicoComercialService } from '@services/servico-comercial.service';
import { ToastService } from '@services/toast.service';
import { UtilsService } from '@services/utils.service';
import { getHttpErrorMessage } from '@utils/http-error.util';
import * as bootstrap from 'bootstrap';

interface ItemEdicao extends OrcamentoItem {
  chave: string;
}

interface CatalogoPesquisaItem {
  tipo_item: 'PRODUTO' | 'SERVICO';
  id: number;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  valor: number;
}

interface PagamentoEdicao {
  forma_pagamento: string;
  valor_informado: number;
}

@Component({
  selector: 'app-comercial-orcamento',
  imports: [AeroNativeControlComponent, AeroNativeButtonComponent, AeroFieldComponent, AeroDateDirective, CommonModule, FormsModule, CurrencyPipe, CurrencyMaskModule, NgxMaskDirective, FormSubmitLoaderComponent],
  templateUrl: './orcamento.component.html',
  styleUrl: './orcamento.component.css'
})
export class OrcamentoComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly catalogoPageSize = 10;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly comercialService = inject(ComercialService);
  private readonly pdfExportService = inject(PdfExportService);
  private readonly produtoService = inject(ProdutoService);
  private readonly servicoService = inject(ServicoComercialService);
  private readonly toastService = inject(ToastService);
  private readonly utilsService = inject(UtilsService);
  private readonly movedModals: Array<{ element: HTMLElement; parent: ParentNode; nextSibling: Node | null }> = [];
  private catalogoPesquisaTimeout: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  public origemTipo = '';
  public origemId = 0;
  public modoPdv = false;
  public somenteLeitura = false;
  public emEdicao = false;
  public detalheTipo = '';
  public orcamento: Orcamento | null = null;
  public venda: Venda | null = null;
  public produtos: Produto[] = [];
  public servicos: ServicoComercial[] = [];
  public itens: ItemEdicao[] = [];
  public clientePesquisa = '';
  public clienteNome = '';
  public clienteDocumento = '';
  public minDate = this.startOfDay(new Date());
  public validadeEm: Date | null = null;
  public descontoFinanceiro = 0;
  public acrescimoFinanceiro = 0;
  public observacoes = '';
  public formaPagamento = 'PIX';
  public quantidadeParcelas = 1;
  public dataPrimeiroVencimento = '';
  public intervaloDias = 30;
  public carregando = false;
  public processando = false;
  public mensagemProcessamento = 'Salvando orçamento...';
  public motivoRejeicao = '';
  public catalogoPesquisa = '';
  public quantidadePesquisa = 1;
  public resultadosCatalogo: CatalogoPesquisaItem[] = [];
  public indiceResultadoAtivo = 0;
  public consultandoCliente = false;
  public clienteEncontrado = false;
  public clientesEncontrados: Cliente[] = [];
  public modalPesquisaClienteAberto = false;
  public modalCadastroClienteAberto = false;
  public clienteCadastroNome = '';
  public clienteCadastroDocumento = '';
  public clienteCadastroCep = '';
  public clienteCadastroEndereco = '';
  public clienteCadastroNumero: number | null = null;
  public clienteCadastroComplemento = '';
  public clienteCadastroBairro = '';
  public clienteCadastroCidade = '';
  public clienteCadastroUf = '';
  public clienteCadastroTelefone = '';
  public clienteCadastroCelular = '';
  public clienteCadastroEmail = '';
  public clienteCadastroContato = '';
  public pagamentosEdicao: PagamentoEdicao[] = [];
  public modalPagamentoVendaAberto = false;
  public modalExportarPdfAberto = false;
  public produtoPesquisa = '';
  public servicoPesquisa = '';
  public itemBuscaProdutoIndex: number | null = null;
  public itemBuscaServicoIndex: number | null = null;
  public produtoPaginaAtual = 1;
  public servicoPaginaAtual = 1;
  public readonly formasPagamentoDisponiveis = ['PIX', 'BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO'];
  public readonly moneyMaskOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', align: 'left', allowNegative: false };
  private acaoPosExportacao: (() => void) | null = null;

  ngOnInit(): void {
    this.modoPdv = this.route.snapshot.data['modo'] === 'pdv' || this.route.snapshot.routeConfig?.path === 'pdv';
    this.somenteLeitura = !!this.route.snapshot.data['readonly'];
    this.emEdicao = !!this.route.snapshot.data['edicao'];
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

    if (this.emEdicao && detalheId > 0) {
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

      this.inicializarRascunhoLocal();
      return;
    }

    if (orcamentoId > 0) {
      this.carregarOrcamentoPorId(orcamentoId);
      return;
    }

    if (!this.origemTipo || !this.origemId) {
      this.inicializarRascunhoLocal();
      return;
    }

    this.carregarOrcamento();
  }

  ngAfterViewInit(): void {
    this.moverModaisParaBody(['modalPesquisaCliente', 'modalSelecaoCliente']);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.catalogoPesquisaTimeout) {
      clearTimeout(this.catalogoPesquisaTimeout);
      this.catalogoPesquisaTimeout = null;
    }
    this.fecharModalPesquisaCliente();
    this.fecharModalPagamentoVenda();
    this.fecharModalCadastroCliente();
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

  public limparCarrinho(): void {
    if (this.orcamentoBloqueado || this.somenteLeitura) {
      return;
    }

    this.itens = [];
  }

  public aoAlterarPesquisa(): void {
    this.indiceResultadoAtivo = 0;
    if (this.catalogoPesquisaTimeout) {
      clearTimeout(this.catalogoPesquisaTimeout);
    }

    this.catalogoPesquisaTimeout = setTimeout(() => {
      this.resultadosCatalogo = this.buscarResultadosCatalogo(this.catalogoPesquisa);
    }, 120);
  }

  public aoTeclaPesquisa(event: KeyboardEvent): void {
    if (this.orcamentoBloqueado || this.somenteLeitura) {
      return;
    }

    const resultados = this.resultadosCatalogo;
    if (event.key === 'ArrowDown' && resultados.length) {
      event.preventDefault();
      this.indiceResultadoAtivo = Math.min(this.indiceResultadoAtivo + 1, resultados.length - 1);
      return;
    }

    if (event.key === 'ArrowUp' && resultados.length) {
      event.preventDefault();
      this.indiceResultadoAtivo = Math.max(this.indiceResultadoAtivo - 1, 0);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selecionado = resultados[this.indiceResultadoAtivo] || resultados[0];
      if (selecionado) {
        this.selecionarResultadoCatalogo(selecionado);
      }
      return;
    }

    if (event.key === 'Escape') {
      this.catalogoPesquisa = '';
      this.resultadosCatalogo = [];
      this.indiceResultadoAtivo = 0;
    }
  }

  public selecionarResultadoCatalogo(item: CatalogoPesquisaItem): void {
    if (this.orcamentoBloqueado || this.somenteLeitura) {
      return;
    }

    const quantidadeAdicionar = this.quantidadePesquisaNormalizada;
    const itemExistente = this.itens.find((entry) =>
      entry.tipo_item === item.tipo_item
      && Number(item.tipo_item === 'PRODUTO' ? entry.id_produto : entry.id_servico) === item.id
    );

    if (itemExistente) {
      itemExistente.quantidade = Number(itemExistente.quantidade || 0) + quantidadeAdicionar;
      this.recalcularItem(itemExistente);
    } else {
      this.itens.push({
        chave: `${Date.now()}-${Math.random()}`,
        tipo_item: item.tipo_item,
        id_produto: item.tipo_item === 'PRODUTO' ? item.id : null,
        id_servico: item.tipo_item === 'SERVICO' ? item.id : null,
        descricao: item.nome,
        quantidade: quantidadeAdicionar,
        valor_unitario: Number(item.valor || 0),
        percentual_desconto: 0,
        valor_desconto: 0,
        valor_total: Number((Number(item.valor || 0) * quantidadeAdicionar).toFixed(2)),
        ordem: this.itens.length + 1
      });
    }

    this.catalogoPesquisa = '';
    this.quantidadePesquisa = 1;
    this.resultadosCatalogo = [];
    this.indiceResultadoAtivo = 0;
    this.reordenarItens();
  }

  public resultadoEstaAtivo(index: number): boolean {
    return this.indiceResultadoAtivo === index;
  }

  public tipoCatalogoLabel(tipo: string): string {
    return tipo === 'PRODUTO' ? 'Produto' : 'Servico';
  }

  public formatarCodigoCatalogo(codigo?: string | null): string {
    return codigo?.trim() || '-';
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
    const quantidade = this.normalizarQuantidadeInteira(item.quantidade);
    item.quantidade = quantidade;
    const valorUnitario = Number(item.valor_unitario || 0);
    const percentual = Number(item.percentual_desconto || 0);
    const bruto = quantidade * valorUnitario;
    item.valor_desconto = percentual > 0 ? Number(((bruto * percentual) / 100).toFixed(2)) : Number(item.valor_desconto || 0);
    item.valor_total = Number(Math.max(bruto - Number(item.valor_desconto || 0), 0).toFixed(2));
  }

  public aoAlterarQuantidade(item: ItemEdicao): void {
    item.quantidade = this.normalizarQuantidadeInteira(item.quantidade);
    this.recalcularItem(item);
  }

  public alterarQuantidadeCarrinho(item: ItemEdicao, delta: number): void {
    const quantidadeAtual = this.normalizarQuantidadeInteira(item.quantidade);
    item.quantidade = this.normalizarQuantidadeInteira(quantidadeAtual + delta);
    this.recalcularItem(item);
  }

  public alterarQuantidadePesquisa(delta: number): void {
    this.quantidadePesquisa = this.normalizarQuantidadeInteira(this.quantidadePesquisa + delta);
  }

  public aoAlterarQuantidadePesquisa(): void {
    this.quantidadePesquisa = this.quantidadePesquisaNormalizada;
  }

  public bloquearEntradaQuantidade(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  public recalcularResumo(): void {
    this.descontoFinanceiro = Number(this.descontoFinanceiro || 0);
    this.acrescimoFinanceiro = Number(this.acrescimoFinanceiro || 0);
  }

  public salvarOrcamento(): void {
    if (!this.orcamento || this.processando) {
      return;
    }

    if (!this.itens.length) {
      this.toastService.warning('Adicione ao menos um item antes de salvar o orçamento.');
      return;
    }

    this.processando = true;
    this.mensagemProcessamento = this.modoPdv ? 'Salvando venda PDV...' : 'Salvando orçamento...';
    this.persistirRascunhoSeNecessario((orcamentoId) => {
      this.comercialService.atualizarItens(this.montarPayloadAtualizacao(orcamentoId)).subscribe({
        next: (response) => {
          this.processando = false;
          this.toastService.success(this.modoPdv ? 'PDV atualizado com sucesso.' : 'Orçamento atualizado com sucesso.');
          this.preencherOrcamento(response);
          this.sincronizarRotaComOrcamento(response.id);
          this.abrirModalConfirmacaoPdf();
        },
        error: (error) => {
          this.processando = false;
          const message = getHttpErrorMessage(error, 'Não foi possível atualizar o orçamento.');
          if (message.toLowerCase().includes('aprovado') || message.toLowerCase().includes('rejeitado')) {
            this.toastService.warning(message);
            this.recarregarContexto();
            return;
          }

          this.toastService.error(message);
        }
      });
    });
  }

  public aprovarOrcamento(): void {
    if (!this.orcamento || this.processando) {
      return;
    }

    this.processando = true;
    this.mensagemProcessamento = this.modoPdv ? 'Finalizando venda PDV...' : 'Aprovando orçamento e gerando venda...';
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
        const message = getHttpErrorMessage(error, 'Não foi possível aprovar o orçamento.');
        if (message.toLowerCase().includes('aprovado')) {
          this.toastService.info(message);
          this.recarregarContexto();
          return;
        }

        this.toastService.error(message);
      }
    });
  }

  public buscarCliente(): void {
    const termo = this.clientePesquisa?.trim();
    if (!termo) {
      this.aplicarConsumidorFinal();
      this.fecharModalPesquisaCliente();
      return;
    }

    if (this.consultandoCliente) {
      return;
    }

    this.consultandoCliente = true;
    this.comercialService.buscarCliente(termo).subscribe({
      next: (response) => {
        this.consultandoCliente = false;
        const clientes = this.normalizarClientesBusca(response);
        if (!clientes.length) {
          this.fecharModalPesquisaCliente();
          this.abrirCadastroCliente(termo);
          return;
        }

        this.clientesEncontrados = clientes;
        this.fecharModalPesquisaCliente();
        this.abrirModalSelecaoCliente();
      },
      error: (error: HttpErrorResponse) => {
        this.consultandoCliente = false;
        if (error.status === 204) {
          this.fecharModalPesquisaCliente();
          this.abrirCadastroCliente(termo);
          return;
        }

        const clientes = this.normalizarClientesBusca(error.error);
        if (clientes.length) {
          this.clientesEncontrados = clientes;
          this.fecharModalPesquisaCliente();
          this.abrirModalSelecaoCliente();
          return;
        }

        this.toastService.error(getHttpErrorMessage(error, 'Não foi possível pesquisar os clientes agora.'));
        this.fecharModalPesquisaCliente();
      }
    });
  }

  public abrirModalPesquisaCliente(): void {
    const modalElement = document.getElementById('modalPesquisaCliente');
    if (!modalElement) {
      return;
    }

    this.modalPesquisaClienteAberto = true;
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }

  public fecharModalPesquisaCliente(): void {
    const modalElement = document.getElementById('modalPesquisaCliente');
    if (!modalElement) {
      return;
    }

    this.modalPesquisaClienteAberto = false;
    bootstrap.Modal.getOrCreateInstance(modalElement).hide();
  }

  public selecionarClienteEncontrado(cliente: Cliente): void {
    this.preencherClienteEncontrado(cliente);
    this.fecharModalSelecaoCliente();
  }

  public confirmarCadastroCliente(): void {
    const nome = this.clienteCadastroNome.trim() || 'Consumidor final';
    const documento = this.clienteCadastroDocumento.trim() || '';
    this.clienteEncontrado = false;
    this.clienteNome = nome;
    this.clienteDocumento = documento;
    this.clientesEncontrados = [];
    this.clientePesquisa = nome === 'Consumidor final' ? '' : [nome, documento].filter(Boolean).join(' - ');
    this.fecharModalCadastroCliente();
    this.toastService.success('Cliente preparado para uso nesta venda.');
  }

  public buscarCepCadastroCliente(): void {
    const cepNormalizado = (this.clienteCadastroCep || '').replace(/\D/g, '');
    if (cepNormalizado.length !== 8) {
      return;
    }

    this.utilsService.buscarEnderecoPorCep(cepNormalizado).subscribe({
      next: (response) => {
        this.clienteCadastroEndereco = response?.logradouro || this.clienteCadastroEndereco;
        this.clienteCadastroBairro = response?.bairro || this.clienteCadastroBairro;
        this.clienteCadastroCidade = response?.localidade || this.clienteCadastroCidade;
        this.clienteCadastroUf = response?.uf || this.clienteCadastroUf;
      },
      error: () => {
        this.toastService.warning('Nao foi possivel localizar o endereco para este CEP.');
      }
    });
  }

  public cadastrarClienteManual(): void {
    this.fecharModalPesquisaCliente();
    this.abrirCadastroCliente(this.clientePesquisa);
  }

  public aoAlterarPesquisaCliente(): void {
    if (!this.clientePesquisa.trim()) {
      this.aplicarConsumidorFinal();
      return;
    }

    this.clienteEncontrado = false;
  }

  public finalizarVenda(): void {
    if (!this.orcamento || this.processando || this.orcamentoBloqueado) {
      return;
    }

    if (!this.itens.length) {
      this.toastService.warning('Adicione ao menos um item antes de finalizar a venda.');
      return;
    }

    this.inicializarPagamentosEdicao();
    this.abrirModalPagamentoVenda();
  }

  public confirmarFinalizacaoVenda(): void {
    if (!this.orcamento || this.processando) {
      return;
    }

    if (!this.validarPagamentosVenda()) {
      return;
    }

    if (this.venda?.id) {
      this.processando = true;
      this.mensagemProcessamento = 'Atualizando venda...';
      this.comercialService.atualizarVenda({
        id_venda: this.venda.id,
        cliente_nome: this.clienteNome?.trim() || 'Consumidor final',
        cliente_documento: this.clienteDocumento?.trim() || null,
        forma_pagamento: this.determinarFormaPagamentoPrincipal(),
        observacoes: this.observacoes,
        pagamentos: this.montarPagamentosVenda(),
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
      }).subscribe({
        next: (response) => {
          this.processando = false;
          this.fecharModalPagamentoVenda();
          this.venda = response;
          this.toastService.success('Venda atualizada com sucesso.');
          this.abrirModalConfirmacaoPdf(() => this.router.navigate(['/comercial/vendas/listar']));
        },
        error: (error) => {
          this.processando = false;
          this.toastService.error(getHttpErrorMessage(error, 'Nao foi possivel atualizar a venda.'));
        }
      });
      return;
    }

    this.processando = true;
    this.mensagemProcessamento = 'Atualizando itens e finalizando venda...';
    this.persistirRascunhoSeNecessario((orcamentoId) => {
      this.comercialService.atualizarItens(this.montarPayloadAtualizacao(orcamentoId)).subscribe({
        next: (orcamentoAtualizado) => {
          this.orcamento = orcamentoAtualizado;
          this.sincronizarRotaComOrcamento(orcamentoAtualizado.id);
          this.comercialService.aprovarOrcamento({
            id_orcamento: orcamentoAtualizado.id,
            forma_pagamento: this.determinarFormaPagamentoPrincipal(),
            observacoes: this.observacoes,
            pagamentos: this.montarPagamentosVenda()
          }).subscribe({
            next: (response) => {
              this.processando = false;
              this.fecharModalPagamentoVenda();
              this.venda = response;
              this.toastService.success('Venda concluida com sucesso.');
              this.abrirModalConfirmacaoPdf(() => this.router.navigate(['/comercial/vendas/listar']));
            },
            error: (error) => {
              this.processando = false;
              this.toastService.error(getHttpErrorMessage(error, 'Nao foi possivel finalizar a venda.'));
            }
          });
        },
        error: (error) => {
          this.processando = false;
          this.toastService.error(getHttpErrorMessage(error, 'Nao foi possivel atualizar os itens antes de finalizar a venda.'));
        }
      });
    });
  }

  public irParaVenda(): void {
    if (!this.orcamento || this.processando || this.orcamento.status === 'APROVADO' || this.orcamento.status === 'REJEITADO') {
      return;
    }

    this.router.navigate(['/comercial/vendas/pdv'], {
      queryParams: { orcamentoId: this.orcamento.id }
    });
  }

  public rejeitarOrcamento(): void {
    if (!this.orcamento || this.processando || this.orcamento.status === 'REJEITADO' || this.modoPdv) {
      return;
    }

    this.processando = true;
    this.mensagemProcessamento = 'Rejeitando orçamento...';
    this.comercialService.rejeitarOrcamento({
      id_orcamento: this.orcamento.id,
      motivo: this.motivoRejeicao
    }).subscribe({
      next: (response) => {
        this.processando = false;
        this.toastService.success(response.origem_tipo === 'ATENDIMENTO'
          ? 'Orçamento rejeitado com sucesso.'
          : 'Orçamento rejeitado e atendimento cancelado com sucesso.');
        this.preencherOrcamento(response);
      },
      error: (error) => {
        this.processando = false;
        const message = getHttpErrorMessage(error, 'Não foi possível rejeitar o orçamento.');
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
    this.mensagemProcessamento = 'Reabrindo orçamento...';
    this.comercialService.reabrirOrcamento({
      id_orcamento: this.orcamento.id
    }).subscribe({
      next: (response) => {
        this.processando = false;
        this.toastService.success('Orçamento reaberto com sucesso.');
        this.preencherOrcamento(response);
      },
      error: (error) => {
        this.processando = false;
        const message = getHttpErrorMessage(error, 'Não foi possível reabrir o orçamento.');
        this.toastService.error(message);
      }
    });
  }

  public voltar(): void {
    if (this.somenteLeitura) {
      this.router.navigate([this.detalheTipo === 'venda' ? '/comercial/vendas/listar' : '/comercial/vendas/orcamentos/listar']);
      return;
    }

    if (this.modoPdv) {
      this.router.navigate(['/comercial/vendas/listar']);
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
        this.router.navigate(['/comercial/vendas/orcamentos/listar']);
    }
  }

  public novoPdv(): void {
    this.router.navigate(['/comercial/vendas/pdv'], {
      queryParams: { orcamentoId: null },
      queryParamsHandling: 'merge'
    });
  }

  public exportarPdf(): void {
    if (this.processando) {
      return;
    }

    const elemento = document.getElementById('comercial-detalhes-pdf');
    const clienteNome = this.venda?.cliente_nome || this.orcamento?.cliente_nome || '';
    const titulo = this.somenteLeitura && this.detalheTipo === 'venda'
      ? `Venda - ${this.venda?.id || 'Detalhes'}${clienteNome ? ` - ${clienteNome}` : ''}`
      : `Orçamento - ${this.orcamento?.id || 'Detalhes'}${clienteNome ? ` - ${clienteNome}` : ''}`;

    this.processando = true;
    this.mensagemProcessamento = 'Exportando PDF...';

    this.pdfExportService.exportElementToPdf(elemento, titulo)
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Nao foi possivel exportar o PDF.';
        this.toastService.error(message);
      })
      .finally(() => {
        this.processando = false;
        this.mensagemProcessamento = 'Salvando orçamento...';
      });
  }

  public formaPagamentoLabel(forma: string | null | undefined): string {
    const labels: Record<string, string> = {
      PIX: 'PIX',
      BOLETO: 'Boleto',
      CARTAO: 'Cartao',
      CARTAO_CREDITO: 'Cartao credito',
      CARTAO_DEBITO: 'Cartao debito',
      DINHEIRO: 'Dinheiro',
      MULTIPLO: 'Multiplo'
    };

    return labels[(forma || '').toUpperCase()] || forma || '-';
  }

  public aoAlterarValorPagamento(): void {
    this.formaPagamento = this.determinarFormaPagamentoPrincipal();
  }

  public abrirModalPagamentoVenda(): void {
    this.modalPagamentoVendaAberto = true;
    document.body.classList.add('modal-open');
  }

  public fecharModalPagamentoVenda(): void {
    this.modalPagamentoVendaAberto = false;
    document.body.classList.remove('modal-open');
  }

  public confirmarExportacaoPdf(exportar: boolean): void {
    if (exportar) {
      this.exportarPdf();
    }

    const acao = this.acaoPosExportacao;
    this.modalExportarPdfAberto = false;
    this.acaoPosExportacao = null;
    document.body.classList.remove('modal-open');
    acao?.();
  }

  public get subtotalItens(): number {
    return this.itens.reduce((total, item) => total + Number(item.valor_total || 0), 0);
  }

  public get clienteObrigatorioPreenchido(): boolean {
    return !!this.clienteNome?.trim();
  }

  public get clienteResumoExibicao(): string {
    return this.clienteNome?.trim() || 'Consumidor final';
  }

  public get totalComercialAtual(): number {
    return Number(Math.max(this.subtotalItens - Number(this.descontoFinanceiro || 0) + Number(this.acrescimoFinanceiro || 0), 0).toFixed(2));
  }

  public get totalPagoInformado(): number {
    return Number(this.pagamentosPreenchidos.reduce((total, pagamento) => total + Number(pagamento.valor_informado || 0), 0).toFixed(2));
  }

  public get saldoPagamento(): number {
    return Number(Math.max(this.totalComercialAtual - this.totalPagoInformado, 0).toFixed(2));
  }

  public get trocoPagamento(): number {
    return Number(Math.max(this.totalPagoInformado - this.totalComercialAtual, 0).toFixed(2));
  }

  public get orcamentoBloqueado(): boolean {
    if (this.somenteLeitura) {
      return true;
    }

    if (this.emEdicao) {
      return false;
    }

    return this.orcamento?.status === 'APROVADO' || this.orcamento?.status === 'REJEITADO';
  }

  public get podeReabrirOrcamento(): boolean {
    return !this.modoPdv
      && this.orcamento?.status === 'REJEITADO'
      && this.orcamento?.origem_tipo === 'ATENDIMENTO';
  }

  public get tituloTela(): string {
    if (this.somenteLeitura) {
      return this.detalheTipo === 'venda' ? 'Detalhes da venda' : 'Detalhes do orçamento';
    }

    return this.modoPdv ? 'PDV e venda' : 'Orçamento e venda';
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
        : 'Consulta detalhada do orçamento';
    }

    if (this.modoPdv) {
      return this.orcamento
        ? `Venda direta para ${this.orcamento.cliente_nome}`
        : 'Venda direta no caixa';
    }

    if (this.orcamento?.origem_tipo === 'LIVRE') {
      return this.orcamento
        ? `Orçamento livre para ${this.orcamento.cliente_nome}`
        : 'Orçamento livre';
    }

    return this.orcamento
      ? `Orçamento da origem ${this.orcamento.origem_tipo} #${this.origemReferenciaId} para ${this.orcamento.cliente_nome}`
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
        this.toastService.error('Não foi possível carregar o orçamento desta origem.');
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
        this.inicializarPagamentosEdicao(response.forma_pagamento || 'PIX', Number(response.total_geral || 0));
        this.comercialService.buscarOrcamentoPorId(response.id_orcamento).subscribe({
          next: (orcamento) => {
            this.preencherOrcamento(orcamento);
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
            this.observacoes = response.observacoes || this.observacoes;
            this.carregando = false;
          },
          error: () => {
            this.carregando = false;
            this.toastService.error('Não foi possível carregar o orçamento vinculado à venda.');
          }
        });
      },
      error: () => {
        this.carregando = false;
        this.toastService.error('Nao foi possivel carregar os detalhes da venda.');
      }
    });
  }

  private inicializarRascunhoLocal(): void {
    this.carregando = false;
    this.venda = null;
    this.preencherOrcamento({
      id: 0,
      codigo: null,
      origem_tipo: this.modoPdv ? 'PDV' : 'LIVRE',
      id_atendimento: null,
      id_manutencao: null,
      id_avulso: null,
      cliente_nome: 'Consumidor final',
      cliente_documento: null,
      status: 'ABERTO',
      validade_em: null,
      aprovado_em: null,
      desconto_financeiro: 0,
      acrescimo_financeiro: 0,
      subtotal: 0,
      total_desconto: 0,
      total_acrescimo: 0,
      total_geral: 0,
      observacoes: null,
      criado_em: undefined,
      atualizado_em: undefined,
      itens: []
    });
  }

  private recarregarContexto(): void {
    if (this.modoPdv && this.orcamento?.id) {
      this.carregarOrcamentoPorId(this.orcamento.id);
      return;
    }

    if ((!this.origemTipo || !this.origemId) && this.orcamento?.id) {
      this.carregarOrcamentoPorId(this.orcamento.id);
      return;
    }

    this.carregarOrcamento();
  }

  private preencherOrcamento(response: Orcamento): void {
    this.orcamento = response;
    this.clienteNome = response.cliente_nome || '';
    this.clienteDocumento = response.cliente_documento || '';
    this.clientePesquisa = this.clienteNome?.trim() && this.clienteNome !== 'Consumidor final'
      ? [this.clienteNome, this.clienteDocumento].filter(Boolean).join(' - ')
      : '';
    this.validadeEm = this.toDate(response.validade_em);
    this.descontoFinanceiro = Number(response.desconto_financeiro || 0);
    this.acrescimoFinanceiro = Number(response.acrescimo_financeiro || 0);
    this.observacoes = response.observacoes || '';
    this.motivoRejeicao = '';
    this.catalogoPesquisa = '';
    this.quantidadePesquisa = 1;
    this.resultadosCatalogo = [];
    this.indiceResultadoAtivo = 0;
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
    this.inicializarPagamentosEdicao(this.formaPagamento, Number(response.total_geral || 0));
  }

  private preencherClienteEncontrado(cliente: Cliente): void {
    this.clienteEncontrado = true;
    this.clienteNome = cliente.nome || this.clienteNome;
    this.clienteDocumento = cliente.documento || this.clienteDocumento;
    this.clientePesquisa = [this.clienteNome, this.clienteDocumento].filter(Boolean).join(' - ');
    this.toastService.success('Cliente carregado com sucesso.');
  }

  private abrirModalSelecaoCliente(): void {
    const modalElement = document.getElementById('modalSelecaoCliente');
    if (!modalElement) {
      return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }

  public fecharModalSelecaoCliente(): void {
    const modalElement = document.getElementById('modalSelecaoCliente');
    if (!modalElement) {
      return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).hide();
  }

  private abrirCadastroCliente(valorInicial = ''): void {
    const termo = (valorInicial || '').trim();
    const somenteDigitos = termo.replace(/\D/g, '');
    this.clienteCadastroNome = somenteDigitos.length === 11 || somenteDigitos.length === 14 ? '' : termo;
    this.clienteCadastroDocumento = somenteDigitos.length === 11 || somenteDigitos.length === 14 ? termo : '';
    this.clienteCadastroCep = '';
    this.clienteCadastroEndereco = '';
    this.clienteCadastroNumero = null;
    this.clienteCadastroComplemento = '';
    this.clienteCadastroBairro = '';
    this.clienteCadastroCidade = '';
    this.clienteCadastroUf = '';
    this.clienteCadastroTelefone = '';
    this.clienteCadastroCelular = '';
    this.clienteCadastroEmail = '';
    this.clienteCadastroContato = '';
    this.modalCadastroClienteAberto = true;
    document.body.classList.add('modal-open');
  }

  public fecharModalCadastroCliente(): void {
    this.modalCadastroClienteAberto = false;
    document.body.classList.remove('modal-open');
  }

  public aplicarConsumidorFinal(): void {
    this.clienteEncontrado = false;
    this.clientesEncontrados = [];
    this.clienteNome = 'Consumidor final';
    this.clienteDocumento = '';
    this.clientePesquisa = '';
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

  private toDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  private startOfDay(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  private reordenarItens(): void {
    this.itens = this.itens.map((item, index) => ({ ...item, ordem: index + 1 }));
  }

  private get quantidadePesquisaNormalizada(): number {
    return this.normalizarQuantidadeInteira(this.quantidadePesquisa);
  }

  private get pagamentosPreenchidos(): PagamentoEdicao[] {
    return this.pagamentosEdicao.filter((pagamento) => Number(pagamento.valor_informado || 0) > 0);
  }

  private montarPayloadAtualizacao(idOrcamento = this.orcamento?.id || 0) {
    return {
      id_orcamento: idOrcamento,
      validade_em: this.comercialService.formatarData(this.validadeEm),
      desconto_financeiro: Number(this.descontoFinanceiro || 0),
      acrescimo_financeiro: Number(this.acrescimoFinanceiro || 0),
      cliente_nome: this.clienteNome?.trim() || 'Consumidor final',
      cliente_documento: this.clienteDocumento?.trim() || null,
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
  }

  private persistirRascunhoSeNecessario(onSuccess: (orcamentoId: number) => void): void {
    if ((this.orcamento?.id || 0) > 0) {
      onSuccess(this.orcamento!.id);
      return;
    }

    const payloadBase = {
      cliente_nome: this.clienteNome?.trim() || 'Consumidor final',
      cliente_documento: this.clienteDocumento?.trim() || null,
      observacoes: this.observacoes || null
    };

    const requisicao = this.modoPdv
      ? this.comercialService.criarOrcamentoPdv(payloadBase)
      : this.comercialService.criarOrcamento({
        ...payloadBase,
        origem_tipo: this.origemTipo || null,
        origem_id: this.origemId || null
      });

    requisicao.subscribe({
      next: (response) => {
        this.orcamento = response;
        this.sincronizarRotaComOrcamento(response.id);
        onSuccess(response.id);
      },
      error: (error) => {
        this.processando = false;
        this.toastService.error(getHttpErrorMessage(error, this.modoPdv
          ? 'Nao foi possivel iniciar a venda.'
          : 'Não foi possível iniciar o orçamento.'));
      }
    });
  }

  private sincronizarRotaComOrcamento(orcamentoId: number): void {
    if (!orcamentoId || this.destroyed) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { orcamentoId },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private abrirModalConfirmacaoPdf(acaoPosExportacao?: () => void): void {
    this.acaoPosExportacao = acaoPosExportacao || null;
    this.modalExportarPdfAberto = true;
    document.body.classList.add('modal-open');
  }

  private montarPagamentosVenda(): PagamentoVenda[] {
    let valorRestante = Number(this.totalComercialAtual.toFixed(2));
    const pagamentos: PagamentoVenda[] = [];

    for (const pagamento of this.pagamentosPreenchidos) {
      const valorInformado = Number(Number(pagamento.valor_informado || 0).toFixed(2));
      if (valorRestante <= 0 || valorInformado <= 0) {
        continue;
      }

      const valorAplicado = Number(Math.min(valorInformado, valorRestante).toFixed(2));
      valorRestante = Number(Math.max(valorRestante - valorAplicado, 0).toFixed(2));

      if (valorAplicado > 0) {
        pagamentos.push({
          forma_pagamento: pagamento.forma_pagamento,
          valor_pago: valorAplicado
        });
      }
    }

    return pagamentos;
  }

  private inicializarPagamentosEdicao(formaPagamento = '', valorTotal = 0): void {
    const formaNormalizada = this.normalizarFormaPagamento(formaPagamento || this.formaPagamento);
    this.pagamentosEdicao = this.formasPagamentoDisponiveis.map((forma) => ({
      forma_pagamento: forma,
      valor_informado: valorTotal > 0 && forma === formaNormalizada ? Number(valorTotal || 0) : 0
    }));
  }

  private determinarFormaPagamentoPrincipal(): string {
    const pagamentos = this.pagamentosPreenchidos;
    if (!pagamentos.length) {
      return this.formaPagamento || 'PIX';
    }

    if (pagamentos.length === 1) {
      return pagamentos[0].forma_pagamento || 'PIX';
    }

    return 'MULTIPLO';
  }

  private normalizarFormaPagamento(forma: string | null | undefined): string {
    return (forma || 'PIX').toUpperCase();
  }

  private normalizarClientesBusca(response: Cliente[] | Cliente | null | undefined): Cliente[] {
    if (!response) {
      return [];
    }

    return Array.isArray(response) ? response.filter(Boolean) : [response];
  }

  private validarPagamentosVenda(exibirToast = true): boolean {
    if (!this.pagamentosPreenchidos.length) {
      if (exibirToast) {
        this.toastService.warning('Informe ao menos uma forma de pagamento para finalizar a venda.');
      }
      return false;
    }

    if (this.saldoPagamento > 0) {
      if (exibirToast) {
        this.toastService.warning('O valor informado ainda nao cobre o total da venda.');
      }
      return false;
    }

    return true;
  }

  private normalizarQuantidadeInteira(value: number | string | null | undefined): number {
    const numeros = String(value ?? '').replace(/\D/g, '');
    const quantidade = Number(numeros || '1');
    return Math.max(1, quantidade);
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

  private buscarResultadosCatalogo(termoBruto: string): CatalogoPesquisaItem[] {
    const termo = termoBruto.trim().toLowerCase();
    if (!termo || this.orcamentoBloqueado || this.somenteLeitura) {
      return [];
    }

    const produtos: CatalogoPesquisaItem[] = [];
    for (const produto of this.produtos) {
      if (
        (produto.nome || '').toLowerCase().includes(termo)
        || (produto.codigo || '').toLowerCase().includes(termo)
        || (produto.descricao || '').toLowerCase().includes(termo)
      ) {
        produtos.push({
          tipo_item: 'PRODUTO',
          id: produto.id,
          codigo: produto.codigo,
          nome: produto.nome,
          descricao: produto.descricao,
          valor: Number(produto.valor_venda || 0)
        });
      }

      if (produtos.length >= 8) {
        break;
      }
    }

    if (produtos.length >= 8) {
      return produtos;
    }

    const servicos: CatalogoPesquisaItem[] = [];
    for (const servico of this.servicos) {
      if (
        (servico.nome || '').toLowerCase().includes(termo)
        || (servico.codigo || '').toLowerCase().includes(termo)
        || (servico.descricao || '').toLowerCase().includes(termo)
      ) {
        servicos.push({
          tipo_item: 'SERVICO',
          id: servico.id,
          codigo: servico.codigo,
          nome: servico.nome,
          descricao: servico.descricao,
          valor: Number(servico.valor_padrao || 0)
        });
      }

      if (produtos.length + servicos.length >= 8) {
        break;
      }
    }

    return [...produtos, ...servicos].slice(0, 8);
  }
}
