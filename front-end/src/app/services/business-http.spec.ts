import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import { ComercialService } from './comercial.service';
import { ProdutoService } from './produto.service';
import { ServicoComercialService } from './servico-comercial.service';
import { FinanceiroService } from './financeiro.service';
import { AgendamentoService } from './agendamento.service';
import { ImagemService } from './imagem.service';

type Contract = { service: any; method: string; args: any[]; verb: string; path: string; body?: any };
const payload = { nome: 'Item', valor: 123 };
const contracts: Contract[] = [
  ...[ProdutoService, ServicoComercialService].flatMap(service => {
    const path = service === ProdutoService ? 'produtos' : 'servicos';
    return [
      { service, method: 'cadastrar', args: [payload], verb: 'POST', path: `${path}/cadastrar`, body: payload },
      { service, method: 'atualizar', args: [payload], verb: 'PUT', path: `${path}/atualizar`, body: payload },
      { service, method: 'listar', args: [2, 25], verb: 'GET', path: `${path}/listar?page=2&limit=25` },
      { service, method: 'listarAtivos', args: [], verb: 'GET', path: `${path}/listar-ativos` },
      { service, method: 'buscarPorId', args: [42], verb: 'GET', path: `${path}/buscar-por-id/42` },
      { service, method: 'excluir', args: [42], verb: 'DELETE', path: `${path}/excluir/42` },
    ];
  }),
  { service: ProdutoService, method: 'listarEmFalta', args: [], verb: 'GET', path: 'produtos/listar-em-falta' },
  ...[
    ['buscarOrcamentoPorOrigem', ['ATENDIMENTO', 42], 'GET', 'orcamentos/buscar-por-origem?origemTipo=ATENDIMENTO&origemId=42'],
    ['buscarOrcamentoPorId', [42], 'GET', 'orcamentos/buscar-por-id/42'],
    ['listarOrcamentos', [2, 25, 'A & B'], 'GET', 'orcamentos/listar?page=2&limit=25&pesquisa=A%20%26%20B'],
    ['listarOrcamentos', [1, 10], 'GET', 'orcamentos/listar?page=1&limit=10&pesquisa='],
    ['criarOrcamentoPdv', [payload], 'POST', 'orcamentos/criar-pdv', payload],
    ['criarOrcamentoPdv', [], 'POST', 'orcamentos/criar-pdv', {}],
    ['criarOrcamento', [payload], 'POST', 'orcamentos/criar', payload],
    ['criarOrcamento', [], 'POST', 'orcamentos/criar', {}],
    ['atualizarItens', [payload], 'PUT', 'orcamentos/atualizar-itens', payload],
    ['aprovarOrcamento', [payload], 'POST', 'vendas/aprovar-orcamento', payload],
    ['rejeitarOrcamento', [payload], 'PUT', 'orcamentos/rejeitar', payload],
    ['reabrirOrcamento', [payload], 'PUT', 'orcamentos/reabrir', payload],
    ['buscarVendaPorId', [42], 'GET', 'vendas/buscar-por-id/42'],
    ['atualizarVenda', [payload], 'PUT', 'vendas/atualizar', payload],
    ['listarVendas', [2, 25, 'A & B'], 'GET', 'vendas/listar?page=2&limit=25&pesquisa=A%20%26%20B'],
    ['listarVendas', [1, 10], 'GET', 'vendas/listar?page=1&limit=10&pesquisa='],
    ['buscarClientePorDocumento', ['123/456'], 'GET', 'clientes/buscar-por-documento?documento=123%2F456'],
    ['buscarCliente', ['A & B'], 'GET', 'clientes/buscar?termo=A%20%26%20B'],
    ['buscarResumoCaixaDia', [], 'GET', 'caixa/resumo-dia'],
    ['fecharCaixa', [payload], 'POST', 'caixa/fechar', payload],
  ].map(([method, args, verb, path, body]) => ({ service: ComercialService, method, args, verb, path, body }) as Contract),
  ...[
    ['cadastrar', [payload], 'POST', 'agendamento/cadastrar', payload],
    ['atualizar', [payload], 'PUT', 'agendamento/atualizar', payload],
    ['buscarPorId', [42], 'GET', 'agendamento/buscar-por-id/42'],
    ['listarPorPagina', [2, 25], 'GET', 'agendamento/listar?page=2&limit=25'],
    ['excluir', [42], 'DELETE', 'agendamento/excluir/42'],
  ].map(([method, args, verb, path, body]) => ({ service: AgendamentoService, method, args, verb, path, body }) as Contract),
  ...[
    ['listar', [{ pesquisa: 'A & B', status: '', tipo: null }, 2, 25], 'GET', 'financeiro/contas?pesquisa=A%20%26%20B&page=2&limit=25'],
    ['detalhes', ['MANUAL', 42], 'GET', 'financeiro/contas/MANUAL/42'],
    ['criar', [payload], 'POST', 'financeiro/contas', payload],
    ['atualizar', [42, payload], 'PUT', 'financeiro/contas/42', payload],
    ['cancelar', [42], 'POST', 'financeiro/contas/42/cancelar', {}],
    ['baixar', ['MANUAL', 42, payload], 'POST', 'financeiro/contas/MANUAL/42/baixas', payload],
    ['relatorio', [{}], 'GET', 'financeiro/relatorios'],
  ].map(([method, args, verb, path, body]) => ({ service: FinanceiroService, method, args, verb, path, body }) as Contract),
  { service: ImagemService, method: 'listar', args: ['PRODUTO', 42, 'foto & capa'], verb: 'GET', path: 'imagens/listar?entityType=PRODUTO&entityId=42&categoria=foto%20%26%20capa' },
  { service: ImagemService, method: 'listar', args: ['PRODUTO', 42], verb: 'GET', path: 'imagens/listar?entityType=PRODUTO&entityId=42' },
  { service: ImagemService, method: 'excluir', args: ['abc'], verb: 'DELETE', path: 'imagens/abc' },
];

