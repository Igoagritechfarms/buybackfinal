import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { PRODUCTS } from '../../config/products';
import { ProductImage } from '../ProductImage';
import { CATEGORY_STYLES } from '../../config/category-styles';
import { getTopByDemand } from '../../lib/product-utils';
import { MainCategory } from '../../config/categories';

/* demand badge colours */
const demandColour = (demand: string) => {
  const d = (demand ?? '').toLowerCase();
  if (d.includes('very high')) return 'bg-red-500';
  if (d.includes('high'))      return 'bg-orange-500';
  if (d.includes('medium'))    return 'bg-yellow-500';
  return 'bg-gray-400';
};

/**
 * HighDemandProductsSection
 * Shows only the top-demand products grid (up to 8 cards).
 * Used exclusively on the Homepage.
 */
export const HighDemandProductsSection = () => {
  const topDemandProducts = useMemo(() => getTopByDemand(PRODUCTS, 8), []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <Flame className="text-orange-600" size={22} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                High-Demand Products
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Best-selling produce with transparent farmgate mandi prices
              </p>
            </div>
          </div>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-400 text-sm font-bold rounded-xl transition-all w-fit"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {/* ── Product Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topDemandProducts.map((product) => {
            const style = CATEGORY_STYLES[product.category as MainCategory];

            return (
              <div
                key={`demand-${product.id}`}
                className="group rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* ── Image ── */}
                <div className="relative h-48 overflow-hidden flex-shrink-0"
                     style={{ backgroundColor: style?.lightColor ?? '#f0fdf4' }}>
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    emoji={product.emoji}
                    className="h-full w-full"
                    imageClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallbackClassName="flex h-full w-full items-center justify-center text-5xl select-none"
                    backgroundColor={style?.lightColor ?? '#f0fdf4'}
                  />

                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Demand badge – top left */}
                  <span className={`absolute top-3 left-3 ${demandColour(product.demand)} text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm`}>
                    {product.demand}
                  </span>

                  {/* Price change badge – top right */}
                  <span className="absolute top-3 right-3 bg-green-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {product.priceChange}
                  </span>

                  {/* Category pill – bottom left */}
                  <span
                    className="absolute bottom-3 left-3 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm"
                    style={{ backgroundColor: style?.color ?? '#166534' }}
                  >
                    {product.category}
                  </span>
                </div>

                {/* ── Info ── */}
                <div className="px-4 py-4 flex flex-col flex-1">
                  <h4 className="font-bold text-gray-900 text-sm leading-snug mb-3">
                    {product.emoji} {product.name}
                  </h4>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-green-700">₹{product.basePrice}</span>
                      <span className="text-xs text-gray-400 font-medium ml-1">/{product.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                      <TrendingUp size={10} />
                      Trending
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-10 text-center">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Sparkles size={15} />
            Browse Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
};
