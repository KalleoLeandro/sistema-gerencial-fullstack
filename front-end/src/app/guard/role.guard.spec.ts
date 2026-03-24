import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { roleGuard } from './role.guard';
import { LoginService } from '@services/login.service';

describe('roleGuard', () => {
  let loginService: jasmine.SpyObj<LoginService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', ['getPerfil']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: loginService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('permite acesso quando o perfil esta entre os papeis aceitos', (done) => {
    loginService.getPerfil.and.returnValue(of({ role: 'ADMIN' } as any));

    const result$ = TestBed.runInInjectionContext(() => roleGuard({ data: { roles: ['ADMIN', 'DEV'] } } as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('redireciona para 401 quando o perfil nao e permitido', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.getPerfil.and.returnValue(of({ role: 'COMERCIAL' } as any));

    const result$ = TestBed.runInInjectionContext(() => roleGuard({ data: { roles: ['ADMIN'] } } as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(tree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['401']);
      done();
    });
  });

  it('redireciona para 404 quando a consulta do perfil falha', (done) => {
    const tree = {} as UrlTree;
    router.createUrlTree.and.returnValue(tree);
    loginService.getPerfil.and.returnValue(throwError(() => new Error('erro')));

    const result$ = TestBed.runInInjectionContext(() => roleGuard({ data: { roles: ['ADMIN'] } } as any, {} as any)) as Observable<boolean | UrlTree>;

    result$.subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(tree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['404']);
      done();
    });
  });
});
