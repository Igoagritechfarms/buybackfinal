/**
 * Hierarchical Product Category Structure
 * Defines main categories, subcategories, and metadata
 * Single source of truth for category organization
 */

export type MainCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Greens'
  | 'Microgreens'
  | 'Grocery'
  | 'Animal Products';

export type SubcategoryType =
  // Vegetables
  | 'Root Vegetables'
  | 'Cruciferous'
  | 'Gourds & Squash'
  | 'Legumes'
  | 'Nightshades'
  | 'Specialty Vegetables'

  // Fruits
  | 'Tropical'
  | 'Citrus'
  | 'Berries'
  | 'Melons'
  | 'Year-Round Fruits'
  | 'Premium Fruits'

  // Greens
  | 'Leafy Greens'
  | 'Fresh Herbs'

  // Microgreens
  | 'Cruciferous Sprouts'
  | 'Mustard Varieties'
  | 'Legume Sprouts'
  | 'Premium Microgreens'

  // Grocery
  | 'Oils & Fats'
  | 'Dairy Products'
  | 'Dairy Derivatives'
  | 'Grains & Staples'
  | 'Pulses'
  | 'Condiments'

  // Animal Products
  | 'Poultry'
  | 'Seafood'
  | 'Meat'
  | 'Eggs & Dairy';

export interface Subcategory {
  id: string;
  name: SubcategoryType;
  description: string;
  icon?: string; // Lucide icon name
  color?: string; // Hex color
  products?: number; // Count of products in this subcategory
}

export interface CategoryDefinition {
  id: string;
  name: MainCategory;
  description: string;
  emoji: string;
  color: string; // Primary color (hex)
  lightColor: string; // Light variant for backgrounds
  darkColor: string; // Dark variant for text
  icon?: string; // Lucide icon name
  averagePrice: {
    min: number;
    max: number;
  };
  totalProducts: number;
  subcategories: Subcategory[];
  typicalUnitTypes: string[];
  tips?: string;
}

/**
 * Complete Category Hierarchy
 */
