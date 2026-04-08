/**
 * Centralized Theme Configuration
 * All colors, spacing, typography, and design tokens in one place
 * Use this for consistent design system across the app
 */

// ─── COLOR PALETTE ──────────────────────────────────────────────────────

export const colors = {
  // Primary Green (Agricultural theme)
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Neutral Earth Tones
  earth: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },

  // Accent Colors
  amber: {
    400: '#fbbf24',
    500: '#f59e0b',
  },

  // Yellow Color (Bright, warm accent)
  yellow: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Status Colors
  status: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  // Social/Brand Colors
  social: {
    whatsapp: '#25D366',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
  },

  // Semantic Colors
  semantic: {
    positive: '#16a34a',
    negative: '#dc2626',
    caution: '#f59e0b',
    neutral: '#6b7280',
  },
} as const;

// ─── TYPOGRAPHY ─────────────────────────────────────────────────────────

export const typography = {
  fonts: {
    sans: "'Inter', system-ui, sans-serif",
    mono: "'Menlo', 'Monaco', 'Courier New', monospace",
  },

  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },

  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

// ─── SPACING ────────────────────────────────────────────────────────────

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ─── BORDER RADIUS ──────────────────────────────────────────────────────

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ─── SHADOWS ────────────────────────────────────────────────────────────

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

// ─── ANIMATIONS ─────────────────────────────────────────────────────────

export const animations = {
  durations: {
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easings: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Framer Motion preset variants
  motion: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideInUp: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 10 },
    },
    slideInDown: {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    slideInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  },
} as const;

// ─── BREAKPOINTS ────────────────────────────────────────────────────────

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ─── Z-INDEX SCALE ──────────────────────────────────────────────────────

export const zIndex = {
  hide: '-1',
  base: '0',
  dropdown: '10',
  sticky: '20',
  fixed: '30',
  backdrop: '40',
  modal: '50',
  tooltip: '60',
  notification: '70',
  popover: '80',
  skipLink: '90',
} as const;

// ─── COMPONENT-SPECIFIC TOKENS ──────────────────────────────────────────

export const components = {
  button: {
    height: spacing[3],
    paddingX: spacing[6],
    paddingY: spacing[3],
    borderRadius: borderRadius['3xl'],
  },

  input: {
    height: spacing[3],
    paddingX: spacing[4],
    paddingY: spacing[3],
    borderRadius: borderRadius.xl,
  },

  card: {
    borderRadius: borderRadius['3xl'],
    padding: spacing[6],
    borderColor: colors.earth[100],
  },

  badge: {
    paddingX: spacing[3],
    paddingY: spacing[1],
    borderRadius: borderRadius.full,
    fontSize: typography.sizes.xs,
  },
} as const;

// ─── PREDEFINED COMBINATIONS ────────────────────────────────────────────

export const themes = {
  light: {
    background: colors.earth[50],
    foreground: colors.earth[900],
    primary: colors.green[600],
    secondary: colors.earth[200],
    border: colors.earth[200],
  },

  dark: {
    background: colors.earth[900],
    foreground: colors.earth[50],
    primary: colors.green[400],
    secondary: colors.earth[700],
    border: colors.earth[700],
  },
} as const;

// ─── EXPORT ALL AS NAMESPACE ────────────────────────────────────────────

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  components,
  themes,
} as const;

export type Theme = typeof theme;

/**
 * Helper function to access nested color values
 * @example getColor('green', 600) => '#16a34a'
 */
export function getColor(colorGroup: keyof typeof colors, shade: string | number): string {
  const group = colors[colorGroup] as any;
  return group?.[shade] || '#000000';
}

/**
 * Helper function to get spacing value
 * @example getSpacing(4) => '1rem'
 */
export function getSpacing(value: keyof typeof spacing): string {
  return spacing[value];
}

/**
 * Helper function to get typography value
 * @example getFontSize('lg') => '1.125rem'
 */
export function getFontSize(size: keyof typeof typography.sizes): string {
  return typography.sizes[size];
}
