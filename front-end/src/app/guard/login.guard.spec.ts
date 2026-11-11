import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { LoginService } from '@services/login.service';
import { loginGuard } from './login.guard';
import { authGuard } from './auth.guard';

describe('loginGuard', () => {
  let loginService: jasmine.SpyObj<LoginService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', [
      'validarToken',
      'refreshToken',
      'persistSessionMetadata',
      'clearSessionMetadata',
      'isLogoutRequested',
      'clearLogoutRequested',
    ]);
    loginService.isLogoutRequested.and.returnValue(false);

    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: loginService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('redireciona para dashboard quando o token e valido', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.validarToken.and.returnValue(of(true));

    const result$ = TestBed.runInInjectionContext(() =>
      loginGuard({} as any, {} as any),
    ) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(result).toBe(tree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
      done();
    });
  });

  it('permite acessar login quando o logout foi solicitado localmente', (done) => {
    loginService.isLogoutRequested.and.returnValue(true);

    const result$ = TestBed.runInInjectionContext(() =>
      loginGuard({} as any, {} as any),
    ) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(result).toBeTrue();
      expect(loginService.clearSessionMetadata).toHaveBeenCalled();
      expect(loginService.clearLogoutRequested).toHaveBeenCalled();
      expect(loginService.validarToken).not.toHaveBeenCalled();
      done();
    });
  });

  it('permite acessar login quando token e refresh falham', (done) => {
    loginService.validarToken.and.returnValue(of(false));
    loginService.refreshToken.and.returnValue(
      throwError(() => new Error('sem sessao')),
    );

    const result$ = TestBed.runInInjectionContext(() =>
      loginGuard({} as any, {} as any),
    ) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(result).toBeTrue();
      expect(loginService.clearSessionMetadata).toHaveBeenCalled();
      done();
    });
  });

  it('redireciona para dashboard quando consegue renovar a sessao', (done) => {
    const tree = {} as UrlTree;
    const response = { userName: 'Maria', perfil: 'ADMIN' } as any;
    router.createUrlTree.and.returnValue(tree);
    loginService.validarToken.and.returnValue(of(false));
    loginService.refreshToken.and.returnValue(of(response));

    const result$ = TestBed.runInInjectionContext(() =>
      loginGuard({} as any, {} as any),
    ) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(result).toBe(tree);
      expect(loginService.persistSessionMetadata).toHaveBeenCalledWith(
        response,
      );
      expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
      done();
    });
  });
});

describe('loginGuard session recovery', () => {
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
  for (const guard of [loginGuard])
    for (const validation of ['false', 'error'])
      for (const refresh of ['success', 'error'])
        it(`${guard.name}: validation=${validation}, refresh=${refresh}`, () => {
          login.validarToken.and.returnValue(
            validation === 'false'
              ? of(false)
              : throwError(() => new Error('expired')),
          );
          if (refresh === 'error')
            login.refreshToken.and.returnValue(
              throwError(() => new Error('expired')),
            );
          let result: any;
          const request = TestBed.runInInjectionContext(() =>
            guard({} as any, {} as any),
          ) as Observable<any>;
          request.subscribe((value) => (result = value));
          if (refresh === 'success') {
            expect(login.persistSessionMetadata).toHaveBeenCalledWith({
              userName: 'Admin',
            });
            expect(result).toEqual(
              guard === authGuard ? true : { path: ['/dashboard'] },
            );
          } else {
            expect(login.clearSessionMetadata).toHaveBeenCalled();
            expect(result).toEqual(
              guard === authGuard ? { path: ['login'] } : true,
            );
          }
        });
});
