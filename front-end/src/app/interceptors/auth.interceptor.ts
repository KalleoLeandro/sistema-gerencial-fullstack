import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '@services/login.service';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, switchMap } from 'rxjs/operators';

let refreshRequest$: Observable<unknown> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  const request = req.clone({
    withCredentials: true
  });

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!shouldTryRefresh(request.url, error.status)) {
        return throwError(() => error);
      }

      if (!refreshRequest$) {
        refreshRequest$ = loginService.refreshToken().pipe(
          shareReplay(1),
          finalize(() => {
            refreshRequest$ = null;
          })
        );
      }

      return refreshRequest$.pipe(
        switchMap((response) => {
          loginService.persistSessionMetadata(response as any);
          return next(request);
        }),
        catchError((refreshError) => {
          loginService.clearSessionMetadata();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};

function shouldTryRefresh(url: string, status: number): boolean {
  if (status !== 401) {
    return false;
  }

  return !url.includes('/login/validar-login')
    && !url.includes('/login/refresh')
    && !url.includes('/auth/login')
    && !url.includes('/auth/refresh');
}
