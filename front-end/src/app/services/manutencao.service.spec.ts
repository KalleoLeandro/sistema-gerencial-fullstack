import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { ManutencaoService } from './manutencao.service';

describe('ManutencaoService', () => {
  let service: ManutencaoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ManutencaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('executa as operacoes de manutencao', () => {
    const form = new FormGroup({
      descricao: new FormControl('Preventiva')
    });

    service.cadastrarManutencao(form).subscribe();
    let request = httpMock.expectOne('/api/manutencao/cadastrar');
    expect(request.request.method).toBe('POST');
    request.flush({});

    service.atualizarManutencao(form).subscribe();
    request = httpMock.expectOne('/api/manutencao/atualizar');
    expect(request.request.method).toBe('PUT');
    request.flush({});

    service.alterarStatusManutencao(2, 3, null as any).subscribe();
    request = httpMock.expectOne((req) => req.url === '/api/manutencao/alterar-status');
    expect(request.request.params.get('id')).toBe('2');
    expect(request.request.params.get('status')).toBe('3');
    expect(request.request.body).toEqual({ motivo_cancelamento: '' });
    request.flush({});

    service.buscarManutencoesPorPagina(1, 10, 8).subscribe();
    request = httpMock.expectOne('/api/manutencao/listar?page=1&limit=10&id=8');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarPorId(7).subscribe();
    request = httpMock.expectOne('/api/manutencao/buscar-por-id/7');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.excluirManutencao(4).subscribe();
    request = httpMock.expectOne('/api/manutencao/excluir/4');
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('propaga erros da API', () => {
    let capturedError: HttpErrorResponse | undefined;

    service.buscarPorId(88).subscribe({
      error: (error) => capturedError = error
    });

    const request = httpMock.expectOne('/api/manutencao/buscar-por-id/88');
    request.flush({ message: 'falha' }, { status: 422, statusText: 'Unprocessable Entity' });

    expect(capturedError?.status).toBe(422);
  });
});
