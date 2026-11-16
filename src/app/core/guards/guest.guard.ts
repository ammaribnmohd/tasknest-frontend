import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, of } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isInitialized()) {
    if (authService.isAuthenticated()) {
      return router.createUrlTree(['/inbox']);
    }
    return true;
  }

  return authService.checkAuth().pipe(
    map(user => {
      if (user) {
        return router.createUrlTree(['/inbox']);
      }
      return true;
    })
  );
};

