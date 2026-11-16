import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { buildPrimeNgPrimary, buildPrimeNgSurface } from './core/config/theme.config';
import { initTheme } from './core/config/theme.service';
import { apiInterceptor } from './core/interceptors/api.interceptor';

// PrimeNG preset is generated from theme.config.ts — do not hardcode colors here.
const TaskflowPreset = definePreset(Aura, {
  semantic: {
    primary: buildPrimeNgPrimary(),
    colorScheme: {
      light: { surface: buildPrimeNgSurface() },
      dark: { surface: buildPrimeNgSurface() }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideAnimationsAsync(),
    provideAppInitializer(() => initTheme()),
    MessageService,
    ConfirmationService,
    providePrimeNG({
      ripple: true,
      theme: {
        preset: TaskflowPreset,
        options: {
          darkModeSelector: '.dark-mode'
        }
      }
    })
  ]
};
