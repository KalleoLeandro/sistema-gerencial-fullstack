import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { authGuard } from './auth.guard';
import { LoginService } from '@services/login.service';

describe('authGuard', () => {
  let loginService: jasmine.SpyObj<LoginService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', [
      'validarToken',
      'clearSessionMetadata',
      'refreshToken',
      'persistSessionMetadata',
      'isLogoutRequested'
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

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBeTrue();
      expect(loginService.clearSessionMetadata).not.toHaveBeenCalled();
      done();
    });
  });

  it('redireciona para login quando houve logout local', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.isLogoutRequested.and.returnValue(true);

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(tree);
      expect(loginService.clearSessionMetadata).toHaveBeenCalled();
      expect(loginService.validarToken).not.toHaveBeenCalled();
      done();
    });
  });

  it('redireciona para login quando o token nao e valido', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.validarToken.and.returnValue(of(false));

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(tree);
      expect(loginService.clearSessionMetadata).toHaveBeenCalled();
      expect(router.createUrlTree).toHaveBeenCalledWith(['login']);
      done();
    });
  });

  it('limpa a sessao e redireciona quando a validacao falha', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.validarToken.and.returnValue(throwError(() => new Error('falha')));

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(tree);
      expect(loginService.clearSessionMetadata).toHaveBeenCalled();
      done();
    });
  });
});
