import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, TrendingUp, Leaf, Flame } from 'lucide-react';
import { PRODUCTS } from '../../config/products';
import { ProductImage } from '../ProductImage';
import { CATEGORIES } from '../../config/categories';
import { CATEGORY_STYLES } from '../../config/category-styles';
import { filterInSeason, getTopByDemand } from '../../lib/product-utils';

const DEMAND_BADGE: Record<string, { bg: string; text: string }> = {
  'Very High': { bg: '#15803d', text: '#ffffff' },
  'High':      { bg: '#16a34a', text: '#ffffff' },
  'Medium':    { bg: '#ca8a04', text: '#ffffff' },
  'Low':       { bg: '#dc2626', text: '#ffffff' },
};

/**
 * Products Section — Category showcase + seasonal + high-demand cards
 */
export const ProductsSection = () => {
  const seasonalProducts  = useMemo(() => filterInSeason(PRODUCTS), []);
  const topDemandProducts = useMemo(() => getTopByDemand(PRODUCTS, 8), []);

  /* Decide which product grid to show: seasonal if items exist, else top demand */
  const featuredProducts = seasonalProducts.length >= 4 ? seasonalProducts.slice(0, 8) : topDemandProducts;
  const featuredLabel    = seasonalProducts.length >= 4 ? 'Now in Season' : 'High-Demand Products';
  const featuredSub      = seasonalProducts.length >= 4
    ? `${seasonalProducts.length} fresh seasonal products available`
    : 'Best-selling produce with transparent farmgate mandi prices';

  return (
    <section className="py-20 bg-white">

      {/* ═══════════════════════════════════════
          BLOCK 1 — Products We Buy (categories)
      ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-green-50 border border-green-200 rounded-full text-green-700 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp size={12} />
              Product Categories
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-none">
              Products We Buy
            </h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              Browse our complete range of fresh produce organised by category
            </p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-full transition-colors"
            >
              Browse Catalog <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((category, i) => {
            const style           = CATEGORY_STYLES[category.name];
            const categoryProducts = PRODUCTS.filter((p) => p.category === category.name);
            const topProducts     = categoryProducts.slice(0, 4);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <Link
                  to="/catalog"
                  className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-white"
                >
                  {/* Coloured header */}
                  <div
                    className="px-5 py-4 text-white"
                    style={{ backgroundColor: style.color }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-3xl leading-none">{category.emoji}</span>
                        <h3 className="text-base font-black mt-1.5">{category.name}</h3>
                      </div>
                      <span className="shrink-0 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold leading-none">
                        {categoryProducts.length} items
                      </span>
                    </div>
                    <p className="text-xs opacity-85 mt-1.5 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Product list */}
                  <div className="flex-1 px-5 py-4 space-y-2.5">
                    {topProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium text-gray-800 truncate pr-2">
                          {product.emoji} {product.name}
                        </span>
                        <span className="shrink-0 font-black text-green-600 text-sm">
                          ₹{product.basePrice}
                        </span>
                      </div>
                    ))}

                    {categoryProducts.length > 4 && (
                      <div className="pt-2.5 mt-1 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">
                          +{categoryProducts.length - 4} more items
                        </span>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                          View all <ChevronRight size={12} />
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          BLOCK 2 — Seasonal / High-Demand product cards
      ═══════════════════════════════════════════════ */}
      <div
        className="py-14"
        style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-green-50 border border-green-200 rounded-full text-green-700 text-[10px] font-black uppercase tracking-widest">
                <Flame size={11} />
                {seasonalProducts.length >= 4 ? 'In Season' : 'Top Demand'}
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-none">
                {featuredLabel}
              </h2>
              <p className="text-gray-500 mt-2 text-sm font-medium">{featuredSub}</p>
            </div>
            <Link
              to="/catalog"
              className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 border-2 border-green-600 text-green-700 hover:bg-green-50 text-sm font-bold rounded-full transition-colors"
            >
              Explore All <ChevronRight size={15} />
            </Link>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product, i) => {
              const style  = CATEGORY_STYLES[product.category];
              const demand = DEMAND_BADGE[product.demand] ?? DEMAND_BADGE['Medium']!;
              return (
                <motion.div
                  key={`featured-${product.id}`}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div
                    className="relative h-40 overflow-hidden shrink-0"
                    style={{ backgroundColor: style.lightColor }}
                  >
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      emoji={product.emoji}
                      className="h-full w-full"
                      imageClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackClassName="flex h-full w-full items-center justify-center text-5xl select-none"
                      backgroundColor={style.lightColor}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* Demand badge — top right */}
                    <span
                      className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black leading-tight"
                      style={{ backgroundColor: demand.bg, color: demand.text }}
                    >
                      {product.demand}
                    </span>

                    {/* Category chip — bottom left */}
                    <span
                      className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {product.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-4 gap-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {product.subcategory}
                    </p>
                    <h4 className="font-bold text-gray-900 text-sm leading-snug">
                      {product.emoji} {product.name}
                    </h4>
                    <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-lg font-black text-green-600">
                        ₹{product.basePrice}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        per {product.unit}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors shadow-md hover:shadow-lg text-sm"
            >
              <Leaf size={15} />
              See Full Product Catalog
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
