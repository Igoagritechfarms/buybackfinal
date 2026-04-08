/**
 * Product Utility Functions
 * Filtering, searching, and organizing product data
 * Works with hierarchical category structure from categories.ts
 */

import { Product } from '../config/products';
import { MainCategory, SubcategoryType, getCategoryById, getSubcategoriesByCategory } from '../config/categories';
import { DEMAND_COLORS, SEASON_COLORS, TAG_COLORS } from '../config/category-styles';

/**
 * Filter products by a single category
 */
export const filterByCategory = (products: Product[], category: MainCategory): Product[] => {
  return products.filter((p) => p.category === category);
};

/**
 * Filter products by a single subcategory
 */
export const filterBySubcategory = (products: Product[], subcategory: SubcategoryType): Product[] => {
  return products.filter((p) => p.subcategory === subcategory);
};

/**
 * Filter products by both category and subcategory
 */
export const filterByCategoryAndSubcategory = (
  products: Product[],
  category: MainCategory,
  subcategory: SubcategoryType
): Product[] => {
  return products.filter((p) => p.category === category && p.subcategory === subcategory);
};

/**
 * Filter products by demand level
 */
export const filterByDemand = (products: Product[], demand: 'Low' | 'Medium' | 'High' | 'Very High'): Product[] => {
  return products.filter((p) => p.demand === demand);
};

/**
 * Filter products by demand level (multiple)
 */
export const filterByDemandLevels = (
  products: Product[],
  demands: Array<'Low' | 'Medium' | 'High' | 'Very High'>
): Product[] => {
  return products.filter((p) => demands.includes(p.demand));
};

/**
 * Filter products that are in season (by harvest months)
 */
export const filterInSeason = (products: Product[]): Product[] => {
  const currentMonth = new Date().getMonth() + 1; // 1-12

  return products.filter((p) => {
    // If no harvest months specified, assume year-round
    if (!p.harvestMonth || p.harvestMonth.length === 0) return true;
    return p.harvestMonth.includes(currentMonth);
  });
};

/**
 * Filter products by a specific tag
 */
export const filterByTag = (
  products: Product[],
  tag: 'organic' | 'premium' | 'seasonal' | 'limited' | 'bulk'
): Product[] => {
  return products.filter((p) => p.tags && p.tags.includes(tag));
};

/**
 * Filter products by multiple tags (AND logic)
 */
export const filterByAllTags = (
  products: Product[],
  tags: Array<'organic' | 'premium' | 'seasonal' | 'limited' | 'bulk'>
): Product[] => {
  return products.filter((p) => tags.every((tag) => p.tags && p.tags.includes(tag)));
};

/**
 * Filter products by multiple tags (OR logic)
 */
export const filterByAnyTag = (
  products: Product[],
  tags: Array<'organic' | 'premium' | 'seasonal' | 'limited' | 'bulk'>
): Product[] => {
  return products.filter((p) => tags.some((tag) => p.tags && p.tags.includes(tag)));
};

/**
 * Filter products by price range
 */
export const filterByPriceRange = (products: Product[], minPrice: number, maxPrice: number): Product[] => {
  return products.filter((p) => p.basePrice >= minPrice && p.basePrice <= maxPrice);
};

/**
 * Search products by name or description
 */
export const searchProducts = (
  products: Product[],
  query: string
): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.subcategory.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Sort products by price (ascending or descending)
 */
export const sortByPrice = (products: Product[], ascending: boolean = true): Product[] => {
  const sorted = [...products];
  return sorted.sort((a, b) => (ascending ? a.basePrice - b.basePrice : b.basePrice - a.basePrice));
};

/**
 * Sort products by demand level (Very High > High > Medium > Low)
 */
