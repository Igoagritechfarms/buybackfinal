/**
 * Price Comparison Widget
 * Phase 0 Feature: Show farmer savings with IGO vs traditional channels
 *
 * Displays side-by-side comparison of:
 * - Market price
 * - Middleman/wholesale price
 * - IGO's farmer price
 * - Total farmer savings
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

interface PriceData {
  product: string;
  emoji: string;
  marketPrice: number;
  middlemanPrice: number;
  igoPrice: number;
  unit: string;
}

const COMPARISON_DATA: PriceData[] = [
  {
    product: 'Tomato',
    emoji: '\u{1F345}',
    marketPrice: 23,
    middlemanPrice: 17,
    igoPrice: 20,
    unit: 'kg'
  },
  {
    product: 'Onion',
    emoji: '\u{1F9C5}',
    marketPrice: 23,
    middlemanPrice: 17,
    igoPrice: 20,
    unit: 'kg'
  },
  {
    product: 'Lettuce',
    emoji: '\u{1F96C}',
    marketPrice: 26,
    middlemanPrice: 20,
    igoPrice: 23,
    unit: 'kg'
  },
  {
    product: 'Carrot',
    emoji: '\u{1F955}',
    marketPrice: 33,
    middlemanPrice: 27,
    igoPrice: 30,
    unit: 'kg'
  },
  {
    product: 'Mushroom',
    emoji: '\u{1F344}',
    marketPrice: 120,
    middlemanPrice: 100,
    igoPrice: 117,
    unit: 'kg'
  },
];

const INR = '\u20B9';

export const PriceComparisonWidget = () => {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const product = COMPARISON_DATA[selectedProduct];

  const savingsVsMiddleman = ((product.igoPrice - product.middlemanPrice) / product.middlemanPrice) * 100;
  const savingsVsMarket = ((product.igoPrice - product.marketPrice) / product.marketPrice) * 100;

  const calculateYearlySavings = (dailyIncome: number) => {
    const dailySavings = (product.igoPrice - product.middlemanPrice) * (dailyIncome / product.middlemanPrice);
    return Math.round(dailySavings * 365);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-agri-green-50 rounded-3xl p-8 border border-agri-green-200 shadow-xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-agri-green-100 rounded-xl">
            <TrendingUp className="text-agri-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-agri-earth-900">Price Comparison Tool</h3>
            <p className="text-sm text-agri-earth-600">See how much more you earn with IGO</p>
          </div>
        </div>
      </div>

      {/* Product Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-agri-earth-900 mb-3">
          Select a Product
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {COMPARISON_DATA.map((item, idx) => (
            <motion.button
              key={item.product}
              onClick={() => setSelectedProduct(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl font-semibold transition-all ${
                selectedProduct === idx
                  ? 'bg-agri-green-600 text-white shadow-lg'
                  : 'bg-white border-2 border-agri-earth-200 text-agri-earth-700 hover:border-agri-green-300'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <div className="text-xs mt-1">{item.product}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price Comparison Cards */}
      <motion.div
        key={selectedProduct}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {/* Market Price */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
          <div className="text-gray-600 text-sm font-semibold mb-2">Market Price</div>
          <div className="text-3xl font-black text-agri-earth-900 mb-1">
            {INR}{product.marketPrice}/{product.unit}
          </div>
          <div className="text-xs text-gray-500"></div>
        </div>

        {/* Middleman Price (Bad) */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center relative"
        >
          <div className="text-red-700 text-sm font-semibold mb-2 mt-4">Middleman Price</div>
          <div className="text-3xl font-black text-red-700 mb-1">
            {INR}{product.middlemanPrice}/{product.unit}
          </div>
          <div className="text-xs text-red-600">Lost to middlemen</div>
          <div className="mt-3 pt-3 border-t border-red-200">
            <span className="text-xs font-bold text-red-700">
              {'\u{1F494}'} You lose: {INR}{product.middlemanPrice - product.igoPrice}/{product.unit}
            </span>
          </div>
        </motion.div>

        {/* IGO Price (Best) */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="bg-gradient-to-br from-agri-green-500 to-agri-green-600 rounded-2xl p-6 text-center text-white shadow-xl border-2 border-agri-green-400 relative"
        >
          <div className="absolute top-2 right-2 bg-white text-agri-green-600 text-xs font-bold px-2 py-1 rounded">
            {'\u2705'} Best Deal
          </div>
          <div className="text-green-100 text-sm font-semibold mb-2 mt-4">IGO Fair Price</div>
          <div className="text-4xl font-black mb-1">{INR}{product.igoPrice}/{product.unit}</div>
          <div className="text-green-100 text-sm">You earn</div>
          <div className="mt-3 pt-3 border-t border-green-400">
            <span className="text-sm font-bold text-green-50">
              {'\u{1F389}'} You earn: {INR}{product.igoPrice - product.middlemanPrice}/{product.unit}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Savings Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-agri-green-50 to-green-50 rounded-2xl p-6 mb-8 border border-agri-green-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Savings % */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-agri-green-600 rounded-xl">
              <TrendingUp className="text-white" size={28} />
            </div>
            <div>
              <div className="text-sm text-agri-earth-600 font-semibold">More than Middleman</div>
              <div className="text-3xl font-black text-agri-green-700">
                +{savingsVsMiddleman.toFixed(1)}%
              </div>
              <div className="text-xs text-agri-earth-500">
                {INR}{product.igoPrice - product.middlemanPrice}/{product.unit} extra per unit
              </div>
            </div>
          </div>

          {/* Yearly Estimate */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-agri-green-600 rounded-xl">
              <DollarSign className="text-white" size={28} />
            </div>
            <div>
              <div className="text-sm text-agri-earth-600 font-semibold">Yearly Estimate</div>
              <div className="text-3xl font-black text-agri-green-700">
                {INR}{calculateYearlySavings(10).toLocaleString()}
              </div>
              <div className="text-xs text-agri-earth-500">
                Farming 10 units daily (500kg/month)
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Benefits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-agri-earth-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-agri-green-600" size={20} />
          <h4 className="font-bold text-agri-earth-900">Why IGO is Better</h4>
        </div>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="text-agri-green-600 font-bold text-lg">{'\u2713'}</span>
            <div>
              <div className="font-semibold text-agri-earth-900">Fair Pricing</div>
              <div className="text-sm text-agri-earth-600">No middlemen markup - you get real market prices</div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-agri-green-600 font-bold text-lg">{'\u2713'}</span>
            <div>
              <div className="font-semibold text-agri-earth-900">Quick Payments</div>
              <div className="text-sm text-agri-earth-600">Money in your account within 7 days</div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-agri-green-600 font-bold text-lg">{'\u2713'}</span>
            <div>
              <div className="font-semibold text-agri-earth-900">Transparent Costs</div>
              <div className="text-sm text-agri-earth-600">Only 3-5% commission, nothing hidden</div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-agri-green-600 font-bold text-lg">{'\u2713'}</span>
            <div>
              <div className="font-semibold text-agri-earth-900">Direct Buyers</div>
              <div className="text-sm text-agri-earth-600">Connect with restaurants, stores, and consumers</div>
            </div>
          </li>
        </ul>
      </motion.div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-agri-green-600 to-agri-green-700 text-white font-bold rounded-xl hover:shadow-xl transition-shadow"
      >
        Start Earning Best Price {'\u2192'}
      </motion.button>
    </div>
  );
};

