import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { EmpresasService } from './empresas.service';

describe('EmpresasService', () => {
  let service: EmpresasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(EmpresasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('envia cadastro e atualizacao de empresa', () => {
    const form = new FormGroup({
      nome: new FormControl('ACME')
    });

    service.cadastrarEmpresa(form).subscribe();
    let request = httpMock.expectOne('/api/empresa/cadastrar');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ nome: 'ACME' });
    request.flush({});

    service.atualizarEmpresa(form).subscribe();
    request = httpMock.expectOne('/api/empresa/atualizar');
    expect(request.request.method).toBe('PUT');
    request.flush({});
  });

  it('consulta empresa por diferentes filtros e por id', () => {
    service.buscarEmpresasPorPagina(2, 10).subscribe();
    let request = httpMock.expectOne('/api/empresa/listar?page=2&limit=10');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarEmpresasPorPaginaENome(1, 5, 'Acme').subscribe();
    request = httpMock.expectOne('/api/empresa/listar-por-nome?page=1&limit=5&nome=Acme');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarPorId(9).subscribe();
    request = httpMock.expectOne('/api/empresa/buscar-por-id/9');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('envia exclusao e salvamento da infraestrutura', () => {
    service.excluirEmpresa(4).subscribe();
    let request = httpMock.expectOne('/api/empresa/excluir/4');
    expect(request.request.method).toBe('DELETE');
    request.flush({});

    service.salvarDadosInfra('rack principal', 4).subscribe();
    request = httpMock.expectOne('/api/empresa/salvar-infra/4');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe('rack principal');
    request.flush({});
  });

  it('propaga erros da API', () => {
    let capturedError: HttpErrorResponse | undefined;

    service.buscarPorId(12).subscribe({
      error: (error) => capturedError = error
    });

    const request = httpMock.expectOne('/api/empresa/buscar-por-id/12');
    request.flush({ message: 'falha' }, { status: 404, statusText: 'Not Found' });

    expect(capturedError?.status).toBe(404);
  });
});
