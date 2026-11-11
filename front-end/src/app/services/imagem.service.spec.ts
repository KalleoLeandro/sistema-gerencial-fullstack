import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import { ImagemService } from './imagem.service';

type Contract = {
  service: any;
  method: string;
  args: any[];
  verb: string;
  path: string;
  body?: any;
};
const contracts: Contract[] = [
  {
    service: ImagemService,
    method: 'listar',
    args: ['PRODUTO', 42, 'foto & capa'],
    verb: 'GET',
    path: 'imagens/listar?entityType=PRODUTO&entityId=42&categoria=foto%20%26%20capa',
  },
  {
    service: ImagemService,
    method: 'listar',
    args: ['PRODUTO', 42],
    verb: 'GET',
    path: 'imagens/listar?entityType=PRODUTO&entityId=42',
  },
  {
    service: ImagemService,
    method: 'excluir',
    args: ['abc'],
    verb: 'DELETE',
    path: 'imagens/abc',
  },
];
describe('ImagemService HTTP contracts', () => {
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
  for (const principal of [undefined, true, false]) {
    it(`uploads image bytes and optional principal=${principal}`, () => {
      const service = TestBed.inject(ImagemService);
      const arquivo = new File(['photo'], 'photo.png', { type: 'image/png' });
      service
        .upload({
          entityType: 'PRODUTO',
          entityId: 42,
          categoria: 'CAPA',
          arquivo,
          principal,
        })
        .subscribe();
      const req = http.expectOne(`${environment.apiUrl}/imagens/upload`);
      const form = req.request.body as FormData;
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      expect(req.request.headers.has('Content-Type')).toBeFalse();
      expect(form.get('arquivo')).toBe(arquivo);
      expect(form.get('entityId')).toBe('42');
      expect(form.get('categoria')).toBe('CAPA');
      expect(form.get('principal')).toBe(
        principal === undefined ? null : String(principal),
      );
      req.flush({ id: 'abc' });
      expect(service.urlConteudo('abc')).toBe(
        `${environment.apiUrl}/imagens/abc/conteudo`,
      );
    });
  }
});
