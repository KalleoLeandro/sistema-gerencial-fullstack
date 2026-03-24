import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { AvulsoService } from './avulso.service';

describe('AvulsoService', () => {
  let service: AvulsoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AvulsoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('executa as operacoes de avulso', () => {
    const form = new FormGroup({
      descricao: new FormControl('Avulso')
    });

    service.cadastrarAvulso(form).subscribe();
    let request = httpMock.expectOne('/api/avulso/cadastrar');
    expect(request.request.method).toBe('POST');
    request.flush({});

    service.buscarAvulsosPorPagina(1, 10).subscribe();
    request = httpMock.expectOne('/api/avulso/listar?page=1&limit=10');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarAvulsosAtributoEPorPagina(2, 5, 'abc', 'nome').subscribe();
    request = httpMock.expectOne('/api/avulso/listar-com-pesquisa?page=2&limit=5&pesquisa=abc&tipoConsulta=nome');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarPorId(3).subscribe();
    request = httpMock.expectOne('/api/avulso/buscar-por-id/3');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.atualizarAvulso(form).subscribe();
    request = httpMock.expectOne('/api/avulso/atualizar');
    expect(request.request.method).toBe('PUT');
    request.flush({});

    service.alterarStatusAtendimento(3, 4, null as any).subscribe();
    request = httpMock.expectOne((req) => req.url === '/api/avulso/alterar-status');
    expect(request.request.params.get('id')).toBe('3');
    expect(request.request.params.get('status')).toBe('4');
    expect(request.request.body).toEqual({ motivo_cancelamento: '' });
    request.flush({});

    service.excluirAvulso(2).subscribe();
    request = httpMock.expectOne('/api/avulso/excluir/2');
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('propaga erros da API', () => {
    let capturedError: HttpErrorResponse | undefined;

    service.buscarPorId(33).subscribe({
      error: (error) => capturedError = error
    });

    const request = httpMock.expectOne('/api/avulso/buscar-por-id/33');
    request.flush({ message: 'falha' }, { status: 400, statusText: 'Bad Request' });

    expect(capturedError?.status).toBe(400);
  });
});
