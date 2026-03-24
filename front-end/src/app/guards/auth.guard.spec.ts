import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { AuthService } from 'app/services/auth/auth.service';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';

describe('authGuard', () => {

  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {

    authServiceMock = {
      refresh: jasmine.createSpy('refresh')
    };

    routerMock = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

  });

  it('deve permitir acesso quando refresh funcionar', (done) => {

    authServiceMock.refresh.and.returnValue(of(true));

    TestBed.runInInjectionContext(() => {

      const result$ = authGuard({} as any, {} as any) as Observable<boolean>;

      result$.subscribe(result => {

        expect(result).toBeTrue();
        expect(authServiceMock.refresh).toHaveBeenCalled();

        done();
      });

    });

  });

  it('deve redirecionar para login quando refresh falhar', (done) => {

    authServiceMock.refresh.and.returnValue(
      throwError(() => new Error('erro'))
    );

    TestBed.runInInjectionContext(() => {

      const result$ = authGuard({} as any, {} as any) as Observable<boolean>;

      result$.subscribe(result => {

        expect(result).toBeFalse();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');

        done();
      });

    });

  });

});