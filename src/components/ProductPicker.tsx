/**
 * ProductPicker Component
 * Advanced product selection modal for forms (FarmgateForm, EnrollmentForm)
 * Features: Category tabs, search, filters, visual product cards
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { PRODUCTS, Product } from '../config/products';
import { ProductImage } from './ProductImage';
import { CATEGORIES } from '../config/categories';
import { CATEGORY_STYLES, SUBCATEGORY_STYLES } from '../config/category-styles';
import {
  filterByCategory,
  filterBySubcategory,
  filterByDemandLevels,
  filterByPriceRange,
  filterInSeason,
  searchProducts,
  sortByPrice,
} from '../lib/product-utils';
import { MainCategory } from '../config/categories';

interface ProductPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  selectedProductId?: string;
}

const ProductPicker: React.FC<ProductPickerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  selectedProductId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('Vegetables');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [demandFilter, setDemandFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [seasonFilter, setSeasonFilter] = useState<'all' | 'in-season' | 'off-season'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);

  // Get subcategories for current category
  const currentCategory = CATEGORIES.find((c) => c.name === selectedCategory);
  const subcategories = currentCategory?.subcategories || [];

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Category filter
    result = filterByCategory(result, selectedCategory);

    // Subcategory filter
    if (selectedSubcategory) {
      result = result.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Demand filter
    if (demandFilter === 'high') {
      result = filterByDemandLevels(result, ['High', 'Very High']);
    } else if (demandFilter === 'medium') {
      result = filterByDemandLevels(result, ['Medium']);
    }

    // Season filter
    if (seasonFilter === 'in-season') {
      result = filterInSeason(result);
    } else if (seasonFilter === 'off-season') {
      const currentMonth = new Date().getMonth() + 1;
      result = result.filter((p) => {
        if (!p.harvestMonth || p.harvestMonth.length === 0) return false;
        return !p.harvestMonth.includes(currentMonth);
      });
    }

    // Price range filter
    result = filterByPriceRange(result, priceRange[0], priceRange[1]);

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery)
      );
    }

    return result.sort((a, b) => a.basePrice - b.basePrice);
  }, [selectedCategory, selectedSubcategory, demandFilter, seasonFilter, priceRange, searchQuery]);

  const handleSelectProduct = useCallback(
    (product: Product) => {
      onSelectProduct(product);
      onClose();
    },
    [onSelectProduct, onClose]
  );

  const handleCategoryChange = (category: MainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  };

  if (!isOpen) return null;

  const categoryStyle = CATEGORY_STYLES[selectedCategory];
  const maxPrice = Math.max(...PRODUCTS.map((p) => p.basePrice));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: categoryStyle?.lightColor }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select a Product</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close picker"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Search Bar */}
          <div className="sticky top-0 bg-white p-6 border-b">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {CATEGORIES.map((cat) => {
                const style = CATEGORY_STYLES[cat.name];
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.name)}
                    className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
                    style={{
                      backgroundColor:
                        selectedCategory === cat.name ? style.color : style.lightColor,
                      color: selectedCategory === cat.name ? style.textColor : style.darkColor,
                      border: `2px solid ${style.color}`,
                    }}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Subcategory Dropdown */}
            {subcategories.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <select
                    value={selectedSubcategory || ''}
                    onChange={(e) => setSelectedSubcategory(e.target.value || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">All Subcategories</option>
                    {subcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.name}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-600 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Demand Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDemandFilter('all')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    demandFilter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Demand
                </button>
                <button
                  onClick={() => setDemandFilter('high')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    demandFilter === 'high'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  High Demand
                </button>
              </div>

              {/* Season Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSeasonFilter('all')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    seasonFilter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Season
                </button>
                <button
                  onClick={() => setSeasonFilter('in-season')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    seasonFilter === 'in-season'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  In Season
                </button>
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([
                      Math.min(Number(e.target.value), priceRange[1]),
                      priceRange[1],
                    ])
                  }
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([
                      priceRange[0],
                      Math.max(Number(e.target.value), priceRange[0]),
                    ])
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDemandFilter('all');
                    setSeasonFilter('all');
                    setPriceRange([0, maxPrice]);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const subcatStyle = SUBCATEGORY_STYLES[product.subcategory];
                  const isSelected = product.id === selectedProductId;

                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className={`text-left rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Image Container */}
                      <div
                        className="h-32 relative overflow-hidden"
                        style={{
                          backgroundColor: subcatStyle?.lightColor,
                        }}
                      >
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.name}
                          emoji={product.emoji}
                          className="h-full w-full"
                          imageClassName="h-full w-full object-cover"
                          fallbackClassName="flex h-full w-full items-center justify-center text-4xl select-none"
                          backgroundColor={subcatStyle?.lightColor}
                        />
                        {/* Overlay with demand badge */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white bg-red-500">
                          {product.demand}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm text-gray-500">{product.subcategory}</p>
                            <h3 className="font-bold text-gray-900 text-base">
                              {product.emoji} {product.name}
                            </h3>
                          </div>
                        </div>

                        {product.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Price and Unit */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg text-green-600">
                            ₹{product.basePrice}/{product.unit}
                          </span>
                          {product.priceChange && (
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                              {product.priceChange}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full text-white bg-opacity-80"
                                style={{ backgroundColor: subcatStyle?.badge || '#9ca3af' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {PRODUCTS.length} products
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPicker;
