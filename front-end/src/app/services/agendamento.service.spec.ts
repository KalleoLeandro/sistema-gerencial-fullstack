import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import { AgendamentoService } from './agendamento.service';

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
    ['cadastrar', [payload], 'POST', 'agendamento/cadastrar', payload],
    ['atualizar', [payload], 'PUT', 'agendamento/atualizar', payload],
    ['buscarPorId', [42], 'GET', 'agendamento/buscar-por-id/42'],
    ['listarPorPagina', [2, 25], 'GET', 'agendamento/listar?page=2&limit=25'],
    ['excluir', [42], 'DELETE', 'agendamento/excluir/42'],
  ].map(
    ([method, args, verb, path, body]) =>
      ({
        service: AgendamentoService,
        method,
        args,
        verb,
        path,
        body,
      }) as Contract,
  ),
];
describe('AgendamentoService HTTP contracts', () => {
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
  it('builds scheduling dates at local noon, preserving optional identity', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 13, 23, 59));
    try {
      const service = TestBed.inject(AgendamentoService);
      expect(
        service.montarPayload({
          titulo: null,
          tipoTarefa: null,
          data: null,
          detalhes: null,
        }),
      ).toEqual({
        titulo: '',
        tipo_tarefa: '',
        data_agendamento: '2026-10-13T12:00:00',
        detalhes: '',
        concluido: false,
      });
      expect(
        service.montarPayload(
          {
            titulo: 'Entrega',
            tipoTarefa: 'Visita',
            data: new Date(2026, 0, 2, 1),
            detalhes: 'ok',
          },
          42,
        ),
      ).toEqual({
        id: 42,
        titulo: 'Entrega',
        tipo_tarefa: 'Visita',
        data_agendamento: '2026-01-02T12:00:00',
        detalhes: 'ok',
        concluido: false,
      });
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
