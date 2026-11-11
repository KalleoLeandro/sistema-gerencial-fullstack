import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '@services/login.service';
import { map, catchError, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(LoginService);
  const router = inject(Router);

  const rolesPermitidos = route.data['roles'] as string[];

  return authService.getPerfil().pipe(
    map((result) => {
      const userRole = result.role;
      if (rolesPermitidos.includes(userRole)) {
        return true;
      }
      return router.createUrlTree(['401']);
    }),
    catchError(() => of(router.createUrlTree(['404'])))
  );
};
