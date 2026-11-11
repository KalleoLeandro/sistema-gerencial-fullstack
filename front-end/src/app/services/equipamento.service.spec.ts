import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '@environments/environment';

import { EquipamentoService } from './equipamento.service';

describe('EquipamentoService', () => {
  let service: EquipamentoService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(EquipamentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('executa as operacoes de equipamento', () => {
    const form = new FormGroup({
      patrimonio: new FormControl('ABC')
    });

    service.cadastrarEquipamento(form).subscribe();
    let request = httpMock.expectOne(`${apiUrl}/equipamento/cadastrar`);
    expect(request.request.method).toBe('POST');
    request.flush({});

    service.buscarEquipamentosPorPagina(1, 10, 4).subscribe();
    request = httpMock.expectOne(`${apiUrl}/equipamento/listar?page=1&limit=10&id_empresa=4`);
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarEquipamentoPorId(5).subscribe();
    request = httpMock.expectOne(`${apiUrl}/equipamento/buscar-por-id/5`);
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.atualizarEquipamento(form).subscribe();
    request = httpMock.expectOne(`${apiUrl}/equipamento/atualizar`);
    expect(request.request.method).toBe('PUT');
    request.flush({});

    service.excluirEquipamento(6).subscribe();
    request = httpMock.expectOne(`${apiUrl}/equipamento/excluir/6`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('propaga erros da API', () => {
    let capturedError: HttpErrorResponse | undefined;

    service.buscarEquipamentoPorId(14).subscribe({
      error: (error) => capturedError = error
    });

    const request = httpMock.expectOne(`${apiUrl}/equipamento/buscar-por-id/14`);
    request.flush({ message: 'falha' }, { status: 500, statusText: 'Server Error' });

    expect(capturedError?.status).toBe(500);
  });
});
