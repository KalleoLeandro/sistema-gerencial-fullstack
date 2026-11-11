import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '@environments/environment';

import { AuthService } from './auth.service';
import { authInterceptor } from 'app/interceptors/auth.interceptor';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.BFF;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        AuthService
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve chamar validarAuth (POST) com sucesso', () => {
    const mockForm: any = { getRawValue: () => ({ login: 'user', senha: '123' }) };
    const mockResponse = { userName: 'User', perfil: 'admin', status: 200, expiration: '2026-03-23T12:00:00' };

    service.validarAuth(mockForm).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({ hash: jasmine.any(String) }));
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockResponse);
  });

  it('deve tratar erro em validarAuth', () => {
    const mockForm: any = { getRawValue: () => ({ login: 'user', senha: '123' }) };

    service.validarAuth(mockForm).subscribe({
      error: err => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne(`${baseUrl}/auth/login`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('deve chamar refresh (POST) com sucesso', () => {
    const mockResponse = { userName: 'User', perfil: 'admin', status: 200 };

    service.refresh().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockResponse);
  });

  it('deve chamar me (GET) com sucesso', () => {
    const mockResponse = { valid: true, userName: 'User', perfil: 'admin' };

    service.me().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/auth/me`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockResponse);
  });

  it('deve chamar logout (POST) com sucesso', () => {
    service.logout().subscribe(res => {
      expect(res).toEqual({ message: 'Logout realizado com sucesso' });
    });

    const req = httpMock.expectOne(`${baseUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ message: 'Logout realizado com sucesso' });
  });
});
