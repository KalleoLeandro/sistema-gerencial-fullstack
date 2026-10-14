import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { OrcamentoComponent } from './orcamento.component';
import { ComercialService } from '@services/comercial.service';
import { ProdutoService } from '@services/produto.service';
import { ServicoComercialService } from '@services/servico-comercial.service';
import { PdfExportService } from '@services/pdf-export.service';
import { ToastService } from '@services/toast.service';
import { UtilsService } from '@services/utils.service';
import { pageSetup } from '../../../testing/page.testing';
import * as bootstrap from 'bootstrap';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

describe('Commercial workflow', () => {
  let setup: ReturnType<typeof pageSetup>;
  let c: OrcamentoComponent;
  let service: any;
  const item = {
    id: 1,
    tipo_item: 'PRODUTO',
    id_produto: 1,
    descricao: 'Teclado',
    quantidade: 2,
    valor_unitario: 50,
    percentual_desconto: 0,
    valor_desconto: 0,
    valor_total: 100,
    ordem: 1,
  };
  const budget = {
    id: 42,
    origem_tipo: 'ATENDIMENTO',
    id_atendimento: 3,
    codigo: 'ORC42',
    cliente_nome: 'Ana',
    cliente_documento: '123',
    status: 'ABERTO',
    total_geral: 100,
    itens: [item],
    validade_em: '2026-10-13',
    observacoes: 'Teste',
  } as any;
  const sale = {
    id: 43,
    id_orcamento: 42,
    codigo: 'V43',
    cliente_nome: 'Ana',
    forma_pagamento: 'DINHEIRO',
    total_geral: 100,
    itens: [item],
    parcelas: [
      {
        numero_parcela: 1,
        pagamentos: [
          {
            forma_pagamento: 'DINHEIRO',
            valor_pago: 100,
            valor_entregue: 120,
            troco: 20,
          },
        ],
      },
    ],
  } as any;
  const product = {
    id: 1,
    nome: 'Teclado',
    codigo: 'P1',
    descricao: 'USB',
    valor_venda: 50,
  } as any;
  const work = {
    id: 2,
    nome: 'Instalação',
    codigo: 'S2',
    descricao: 'Software',
    valor_padrao: 20,
  } as any;
  function prepare(query = {}, params = {}, data = {}) {
    setup = pageSetup(query, params, data);
    service = setup.mock(ComercialService);
    for (const name of [
      'buscarOrcamentoPorOrigem',
      'buscarOrcamentoPorId',
      'atualizarItens',
      'criarOrcamento',
      'criarOrcamentoPdv',
      'reabrirOrcamento',
      'rejeitarOrcamento',
    ])
      service[name].and.returnValue(of({ ...budget }));
    for (const name of [
      'buscarVendaPorId',
      'aprovarOrcamento',
      'atualizarVenda',
    ])
      service[name].and.returnValue(of({ ...sale }));
    service.formatarData.and.returnValue('13/10/2026');
    setup.mock(ProdutoService).listarAtivos.and.returnValue(of([product]));
    setup
      .mock(ServicoComercialService)
      .listarAtivos.and.returnValue(of([work]));
    c = setup.create(OrcamentoComponent);
  }
  beforeEach(() => prepare());
  afterEach(() => {
    c.ngOnDestroy();
    document
      .querySelectorAll('[data-commercial-test]')
      .forEach((node) => node.remove());
  });
  function ready() {
    c.ngOnInit();
    (c as any).preencherOrcamento({ ...budget });
  }
  function dialogs() {
    const host = document.createElement('div');
    host.dataset['commercialTest'] = 'true';
    host.innerHTML = [
      'modalPesquisaCliente',
      'modalSelecaoCliente',
      'modalBuscaProduto',
      'modalBuscaServico',
    ]
      .map((id) => `<div id="${id}" data-commercial-test="true"></div>`)
      .join('');
    document.body.append(host);
    const modal = { show: jasmine.createSpy(), hide: jasmine.createSpy() };
    spyOn(bootstrap.Modal, 'getOrCreateInstance').and.returnValue(modal as any);
    return { host, modal };
  }
  const contexts = [
    [{}, {}, {}, 'draft'],
    [{}, {}, { modo: 'pdv' }, 'draft'],
    [{ orcamentoId: '42' }, {}, { modo: 'pdv' }, 'budget'],
    [{ orcamentoId: '42' }, {}, {}, 'budget'],
    [{ origemTipo: 'atendimento', origemId: '3' }, {}, {}, 'origin'],
    ...[true, false].flatMap((readonly) =>
      ['venda', 'orcamento'].map((detalheTipo) => [
        {},
        { id: '42' },
        { readonly, edicao: !readonly, detalheTipo },
        detalheTipo === 'venda' ? 'sale' : 'budget',
      ]),
    ),
  ] as any[];
  for (const [query, params, data, expected] of contexts)
    it(`initializes ${JSON.stringify({ query, data })}`, () => {
      // Each Jasmine spec has its own injector; update the supplied snapshot before initialization.
      Object.assign(setup.route.snapshot, {
        queryParamMap: pageMap(query),
        paramMap: pageMap(params),
        data,
      });
      c.ngOnInit();
      expect(c.carregando).toBeFalse();
      expect(c.produtos).toEqual([product]);
      if (expected === 'draft') expect(c.orcamento!.id).toBe(0);
      if (expected === 'budget')
        expect(service.buscarOrcamentoPorId).toHaveBeenCalledWith(42);
      if (expected === 'sale') {
        expect(service.buscarVendaPorId).toHaveBeenCalledWith(42);
        expect(
          c.pagamentosEdicao.find((p) => p.forma_pagamento === 'DINHEIRO')!
            .valor_informado,
        ).toBe(120);
      }
      if (expected === 'origin')
        expect(service.buscarOrcamentoPorOrigem).toHaveBeenCalledWith(
          'ATENDIMENTO',
          3,
        );
    });
  function pageMap(values: any) {
    return { get: (key: string) => values[key] ?? null } as any;
  }
  for (const method of [
    'carregarOrcamento',
    'carregarOrcamentoPorId',
    'carregarVendaDetalhe',
  ])
    it(`${method} handles lookup failure`, () => {
      const api =
        method === 'carregarOrcamento'
          ? 'buscarOrcamentoPorOrigem'
          : method === 'carregarOrcamentoPorId'
            ? 'buscarOrcamentoPorId'
            : 'buscarVendaPorId';
      service[api].and.returnValue(throwError(() => new Error('offline')));
      (c as any)[method](42);
      expect(c.carregando).toBeFalse();
      expect(setup.mock(ToastService).error).toHaveBeenCalled();
    });
  it('handles missing linked budget and restores legacy payment amounts', () => {
    service.buscarOrcamentoPorId.and.returnValue(
      throwError(() => new Error('offline')),
    );
    (c as any).carregarVendaDetalhe(43);
    expect(c.carregando).toBeFalse();
    expect(setup.mock(ToastService).error).toHaveBeenCalled();
    service.buscarOrcamentoPorId.and.returnValue(
      of({ ...budget, itens: [{ ...item, id: null, ordem: null }] }),
    );
    service.buscarVendaPorId.and.returnValue(
      of({
        ...sale,
        itens: [{ ...item, id: null, ordem: null }],
        parcelas: [
          { pagamentos: [{ forma_pagamento: 'PIX', valor_pago: 100 }] },
        ],
      }),
    );
    (c as any).carregarVendaDetalhe(43);
    expect(
      c.pagamentosEdicao.find((p) => p.forma_pagamento === 'PIX')!
        .valor_informado,
    ).toBe(100);
    service.buscarVendaPorId.and.returnValue(of({ id: 43, id_orcamento: 42 }));
    (c as any).carregarVendaDetalhe(43);
    expect(c.itens).toEqual([]);
  });
  it('adds, merges, removes and reprices product/service cart items', () => {
    ready();
    c.limparCarrinho();
    c.adicionarItem();
    c.adicionarItem('PRODUTO');
    c.itens[1].id_produto = 1;
    c.aplicarProduto(1);
    expect(c.itens[1].valor_total).toBe(50);
    c.itens[0].id_servico = 2;
    c.aplicarServico(0);
    expect(c.itens[0].valor_total).toBe(20);
    expect(c.produtoSelecionado(c.itens[1])).toBe(product);
    expect(c.servicoSelecionado(c.itens[0])).toBe(work);
    c.atualizarTipo(0);
    expect(c.itens[0].valor_total).toBe(0);
    c.aplicarProduto(0);
    c.aplicarServico(0);
    c.limparProduto(1);
    c.limparServico(0);
    c.removerItem(0);
    expect(c.itens[0].ordem).toBe(1);
    c.limparCarrinho();
    c.quantidadePesquisa = 2;
    c.selecionarResultadoCatalogo({
      tipo_item: 'PRODUTO',
      id: 1,
      nome: 'Teclado',
      valor: 50,
    });
    c.selecionarResultadoCatalogo({
      tipo_item: 'PRODUTO',
      id: 1,
      nome: 'Teclado',
      valor: 50,
    });
    expect(c.itens[0].quantidade).toBe(3);
    c.selecionarResultadoCatalogo({
      tipo_item: 'SERVICO',
      id: 2,
      nome: 'Instalação',
      valor: 20,
    });
    expect(c.subtotalItens).toBe(170);
    const cart = c.itens[0];
    cart.percentual_desconto = 10;
    c.recalcularItem(cart);
    expect(cart.valor_total).toBe(135);
    cart.percentual_desconto = 0;
    cart.valor_desconto = 1000;
    c.recalcularItem(cart);
    expect(cart.valor_total).toBe(0);
    cart.valor_desconto = 0;
    cart.quantidade = 0;
    c.aoAlterarQuantidade(cart);
    expect(cart.quantidade).toBe(1);
    c.alterarQuantidadeCarrinho(cart, 2);
    expect(cart.quantidade).toBe(3);
    c.alterarQuantidadePesquisa(-1);
    c.aoAlterarQuantidadePesquisa();
    expect(c.quantidadePesquisa).toBe(1);
    c.descontoFinanceiro = 5;
    c.acrescimoFinanceiro = 2;
    c.recalcularResumo();
    expect(c.totalComercialAtual).toBe(167);
  });
  it('searches catalog with debounce and supports keyboard navigation', fakeAsync(() => {
    ready();
    c.catalogoPesquisa = 'tecl';
    c.aoAlterarPesquisa();
    c.aoAlterarPesquisa();
    tick(121);
    expect(c.resultadosCatalogo.length).toBe(1);
    expect(c.resultadoEstaAtivo(0)).toBeTrue();
    c.resultadosCatalogo.push({
      tipo_item: 'SERVICO',
      id: 2,
      nome: 'Instalação',
      valor: 20,
    });
    c.aoTeclaPesquisa(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(c.indiceResultadoAtivo).toBe(1);
    c.aoTeclaPesquisa(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(c.indiceResultadoAtivo).toBe(0);
    c.aoTeclaPesquisa(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(c.itens[0].quantidade).toBe(3);
    c.aoTeclaPesquisa(new KeyboardEvent('keydown', { key: 'Enter' }));
    c.aoTeclaPesquisa(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(c.resultadosCatalogo).toEqual([]);
    for (const key of ['Backspace', '5', '.']) {
      const event = new KeyboardEvent('keydown', { key, cancelable: true });
      c.bloquearEntradaQuantidade(event);
      expect(event.defaultPrevented).toBe(key === '.');
    }
    c.catalogoPesquisa = 'usb';
    c.aoAlterarPesquisa();
    tick(121);
    expect(c.resultadosCatalogo[0].id).toBe(1);
    c.catalogoPesquisa = 'software';
    c.aoAlterarPesquisa();
    tick(121);
    expect(c.resultadosCatalogo[0].id).toBe(2);
    c.produtos = Array.from({ length: 10 }, (_, id) => ({ ...product, id }));
    c.catalogoPesquisa = 'P1';
    c.aoAlterarPesquisa();
    tick(121);
    expect(c.resultadosCatalogo.length).toBe(8);
    c.produtos = [];
    c.servicos = Array.from({ length: 10 }, (_, id) => ({ ...work, id }));
    c.catalogoPesquisa = 'S2';
    c.aoAlterarPesquisa();
    tick(121);
    expect(c.resultadosCatalogo.length).toBe(8);
    c.catalogoPesquisa = '';
    c.aoAlterarPesquisa();
    tick(121);
    expect(c.resultadosCatalogo).toEqual([]);
    c.aoAlterarPesquisa();
    c.ngOnDestroy();
    tick(121);
  }));
  it('filters paginated catalogs by name, code and description and clamps page bounds', () => {
    ready();
    c.produtos = Array.from({ length: 30 }, (_, id) => ({ ...product, id }));
    c.servicos = Array.from({ length: 30 }, (_, id) => ({ ...work, id }));
    expect(c.produtosFiltrados.length).toBe(25);
    expect(c.servicosFiltrados.length).toBe(30);
    c.mudarPaginaProduto(100);
    c.mudarPaginaServico(100);
    expect(c.produtosPaginados.length).toBe(5);
    expect(c.servicosPaginados.length).toBe(10);
    c.mudarPaginaProduto(-100);
    c.mudarPaginaServico(-100);
    expect(c.produtoPaginaAtual).toBe(1);
    for (const search of ['teclado', 'P1', 'usb', 'missing']) {
      c.produtoPesquisa = search;
      expect(c.produtosFiltrados.length).toBe(search === 'missing' ? 0 : 30);
    }
    for (const search of ['instalação', 'S2', 'software', 'missing']) {
      c.servicoPesquisa = search;
      expect(c.servicosFiltrados.length).toBe(search === 'missing' ? 0 : 30);
    }
    expect(c.tipoCatalogoLabel('PRODUTO')).toBe('Produto');
    expect(c.tipoCatalogoLabel('SERVICO')).toBe('Servico');
    expect(c.formatarCodigoCatalogo(' X ')).toBe('X');
    expect(c.formatarCodigoCatalogo(null)).toBe('-');
  });
  it('opens selector modals, assigns products/services and restores modal placement', () => {
    ready();
    const { host, modal } = dialogs();
    c.ngAfterViewInit();
    expect(document.getElementById('modalPesquisaCliente')!.parentNode).toBe(
      document.body,
    );
    c.selecionarProduto(product);
    c.selecionarServico(work);
    c.abrirBuscaProduto(99);
    c.selecionarProduto(product);
    c.abrirBuscaProduto(0);
    c.selecionarProduto(product);
    expect(c.itens[0].id_produto).toBe(1);
    c.abrirBuscaServico(99);
    c.selecionarServico(work);
    c.abrirBuscaServico(0);
    c.selecionarServico(work);
    expect(c.itens[0].id_servico).toBe(2);
    c.abrirModalPesquisaCliente();
    c.fecharModalPesquisaCliente();
    c.fecharModalSelecaoCliente();
    expect(modal.show).toHaveBeenCalled();
    expect(modal.hide).toHaveBeenCalled();
    c.ngOnDestroy();
    expect(host.querySelector('#modalPesquisaCliente')).not.toBeNull();
    expect(host.querySelector('#modalSelecaoCliente')).not.toBeNull();
  });
  for (const response of [
    [],
    null,
    [{ nome: 'Ana', documento: '123' }],
    { nome: 'Ana', documento: '123' },
  ])
    it(`searches and selects clients: ${JSON.stringify(response)}`, () => {
      ready();
      dialogs();
      c.clientePesquisa = 'Ana';
      service.buscarCliente.and.returnValue(of(response));
      c.buscarCliente();
      expect(c.consultandoCliente).toBeFalse();
      if (!response || (Array.isArray(response) && !response.length)) {
        expect(c.modalCadastroClienteAberto).toBeTrue();
        expect(c.clienteCadastroNome).toBe('Ana');
      } else {
        c.selecionarClienteEncontrado(c.clientesEncontrados[0]);
        expect(c.clienteEncontrado).toBeTrue();
        expect(c.clienteNome).toBe('Ana');
      }
    });
  for (const error of [
    { status: 204 },
    { status: 500, error: [{ nome: 'Ana', documento: '123' }] },
    { status: 500, error: undefined },
  ])
    it(`handles client search errors ${JSON.stringify(error)}`, () => {
      ready();
      dialogs();
      c.clientePesquisa = '12345678901';
      service.buscarCliente.and.returnValue(throwError(() => error));
      c.buscarCliente();
      expect(c.consultandoCliente).toBeFalse();
      if (error.status === 204)
        expect(c.clienteCadastroDocumento).toBe('12345678901');
      else if (Array.isArray(error.error))
        expect(c.clientesEncontrados.length).toBe(1);
      else expect(setup.mock(ToastService).error).toHaveBeenCalled();
    });
  it('supports final consumer/manual clients and CEP lookup', () => {
    ready();
    c.clientePesquisa = '';
    c.buscarCliente();
    expect(c.clienteNome).toBe('Consumidor final');
    c.clientePesquisa = 'Nome';
    c.aoAlterarPesquisaCliente();
    c.cadastrarClienteManual();
    expect(c.clienteCadastroNome).toBe('Nome');
    c.clienteCadastroDocumento = '123';
    c.confirmarCadastroCliente();
    expect(c.clientePesquisa).toBe('Nome - 123');
    c.clienteCadastroNome = '';
    c.clienteCadastroDocumento = '';
    c.confirmarCadastroCliente();
    expect(c.clientePesquisa).toBe('');
    c.aoAlterarPesquisaCliente();
    expect(c.clienteResumoExibicao).toBe('Consumidor final');
    expect(c.clienteObrigatorioPreenchido).toBeTrue();
    c.clienteCadastroCep = '123';
    c.buscarCepCadastroCliente();
    expect(
      setup.mock(UtilsService).buscarEnderecoPorCep,
    ).not.toHaveBeenCalled();
    c.clienteCadastroCep = '01001-000';
    setup
      .mock(UtilsService)
      .buscarEnderecoPorCep.and.returnValue(
        of({ logradouro: 'Rua', bairro: 'Centro', localidade: 'SP', uf: 'SP' }),
      );
    c.buscarCepCadastroCliente();
    expect(c.clienteCadastroEndereco).toBe('Rua');
    setup.mock(UtilsService).buscarEnderecoPorCep.and.returnValue(of(null));
    c.buscarCepCadastroCliente();
    expect(c.clienteCadastroEndereco).toBe('Rua');
    setup
      .mock(UtilsService)
      .buscarEnderecoPorCep.and.returnValue(
        throwError(() => new Error('offline')),
      );
    c.buscarCepCadastroCliente();
    expect(setup.mock(ToastService).warning).toHaveBeenCalled();
    service.buscarCliente.and.returnValue(new Subject());
    c.clientePesquisa = 'Ana';
    c.buscarCliente();
    c.buscarCliente();
    expect(service.buscarCliente).toHaveBeenCalledTimes(1);
  });
  for (const mode of [false, true])
    for (const failure of [null, 'create', 'update'])
      it(`saves ${mode ? 'POS' : 'free budget'} draft; failure=${failure}`, () => {
        c.modoPdv = mode;
        (c as any).inicializarRascunhoLocal();
        c.selecionarResultadoCatalogo({
          tipo_item: 'PRODUTO',
          id: 1,
          nome: 'Teclado',
          valor: 50,
        });
        if (failure === 'create')
          service[
            mode ? 'criarOrcamentoPdv' : 'criarOrcamento'
          ].and.returnValue(throwError(() => new Error('offline')));
        if (failure === 'update')
          service.atualizarItens.and.returnValue(
            throwError(() => ({ error: { message: 'Falha' } })),
          );
        c.salvarOrcamento();
        expect(c.processando).toBeFalse();
        expect(
          service[mode ? 'criarOrcamentoPdv' : 'criarOrcamento'],
        ).toHaveBeenCalled();
        if (!failure) {
          expect(c.orcamento!.id).toBe(42);
          expect(c.modalExportarPdfAberto).toBeTrue();
          c.confirmarExportacaoPdf(false);
        } else expect(setup.mock(ToastService).error).toHaveBeenCalled();
      });
  for (const message of ['aprovado', 'rejeitado', 'Falha'])
    it(`handles save conflict ${message}`, () => {
      ready();
      service.atualizarItens.and.returnValue(
        throwError(() => ({ error: { message } })),
      );
      c.salvarOrcamento();
      expect(c.processando).toBeFalse();
      expect(
        setup.mock(ToastService)[message === 'Falha' ? 'error' : 'warning'],
      ).toHaveBeenCalledWith(message);
    });
  for (const mode of [false, true])
    for (const error of [null, 'aprovado', 'Falha'])
      it(`approves budget mode=${mode}, error=${error}`, () => {
        ready();
        c.modoPdv = mode;
        if (error)
          service.aprovarOrcamento.and.returnValue(
            throwError(() => ({ error: { message: error } })),
          );
        c.aprovarOrcamento();
        expect(c.processando).toBeFalse();
        if (!error) expect(c.venda!.id).toBe(43);
        else
          expect(
            setup.mock(ToastService)[error === 'aprovado' ? 'info' : 'error'],
          ).toHaveBeenCalledWith(error);
      });
  for (const existing of [false, true])
    for (const failure of [null, 'update', 'approve'])
      it(`finalizes ${existing ? 'existing' : 'new'} sale; failure=${failure}`, () => {
        ready();
        c.pagamentosEdicao = [
          { forma_pagamento: 'DINHEIRO', valor_informado: 120 },
        ];
        c.itens.push({
          ...item,
          tipo_item: 'SERVICO',
          id_produto: null,
          id_servico: 2,
          quantidade: 0,
          valor_total: 0,
          chave: 'S',
        } as any);
        if (existing) c.venda = { ...sale };
        const api = existing
          ? 'atualizarVenda'
          : failure === 'update'
            ? 'atualizarItens'
            : 'aprovarOrcamento';
        if (failure)
          service[api].and.returnValue(
            throwError(() => ({ error: { message: 'Falha' } })),
          );
        c.confirmarFinalizacaoVenda();
        expect(c.processando).toBeFalse();
        expect(
          service[existing ? 'atualizarVenda' : 'atualizarItens'],
        ).toHaveBeenCalled();
        if (!failure) {
          expect(c.modalExportarPdfAberto).toBeTrue();
          c.confirmarExportacaoPdf(false);
          expect(setup.router.navigate).toHaveBeenCalledWith([
            '/comercial/vendas/listar',
          ]);
        } else
          expect(setup.mock(ToastService).error).toHaveBeenCalledWith('Falha');
      });
  it('opens payment dialog and blocks invalid payments/empty carts/duplicate processing', () => {
    ready();
    c.finalizarVenda();
    expect(c.modalPagamentoVendaAberto).toBeTrue();
    c.fecharModalPagamentoVenda();
    c.pagamentosEdicao = [];
    c.confirmarFinalizacaoVenda();
    expect(service.aprovarOrcamento).not.toHaveBeenCalled();
    for (const payments of [
      [],
      [{ forma_pagamento: 'PIX', valor_informado: 20 }],
      [{ forma_pagamento: 'PIX', valor_informado: 120 }],
    ]) {
      c.pagamentosEdicao = payments;
      expect((c as any).validarPagamentosVenda(false)).toBeFalse();
    }
    c.itens = [];
    c.salvarOrcamento();
    c.finalizarVenda();
    expect(setup.mock(ToastService).warning).toHaveBeenCalled();
    c.processando = true;
    c.salvarOrcamento();
    c.aprovarOrcamento();
    c.rejeitarOrcamento();
    c.reabrirOrcamento();
    c.finalizarVenda();
    c.confirmarFinalizacaoVenda();
    c.irParaVenda();
    c.exportarPdf();
    expect(service.atualizarItens).not.toHaveBeenCalled();
    c.processando = false;
    c.orcamento = null;
    c.salvarOrcamento();
    c.aprovarOrcamento();
    c.confirmarFinalizacaoVenda();
  });
  for (const error of [null, 'rejeitado', 'Falha'])
    it(`rejects budget error=${error} and reopens eligible service orders`, () => {
      ready();
      if (error)
        service.rejeitarOrcamento.and.returnValue(
          throwError(() => ({ error: { message: error } })),
        );
      c.rejeitarOrcamento();
      expect(c.processando).toBeFalse();
      if (error)
        expect(
          setup.mock(ToastService)[error === 'rejeitado' ? 'info' : 'error'],
        ).toHaveBeenCalledWith(error);
      c.orcamento = { ...budget, status: 'REJEITADO' };
      expect(c.podeReabrirOrcamento).toBeTrue();
      c.reabrirOrcamento();
      expect(service.reabrirOrcamento).toHaveBeenCalledWith({
        id_orcamento: 42,
      });
      c.orcamento = { ...budget, status: 'REJEITADO' };
      service.reabrirOrcamento.and.returnValue(
        throwError(() => ({ error: { message: 'Falha' } })),
      );
      c.reabrirOrcamento();
      expect(setup.mock(ToastService).error).toHaveBeenCalledWith('Falha');
    });
  it('shows stored payment totals without inventing unavailable change data', () => {
    c.venda = sale;
    expect(c.valorEntregueRegistrado).toBe(120);
    expect(c.trocoRegistrado).toBe(20);
    expect(c.recebidoRegistrado).toBe(100);
    c.venda = {
      ...sale,
      parcelas: [{ pagamentos: [{ valor_pago: 100 }] }, {}],
    };
    expect(c.valorEntregueRegistrado).toBeNull();
    expect(c.trocoRegistrado).toBeNull();
    c.venda = null;
    expect(c.pagamentosRegistrados).toEqual([]);
    expect(c.recebidoRegistrado).toBe(0);
    c.formaPagamento = '';
    c.aoAlterarValorPagamento();
    expect(c.formaPagamento).toBe('PIX');
    c.pagamentosEdicao = [
      { forma_pagamento: 'DINHEIRO', valor_informado: 20 },
      { forma_pagamento: 'PIX', valor_informado: 30 },
    ];
    c.aoAlterarValorPagamento();
    expect(c.formaPagamento).toBe('MULTIPLO');
    for (const [input, output] of [
      ['pix', 'PIX'],
      ['Outra', 'Outra'],
      [null, '-'],
    ])
      expect(c.formaPagamentoLabel(input)).toBe(output!);
  });
  it('exposes screen context, readonly locks, origin navigation and date handling', () => {
    for (const mode of [false, true])
      for (const readonly of [false, true])
        for (const type of ['venda', 'orcamento']) {
          c.modoPdv = mode;
          c.somenteLeitura = readonly;
          c.detalheTipo = type;
          expect(c.tituloTela.length).toBeGreaterThan(0);
          void c.descricaoTela;
          c.voltar();
          c.orcamento = budget;
          c.venda = sale;
          expect(c.descricaoTela.length).toBeGreaterThan(0);
          c.voltar();
          c.orcamento = null;
          c.venda = null;
        }
    c.modoPdv = false;
    c.somenteLeitura = false;
    c.orcamento = { ...budget, origem_tipo: 'LIVRE' };
    expect(c.descricaoTela).toContain('livre');
    for (const origin of ['ATENDIMENTO', 'MANUTENCAO', 'AVULSO', '']) {
      c.origemTipo = origin;
      c.voltar();
    }
    c.orcamento = budget;
    c.irParaVenda();
    c.novoPdv();
    expect(setup.router.navigate).toHaveBeenCalled();
    c.orcamento = { ...budget, status: 'APROVADO' };
    expect(c.orcamentoBloqueado).toBeTrue();
    c.limparCarrinho();
    c.aoTeclaPesquisa(new KeyboardEvent('keydown'));
    c.selecionarResultadoCatalogo({} as any);
    c.abrirBuscaProduto(0);
    c.abrirBuscaServico(0);
    c.irParaVenda();
    c.emEdicao = true;
    expect(c.orcamentoBloqueado).toBeFalse();
    for (const value of [null, 'invalid']) {
      expect((c as any).inputDate(value)).toBe('');
      expect((c as any).toDate(value)).toBeNull();
    }
    expect((c as any).inputDate(new Date(2026, 0, 2))).toBe('2026-01-02');
    c.orcamento = null;
    c.origemId = 3;
    expect(c.origemReferenciaId).toBe(3);
  });
  for (const fail of [false, true])
    it(`exports PDF and clears busy state; failure=${fail}`, fakeAsync(() => {
      ready();
      if (fail)
        setup
          .mock(PdfExportService)
          .exportElementToPdf.and.returnValue(
            Promise.reject(new Error('PDF falhou')),
          );
      c.confirmarExportacaoPdf(true);
      flushMicrotasks();
      expect(c.processando).toBeFalse();
      if (fail)
        expect(setup.mock(ToastService).error).toHaveBeenCalledWith(
          'PDF falhou',
        );
      else
        expect(
          setup.mock(PdfExportService).exportElementToPdf,
        ).toHaveBeenCalled();
    }));
  it('tolerates legacy budgets, sales and catalogs with missing optional fields', () => {
    ready();
    c.produtos = [{ id: 1 } as any];
    c.servicos = [{ id: 2 } as any];
    c.produtoPesquisa = 'missing';
    c.servicoPesquisa = 'missing';
    expect(c.produtosFiltrados).toEqual([]);
    expect(c.servicosFiltrados).toEqual([]);
    expect((c as any).buscarResultadosCatalogo('missing')).toEqual([]);
    c.produtos[0].codigo = 'P1';
    c.servicos[0].codigo = 'S2';
    expect((c as any).buscarResultadosCatalogo('P1')[0].valor).toBe(0);
    expect((c as any).buscarResultadosCatalogo('S2')[0].valor).toBe(0);
    c.itens = [];
    c.adicionarItem('PRODUTO');
    c.itens[0].id_produto = 1;
    c.aplicarProduto(0);
    expect(c.itens[0].valor_total).toBe(0);
    c.adicionarItem();
    c.itens[1].id_servico = 2;
    c.aplicarServico(1);
    expect(c.itens[1].valor_total).toBe(0);
    c.abrirBuscaProduto(0);
    c.selecionarProduto({ id: 1, nome: 'Sem preço' } as any);
    c.abrirBuscaServico(1);
    c.selecionarServico({ id: 2, nome: 'Sem preço' } as any);
    c.limparCarrinho();
    c.selecionarResultadoCatalogo({
      tipo_item: 'SERVICO',
      id: 2,
      nome: 'Sem preço',
      valor: 0,
    });
    c.itens[0].quantidade = 0;
    c.selecionarResultadoCatalogo({
      tipo_item: 'SERVICO',
      id: 2,
      nome: 'Sem preço',
      valor: 0,
    });
    expect(c.itens[0].quantidade).toBe(1);
    c.descontoFinanceiro = null as any;
    c.acrescimoFinanceiro = null as any;
    c.recalcularResumo();
    expect(c.totalComercialAtual).toBe(0);
    (c as any).preencherOrcamento({
      id: 42,
      itens: [{ tipo_item: 'PRODUTO' }, { tipo_item: 'SERVICO' }],
    });
    expect(c.clienteNome).toBe('');
    expect(c.itens[0].valor_total).toBe(0);
    expect(c.clienteResumoExibicao).toBe('Consumidor final');
    expect(c.clienteObrigatorioPreenchido).toBeFalse();
    const payload = (c as any).montarPayloadAtualizacao();
    expect(payload.cliente_nome).toBe('Consumidor final');
    expect(payload.itens[0].id_produto).toBeNull();
    expect(payload.itens[1].id_servico).toBeNull();
    (c as any).preencherOrcamento({ id: 42 });
    expect(c.itens).toEqual([]);
    c.clienteNome = 'Ana';
    c.clienteDocumento = '123';
    c.selecionarClienteEncontrado({} as any);
    expect(c.clienteNome).toBe('Ana');
    expect(c.clienteDocumento).toBe('123');
    c.clienteCadastroCep = null as any;
    c.buscarCepCadastroCliente();
    c.cadastrarClienteManual();
    (c as any).abrirCadastroCliente();
    expect(c.clienteCadastroNome).toBe('');
    c.abrirModalPesquisaCliente();
    c.fecharModalSelecaoCliente();
    service.buscarVendaPorId.and.returnValue(
      of({
        id: 43,
        id_orcamento: 42,
        itens: [{}],
        parcelas: [{}, { pagamentos: [{ forma_pagamento: 'PIX' }] }],
      }),
    );
    (c as any).carregarVendaDetalhe(43);
    expect(c.itens[0].valor_total).toBe(0);
    expect(c.recebidoRegistrado).toBe(0);
    c.venda = {
      ...sale,
      parcelas: [
        { pagamentos: [{ valor_pago: 0, valor_entregue: 0, troco: 0 }] },
      ],
    };
    expect(c.valorEntregueRegistrado).toBe(0);
    expect(c.trocoRegistrado).toBe(0);
    expect(c.recebidoRegistrado).toBe(0);
    c.pagamentosEdicao = [{ forma_pagamento: '', valor_informado: 1 }];
    c.aoAlterarValorPagamento();
    expect(c.formaPagamento).toBe('PIX');
    expect((c as any).normalizarFormaPagamento(null)).toBe('PIX');
    for (const quantity of [null, undefined, ''])
      expect((c as any).normalizarQuantidadeInteira(quantity)).toBe(1);
  });
  it('resolves origin references, readonly fallback labels and cancelled requests', () => {
    for (const fields of [
      { id_manutencao: 4 },
      { id_avulso: 5 },
      {},
      { id_atendimento: 3 },
    ]) {
      c.orcamento = { id: 42, ...fields } as any;
      expect(c.origemReferenciaId).toBeGreaterThanOrEqual(0);
    }
    c.orcamento = { id: 42, cliente_nome: 'Ana' } as any;
    c.somenteLeitura = true;
    expect(c.orcamentoBloqueado).toBeTrue();
    expect(c.descricaoTela).toContain('Rascunho');
    service.buscarOrcamentoPorId.and.returnValue(
      throwError(() => new Error('offline')),
    );
    (c as any).carregarOrcamentoPorId(42);
    expect(setup.mock(ToastService).error).toHaveBeenCalledWith(
      'Nao foi possivel carregar os detalhes.',
    );
    c.somenteLeitura = false;
    c.origemTipo = 'ATENDIMENTO';
    c.origemId = 3;
    (c as any).recarregarContexto();
    expect(service.buscarOrcamentoPorOrigem).toHaveBeenCalledWith(
      'ATENDIMENTO',
      3,
    );
    (c as any).sincronizarRotaComOrcamento(0);
    setup.router.navigate.calls.reset();
    c.ngOnDestroy();
    (c as any).sincronizarRotaComOrcamento(42);
    expect(setup.router.navigate).not.toHaveBeenCalled();
    c.ngAfterViewInit();
    expect((c as any).destroyed).toBeTrue();
  });
  it('validates short payments and omits already covered payment entries', () => {
    ready();
    c.pagamentosEdicao = [{ forma_pagamento: 'PIX', valor_informado: 20 }];
    expect((c as any).validarPagamentosVenda()).toBeFalse();
    expect(c.saldoPagamento).toBe(80);
    c.pagamentosEdicao = [
      { forma_pagamento: 'PIX', valor_informado: 100 },
      { forma_pagamento: 'DINHEIRO', valor_informado: 20 },
      { forma_pagamento: 'BOLETO', valor_informado: 0 },
    ];
    expect((c as any).montarPagamentosVenda()).toEqual([
      { forma_pagamento: 'PIX', valor_pago: 100, valor_entregue: 100 },
    ]);
    c.quantidadeParcelas = 0;
    c.intervaloDias = 0;
    c.aprovarOrcamento();
    expect(service.aprovarOrcamento).toHaveBeenCalledWith(
      jasmine.objectContaining({ quantidade_parcelas: 1, intervalo_dias: 30 }),
    );
    service.rejeitarOrcamento.and.returnValue(
      of({ ...budget, origem_tipo: 'AVULSO' }),
    );
    c.rejeitarOrcamento();
    expect(setup.mock(ToastService).success).toHaveBeenCalled();
  });
  it('updates a legacy sale with final consumer and items without catalog IDs', () => {
    ready();
    c.venda = sale;
    c.clienteNome = '';
    c.clienteDocumento = '';
    c.itens = [
      { tipo_item: 'PRODUTO', valor_total: 100 },
      { tipo_item: 'SERVICO', valor_total: 0 },
    ] as any;
    c.pagamentosEdicao = [
      { forma_pagamento: 'DINHEIRO', valor_informado: 100 },
    ];
    c.confirmarFinalizacaoVenda();
    expect(service.atualizarVenda).toHaveBeenCalledWith(
      jasmine.objectContaining({
        cliente_nome: 'Consumidor final',
        cliente_documento: null,
        itens: [
          jasmine.objectContaining({ id_produto: null, valor_unitario: 0 }),
          jasmine.objectContaining({ id_servico: null }),
        ],
      }),
    );
  });
  it('exports readonly sales with and without optional identity and handles unknown PDF failures', fakeAsync(() => {
    c.somenteLeitura = true;
    c.detalheTipo = 'venda';
    c.venda = sale;
    c.exportarPdf();
    flushMicrotasks();
    expect(
      setup.mock(PdfExportService).exportElementToPdf,
    ).toHaveBeenCalledWith(null, 'Venda - 43 - Ana');
    c.venda = null;
    c.exportarPdf();
    flushMicrotasks();
    expect(
      setup.mock(PdfExportService).exportElementToPdf,
    ).toHaveBeenCalledWith(null, 'Venda - Detalhes');
    c.somenteLeitura = false;
    c.orcamento = null;
    setup
      .mock(PdfExportService)
      .exportElementToPdf.and.returnValue(Promise.reject('unknown'));
    c.exportarPdf();
    flushMicrotasks();
    expect(setup.mock(ToastService).error).toHaveBeenCalledWith(
      'Nao foi possivel exportar o PDF.',
    );
  }));
});

describe('Sale change', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        ...[
          ActivatedRoute,
          Router,
          ComercialService,
          PdfExportService,
          ProdutoService,
          ServicoComercialService,
          UtilsService,
        ].map((provide) => ({ provide, useValue: {} })),
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj('ToastService', ['warning']),
        },
      ],
    }),
  );
  const venda = (total: number) => {
    const component = TestBed.runInInjectionContext(
      () => new OrcamentoComponent(),
    );
    component.itens = [{ valor_total: total } as any];
    return component;
  };
  it('envia valor entregue além do líquido para preservar o troco', () => {
    const component = venda(80);
    component.pagamentosEdicao = [
      { forma_pagamento: 'DINHEIRO', valor_informado: 100 },
    ];
    expect(component['montarPagamentosVenda']()).toEqual([
      { forma_pagamento: 'DINHEIRO', valor_pago: 80, valor_entregue: 100 },
    ]);
    expect(component['validarPagamentosVenda']()).toBeTrue();
  });
  it('pagamento misto aplica PIX primeiro e devolve o excedente em dinheiro', () => {
    const component = venda(100);
    component.pagamentosEdicao = [
      { forma_pagamento: 'DINHEIRO', valor_informado: 100 },
      { forma_pagamento: 'PIX', valor_informado: 30 },
    ];
    expect(component['montarPagamentosVenda']()).toEqual([
      { forma_pagamento: 'PIX', valor_pago: 30, valor_entregue: 30 },
      { forma_pagamento: 'DINHEIRO', valor_pago: 70, valor_entregue: 100 },
    ]);
    expect(component.trocoPagamento).toBe(30);
  });
  it('não permite troco em PIX ou descarta dinheiro quando a venda já foi coberta', () => {
    const component = venda(100);
    component.pagamentosEdicao = [
      { forma_pagamento: 'PIX', valor_informado: 120 },
    ];
    expect(component['validarPagamentosVenda']()).toBeFalse();
    component.pagamentosEdicao = [
      { forma_pagamento: 'PIX', valor_informado: 100 },
      { forma_pagamento: 'DINHEIRO', valor_informado: 20 },
    ];
    expect(component['validarPagamentosVenda']()).toBeFalse();
  });
});
