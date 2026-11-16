import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let clone = req;
  const isApiRequest = req.url.includes('localhost:8080') || req.url.startsWith('/api/');

  if (isApiRequest) {
    const headers: Record<string, string> = {};

    const csrfToken = getCsrfTokenFromCookie();
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
    if (csrfToken && isMutation) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    clone = req.clone({
      withCredentials: true,
      setHeaders: headers
    });
  }

  return next(clone).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const isAuthCheck = req.url.includes('/api/auth/me') || req.url.includes('/api/auth/login');
        if (!isAuthCheck) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};

