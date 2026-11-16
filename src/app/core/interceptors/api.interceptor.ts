import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

let latestCsrfToken: string | null = null;

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let clone = req;
  const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.includes('/api/');

  if (isApiRequest) {
    const headers: Record<string, string> = {};

    const csrfToken = getCsrfTokenFromCookie() ?? latestCsrfToken;
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
    tap(event => {
      if (event instanceof HttpResponse) {
        const token = event.headers.get('X-XSRF-TOKEN');
        if (token) {
          latestCsrfToken = token;
        }
      }
    }),
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