export const sortByDemand = (products: Product[]): Product[] => {
  const demandOrder = { 'Very High': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  const sorted = [...products];
  return sorted.sort((a, b) => demandOrder[a.demand] - demandOrder[b.demand]);
};

/**
 * Sort products alphabetically
 */
export const sortAlphabetically = (products: Product[], ascending: boolean = true): Product[] => {
  const sorted = [...products];
  return sorted.sort((a, b) => (ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
};

/**
 * Sort products by peak month (closest to current month first)
 */
export const sortBySeasonality = (products: Product[]): Product[] => {
  const currentMonth = new Date().getMonth() + 1;
  const sorted = [...products];

  return sorted.sort((a, b) => {
    const aHarvest = a.harvestMonth || [];
    const bHarvest = b.harvestMonth || [];

    // Check if in season
    const aInSeason = aHarvest.includes(currentMonth);
    const bInSeason = bHarvest.includes(currentMonth);

    if (aInSeason && !bInSeason) return -1;
    if (!aInSeason && bInSeason) return 1;

    // Calculate distance from current month
    const getMonthDistance = (months: number[]): number => {
      if (months.length === 0) return 0; // Year-round products
      const distances = months.map((m) => Math.min(Math.abs(m - currentMonth), 12 - Math.abs(m - currentMonth)));
      return Math.min(...distances);
    };

    return getMonthDistance(aHarvest) - getMonthDistance(bHarvest);
  });
};

/**
 * Get top products by demand
 */
export const getTopByDemand = (products: Product[], count: number = 10): Product[] => {
  return sortByDemand(products).slice(0, count);
};

/**
 * Get seasonal highlights for current month
 */
export const getSeasonalHighlights = (products: Product[]): Product[] => {
  return filterInSeason(products).sort(() => Math.random() - 0.5).slice(0, 6);
};

/**
 * Get products grouped by category
 */
export const groupByCategory = (
  products: Product[]
): Record<MainCategory, Product[]> => {
  const grouped: Record<MainCategory, Product[]> = {
    'Vegetables': [],
    'Fruits': [],
    'Greens': [],
    'Microgreens': [],
    'Grocery': [],
    'Animal Products': [],
  };

  products.forEach((p) => {
    grouped[p.category].push(p);
  });

  return grouped;
};

/**
 * Get products grouped by subcategory (with parent category context)
 */
export const groupBySubcategory = (
  products: Product[]
): Record<SubcategoryType, Product[]> => {
  const grouped: Record<string, Product[]> = {};

  products.forEach((p) => {
    if (!grouped[p.subcategory]) {
      grouped[p.subcategory] = [];
    }
    grouped[p.subcategory].push(p);
  });

  return grouped as Record<SubcategoryType, Product[]>;
};

/**
 * Get best value products (good demand with reasonable price)
 */
export const getBestValue = (products: Product[], limit: number = 6): Product[] => {
  const highDemandProducts = products.filter((p) => p.demand === 'High' || p.demand === 'Very High');
  const sorted = sortByPrice(highDemandProducts, true);
  return sorted.slice(0, limit);
};

/**
 * Get premium/specialty products
 */
export const getPremiumProducts = (products: Product[]): Product[] => {
  return products.filter((p) => p.tags && (p.tags.includes('premium') || p.tags.includes('limited')));
};

/**
 * Get bulk-friendly products
 */
export const getBulkFriendly = (products: Product[]): Product[] => {
  return products
    .filter((p) => p.tags && p.tags.includes('bulk'))
    .sort((a, b) => b.demand.localeCompare(a.demand));
};

/**
 * Get products available for a specific month
 */
export const getProductsForMonth = (products: Product[], month: number): Product[] => {
  return products.filter((p) => {
    if (!p.harvestMonth || p.harvestMonth.length === 0) return true;
    return p.harvestMonth.includes(month);
  });
};

/**
 * Get products NOT available for a specific month (out of season)
 */
export const getOutOfSeasonProducts = (products: Product[], month: number): Product[] => {
  return products.filter(
    (p) => p.harvestMonth && p.harvestMonth.length > 0 && !p.harvestMonth.includes(month)
  );
};

/**
 * Calculate average price for a category
 */
export const getCategoryAveragePrice = (products: Product[], category: MainCategory): number => {
  const categoryProducts = filterByCategory(products, category);
  if (categoryProducts.length === 0) return 0;
  const total = categoryProducts.reduce((sum, p) => sum + p.basePrice, 0);
  return Math.round((total / categoryProducts.length) * 100) / 100;
};

/**
 * Get category statistics
 */
export const getCategoryStats = (
  products: Product[],
  category: MainCategory
): {
  count: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  demandDistribution: Record<string, number>;
} => {
  const categoryProducts = filterByCategory(products, category);

  const stats = {
    count: categoryProducts.length,
    minPrice: Math.min(...categoryProducts.map((p) => p.basePrice)),
    maxPrice: Math.max(...categoryProducts.map((p) => p.basePrice)),
    avgPrice: getCategoryAveragePrice(products, category),
    demandDistribution: {
      'Low': 0,
      'Medium': 0,
      'High': 0,
      'Very High': 0,
    },
  };

  categoryProducts.forEach((p) => {
    stats.demandDistribution[p.demand]++;
  });

  return stats;
};

/**
 * Advanced filter combining multiple criteria
 */
export const advancedFilter = (
  products: Product[],
  filters: {
    category?: MainCategory;
    subcategory?: SubcategoryType;
    minPrice?: number;
    maxPrice?: number;
    demand?: Array<'Low' | 'Medium' | 'High' | 'Very High'>;
    tags?: Array<'organic' | 'premium' | 'seasonal' | 'limited' | 'bulk'>;
    tagsLogic?: 'AND' | 'OR';
    inSeasonOnly?: boolean;
    searchQuery?: string;
  }
): Product[] => {
  let result = [...products];

  if (filters.category) {
    result = filterByCategory(result, filters.category);
  }

  if (filters.subcategory) {
    result = filterBySubcategory(result, filters.subcategory);
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const minPrice = filters.minPrice ?? 0;
    const maxPrice = filters.maxPrice ?? Infinity;
    result = filterByPriceRange(result, minPrice, maxPrice);
  }

  if (filters.demand && filters.demand.length > 0) {
    result = filterByDemandLevels(result, filters.demand);
  }

  if (filters.tags && filters.tags.length > 0) {
    result = filters.tagsLogic === 'AND' ? filterByAllTags(result, filters.tags) : filterByAnyTag(result, filters.tags);
  }

  if (filters.inSeasonOnly) {
    result = filterInSeason(result);
  }

  if (filters.searchQuery) {
    result = searchProducts(result, filters.searchQuery);
  }

  return result;
};

/**
 * Get demand color for UI
 */
export const getDemandColor = (demand: string): string => {
  return DEMAND_COLORS[demand as keyof typeof DEMAND_COLORS] || '#9ca3af';
};

/**
 * Get season color for UI
 */
export const getSeasonColor = (season: string): string => {
  return SEASON_COLORS[season as keyof typeof SEASON_COLORS] || '#3b82f6';
};

/**
 * Get tag color for UI
 */
export const getTagColor = (tag: string): string => {
  return TAG_COLORS[tag] || '#6b7280';
};
