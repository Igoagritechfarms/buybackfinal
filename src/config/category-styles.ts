/**
 * Category Visual Identity System
 * Defines colors, icons, and visual styling for all categories
 * Ensures consistent branding across the application
 */

import { MainCategory, SubcategoryType } from './categories';

export interface CategoryStyle {
  color: string; // Primary hex color
  lightColor: string; // Light variant for backgrounds
  darkColor: string; // Dark variant for text
  icon: string; // Lucide icon name
  textColor: string; // Text color for contrast
  borderColor: string; // Border color
  hoverBg: string; // Hover background
  badge: string; // Badge background
  gradient?: string; // Optional gradient
}

export interface SubcategoryStyle extends CategoryStyle {
  emoji?: string; // Optional emoji
}

/**
 * Category Color & Icon System
 * Used throughout the app for consistent visual identity
 */
export const CATEGORY_STYLES: Record<MainCategory, CategoryStyle> = {
  'Vegetables': {
    color: '#16a34a',
    lightColor: '#f0fdf4',
    darkColor: '#15803d',
    icon: 'Leaf',
    textColor: '#ffffff',
    borderColor: '#22c55e',
    hoverBg: '#dcfce7',
    badge: '#86efac',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
  },
  'Fruits': {
    color: '#ea580c',
    lightColor: '#fff7ed',
    darkColor: '#c2410c',
    icon: 'Apple',
    textColor: '#ffffff',
    borderColor: '#f59e0b',
    hoverBg: '#fed7aa',
    badge: '#fdba74',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
  },
  'Greens': {
    color: '#059669',
    lightColor: '#ecfdf5',
    darkColor: '#065f46',
    icon: 'Sprout',
    textColor: '#ffffff',
    borderColor: '#10b981',
    hoverBg: '#a7f3d0',
    badge: '#6ee7b7',
    gradient: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
  },
  'Microgreens': {
    color: '#0891b2',
    lightColor: '#ecfdf5',
    darkColor: '#0e7490',
    icon: 'Sprout',
    textColor: '#ffffff',
    borderColor: '#06b6d4',
    hoverBg: '#a5f3fc',
    badge: '#67e8f9',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0369a1 100%)',
  },
  'Grocery': {
    color: '#7c3aed',
    lightColor: '#faf5ff',
    darkColor: '#5b21b6',
    icon: 'Package',
    textColor: '#ffffff',
    borderColor: '#a78bfa',
    hoverBg: '#ede9fe',
    badge: '#c4b5fd',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
  },
  'Animal Products': {
    color: '#d97706',
    lightColor: '#fffbeb',
    darkColor: '#b45309',
    icon: 'Beef',
    textColor: '#ffffff',
    borderColor: '#f59e0b',
    hoverBg: '#fef3c7',
    badge: '#fcd34d',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  },
};

/**
 * Subcategory Styles
 * For visual differentiation within main categories
 */
