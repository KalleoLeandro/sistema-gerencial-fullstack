import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import { ComercialService } from './comercial.service';

type Contract = {
  service: any;
  method: string;
  args: any[];
  verb: string;
  path: string;
  body?: any;
};
const payload = { nome: 'Item', valor: 123 };
const contracts: Contract[] = [
  ...[
    [
      'buscarOrcamentoPorOrigem',
      ['ATENDIMENTO', 42],
      'GET',
      'orcamentos/buscar-por-origem?origemTipo=ATENDIMENTO&origemId=42',
    ],
    ['buscarOrcamentoPorId', [42], 'GET', 'orcamentos/buscar-por-id/42'],
    [
      'listarOrcamentos',
      [2, 25, 'A & B'],
      'GET',
      'orcamentos/listar?page=2&limit=25&pesquisa=A%20%26%20B',
    ],
    [
      'listarOrcamentos',
      [1, 10],
      'GET',
      'orcamentos/listar?page=1&limit=10&pesquisa=',
    ],
    ['criarOrcamentoPdv', [payload], 'POST', 'orcamentos/criar-pdv', payload],
    ['criarOrcamentoPdv', [], 'POST', 'orcamentos/criar-pdv', {}],
    ['criarOrcamento', [payload], 'POST', 'orcamentos/criar', payload],
    ['criarOrcamento', [], 'POST', 'orcamentos/criar', {}],
    ['atualizarItens', [payload], 'PUT', 'orcamentos/atualizar-itens', payload],
    [
      'aprovarOrcamento',
      [payload],
      'POST',
      'vendas/aprovar-orcamento',
      payload,
    ],
    ['rejeitarOrcamento', [payload], 'PUT', 'orcamentos/rejeitar', payload],
    ['reabrirOrcamento', [payload], 'PUT', 'orcamentos/reabrir', payload],
    ['buscarVendaPorId', [42], 'GET', 'vendas/buscar-por-id/42'],
    ['atualizarVenda', [payload], 'PUT', 'vendas/atualizar', payload],
    [
      'listarVendas',
      [2, 25, 'A & B'],
      'GET',
      'vendas/listar?page=2&limit=25&pesquisa=A%20%26%20B',
    ],
    ['listarVendas', [1, 10], 'GET', 'vendas/listar?page=1&limit=10&pesquisa='],
    [
      'buscarClientePorDocumento',
      ['123/456'],
      'GET',
      'clientes/buscar-por-documento?documento=123%2F456',
    ],
    ['buscarCliente', ['A & B'], 'GET', 'clientes/buscar?termo=A%20%26%20B'],
    ['buscarResumoCaixaDia', [], 'GET', 'caixa/resumo-dia'],
    ['fecharCaixa', [payload], 'POST', 'caixa/fechar', payload],
  ].map(
    ([method, args, verb, path, body]) =>
      ({
        service: ComercialService,
        method,
        args,
        verb,
        path,
        body,
      }) as Contract,
  ),
];
describe('ComercialService HTTP contracts', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  for (const contract of contracts) {
    const { service, method, args, verb, path, body } = contract;
    const url = `${environment.apiUrl}/${path}`;
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
      (TestBed.inject(service) as any)
        [method](...args)
        .subscribe({ error: received });
      http
        .expectOne(url)
        .flush({ message: 'failure' }, { status: 500, statusText: 'Failure' });
      expect(received.calls.mostRecent().args[0].status).toBe(500);
    });
  }
  it('formats valid dates and rejects absent or invalid dates', () => {
    const service = TestBed.inject(ComercialService);
    expect(service.formatarData(new Date(2026, 9, 13))).toBe('13/10/2026');
    for (const date of [null, undefined, '', 'invalid'])
      expect(service.formatarData(date)).toBeNull();
  });
});
