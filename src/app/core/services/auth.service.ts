import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import {
  EmailRequest,
  LoginRequest,
  MessageResponse,
  OtpIssuedResponse,
  OtpVerifyRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/auth';

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isInitialized = signal<boolean>(false);
  readonly pendingEmail = signal<string>('');

  checkAuth(): Observable<User | null> {
    return this.http.get<User>(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isInitialized.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isInitialized.set(true);
        return of(null);
      })
    );
  }

  register(req: RegisterRequest): Observable<OtpIssuedResponse> {
    return this.http.post<OtpIssuedResponse>(`${this.baseUrl}/register`, req, { withCredentials: true }).pipe(
      tap(() => this.pendingEmail.set(req.email.trim().toLowerCase()))
    );
  }

  verifyEmail(req: OtpVerifyRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/verify-email`, req, { withCredentials: true }).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.pendingEmail.set('');
      })
    );
  }

  resendVerification(req: EmailRequest): Observable<OtpIssuedResponse> {
    return this.http.post<OtpIssuedResponse>(`${this.baseUrl}/resend-verification`, req, { withCredentials: true });
  }

  login(req: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, req, { withCredentials: true }).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.currentUser.set(null)),
      catchError(() => {
        this.currentUser.set(null);
        return of({ message: 'Logged out' });
      })
    );
  }

  forgotPassword(req: EmailRequest): Observable<OtpIssuedResponse> {
    return this.http.post<OtpIssuedResponse>(`${this.baseUrl}/forgot-password`, req, { withCredentials: true }).pipe(
      tap(() => this.pendingEmail.set(req.email.trim().toLowerCase()))
    );
  }

  verifyResetOtp(req: OtpVerifyRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/verify-reset-otp`, req, { withCredentials: true });
  }

  resetPassword(req: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, req, { withCredentials: true });
  }
}

