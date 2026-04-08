/**
 * Generate CSS custom properties from theme config
 * Injects CSS variables into document root for use in stylesheets
 */

import { colors, spacing, typography, borderRadius, shadows, zIndex } from '../config/theme';

export function injectCSSVariables() {
  const root = document.documentElement;

  // Colors
  Object.entries(colors).forEach(([colorName, colorValues]) => {
    Object.entries(colorValues).forEach(([shade, value]) => {
      root.style.setProperty(`--color-${colorName}-${shade}`, value);
    });
  });

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  // Typography
  Object.entries(typography.sizes).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });

  Object.entries(typography.weights).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value.toString());
  });

  // Border Radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });

  // Z-Index
  Object.entries(zIndex).forEach(([key, value]) => {
    root.style.setProperty(`--z-${key}`, value);
  });
}

// Auto-inject on module load (or call manually if needed)
if (typeof window !== 'undefined') {
  injectCSSVariables();
}