export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    description: 'Fresh vegetables including root, leafy, gourds, and specialty varieties',
    emoji: '🥬',
    color: '#16a34a',
    lightColor: '#f0fdf4',
    darkColor: '#15803d',
    icon: 'Leaf',
    averagePrice: { min: 18, max: 220 },
    totalProducts: 23,
    typicalUnitTypes: ['kg', 'bundles'],
    tips: 'Peak season: Oct-Mar. Year-round staples: Tomato, Onion, Potato, Cucumber.',
    subcategories: [
      {
        id: 'root-vegetables',
        name: 'Root Vegetables',
        description: 'Underground vegetables rich in carbs and minerals',
        icon: 'Flower2',
        color: '#92400e',
        products: 5, // Potato, Onion, Garlic, Carrot, Radish
      },
      {
        id: 'cruciferous',
        name: 'Cruciferous',
        description: 'Cancer-fighting vegetables from the cabbage family',
        icon: 'Leaf',
        color: '#059669',
        products: 3, // Broccoli, Cauliflower, Cabbage
      },
      {
        id: 'gourds-squash',
        name: 'Gourds & Squash',
        description: 'Light and water-rich vegetables perfect for monsoon',
        icon: 'Droplet',
        color: '#0891b2',
        products: 4, // Bottle Gourd, Ridge Gourd, Bitter Gourd, Zucchini
      },
      {
        id: 'legumes',
        name: 'Legumes',
        description: 'Protein-rich vegetables including beans and peas',
        icon: 'Sprout',
        color: '#84cc16',
        products: 3, // Beans, Peas, Corn
      },
      {
        id: 'nightshades',
        name: 'Nightshades',
        description: 'Tomatoes, peppers, and eggplants',
        icon: 'Cherry',
        color: '#dc2626',
        products: 2, // Tomato, Eggplant
      },
      {
        id: 'specialty-vegetables',
        name: 'Specialty Vegetables',
        description: 'Unique vegetables including mushrooms and specialty produce',
        icon: 'Zap',
        color: '#8b5cf6',
        products: 6, // Cucumber, Lady Finger, Bell Pepper, Oyster Mushroom, Button Mushroom
      },
    ],
  },

  {
    id: 'fruits',
    name: 'Fruits',
    description: 'Fresh fruits from tropical to temperate regions',
    emoji: '🍎',
    color: '#ea580c',
    lightColor: '#fff7ed',
    darkColor: '#c2410c',
    icon: 'Apple',
    averagePrice: { min: 28, max: 245 },
    totalProducts: 15,
    typicalUnitTypes: ['kg', 'pieces', 'bundles'],
    tips: 'Seasonal availability varies. Mango (Mar-Jun), Strawberry (Jan-Apr), Watermelon (Apr-Sep).',
    subcategories: [
      {
        id: 'tropical',
        name: 'Tropical',
        description: 'Tropical fruits from warm climates',
        icon: 'Cloud',
        color: '#f59e0b',
        products: 4, // Mango, Pineapple, Papaya, Coconut
      },
      {
        id: 'citrus',
        name: 'Citrus',
        description: 'Vitamin C rich citrus fruits',
        icon: 'Sun',
        color: '#fbbf24',
        products: 3, // Orange, Mosambi, Guava
      },
      {
        id: 'berries',
        name: 'Berries',
        description: 'Antioxidant-rich berries and small fruits',
        icon: 'Cherry',
        color: '#e11d48',
        products: 3, // Strawberry, Blueberry, Guava
      },
      {
        id: 'melons',
        name: 'Melons',
        description: 'Water-rich melons for summer',
        icon: 'Droplet',
        color: '#0891b2',
        products: 2, // Watermelon
      },
      {
        id: 'year-round',
        name: 'Year-Round Fruits',
        description: 'Available throughout the year',
        icon: 'Calendar',
        color: '#059669',
        products: 2, // Banana, Grapes
      },
      {
        id: 'premium',
        name: 'Premium Fruits',
        description: 'Specialty and imported premium fruits',
        icon: 'Crown',
        color: '#7c3aed',
        products: 2, // Kiwi, Apple
      },
    ],
  },

  {
    id: 'greens',
    name: 'Greens',
    description: 'Leafy greens and fresh culinary herbs',
    emoji: '🌿',
    color: '#059669',
    lightColor: '#ecfdf5',
    darkColor: '#065f46',
    icon: 'Sprout',
    averagePrice: { min: 28, max: 65 },
    totalProducts: 10,
    typicalUnitTypes: ['bundles', 'kg'],
    tips: 'Herbs available year-round. Greens peak in winter (Oct-Mar).',
    subcategories: [
      {
        id: 'leafy-greens',
        name: 'Leafy Greens',
        description: 'Nutrient-dense leafy vegetables',
        icon: 'Leaf',
        color: '#10b981',
        products: 5, // Spinach, Kale, Arugula, Lettuce, Swiss Chard
      },
      {
        id: 'fresh-herbs',
        name: 'Fresh Herbs',
        description: 'Culinary and medicinal herbs',
        icon: 'TreePine',
        color: '#14b8a6',
        products: 5, // Cilantro, Mint, Parsley, Dill, Fenugreek
      },
    ],
  },

  {
    id: 'microgreens',
    name: 'Microgreens',
    description: 'Young nutrient-dense microgreens for premium markets',
    emoji: '🌱',
    color: '#0891b2',
    lightColor: '#ecfdf5',
    darkColor: '#0e7490',
    icon: 'Sprout',
    averagePrice: { min: 255, max: 305 },
    totalProducts: 8,
    typicalUnitTypes: ['kg', 'box'],
    tips: 'High-value crop. Available year-round. Peak demand: Jul-Sep.',
    subcategories: [
      {
        id: 'cruciferous-sprouts',
        name: 'Cruciferous Sprouts',
        description: 'Broccoli and radish microgreens with high nutritional value',
        icon: 'Leaf',
        color: '#06b6d4',
        products: 2, // Broccoli Microgreens, Radish Microgreens
      },
      {
        id: 'mustard-varieties',
        name: 'Mustard Varieties',
        description: 'Spicy mustard and fenugreek microgreens',
        icon: 'Zap',
        color: '#f59e0b',
        products: 2, // Mustard Microgreens, Fenugreek Microgreens
      },
      {
        id: 'legume-sprouts',
        name: 'Legume Sprouts',
        description: 'Protein-rich pea and alfalfa sprouts',
        icon: 'Sprout',
        color: '#84cc16',
        products: 2, // Pea Microgreens, Alfalfa Microgreens
      },
      {
        id: 'premium-microgreens',
        name: 'Premium Microgreens',
        description: 'Specialty and high-demand microgreens',
        icon: 'Crown',
        color: '#fbbf24',
        products: 2, // Sunflower Microgreens, Mixed Microgreens
      },
    ],
  },

  {
    id: 'grocery',
    name: 'Grocery',
    description: 'Pantry staples, oils, dairy products, and condiments',
    emoji: '🛒',
    color: '#7c3aed',
    lightColor: '#faf5ff',
    darkColor: '#5b21b6',
    icon: 'Package',
    averagePrice: { min: 18, max: 595 },
    totalProducts: 12,
    typicalUnitTypes: ['kg', 'liter', 'box'],
    tips: 'Non-perishable staples available year-round. Essential for every household.',
    subcategories: [
      {
        id: 'oils-fats',
        name: 'Oils & Fats',
        description: 'Cooking oils and ghee',
        icon: 'Droplet',
        color: '#d97706',
        products: 3, // Ghee, Coconut Oil, Mustard Oil
      },
      {
        id: 'dairy-products',
        name: 'Dairy Products',
        description: 'Dairy and honey products',
        icon: 'Heart',
        color: '#f97316',
        products: 2, // Honey, Butter
      },
      {
        id: 'dairy-derivatives',
        name: 'Dairy Derivatives',
        description: 'Cheese, paneer, and dairy preparations',
        icon: 'Square',
        color: '#fbbf24',
        products: 2, // Cheese, Paneer
      },
      {
        id: 'grains-staples',
        name: 'Grains & Staples',
        description: 'Rice, flour, and grain products',
        icon: 'Wheat',
        color: '#ca8a04',
        products: 3, // Rice, Wheat Flour, Corn
      },
      {
        id: 'pulses',
        name: 'Pulses',
        description: 'Lentils and pulses for nutrition',
        icon: 'Layers',
        color: '#b91c1c',
        products: 2, // Dal, Pulses
      },
      {
        id: 'condiments',
        name: 'Condiments',
        description: 'Salt, sugar, and basic seasonings',
        icon: 'Sparkles',
        color: '#6366f1',
        products: 2, // Salt, Sugar
      },
    ],
  },

  {
    id: 'animal-products',
    name: 'Animal Products',
    description: 'Protein-rich animal products including poultry, seafood, meat, and dairy',
    emoji: '🍗',
    color: '#d97706',
    lightColor: '#fffbeb',
    darkColor: '#b45309',
    icon: 'Beef',
    averagePrice: { min: 6, max: 485 },
    totalProducts: 11,
    typicalUnitTypes: ['kg', 'pieces', 'liter', 'dozen'],
    tips: 'High-demand year-round. Best for bulk orders. Store temperature-controlled.',
    subcategories: [
      {
        id: 'poultry',
        name: 'Poultry',
        description: 'Chicken and poultry products',
        icon: 'Feather',
        color: '#dc2626',
        products: 4, // Chicken Whole, Chicken Pieces, Chicken Breast, Eggs
      },
      {
        id: 'seafood',
        name: 'Seafood',
        description: 'Fresh fish and seafood',
        icon: 'Fish',
        color: '#0891b2',
        products: 3, // Fish Tilapia, Fish Rohu, Fish Catfish
      },
      {
        id: 'meat',
        name: 'Meat',
        description: 'Mutton and goat meat',
        icon: 'Award',
        color: '#84cc16',
        products: 2, // Mutton, Goat Meat
      },
      {
        id: 'eggs-dairy',
        name: 'Eggs & Dairy',
        description: 'Eggs, milk, and dairy products',
        icon: 'Heart',
        color: '#f97316',
        products: 2, // Eggs, Milk, Yogurt
      },
    ],
  },
];

