import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginService } from './login.service';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.BFF;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LoginService
      ]
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ---------------------------------------------------------------------
  // ✅ validarLogin
  // ---------------------------------------------------------------------
  it('deve chamar validarLogin (POST) com sucesso', () => {
    const mockResponse = { token: '123', userName: 'User', status: 200, message: 'Login Ok' };

    service.validarLogin('hashTest').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/validar-login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ hash: 'hashTest' });
    req.flush(mockResponse);
  });

  it('deve tratar erro em validarLogin', () => {
    service.validarLogin('hashTest').subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/validar-login`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  // ---------------------------------------------------------------------
  // ✅ validarToken
  // ---------------------------------------------------------------------
  it('deve chamar validarToken (POST) com sucesso', () => {
    service.validarToken().subscribe(res => {
      expect(res).toBeTrue();
    });

    const req = httpMock.expectOne(`${baseUrl}/validar-token`);
    expect(req.request.method).toBe('POST');
    req.flush(true);
  });

  it('deve tratar erro em validarToken', () => {
    service.validarToken().subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/validar-token`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  // ---------------------------------------------------------------------
  // ✅ getPerfil
  // ---------------------------------------------------------------------
  it('deve chamar getPerfil (POST) com sucesso', () => {
    service.getPerfil('token').subscribe(res => {
      expect(res).toBeTrue();
    });

    const req = httpMock.expectOne(`${baseUrl}/retorna-perfil`);
    expect(req.request.method).toBe('POST');
    req.flush(true);
  });

  it('deve tratar erro em getPerfil', () => {
    service.getPerfil('token').subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/retorna-perfil`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  // ---------------------------------------------------------------------
  // ✅ buscarUsuarioPorId
  // ---------------------------------------------------------------------
  it('deve chamar buscarUsuarioPorId (GET) com sucesso', () => {
    service.buscarUsuarioPorId(5).subscribe(res => {
      expect(res).toEqual({ id: 5 });
    });

    const req = httpMock.expectOne(`${baseUrl}/buscar-login-por-id/5`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 5 });
  });

  it('deve tratar erro em buscarUsuarioPorId', () => {
    service.buscarUsuarioPorId(5).subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/buscar-login-por-id/5`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  // ---------------------------------------------------------------------
  // ✅ atualizarUsuario
  // ---------------------------------------------------------------------
  it('deve chamar atualizarUsuario (PUT) com sucesso', () => {
    const mockForm: any = { getRawValue: () => ({ nome: 'Test' }) };

    service.atualizarUsuario(mockForm).subscribe(res => {
      expect(res).toEqual({});
    });

    const req = httpMock.expectOne(`${baseUrl}/atualizar-login`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nome: 'Test' });
    req.flush({});
  });

  it('deve tratar erro em atualizarUsuario', () => {
    const mockForm: any = { getRawValue: () => ({ nome: 'Test' }) };

    service.atualizarUsuario(mockForm).subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/atualizar-login`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  // ---------------------------------------------------------------------
  // ✅ cadastrarUsuario
  // ---------------------------------------------------------------------
  it('deve chamar cadastrarUsuario (POST) com sucesso', () => {
    const mockForm: any = { getRawValue: () => ({ nome: 'NovoUser' }) };

    service.cadastrarUsuario(mockForm).subscribe(res => {
      expect(res).toEqual({});
    });

    const req = httpMock.expectOne(`${baseUrl}/cadastrar-login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nome: 'NovoUser' });
    req.flush({});
  });

  it('deve tratar erro em cadastrarUsuario', () => {
    const mockForm: any = { getRawValue: () => ({ nome: 'NovoUser' }) };

    service.cadastrarUsuario(mockForm).subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/cadastrar-login`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  // ---------------------------------------------------------------------
  // ✅ buscarLoginsPorPagina
  // ---------------------------------------------------------------------
  it('deve chamar buscarLoginsPorPagina (GET) com sucesso', () => {
    service.buscarLoginsPorPagina(1, 10).subscribe(res => {
      expect(res).toEqual([]);
    });

    const req = httpMock.expectOne(`${baseUrl}/buscar-usuarios-por-pagina?page=1&limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve tratar erro em buscarLoginsPorPagina', () => {
    service.buscarLoginsPorPagina(1, 10).subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/buscar-usuarios-por-pagina?page=1&limit=10`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  // ---------------------------------------------------------------------
  // ✅ excluirUsuario
  // ---------------------------------------------------------------------
  it('deve chamar excluirUsuario (DELETE) com sucesso', () => {
    service.excluirUsuario(9).subscribe(res => {
      expect(res).toEqual({});
    });

    const req = httpMock.expectOne(`${baseUrl}/excluir-login/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('deve tratar erro em excluirUsuario', () => {
    service.excluirUsuario(9).subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/excluir-login/9`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });
});
