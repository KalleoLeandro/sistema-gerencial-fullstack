import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '@environments/environment';

import { AtendimentoService } from './atendimento.service';

describe('AtendimentoService', () => {
  let service: AtendimentoService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AtendimentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('executa as operacoes do atendimento com credenciais', () => {
    const form = new FormGroup({
      descricao: new FormControl('Chamado')
    });

    service.cadastrarAtendimento(form).subscribe();
    let request = httpMock.expectOne(`${apiUrl}/atendimento/cadastrar`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ descricao: 'Chamado' });
    expect(request.request.withCredentials).toBeTrue();
    request.flush({});

    service.atualizarAtendimento(form).subscribe();
    request = httpMock.expectOne(`${apiUrl}/atendimento/atualizar`);
    expect(request.request.method).toBe('PUT');
    request.flush({});

    service.alterarStatusAtendimento(4, 2, null as any).subscribe();
    request = httpMock.expectOne((req) => req.url === `${apiUrl}/atendimento/alterar-status`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.params.get('id')).toBe('4');
    expect(request.request.params.get('status')).toBe('2');
    expect(request.request.body).toEqual({ motivo_cancelamento: '' });
    request.flush({});

    service.buscarAtendimentosPorPagina(2, 10, 8).subscribe();
    request = httpMock.expectOne(`${apiUrl}/atendimento/listar?page=2&limit=10&id=8`);
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarPorId(9).subscribe();
    request = httpMock.expectOne(`${apiUrl}/atendimento/buscar-por-id/9`);
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.excluirHistoricoAtendimento(7).subscribe();
    request = httpMock.expectOne(`${apiUrl}/atendimento/excluir/7`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('propaga erros da API', () => {
    let capturedError: HttpErrorResponse | undefined;

    service.buscarPorId(99).subscribe({
      error: (error) => capturedError = error
    });

    const request = httpMock.expectOne(`${apiUrl}/atendimento/buscar-por-id/99`);
    request.flush({ message: 'falha' }, { status: 500, statusText: 'Server Error' });

    expect(capturedError?.status).toBe(500);
  });
});