describe('Business HTTP contracts', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  for (const contract of contracts) {
    const { service, method, args, verb, path, body } = contract;
    const url = `${service === FinanceiroService ? environment.BFF : environment.apiUrl}/${path}`;
    it(`${service.name}.${method} sends ${verb} ${path} with cookies`, () => {
      const instance: any = TestBed.inject(service);
      const received = jasmine.createSpy('received');
      instance[method](...args).subscribe(received);
      const req = http.expectOne(url);
      expect(req.request.method).toBe(verb);
      expect(req.request.withCredentials).toBeTrue();
      if (body !== undefined) expect(req.request.body).toEqual(body);
      req.flush({ id: 42 });
      expect(received).toHaveBeenCalledWith({ id: 42 });
    });
    it(`${service.name}.${method} exposes backend errors`, () => {
      const received = jasmine.createSpy('error');
      (TestBed.inject(service) as any)[method](...args).subscribe({ error: received });
      http.expectOne(url).flush({ message: 'failure' }, { status: 500, statusText: 'Failure' });
      expect(received.calls.mostRecent().args[0].status).toBe(500);
    });
  }
  it('formats valid dates and rejects absent or invalid dates', () => {
    const service = TestBed.inject(ComercialService);
    expect(service.formatarData(new Date(2026, 9, 13))).toBe('13/10/2026');
    for (const date of [null, undefined, '', 'invalid']) expect(service.formatarData(date)).toBeNull();
  });
  it('builds scheduling dates at local noon, preserving optional identity', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 13, 23, 59));
    try {
      const service = TestBed.inject(AgendamentoService);
      expect(service.montarPayload({ titulo: null, tipoTarefa: null, data: null, detalhes: null })).toEqual({ titulo: '', tipo_tarefa: '', data_agendamento: '2026-10-13T12:00:00', detalhes: '', concluido: false });
      expect(service.montarPayload({ titulo: 'Entrega', tipoTarefa: 'Visita', data: new Date(2026, 0, 2, 1), detalhes: 'ok' }, 42)).toEqual({ id: 42, titulo: 'Entrega', tipo_tarefa: 'Visita', data_agendamento: '2026-01-02T12:00:00', detalhes: 'ok', concluido: false });
    } finally { jasmine.clock().uninstall(); }
  });
  for (const principal of [undefined, true, false]) {
    it(`uploads image bytes and optional principal=${principal}`, () => {
      const service = TestBed.inject(ImagemService);
      const arquivo = new File(['photo'], 'photo.png', { type: 'image/png' });
      service.upload({ entityType: 'PRODUTO', entityId: 42, categoria: 'CAPA', arquivo, principal }).subscribe();
      const req = http.expectOne(`${environment.apiUrl}/imagens/upload`);
      const form = req.request.body as FormData;
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      expect(req.request.headers.has('Content-Type')).toBeFalse();
      expect(form.get('arquivo')).toBe(arquivo);
      expect(form.get('entityId')).toBe('42');
      expect(form.get('categoria')).toBe('CAPA');
      expect(form.get('principal')).toBe(principal === undefined ? null : String(principal));
      req.flush({ id: 'abc' });
      expect(service.urlConteudo('abc')).toBe(`${environment.apiUrl}/imagens/abc/conteudo`);
    });
  }
});
