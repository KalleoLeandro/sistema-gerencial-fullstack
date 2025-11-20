import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UtilsService } from './utils.service';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

describe('UtilsService', () => {
  let service: UtilsService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.BFF;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UtilsService
      ]
    });

    service = TestBed.inject(UtilsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve chamar validarCpf com método POST', () => {
    const mockResponse = { valido: true };

    service.validarCpf('12345678900').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/validar-cpf`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ cpf: '12345678900' });
    req.flush(mockResponse);
  });

  it('deve retornar erro ao validarCpf', () => {
    service.validarCpf('12345678900').subscribe({
      next: () => fail('Era esperado erro, mas veio sucesso'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/validar-cpf`);
    expect(req.request.method).toBe('POST');
    req.flush('Erro', { status: 400, statusText: 'Bad Request' });
  });
});