export const SUBCATEGORY_STYLES: Record<SubcategoryType, SubcategoryStyle> = {
  // Vegetables
  'Root Vegetables': {
    color: '#92400e',
    lightColor: '#fef3c7',
    darkColor: '#78350f',
    icon: 'Flower2',
    textColor: '#ffffff',
    borderColor: '#b45309',
    hoverBg: '#fed7aa',
    badge: '#fcd34d',
  },
  'Cruciferous': {
    color: '#059669',
    lightColor: '#d1fae5',
    darkColor: '#065f46',
    icon: 'Leaf',
    textColor: '#ffffff',
    borderColor: '#10b981',
    hoverBg: '#a7f3d0',
    badge: '#6ee7b7',
  },
  'Gourds & Squash': {
    color: '#0891b2',
    lightColor: '#cffafe',
    darkColor: '#0e7490',
    icon: 'Droplet',
    textColor: '#ffffff',
    borderColor: '#06b6d4',
    hoverBg: '#a5f3fc',
    badge: '#67e8f9',
  },
  'Legumes': {
    color: '#84cc16',
    lightColor: '#f2fce7',
    darkColor: '#713f12',
    icon: 'Sprout',
    textColor: '#ffffff',
    borderColor: '#a3e635',
    hoverBg: '#dcfce7',
    badge: '#bef264',
  },
  'Nightshades': {
    color: '#dc2626',
    lightColor: '#fee2e2',
    darkColor: '#991b1b',
    icon: 'Cherry',
    textColor: '#ffffff',
    borderColor: '#ef4444',
    hoverBg: '#fecaca',
    badge: '#fca5a5',
  },
  'Specialty Vegetables': {
    color: '#8b5cf6',
    lightColor: '#f3e8ff',
    darkColor: '#6d28d9',
    icon: 'Zap',
    textColor: '#ffffff',
    borderColor: '#a78bfa',
    hoverBg: '#ede9fe',
    badge: '#c4b5fd',
  },

  // Fruits
  'Tropical': {
    color: '#f59e0b',
    lightColor: '#fef3c7',
    darkColor: '#d97706',
    icon: 'Cloud',
    textColor: '#ffffff',
    borderColor: '#fbbf24',
    hoverBg: '#fde68a',
    badge: '#fcd34d',
    emoji: '🥭',
  },
  'Citrus': {
    color: '#fbbf24',
    lightColor: '#fef3c7',
    darkColor: '#d97706',
    icon: 'Sun',
    textColor: '#000000',
    borderColor: '#fcd34d',
    hoverBg: '#fef08a',
    badge: '#facc15',
    emoji: '🍊',
  },
  'Berries': {
    color: '#e11d48',
    lightColor: '#ffe4e6',
    darkColor: '#be123c',
    icon: 'Cherry',
    textColor: '#ffffff',
    borderColor: '#f43f5e',
    hoverBg: '#fbcfe8',
    badge: '#f472b6',
    emoji: '🫐',
  },
  'Melons': {
    color: '#0891b2',
    lightColor: '#cffafe',
    darkColor: '#0e7490',
    icon: 'Droplet',
    textColor: '#ffffff',
    borderColor: '#06b6d4',
    hoverBg: '#a5f3fc',
    badge: '#67e8f9',
    emoji: '🍉',
  },
  'Year-Round Fruits': {
    color: '#059669',
    lightColor: '#d1fae5',
    darkColor: '#065f46',
    icon: 'Calendar',
    textColor: '#ffffff',
    borderColor: '#10b981',
    hoverBg: '#a7f3d0',
    badge: '#6ee7b7',
    emoji: '🍌',
  },
  'Premium Fruits': {
    color: '#7c3aed',
    lightColor: '#f3e8ff',
    darkColor: '#5b21b6',
    icon: 'Crown',
    textColor: '#ffffff',
    borderColor: '#a78bfa',
    hoverBg: '#ede9fe',
    badge: '#c4b5fd',
    emoji: '🥝',
  },

  // Greens
  'Leafy Greens': {
    color: '#10b981',
    lightColor: '#d1fae5',
    darkColor: '#047857',
    icon: 'Leaf',
    textColor: '#ffffff',
    borderColor: '#6ee7b7',
    hoverBg: '#a7f3d0',
    badge: '#6ee7b7',
    emoji: '🥬',
  },
  'Fresh Herbs': {
    color: '#14b8a6',
    lightColor: '#ccfbf1',
    darkColor: '#0d9488',
    icon: 'TreePine',
    textColor: '#ffffff',
    borderColor: '#2dd4bf',
    hoverBg: '#99f6e4',
    badge: '#5eead4',
    emoji: '🌿',
  },

  // Microgreens
  'Cruciferous Sprouts': {
    color: '#06b6d4',
    lightColor: '#cffafe',
    darkColor: '#0891b2',
    icon: 'Leaf',
    textColor: '#ffffff',
    borderColor: '#22d3ee',
    hoverBg: '#a5f3fc',
    badge: '#67e8f9',
    emoji: '🌱',
  },
  'Mustard Varieties': {
    color: '#f59e0b',
    lightColor: '#fef3c7',
    darkColor: '#d97706',
    icon: 'Zap',
    textColor: '#ffffff',
    borderColor: '#fbbf24',
    hoverBg: '#fde68a',
    badge: '#fcd34d',
    emoji: '🌱',
  },
  'Legume Sprouts': {
    color: '#84cc16',
    lightColor: '#f2fce7',
    darkColor: '#65a30d',
    icon: 'Sprout',
    textColor: '#ffffff',
    borderColor: '#a3e635',
    hoverBg: '#dcfce7',
    badge: '#bef264',
    emoji: '🌱',
  },
  'Premium Microgreens': {
    color: '#fbbf24',
    lightColor: '#fef3c7',
    darkColor: '#d97706',
    icon: 'Crown',
    textColor: '#000000',
    borderColor: '#fcd34d',
    hoverBg: '#fef08a',
    badge: '#facc15',
    emoji: '🌱',
  },

  // Grocery
  'Oils & Fats': {
    color: '#d97706',
    lightColor: '#fef3c7',
    darkColor: '#b45309',
    icon: 'Droplet',
    textColor: '#ffffff',
    borderColor: '#f59e0b',
    hoverBg: '#fde68a',
    badge: '#fcd34d',
    emoji: '🫗',
  },
  'Dairy Products': {
    color: '#f97316',
    lightColor: '#ffedd5',
    darkColor: '#c2410c',
    icon: 'Heart',
    textColor: '#ffffff',
    borderColor: '#fb923c',
    hoverBg: '#fed7aa',
    badge: '#fdba74',
    emoji: '🍯',
  },
  'Dairy Derivatives': {
    color: '#fbbf24',
    lightColor: '#fef3c7',
    darkColor: '#d97706',
    icon: 'Square',
    textColor: '#000000',
    borderColor: '#fcd34d',
    hoverBg: '#fef08a',
    badge: '#facc15',
    emoji: '🧀',
  },
  'Grains & Staples': {
    color: '#ca8a04',
    lightColor: '#fef3c7',
    darkColor: '#b45309',
    icon: 'Wheat',
    textColor: '#ffffff',
    borderColor: '#eab308',
    hoverBg: '#fef3c7',
    badge: '#fcd34d',
    emoji: '🌾',
  },
  'Pulses': {
    color: '#b91c1c',
    lightColor: '#fee2e2',
    darkColor: '#991b1b',
    icon: 'Layers',
    textColor: '#ffffff',
    borderColor: '#dc2626',
    hoverBg: '#fecaca',
    badge: '#fca5a5',
    emoji: '🫘',
  },
  'Condiments': {
    color: '#6366f1',
    lightColor: '#e0e7ff',
    darkColor: '#4f46e5',
    icon: 'Sparkles',
    textColor: '#ffffff',
    borderColor: '#818cf8',
    hoverBg: '#dbeafe',
    badge: '#a5b4fc',
    emoji: '🧂',
  },

  // Animal Products
  'Poultry': {
    color: '#dc2626',
    lightColor: '#fee2e2',
    darkColor: '#991b1b',
    icon: 'Feather',
    textColor: '#ffffff',
    borderColor: '#ef4444',
    hoverBg: '#fecaca',
    badge: '#fca5a5',
    emoji: '🍗',
  },
  'Seafood': {
    color: '#0891b2',
    lightColor: '#cffafe',
    darkColor: '#0e7490',
    icon: 'Fish',
    textColor: '#ffffff',
    borderColor: '#06b6d4',
    hoverBg: '#a5f3fc',
    badge: '#67e8f9',
    emoji: '🐟',
  },
  'Meat': {
    color: '#84cc16',
    lightColor: '#f2fce7',
    darkColor: '#65a30d',
    icon: 'Award',
    textColor: '#ffffff',
    borderColor: '#a3e635',
    hoverBg: '#dcfce7',
    badge: '#bef264',
    emoji: '🍖',
  },
  'Eggs & Dairy': {
    color: '#f97316',
    lightColor: '#ffedd5',
    darkColor: '#c2410c',
    icon: 'Heart',
    textColor: '#ffffff',
    borderColor: '#fb923c',
    hoverBg: '#fed7aa',
    badge: '#fdba74',
    emoji: '🥚',
  },
};

/**
 * Get style for a category
 */
export const getCategoryStyle = (categoryName: MainCategory): CategoryStyle | undefined => {
  return CATEGORY_STYLES[categoryName];
};

/**
 * Get style for a subcategory
 */
export const getSubcategoryStyle = (subcategoryName: SubcategoryType): SubcategoryStyle | undefined => {
  return SUBCATEGORY_STYLES[subcategoryName];
};

/**
 * Color palette for demand levels
 */
export const DEMAND_COLORS = {
  Low: '#9ca3af',
  Medium: '#f59e0b',
  High: '#10b981',
  'Very High': '#ef4444',
};

/**
 * Color palette for season/availability
 */
export const SEASON_COLORS = {
  'In-Season': '#10b981',
  'Off-Season': '#ef4444',
  'Year-Round': '#3b82f6',
};

/**
 * Tag colors
 */
export const TAG_COLORS: Record<string, string> = {
  organic: '#10b981',
  premium: '#7c3aed',
  seasonal: '#f59e0b',
  limited: '#dc2626',
  bulk: '#3b82f6',
};
