import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  MapPin,
  Search,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react';
import { PRODUCTS, getAllCategories } from '../config/products';
import { CATEGORIES } from '../config/categories';
import { CATEGORY_STYLES, SUBCATEGORY_STYLES } from '../config/category-styles';
import {
  filterByCategory,
  filterBySubcategory,
  filterByDemandLevels,
  filterByPriceRange,
  filterInSeason,
  getCategoryStats,
  groupByCategory,
  getDemandColor,
  getSeasonColor,
} from '../lib/product-utils';
import { MarketPriceGraph } from '../components/MarketPriceGraph';
import { MainCategory } from '../config/categories';

export const Market = () => {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [demandFilter, setDemandFilter] = useState<string[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<'all' | 'in-season' | 'off-season'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Get all categories
  const categories = getAllCategories() as MainCategory[];

  // Get subcategories for selected category
  const currentCategory = selectedCategory
    ? CATEGORIES.find((c) => c.name === selectedCategory)
    : null;
  const subcategories = currentCategory?.subcategories || [];

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Category filter
    if (selectedCategory) {
      result = filterByCategory(result, selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory) {
      result = result.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Demand filter
    if (demandFilter.length > 0) {
      result = filterByDemandLevels(
        result,
        demandFilter as Array<'Low' | 'Medium' | 'High' | 'Very High'>
      );
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
          p.category.toLowerCase().includes(lowerQuery) ||
          p.subcategory?.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  }, [selectedCategory, selectedSubcategory, demandFilter, seasonFilter, priceRange, searchQuery]);

  const handleDemandToggle = (demand: string) => {
    setDemandFilter((prev) =>
      prev.includes(demand) ? prev.filter((d) => d !== demand) : [...prev, demand]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setDemandFilter([]);
    setSeasonFilter('all');
    setPriceRange([0, 600]);
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedSubcategory ||
    searchQuery ||
    demandFilter.length > 0 ||
    seasonFilter !== 'all' ||
    priceRange[0] > 0 ||
    priceRange[1] < 600;

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const maxPrice = Math.max(...PRODUCTS.map((p) => p.basePrice));

  return (
    <div className="pt-16 min-h-screen bg-agri-earth-50">
      {/* Header */}
      <div className="bg-white border-b border-agri-earth-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="badge-green w-fit mb-3"><TrendingUp size={14} /> Live Market Data</div>
              <h1 className="text-4xl font-black tracking-tighter text-agri-earth-900">IGO Market Dashboard</h1>
              <p className="text-agri-earth-500 mt-2 flex items-center gap-2 text-sm">
                <MapPin size={14} /> Tamil Nadu Region
                <span className="text-agri-earth-300">·</span>
                <RefreshCw size={13} /> Updated: {now}
              </p>
            </div>
            <a
              href="https://wa.me/919999999999?text=Subscribe%20to%20price%20alerts"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm px-5 py-2.5 w-fit"
            >
              Get WhatsApp Price Alerts
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Filters Section */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-agri-earth-400" />
            <input
              type="text"
              placeholder="Search products by name, category, or subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-agri-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-agri-green-600 text-white'
                    : 'bg-agri-earth-100 text-agri-earth-900 hover:bg-agri-earth-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => {
                const style = CATEGORY_STYLES[category];
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedSubcategory(null);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                      selectedCategory === category
                        ? 'text-white'
                        : 'bg-agri-earth-100 text-agri-earth-900 hover:bg-agri-earth-200'
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category
                          ? style.color
                          : undefined,
                    }}
                  >
                    {CATEGORIES.find((c) => c.name === category)?.emoji} {category} (
                    {PRODUCTS.filter((p) => p.category === category).length})
                  </button>
                );
              })}
            </div>

            {/* Subcategory Dropdown */}
            {selectedCategory && subcategories.length > 0 && (
              <div className="mt-3 relative max-w-xs">
                <div className="relative">
                  <select
                    value={selectedSubcategory || ''}
                    onChange={(e) => setSelectedSubcategory(e.target.value || null)}
                    className="w-full px-4 py-2 border border-agri-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green-500 appearance-none cursor-pointer"
                  >
                    <option value="">All {selectedCategory} Subcategories</option>
                    {subcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.name}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-earth-600 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters Toggle & Display */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-agri-earth-100 hover:bg-agri-earth-200 transition font-medium text-sm"
            >
              <Filter size={16} />
              Advanced Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-agri-green-600 text-white rounded-full text-xs font-bold">
                  {[
                    selectedCategory ? 1 : 0,
                    selectedSubcategory ? 1 : 0,
                    searchQuery ? 1 : 0,
                    demandFilter.length > 0 ? 1 : 0,
                    seasonFilter !== 'all' ? 1 : 0,
                    priceRange[0] > 0 || priceRange[1] < 600 ? 1 : 0,
                  ].reduce((a, b) => a + b)}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition font-medium text-sm text-red-700"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white rounded-lg border border-agri-earth-200 space-y-4"
            >
              {/* Demand Filter */}
              <div>
                <label className="block text-sm font-semibold text-agri-earth-900 mb-2">
                  Demand Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Low', 'Medium', 'High', 'Very High'].map((demand) => (
                    <button
                      key={demand}
                      onClick={() => handleDemandToggle(demand)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        demandFilter.includes(demand)
                          ? 'text-white'
                          : 'bg-agri-earth-100 text-agri-earth-700 hover:bg-agri-earth-200'
                      }`}
                      style={{
                        backgroundColor: demandFilter.includes(demand)
                          ? getDemandColor(demand)
                          : undefined,
                      }}
                    >
                      {demand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Season Filter */}
              <div>
                <label className="block text-sm font-semibold text-agri-earth-900 mb-2">
                  Seasonal Availability
                </label>
                <div className="flex gap-2">
                  {(['all', 'in-season', 'off-season'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSeasonFilter(option)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        seasonFilter === option
                          ? 'bg-agri-green-600 text-white'
                          : 'bg-agri-earth-100 text-agri-earth-700 hover:bg-agri-earth-200'
                      }`}
                    >
                      {option === 'all'
                        ? 'All Year'
                        : option === 'in-season'
                          ? 'In Season'
                          : 'Off Season'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-agri-earth-900 mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="space-y-3">
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
                    className="w-full h-2 bg-agri-earth-200 rounded-lg appearance-none cursor-pointer"
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
                    className="w-full h-2 bg-agri-earth-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats Summary */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {(() => {
              const stats = getCategoryStats(filteredProducts, selectedCategory);
              return (
                <>
                  <div className="card p-4">
                    <p className="text-xs text-agri-earth-600 uppercase font-bold mb-2">
                      Product Count
                    </p>
                    <p className="text-3xl font-black text-agri-green-600">{stats.count}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-xs text-agri-earth-600 uppercase font-bold mb-2">
                      Avg Price
                    </p>
                    <p className="text-2xl font-black text-agri-earth-900">₹{stats.avgPrice}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-xs text-agri-earth-600 uppercase font-bold mb-2">
                      Price Range
                    </p>
                    <p className="text-sm font-bold text-agri-earth-900">
                      ₹{stats.minPrice} - ₹{stats.maxPrice}
                    </p>
                  </div>
                  <div className="card p-4">
                    <p className="text-xs text-agri-earth-600 uppercase font-bold mb-2">
                      Top Demand
                    </p>
                    <p className="text-lg font-black text-agri-green-600">
                      {
                        Object.entries(stats.demandDistribution).sort(
                          ([, a], [, b]) => b - a
                        )[0]?.[0]
                      }
                    </p>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* Price Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-agri-earth-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-agri-earth-900">Today's Farmgate Rates</h2>
              <p className="text-sm text-agri-earth-500">
                IGO guaranteed prices — no negotiation needed · {filteredProducts.length} of{' '}
                {PRODUCTS.length} products
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm px-3 py-1 bg-agri-earth-100 hover:bg-agri-earth-200 rounded transition"
              >
                Reset View
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            {filteredProducts.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-agri-earth-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-agri-earth-500 uppercase tracking-wide">
                      Product
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-agri-earth-500 uppercase tracking-wide">
                      Category
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-agri-earth-500 uppercase tracking-wide">
                      Subcategory
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-agri-earth-500 uppercase tracking-wide">
                      IGO Rate
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-agri-earth-500 uppercase tracking-wide">
                      Demand
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-agri-earth-500 uppercase tracking-wide">
                      Price Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-agri-earth-50">
                  {filteredProducts.map((product, i) => {
                    const categoryStyle = CATEGORY_STYLES[product.category];
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-agri-green-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{product.emoji}</span>
                            <span className="font-semibold text-agri-earth-900">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="badge text-[11px] text-white"
                            style={{ backgroundColor: categoryStyle.color }}
                          >
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-agri-earth-600">
                            {product.subcategory}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-black text-agri-green-600">
                            ₹{product.basePrice}/{product.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="badge text-[10px] text-white"
                            style={{
                              backgroundColor: getDemandColor(product.demand),
                            }}
                          >
                            {product.demand}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {product.priceChange?.includes('-') ? (
                              <TrendingDown
                                size={16}
                                className="text-red-500"
                              />
                            ) : (
                              <TrendingUp size={16} className="text-green-500" />
                            )}
                            <span className="font-semibold text-sm">
                              {product.priceChange || '-'}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-agri-earth-500 mb-4">
                  No products found matching your filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-agri-green-600 text-white rounded-lg hover:bg-agri-green-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price Trends Chart */}
        <div className="card p-6 md:p-8">
          <h2 className="font-bold text-agri-earth-900 mb-6">6-Month Price Trends</h2>
          <MarketPriceGraph />
        </div>
      </div>
    </div>
  );
};
