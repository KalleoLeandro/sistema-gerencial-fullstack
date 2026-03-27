import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { loginGuard } from './login.guard';
import { LoginService } from '@services/login.service';

describe('loginGuard', () => {
  let loginService: jasmine.SpyObj<LoginService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', [
      'validarToken',
      'refreshToken',
      'persistSessionMetadata',
      'clearSessionMetadata',
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

  it('redireciona para dashboard quando o token e valido', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.validarToken.and.returnValue(of(true));

    const result$ = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(tree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
      done();
    });
  });

  it('permite acessar login quando o logout foi solicitado localmente', (done) => {
    loginService.isLogoutRequested.and.returnValue(true);

    const result$ = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBeTrue();
      expect(loginService.clearSessionMetadata).toHaveBeenCalled();
      expect(loginService.validarToken).not.toHaveBeenCalled();
      done();
    });
  });

  it('permite acessar login quando token e refresh falham', (done) => {
    loginService.validarToken.and.returnValue(of(false));
    loginService.refreshToken.and.returnValue(throwError(() => new Error('sem sessao')));

    const result$ = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
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

    const result$ = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(tree);
      expect(loginService.persistSessionMetadata).toHaveBeenCalledWith(response);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
      done();
    });
  });
});
