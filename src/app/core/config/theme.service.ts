import { FONTS, ThemeMode, buildThemeVars } from './theme.config';

const FONT_LINK_ID = 'taskflow-font';

/** Applies the theme config as CSS variables on <html> and toggles PrimeNG's dark class. */
export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  const vars = buildThemeVars(mode);
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }

  if (mode === 'dark') {
    root.classList.add('dark-mode');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark-mode');
    root.removeAttribute('data-theme');
  }
}

/** Loads the web font declared in theme.config.ts (once). */
export function loadThemeFont(): void {
  if (!FONTS.googleFontsUrl || document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = FONTS.googleFontsUrl;
  document.head.appendChild(link);
}

/** Runs at bootstrap: restores saved mode, applies variables and font. */
export function initTheme(): void {
  let mode: ThemeMode = 'light';
  try {
    mode = localStorage.getItem('taskflow-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    // storage unavailable
  }
  loadThemeFont();
  applyTheme(mode);
}

