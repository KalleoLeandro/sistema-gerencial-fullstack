import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '@services/login.service';
import { catchError, map, of, switchMap } from 'rxjs';

export const loginGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isLogoutRequested()) {
    loginService.clearSessionMetadata();
    return of(true);
  }

  return loginService.validarToken().pipe(
    switchMap((isAuthenticated) => {
      if (isAuthenticated) {
        return of(router.createUrlTree(['/dashboard']));
      }

      return loginService.refreshToken().pipe(
        map((response) => {
          loginService.persistSessionMetadata(response);
          return router.createUrlTree(['/dashboard']);
        }),
        catchError(() => {
          loginService.clearSessionMetadata();
          return of(true);
        })
      );
    }),
    catchError(() =>
      loginService.refreshToken().pipe(
        map((response) => {
          loginService.persistSessionMetadata(response);
          return router.createUrlTree(['/dashboard']);
        }),
        catchError(() => {
          loginService.clearSessionMetadata();
          return of(true);
        })
      )
    )
  );
};
