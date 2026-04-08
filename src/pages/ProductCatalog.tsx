/**
 * ProductCatalog Page
 * Dedicated product discovery and exploration page
 * Features: Category showcase, seasonal highlights, demand insights, advanced filtering
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, TrendingUp, Leaf, Zap, Crown, ArrowRight } from 'lucide-react';
import { PRODUCTS, Product } from '../config/products';
import { CATEGORIES } from '../config/categories';
import { CATEGORY_STYLES, SUBCATEGORY_STYLES } from '../config/category-styles';
import {
  filterByCategory,
  filterBySubcategory,
  filterInSeason,
  filterByTag,
  getBestValue,
  getPremiumProducts,
  getBulkFriendly,
  getTopByDemand,
  searchProducts as searchProductsUtil,
  sortByPrice,
} from '../lib/product-utils';
import { MainCategory } from '../config/categories';

export const ProductCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'seasonal' | 'value' | 'premium' | 'bulk'>(
    'all'
  );

  // Get seasonal products
  const seasonalProducts = useMemo(() => filterInSeason(PRODUCTS), []);
  const bestValueProducts = useMemo(() => getBestValue(PRODUCTS, 8), []);
  const premiumProducts = useMemo(() => getPremiumProducts(PRODUCTS), []);
  const bulkProducts = useMemo(() => getBulkFriendly(PRODUCTS).slice(0, 8), []);

  // Filter products based on search and selection
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (selectedCategory) {
      result = filterByCategory(result, selectedCategory);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery) ||
          p.subcategory?.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply view filter
    if (viewMode === 'seasonal') {
      result = result.filter((p) => seasonalProducts.includes(p));
    } else if (viewMode === 'value') {
      result = bestValueProducts;
    } else if (viewMode === 'premium') {
      result = premiumProducts;
    } else if (viewMode === 'bulk') {
      result = bulkProducts;
    }

    return result.sort((a, b) => a.basePrice - b.basePrice);
  }, [selectedCategory, searchQuery, viewMode, seasonalProducts, bestValueProducts, premiumProducts, bulkProducts]);

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-agri-earth-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-agri-earth-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-black tracking-tighter text-agri-earth-900 mb-2">
            Product Catalog
          </h1>
          <p className="text-agri-earth-600 max-w-2xl">
            Explore our complete range of fresh produce, organized by category and season. Discover
            what's available now and what's coming soon.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Search & View Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-agri-earth-400" />
            <input
              type="text"
              placeholder="Search products, categories, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-agri-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green-500"
            />
          </div>

          {/* View Mode Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { mode: 'all' as const, label: 'All Products', icon: null },
              { mode: 'seasonal' as const, label: 'In Season', icon: <Leaf size={16} /> },
              { mode: 'value' as const, label: 'Best Value', icon: <TrendingUp size={16} /> },
              { mode: 'premium' as const, label: 'Premium', icon: <Crown size={16} /> },
              { mode: 'bulk' as const, label: 'Bulk Friendly', icon: <Zap size={16} /> },
            ].map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  setSelectedCategory(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                  viewMode === mode
                    ? 'bg-agri-green-600 text-white'
                    : 'bg-agri-earth-100 text-agri-earth-900 hover:bg-agri-earth-200'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Category Quick Filter (when not in special view) */}
          {viewMode === 'all' && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-agri-green-600 text-white'
                    : 'bg-agri-earth-100 text-agri-earth-900 hover:bg-agri-earth-200'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => {
                const style = CATEGORY_STYLES[cat.name];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap text-white"
                    style={{
                      backgroundColor:
                        selectedCategory === cat.name ? style.color : style.lightColor,
                      color: selectedCategory === cat.name ? style.textColor : style.darkColor,
                    }}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Showcase (only when viewing all) */}
        {viewMode === 'all' && !selectedCategory && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-agri-earth-900">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((category) => {
                const style = CATEGORY_STYLES[category.name];
                const categoryProducts = PRODUCTS.filter((p) => p.category === category.name);
                const topProducts = categoryProducts.slice(0, 3);

                return (
                  <motion.div
                    key={category.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedCategory(category.name)}
                    className="card overflow-hidden cursor-pointer group"
                  >
                    {/* Header */}
                    <div
                      className="p-6 text-white group-hover:brightness-110 transition"
                      style={{ backgroundColor: style.color }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-4xl mb-2">{category.emoji}</p>
                          <h3 className="text-2xl font-black">{category.name}</h3>
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                          {categoryProducts.length}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>

                    {/* Products Preview */}
                    <div className="p-6 space-y-3">
                      {topProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium text-agri-earth-900">
                            {product.emoji} {product.name}
                          </span>
                          <span className="text-agri-green-600 font-bold">
                            ₹{product.basePrice}/{product.unit}
                          </span>
                        </div>
                      ))}
                      {categoryProducts.length > 3 && (
                        <button
                          className="w-full mt-3 pt-3 border-t border-agri-earth-200 text-agri-green-600 hover:text-agri-green-700 font-semibold text-sm flex items-center justify-center gap-2 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category.name);
                          }}
                        >
                          View all {categoryProducts.length}
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Seasonal Highlights */}
        {viewMode === 'all' && seasonalProducts.length > 0 && !selectedCategory && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-agri-earth-900">Now Harvesting</h2>
              <span className="text-sm text-agri-earth-600">
                {seasonalProducts.length} products in season
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {seasonalProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Curated Collections */}
        {viewMode === 'all' && !selectedCategory && !searchQuery && (
          <>
            {/* Best Value */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-agri-earth-900">Best Value</h2>
                    <p className="text-sm text-agri-earth-600">High demand, reasonable prices</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {bestValueProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>

            {/* Premium Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Crown className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-agri-earth-900">Premium Selection</h2>
                    <p className="text-sm text-agri-earth-600">Specialty and high-value products</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {premiumProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>

            {/* Bulk Friendly */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Zap className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-agri-earth-900">Bulk Friendly</h2>
                    <p className="text-sm text-agri-earth-600">Great for bulk orders</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {bulkProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Main Product Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-agri-earth-900">
              {viewMode === 'all'
                ? `${selectedCategory || 'All Products'} (${filteredProducts.length})`
                : `${viewMode === 'seasonal' ? 'In Season' : viewMode === 'value' ? 'Best Value' : viewMode === 'premium' ? 'Premium' : 'Bulk Friendly'} Products`}
            </h2>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setViewMode('all');
                }}
                className="text-sm px-3 py-1 bg-agri-earth-100 hover:bg-agri-earth-200 rounded transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-agri-earth-50 rounded-lg">
              <p className="text-agri-earth-600 mb-4">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setViewMode('all');
                }}
                className="px-4 py-2 bg-agri-green-600 text-white rounded-lg hover:bg-agri-green-700 transition"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const categoryStyle = CATEGORY_STYLES[product.category];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card overflow-hidden group cursor-pointer"
    >
      {/* Image */}
      <div
        className="h-32 bg-cover bg-center relative overflow-hidden group-hover:brightness-110 transition"
        style={{
          backgroundImage: `url(${product.imageUrl})`,
          backgroundColor: categoryStyle.lightColor,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {product.demand && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white bg-red-500">
            {product.demand}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-agri-earth-600 font-medium">{product.subcategory}</p>
        <h3 className="font-bold text-gray-900">
          {product.emoji} {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="font-bold text-lg text-agri-green-600">
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
          <div className="flex flex-wrap gap-1 pt-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full text-white bg-opacity-80"
                style={{ backgroundColor: categoryStyle.badge }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCatalog;
