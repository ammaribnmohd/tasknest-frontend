import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Public Auth Routes
  {
    path: 'login',
    title: 'Sign In · Taskflow',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    title: 'Sign Up · Taskflow',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'verify-email',
    title: 'Verify Email · Taskflow',
    loadComponent: () => import('./pages/verify-email/verify-email.page').then(m => m.VerifyEmailPage)
  },
  {
    path: 'forgot-password',
    title: 'Forgot Password · Taskflow',
    loadComponent: () => import('./pages/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
  },
  {
    path: 'reset-password',
    title: 'Reset Password · Taskflow',
    loadComponent: () => import('./pages/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
  },

  // Protected Application Routes
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inbox' },
      {
        path: 'inbox',
        title: 'Inbox · Taskflow',
        loadComponent: () => import('./pages/inbox/inbox.page').then(m => m.InboxPage)
      },
      {
        path: 'today',
        title: 'Today · Taskflow',
        loadComponent: () => import('./pages/today/today.page').then(m => m.TodayPage)
      },
      {
        path: 'upcoming',
        title: 'Upcoming · Taskflow',
        loadComponent: () => import('./pages/upcoming/upcoming.page').then(m => m.UpcomingPage)
      },
      {
        path: 'all',
        title: 'All Tasks · Taskflow',
        loadComponent: () => import('./pages/all-tasks/all-tasks.page').then(m => m.AllTasksPage)
      },
      {
        path: 'completed',
        title: 'Completed · Taskflow',
        loadComponent: () => import('./pages/completed/completed.page').then(m => m.CompletedPage)
      },
      {
        path: 'settings',
        title: 'Settings · Taskflow',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
      }
    ]
  },
  { path: '**', redirectTo: 'inbox' }
];
