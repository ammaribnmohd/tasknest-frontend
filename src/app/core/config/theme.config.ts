/**
 * ============================================================================
 *  TASKFLOW THEME CONFIG  —  the single source of truth for the whole UI.
 * ============================================================================
 *  Edit ONLY this file to re-brand the app:
 *    - `primary`    → brand / accent color scale (buttons, active nav, focus)
 *    - `secondary`  → neutral scale (backgrounds, text, borders)
 *    - `semantic`   → success / info / warning / danger colors
 *    - `fonts`      → font family, Google Fonts URL, base size
 *    - `layout`     → sidebar widths, control heights, radii
 *    - `light/dark` → how the scales map onto surfaces, text and borders
 *
 *  These values drive BOTH the CSS variables used by every component AND the
 *  PrimeNG preset (see app.config.ts), so nothing else needs to change.
 * ============================================================================
 */

export type ColorScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950, string>;
export type ThemeMode = 'light' | 'dark';

/** Brand color (accent). Swap this scale to change the whole app's accent. */
export const PRIMARY: ColorScale = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
  950: '#1e1b4b'
};

/** Neutral color used for backgrounds, text and borders. */
export const SECONDARY: ColorScale = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617'
};

/** Semantic colors (status, priority, errors). */
export const SEMANTIC = {
  success: { light: '#059669', dark: '#34d399', bgLight: '#ecfdf5', bgDark: 'rgba(16, 185, 129, 0.16)' },
  info: { light: '#2563eb', dark: '#60a5fa', bgLight: '#eff6ff', bgDark: 'rgba(59, 130, 246, 0.16)' },
  warning: { light: '#d97706', dark: '#fbbf24', bgLight: '#fffbeb', bgDark: 'rgba(245, 158, 11, 0.16)' },
  danger: {
    light: '#dc2626',
    dark: '#f87171',
    hoverLight: '#b91c1c',
    hoverDark: '#ef4444',
    bgLight: '#fef2f2',
    bgDark: 'rgba(239, 68, 68, 0.16)'
  }
};

export const FONTS = {
  family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  /** Set to '' to skip loading a web font. */
  googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  sizeBase: '15.5px'
};

export const LAYOUT = {
  sidebarExpandedWidth: '256px',
  sidebarCollapsedWidth: '68px',
  controlHeight: '36px',
  controlHeightSm: '32px',
  tabHeight: '42px',
  radius: { xs: '4px', sm: '6px', md: '8px', lg: '12px' },
  transition: {
    fast: '140ms cubic-bezier(0.16, 1, 0.3, 1)',
    base: '200ms cubic-bezier(0.16, 1, 0.3, 1)'
  }
};

/** Builds the CSS variables for the given mode from the scales above. */
export function buildThemeVars(mode: ThemeMode): Record<string, string> {
  const dark = mode === 'dark';
  const p = PRIMARY;
  const s = SECONDARY;
  const sem = SEMANTIC;

  const vars: Record<string, string> = {
    // Surfaces
    '--bg-app': dark ? '#0b0f17' : s[50],
    '--bg-sidebar': dark ? '#111827' : s[100],
    '--bg-surface': dark ? '#151d2c' : '#ffffff',
    '--bg-surface-hover': dark ? '#1b2538' : s[50],
    '--bg-surface-active': dark ? '#232f46' : s[200],
    '--bg-subtle': dark ? s[800] : s[100],

    // Text
    '--text-primary': dark ? s[100] : s[900],
    '--text-secondary': dark ? s[400] : s[600],
    '--text-muted': dark ? s[500] : s[400],
    '--text-on-accent': '#ffffff',

    // Borders
    '--border-subtle': dark ? s[800] : s[200],
    '--border-default': dark ? s[700] : s[300],
    '--border-focus': dark ? p[500] : p[600],

    // Accent (primary)
    '--accent': dark ? p[500] : p[600],
    '--accent-hover': dark ? p[400] : p[700],
    '--accent-subtle': dark ? 'rgba(99, 102, 241, 0.16)' : p[50],
    '--accent-subtle-text': dark ? p[300] : p[700],

    // Status
    '--status-todo-bg': dark ? s[800] : s[100],
    '--status-todo-text': dark ? s[400] : s[600],
    '--status-progress-bg': dark ? sem.info.bgDark : sem.info.bgLight,
    '--status-progress-text': dark ? sem.info.dark : sem.info.light,
    '--status-done-bg': dark ? sem.success.bgDark : sem.success.bgLight,
    '--status-done-text': dark ? sem.success.dark : sem.success.light,

    // Priority
    '--priority-high': dark ? sem.danger.dark : sem.danger.light,
    '--priority-high-bg': dark ? sem.danger.bgDark : sem.danger.bgLight,
    '--priority-medium': dark ? sem.warning.dark : sem.warning.light,
    '--priority-medium-bg': dark ? sem.warning.bgDark : sem.warning.bgLight,
    '--priority-low': dark ? s[400] : s[500],
    '--priority-low-bg': dark ? 'rgba(148, 163, 184, 0.12)' : s[50],

    // Danger
    '--danger': dark ? sem.danger.dark : sem.danger.light,
    '--danger-hover': dark ? sem.danger.hoverDark : sem.danger.hoverLight,
    '--danger-subtle': dark ? sem.danger.bgDark : sem.danger.bgLight,

    // Shadows
    '--shadow-xs': dark ? '0 1px 2px rgba(0, 0, 0, 0.25)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
    '--shadow-sm': dark ? '0 1px 3px rgba(0, 0, 0, 0.35)' : '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
    '--shadow-md': dark
      ? '0 4px 12px rgba(0, 0, 0, 0.45)'
      : '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',

    // Fonts
    '--font-family': FONTS.family,
    '--font-size-base': FONTS.sizeBase,

    // Layout
    '--sidebar-expanded-width': LAYOUT.sidebarExpandedWidth,
    '--sidebar-collapsed-width': LAYOUT.sidebarCollapsedWidth,
    '--control-height': LAYOUT.controlHeight,
    '--control-height-sm': LAYOUT.controlHeightSm,
    '--tab-height': LAYOUT.tabHeight,
    '--radius-xs': LAYOUT.radius.xs,
    '--radius-sm': LAYOUT.radius.sm,
    '--radius-md': LAYOUT.radius.md,
    '--radius-lg': LAYOUT.radius.lg,
    '--transition-fast': LAYOUT.transition.fast,
    '--transition-base': LAYOUT.transition.base
  };

  return vars;
}

/** PrimeNG primary palette (shifted so PrimeNG's "500" matches our accent 600). */
export function buildPrimeNgPrimary(): ColorScale {
  return {
    50: PRIMARY[50],
    100: PRIMARY[100],
    200: PRIMARY[200],
    300: PRIMARY[300],
    400: PRIMARY[400],
    500: PRIMARY[600],
    600: PRIMARY[700],
    700: PRIMARY[800],
    800: PRIMARY[900],
    900: PRIMARY[950],
    950: PRIMARY[950]
  };
}

/** PrimeNG surface palette built from the secondary scale. */
export function buildPrimeNgSurface(): ColorScale & { 0: string } {
  return { 0: '#ffffff', ...SECONDARY };
}

