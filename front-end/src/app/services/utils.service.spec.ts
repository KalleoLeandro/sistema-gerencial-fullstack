import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UtilsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve formatar datas no padrao esperado', () => {
    const data = new Date(2026, 2, 21, 9, 5);

    expect(service.formatarDatas(data)).toBe('21/03/2026 09:05');
  });

  it('deve consultar endereco por cep', () => {
    service.buscarEnderecoPorCep('01001000').subscribe((response) => {
      expect(response.cep).toBe('01001-000');
    });

    const request = httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
    expect(request.request.method).toBe('GET');
    request.flush({ cep: '01001-000' });
  });

  it('deve propagar erro na consulta de CEP', () => {
    let capturedError: HttpErrorResponse | undefined;

    service.buscarEnderecoPorCep('00000000').subscribe({
      error: (error) => capturedError = error
    });

    const request = httpMock.expectOne('https://viacep.com.br/ws/00000000/json/');
    request.flush({ message: 'falha' }, { status: 500, statusText: 'Server Error' });

    expect(capturedError?.status).toBe(500);
  });
});
