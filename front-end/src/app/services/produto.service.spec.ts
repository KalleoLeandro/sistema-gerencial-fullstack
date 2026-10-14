import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import { ProdutoService } from './produto.service';

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
  ...([ProdutoService] as any[]).flatMap((service) => {
    const path = service === ProdutoService ? 'produtos' : 'servicos';
    return [
      {
        service,
        method: 'cadastrar',
        args: [payload],
        verb: 'POST',
        path: `${path}/cadastrar`,
        body: payload,
      },
      {
        service,
        method: 'atualizar',
        args: [payload],
        verb: 'PUT',
        path: `${path}/atualizar`,
        body: payload,
      },
      {
        service,
        method: 'listar',
        args: [2, 25],
        verb: 'GET',
        path: `${path}/listar?page=2&limit=25`,
      },
      {
        service,
        method: 'listarAtivos',
        args: [],
        verb: 'GET',
        path: `${path}/listar-ativos`,
      },
      {
        service,
        method: 'buscarPorId',
        args: [42],
        verb: 'GET',
        path: `${path}/buscar-por-id/42`,
      },
      {
        service,
        method: 'excluir',
        args: [42],
        verb: 'DELETE',
        path: `${path}/excluir/42`,
      },
    ];
  }),
  {
    service: ProdutoService,
    method: 'listarEmFalta',
    args: [],
    verb: 'GET',
    path: 'produtos/listar-em-falta',
  },
];
describe('ProdutoService HTTP contracts', () => {
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
});
