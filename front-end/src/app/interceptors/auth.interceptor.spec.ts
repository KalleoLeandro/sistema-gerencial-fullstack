import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginService } from '@services/login.service';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('deve adicionar withCredentials na requisicao', (done) => {
    const loginServiceSpy = jasmine.createSpyObj<LoginService>('LoginService', [
      'isLogoutRequested',
      'refreshToken',
      'persistSessionMetadata',
      'clearSessionMetadata'
    ]);
    loginServiceSpy.isLogoutRequested.and.returnValue(false);

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
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
