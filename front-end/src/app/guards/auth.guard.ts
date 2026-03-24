import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "app/services/auth/auth.service";
import { map, catchError, of } from "rxjs";


export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map(() => true),
    catchError(() =>
      authService.refresh().pipe(
        map(() => true),
        catchError(() => {
          router.navigateByUrl('/login');
          return of(false);
        })
      )
    )
  );

};
