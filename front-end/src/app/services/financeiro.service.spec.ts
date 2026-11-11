import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import { FinanceiroService } from './financeiro.service';

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
      'listar',
      [{ pesquisa: 'A & B', status: '', tipo: null }, 2, 25],
      'GET',
      'financeiro/contas?pesquisa=A%20%26%20B&page=2&limit=25',
    ],
    ['detalhes', ['MANUAL', 42], 'GET', 'financeiro/contas/MANUAL/42'],
    ['criar', [payload], 'POST', 'financeiro/contas', payload],
    ['atualizar', [42, payload], 'PUT', 'financeiro/contas/42', payload],
    ['cancelar', [42], 'POST', 'financeiro/contas/42/cancelar', {}],
    [
      'baixar',
      ['MANUAL', 42, payload],
      'POST',
      'financeiro/contas/MANUAL/42/baixas',
      payload,
    ],
    ['relatorio', [{}], 'GET', 'financeiro/relatorios'],
  ].map(
    ([method, args, verb, path, body]) =>
      ({
        service: FinanceiroService,
        method,
        args,
        verb,
        path,
        body,
      }) as Contract,
  ),
];
describe('FinanceiroService HTTP contracts', () => {
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
    const url = `${environment.BFF}/${path}`;
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
});
