import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginService } from '@services/login.service';
import { authInterceptor } from './auth.interceptor';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subject, throwError } from 'rxjs';

describe('authInterceptor', () => {
  it('deve adicionar withCredentials na requisicao', (done) => {
    const loginServiceSpy = jasmine.createSpyObj<LoginService>('LoginService', [
      'isLogoutRequested',
      'refreshToken',
      'persistSessionMetadata',
      'clearSessionMetadata',
    ]);
    loginServiceSpy.isLogoutRequested.and.returnValue(false);

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const req = new HttpRequest('GET', '/teste');

      const next: HttpHandlerFn = (request) => {
        expect(request.withCredentials).toBeTrue();
        return of({} as HttpEvent<any>);
      };

      authInterceptor(req, next).subscribe(() => {
        done();
      });
    });
  });
});

describe('Session recovery interceptor', () => {
  let login: any;
  let router: any;
  beforeEach(() => {
    login = jasmine.createSpyObj('Login', [
      'validarToken',
      'refreshToken',
      'isLogoutRequested',
      'clearLogoutRequested',
      'persistSessionMetadata',
      'clearSessionMetadata',
    ]);
    login.isLogoutRequested.and.returnValue(false);
    login.refreshToken.and.returnValue(of({ userName: 'Admin' }));
    router = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    router.createUrlTree.and.callFake((path: any) => ({ path }));
    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: login },
        { provide: Router, useValue: router },
      ],
    });
  });
  for (const url of [
    '/login/validar-login',
    '/login/validar-token',
    '/login/refresh',
    '/login/logout',
    '/login/buscar-por-token',
    '/login/retorna-perfil',
    '/auth/login',
    '/auth/refresh',
  ])
    it(`does not refresh authentication endpoint ${url}`, () => {
      let received: any;
      const error = new HttpErrorResponse({ status: 401 });
      TestBed.runInInjectionContext(() =>
        authInterceptor(new HttpRequest('GET', url), () =>
          throwError(() => error),
        ),
      ).subscribe({ error: (value) => (received = value) });
      expect(received).toBe(error);
      expect(login.refreshToken).not.toHaveBeenCalled();
    });
  it('does not refresh server failures or a logged out session', () => {
    for (const status of [500, 401]) {
      login.isLogoutRequested.and.returnValue(status === 401);
      const error = new HttpErrorResponse({ status });
      let received: any;
      TestBed.runInInjectionContext(() =>
        authInterceptor(new HttpRequest('GET', '/produtos'), () =>
          throwError(() => error),
        ),
      ).subscribe({ error: (value) => (received = value) });
      expect(received).toBe(error);
    }
    expect(login.refreshToken).not.toHaveBeenCalled();
    expect(login.clearSessionMetadata).toHaveBeenCalled();
  });
  it('refreshes once for concurrent expired requests and retries with credentials', () => {
    const pending = new Subject<any>();
    login.refreshToken.and.returnValue(pending);
    const next = jasmine.createSpy().and.returnValues(
      throwError(() => new HttpErrorResponse({ status: 401 })),
      of(new HttpResponse({ body: 'ok' })),
    );
    const next2 = jasmine.createSpy().and.returnValues(
      throwError(() => new HttpErrorResponse({ status: 401 })),
      of(new HttpResponse({ body: 'ok2' })),
    );
    let first: any;
    let second: any;
    TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('GET', '/produtos'), next),
    ).subscribe((value) => (first = value));
    TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('GET', '/vendas'), next2),
    ).subscribe((value) => (second = value));
    expect(login.refreshToken).toHaveBeenCalledTimes(1);
    pending.next({ userName: 'Admin' });
    pending.complete();
    expect(first.body).toBe('ok');
    expect(second.body).toBe('ok2');
    expect(next.calls.mostRecent().args[0].withCredentials).toBeTrue();
  });
  it('clears metadata and redirects after failed refresh', () => {
    const failure = new Error('expired');
    login.refreshToken.and.returnValue(throwError(() => failure));
    let received: any;
    TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('GET', '/produtos'), () =>
        throwError(() => new HttpErrorResponse({ status: 401 })),
      ),
    ).subscribe({ error: (value) => (received = value) });
    expect(received).toBe(failure);
    expect(login.clearSessionMetadata).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
