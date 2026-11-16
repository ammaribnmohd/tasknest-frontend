import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isInitialized()) {
    if (authService.isAuthenticated()) {
      return true;
    }
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  return authService.checkAuth().pipe(
    map(user => {
      if (user) {
        return true;
      }
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    })
  );
};

