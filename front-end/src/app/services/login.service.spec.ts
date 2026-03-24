import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { LoginService } from './login.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('deve enviar o formulario para validar login com credentials', () => {
    const form = new FormGroup({
      login: new FormControl('maria'),
      senha: new FormControl('123'),
    });

    service.validarLogin(form).subscribe();

    const request = httpMock.expectOne('/api/login/validar-login');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body).toEqual({ login: 'maria', senha: '123' });
    request.flush({ userName: 'Maria', perfil: 'ADMIN' });
  });

  it('deve buscar usuarios paginados', () => {
    service.buscarLoginsPorPagina(10, 2).subscribe();

    const request = httpMock.expectOne('/api/login/listar?page=2&limit=10');
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], total: 0 });
  });

  it('deve executar os demais endpoints de login', () => {
    const form = new FormGroup({
      nome: new FormControl('Maria'),
      login: new FormControl('maria'),
      senha: new FormControl('123'),
      perfil: new FormControl('ADMIN')
    });

    service.refreshToken().subscribe();
    let request = httpMock.expectOne('/api/login/refresh');
    expect(request.request.method).toBe('POST');
    request.flush({});

    service.logout().subscribe();
    request = httpMock.expectOne('/api/login/logout');
    expect(request.request.method).toBe('POST');
    request.flush({});

    service.validarToken().subscribe();
    request = httpMock.expectOne('/api/login/validar-token');
    expect(request.request.method).toBe('POST');
    request.flush(true);

    service.getPerfil().subscribe();
    request = httpMock.expectOne('/api/login/retorna-perfil');
    expect(request.request.method).toBe('GET');
    request.flush({ role: 'ADMIN' });

    service.cadastrarUsuario(form).subscribe();
    request = httpMock.expectOne('/api/login/cadastrar');
    expect(request.request.method).toBe('POST');
    request.flush({});

    service.atualizarUsuario(form).subscribe();
    request = httpMock.expectOne('/api/login/atualizar');
    expect(request.request.method).toBe('PUT');
    request.flush({});

    service.buscarPorId(3).subscribe();
    request = httpMock.expectOne('/api/login/buscar-por-id/3');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarPorToken().subscribe();
    request = httpMock.expectOne('/api/login/buscar-por-token');
    expect(request.request.method).toBe('GET');
    request.flush({});

    service.buscarPorNome('Maria').subscribe();
    request = httpMock.expectOne('/api/login/buscar-por-nome?nome=Maria');
    expect(request.request.method).toBe('GET');
    request.flush([]);

    service.buscarTodos().subscribe();
    request = httpMock.expectOne('/api/login/listar-todos');
    expect(request.request.method).toBe('GET');
    request.flush([]);

    service.excluirLogin(4).subscribe();
    request = httpMock.expectOne('/api/login/excluir/4');
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('deve persistir e limpar metadados da sessao', () => {
    service.persistSessionMetadata({ userName: 'Maria', perfil: 'DEV' });

    expect(sessionStorage.getItem('userName')).toBe('Maria');
    expect(sessionStorage.getItem('perfil')).toBe('DEV');

    service.clearSessionMetadata();

    expect(sessionStorage.getItem('userName')).toBeNull();
    expect(sessionStorage.getItem('perfil')).toBeNull();
  });

  it('deve reutilizar role quando perfil nao vier na resposta', () => {
    service.persistSessionMetadata({ userName: 'Joao', role: 'COMERCIAL' });

    expect(sessionStorage.getItem('userName')).toBe('Joao');
    expect(sessionStorage.getItem('perfil')).toBe('COMERCIAL');
  });

  it('deve reaproveitar dados ja salvos quando a resposta vier parcial', () => {
    sessionStorage.setItem('userName', 'Ana');
    sessionStorage.setItem('perfil', 'USER');

    service.persistSessionMetadata({});

    expect(sessionStorage.getItem('userName')).toBe('Ana');
    expect(sessionStorage.getItem('perfil')).toBe('USER');
  });

  it('deve limpar metadados para string vazia quando nao houver fallback', () => {
    service.persistSessionMetadata({});

    expect(sessionStorage.getItem('userName')).toBe('');
    expect(sessionStorage.getItem('perfil')).toBe('');
  });

  it('deve propagar erro de autenticacao', () => {
    let capturedError: HttpErrorResponse | undefined;
    const form = new FormGroup({
      login: new FormControl('maria'),
      senha: new FormControl('123'),
    });

    service.validarLogin(form).subscribe({
      error: (error) => capturedError = error
    });

    const request = httpMock.expectOne('/api/login/validar-login');
    request.flush({ message: 'nao autorizado' }, { status: 401, statusText: 'Unauthorized' });

    expect(capturedError?.status).toBe(401);
  });
});
