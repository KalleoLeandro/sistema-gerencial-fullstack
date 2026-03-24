import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {

  it('deve adicionar withCredentials na requisição', (done) => {

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