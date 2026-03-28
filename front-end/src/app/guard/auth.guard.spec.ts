import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { LoginService } from '@services/login.service';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let loginService: jasmine.SpyObj<LoginService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', [
      'validarToken',
      'clearSessionMetadata',
      'refreshToken',
      'persistSessionMetadata',
      'isLogoutRequested',
      'clearLogoutRequested'
    ]);
    loginService.isLogoutRequested.and.returnValue(false);

    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: loginService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('permite a navegacao quando o token e valido', (done) => {
    loginService.validarToken.and.returnValue(of(true));

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(result).toBeTrue();
      expect(loginService.refreshToken).not.toHaveBeenCalled();
      done();
    });
  });

  it('redireciona para login quando houve logout local', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.isLogoutRequested.and.returnValue(true);

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(result).toBe(tree);
      expect(loginService.clearSessionMetadata).toHaveBeenCalled();
      expect(loginService.clearLogoutRequested).toHaveBeenCalled();
      expect(loginService.validarToken).not.toHaveBeenCalled();
      done();
    });
  });

  it('renova a sessao quando o token nao e valido', (done) => {
    loginService.validarToken.and.returnValue(of(false));
    loginService.refreshToken.and.returnValue(of({ userName: 'Maria', perfil: 'ADMIN' } as any));

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(result).toBeTrue();
      expect(loginService.persistSessionMetadata).toHaveBeenCalledWith({ userName: 'Maria', perfil: 'ADMIN' } as any);
      done();
    });
  });

  it('limpa a sessao e redireciona quando validacao e refresh falham', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.validarToken.and.returnValue(throwError(() => new Error('falha')));
    loginService.refreshToken.and.returnValue(throwError(() => new Error('sem sessao')));

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(result).toBe(tree);
      expect(loginService.clearSessionMetadata).toHaveBeenCalled();
      done();
    });
  });
});