/**
 * Helper function to get a category by ID
 */
export const getCategoryById = (categoryId: string): CategoryDefinition | undefined => {
  return CATEGORIES.find((c) => c.id === categoryId);
};

/**
 * Helper function to get a category by name
 */
export const getCategoryByName = (categoryName: MainCategory): CategoryDefinition | undefined => {
  return CATEGORIES.find((c) => c.name === categoryName);
};

/**
 * Helper function to get all main category names
 */
export const getAllCategoryNames = (): MainCategory[] => {
  return CATEGORIES.map((c) => c.name);
};

/**
 * Helper function to get subcategories for a main category
 */
export const getSubcategoriesByCategory = (
  categoryId: string
): Subcategory[] | undefined => {
  const category = getCategoryById(categoryId);
  return category?.subcategories;
};

/**
 * Helper function to get all subcategories across all categories
 */
export const getAllSubcategories = (): Array<Subcategory & { parentCategory: MainCategory }> => {
  const all: Array<Subcategory & { parentCategory: MainCategory }> = [];
  CATEGORIES.forEach((category) => {
    category.subcategories.forEach((subcat) => {
      all.push({
        ...subcat,
        parentCategory: category.name,
      });
    });
  });
  return all;
};

/**
 * Helper function to find subcategory by ID
 */
export const getSubcategoryById = (subcategoryId: string): Subcategory | undefined => {
  for (const category of CATEGORIES) {
    const subcat = category.subcategories.find((s) => s.id === subcategoryId);
    if (subcat) return subcat;
  }
  return undefined;
};

/**
 * Helper function to get category by subcategory name
 */
export const getCategoryBySubcategoryName = (
  subcategoryName: SubcategoryType
): CategoryDefinition | undefined => {
  return CATEGORIES.find((c) =>
    c.subcategories.some((s) => s.name === subcategoryName)
  );
};
