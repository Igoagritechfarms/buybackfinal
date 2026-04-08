/**
 * Example Themed Components
 * Demonstrates how to use the theme config to create reusable components
 *
 * All components use values from src/config/theme.ts
 * Update theme.ts to change styling across all components at once
 */

import React from 'react';
import { theme, colors, spacing } from '../config/theme';

/**
 * Themed Card Component
 * Uses theme.components.card for consistent styling
 */
export const ThemedCard: React.FC<{ children: React.ReactNode; }> = ({ children }) => (
  <div
    style={{
      borderRadius: theme.components.card.borderRadius,
      padding: theme.components.card.padding,
      backgroundColor: colors.earth[50],
      border: `1px solid ${colors.earth[100]}`,
      boxShadow: theme.shadows.sm,
    }}
  >
    {children}
  </div>
);

/**
 * Themed Button Component - Primary Variant
 */
export const ThemedButtonPrimary: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, disabled = false, ...props }) => (
  <button
    disabled={disabled}
    style={{
      backgroundColor: disabled ? colors.green[200] : colors.green[600],
      color: 'white',
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: theme.components.button.borderRadius,
      border: 'none',
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${theme.animations.durations.base} ${theme.animations.easings.smooth}`,
      boxShadow: theme.shadows.lg,
      ':hover': disabled ? 'none' : `0 0 0 3px ${colors.green[200]}`,
    }}
    {...props}
  >
    {children}
  </button>
);

/**
 * Themed Button Component - Secondary Variant
 */
export const ThemedButtonSecondary: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, ...props }) => (
  <button
    style={{
      backgroundColor: colors.earth[100],
      color: colors.earth[900],
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: theme.components.button.borderRadius,
      border: `1px solid ${colors.earth[200]}`,
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      cursor: 'pointer',
      transition: `all ${theme.animations.durations.base} ${theme.animations.easings.smooth}`,
    }}
    {...props}
  >
    {children}
  </button>
);

/**
 * Themed Input Component
 */
export const ThemedInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    style={{
      padding: `${spacing[3]} ${spacing[4]}`,
      borderRadius: theme.components.input.borderRadius,
      border: `1px solid ${colors.earth[200]}`,
      fontSize: theme.typography.sizes.base,
      fontFamily: theme.typography.fonts.sans,
      transition: `all ${theme.animations.durations.base} ${theme.animations.easings.smooth}`,
      ':focus': {
        outline: 'none',
        borderColor: colors.green[600],
        boxShadow: `0 0 0 3px ${colors.green[100]}`,
      },
    }}
    {...props}
  />
);

/**
 * Themed Badge Component
 */
export const ThemedBadge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
}> = ({ children, variant = 'info' }) => {
  const variantStyles = {
    success: { bg: colors.status.success, text: 'white' },
    error: { bg: colors.status.error, text: 'white' },
    warning: { bg: colors.status.warning, text: 'white' },
    info: { bg: colors.status.info, text: 'white' },
  };

  const style = variantStyles[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[1],
        padding: `${spacing[1]} ${spacing[3]}`,
        borderRadius: theme.components.badge.borderRadius,
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.semibold,
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {children}
    </span>
  );
};

/**
 * Themed Alert Component
 */
export const ThemedAlert: React.FC<{
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
}> = ({ children, type = 'info' }) => {
  const typeStyles = {
    success: {
      bg: colors.status.success,
      bgLight: colors.green[100],
      text: colors.green[900],
    },
    error: {
      bg: colors.status.error,
      bgLight: colors.amber[100],
      text: colors.amber[900],
    },
    warning: {
      bg: colors.status.warning,
      bgLight: colors.amber[100],
      text: colors.amber[900],
    },
    info: {
      bg: colors.status.info,
      bgLight: colors.green[100],
      text: colors.green[900],
    },
  };

  const style = typeStyles[type];

  return (
    <div
      style={{
        padding: spacing[4],
        borderRadius: theme.borderRadius.xl,
        backgroundColor: style.bgLight,
        border: `1px solid ${style.bg}`,
        color: style.text,
        fontSize: theme.typography.sizes.sm,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Themed Section Title Component
 */
export const ThemedSectionTitle: React.FC<{ children: React.ReactNode; }> = ({ children }) => (
  <h2
    style={{
      fontSize: theme.typography.sizes['3xl'],
      fontWeight: theme.typography.weights.black,
      color: colors.earth[900],
      marginBottom: spacing[4],
    }}
  >
    {children}
  </h2>
);

/**
 * Themed Heading Component
 */
export const ThemedHeading: React.FC<{
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  children: React.ReactNode;
}> = ({ level = 'h2', children }) => {
  const HeadingTag = level;
  const sizeMap = {
    h1: theme.typography.sizes['6xl'],
    h2: theme.typography.sizes['5xl'],
    h3: theme.typography.sizes['3xl'],
    h4: theme.typography.sizes['2xl'],
  };

  return (
    <HeadingTag
      style={{
        fontSize: sizeMap[level],
        fontWeight: theme.typography.weights.black,
        color: colors.earth[900],
        lineHeight: theme.typography.lineHeights.tight,
      }}
    >
      {children}
    </HeadingTag>
  );
};

/**
 * Themed Text Component
 */
export const ThemedText: React.FC<{
  children: React.ReactNode;
  variant?: 'body' | 'small' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted';
}> = ({ children, variant = 'body', color = 'primary' }) => {
  const variantMap = {
    body: theme.typography.sizes.base,
    small: theme.typography.sizes.sm,
    caption: theme.typography.sizes.xs,
    label: theme.typography.sizes.sm,
  };

  const colorMap = {
    primary: colors.earth[900],
    secondary: colors.earth[600],
    muted: colors.earth[400],
  };

  return (
    <p
      style={{
        fontSize: variantMap[variant],
        color: colorMap[color],
        lineHeight: theme.typography.lineHeights.normal,
        fontWeight:
          variant === 'label'
            ? theme.typography.weights.semibold
            : theme.typography.weights.normal,
      }}
    >
      {children}
    </p>
  );
};

/**
 * Themed Grid Layout Component
 */
export const ThemedGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
}> = ({ children, columns = 3 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
      gap: spacing[6],
    }}
  >
    {children}
  </div>
);

/**
 * Themed Container Component
 */
export const ThemedContainer: React.FC<{ children: React.ReactNode; }> = ({ children }) => (
  <div
    style={{
      maxWidth: '1280px',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: spacing[6],
      paddingRight: spacing[6],
    }}
  >
    {children}
  </div>
);

/**
 * Themed Divider Component
 */
export const ThemedDivider = () => (
  <hr
    style={{
      border: 'none',
      borderTop: `1px solid ${colors.earth[200]}`,
      margin: `${spacing[6]} 0`,
    }}
  />
);

/**
 * Themed Spacing Component (for consistent gaps)
 */
export const ThemedSpacer: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: spacing[3],
    md: spacing[6],
    lg: spacing[12],
  };

  return <div style={{ height: sizeMap[size] }} />;
};
