import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '@services/login.service';
import { catchError, map, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(LoginService);
  const router = inject(Router);

  if (authService.isLogoutRequested()) {
    authService.clearSessionMetadata();
    return of(router.createUrlTree(['login']));
  }

  return authService.validarToken().pipe(
    switchMap((isAuthenticated) => {
      if (isAuthenticated) {
        return of(true);
      }

      return authService.refreshToken().pipe(
        map((response) => {
          authService.persistSessionMetadata(response);
          return true;
        }),
        catchError(() => {
          authService.clearSessionMetadata();
          return of(router.createUrlTree(['login']));
        })
      );
    }),
    catchError(() =>
      authService.refreshToken().pipe(
        map((response) => {
          authService.persistSessionMetadata(response);
          return true;
        }),
        catchError(() => {
          authService.clearSessionMetadata();
          return of(router.createUrlTree(['login']));
        })
      )
    )
  );  
};
