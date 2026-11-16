import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputOtpModule } from 'primeng/inputotp';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    InputOtpModule
  ],
  templateUrl: './verify-email.page.html',
  styleUrl: './verify-email.page.scss'
})
export class VerifyEmailPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly isResending = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly cooldownRemaining = signal(60);

  private timerInterval: any = null;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  ngOnInit(): void {
    const prefillEmail = this.auth.pendingEmail();
    if (prefillEmail) {
      this.form.patchValue({ email: prefillEmail });
    }
    this.startCooldownTimer(60);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startCooldownTimer(seconds: number): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.cooldownRemaining.set(seconds);
    this.timerInterval = setInterval(() => {
      const current = this.cooldownRemaining();
      if (current <= 1) {
        clearInterval(this.timerInterval);
        this.cooldownRemaining.set(0);
      } else {
        this.cooldownRemaining.set(current - 1);
      }
    }, 1000);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    const { email, otp } = this.form.getRawValue();

    this.auth.verifyEmail({ email: email!, otp: otp! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Email verified successfully! Redirecting to workspace...');
        setTimeout(() => {
          this.router.navigate(['/inbox']);
        }, 800);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Verification failed. Please check the code.';
        this.errorMessage.set(msg);
      }
    });
  }

  resendCode(): void {
    const email = this.form.get('email')?.value;
    if (!email || this.form.get('email')?.invalid) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    if (this.cooldownRemaining() > 0) return;

    this.isResending.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.auth.resendVerification({ email }).subscribe({
      next: (res) => {
        this.isResending.set(false);
        this.successMessage.set('A new verification code has been dispatched.');
        this.startCooldownTimer(res.resendAvailableInSeconds || 60);
      },
      error: (err) => {
        this.isResending.set(false);
        const msg = err.error?.message || 'Failed to resend code. Please try again later.';
        this.errorMessage.set(msg);
      }
    });
  }
}

