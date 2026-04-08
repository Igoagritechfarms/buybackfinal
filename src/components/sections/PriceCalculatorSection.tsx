import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';

/* Product comparison data */
interface ProductData {
  emoji: string;
  label: string;
  market: number;   // APMC / direct market price
  middleman: number; // what middlemen give
  igo: number;       // IGO guaranteed price
  unit: string;
  harvests: number;  // estimated harvests per year
  qtyPerHarvest: number; // kg per harvest
}

const PRODUCTS: Record<string, ProductData> = {
  tomato: {
    emoji: '\u{1F345}',
    label: 'Tomato',
    market: 23,
    middleman: 17,
    igo: 20,
    unit: 'kg',
    harvests: 4,
    qtyPerHarvest: 500,
  },
  onion: {
    emoji: '\u{1F9C5}',
    label: 'Onion',
    market: 23,
    middleman: 17,
    igo: 20,
    unit: 'kg',
    harvests: 2,
    qtyPerHarvest: 800,
  },
  carrot: {
    emoji: '\u{1F955}',
    label: 'Carrot',
    market: 33,
    middleman: 27,
    igo: 30,
    unit: 'kg',
    harvests: 3,
    qtyPerHarvest: 400,
  },
  mushroom: {
    emoji: '\u{1F344}',
    label: 'Mushroom',
    market: 120,
    middleman: 100,
    igo: 117,
    unit: 'kg',
    harvests: 6,
    qtyPerHarvest: 100,
  },
  lettuce: {
    emoji: '\u{1F96C}',
    label: 'Lettuce',
    market: 26,
    middleman: 20,
    igo: 23,
    unit: 'kg',
    harvests: 5,
    qtyPerHarvest: 300,
  },
};

const PRODUCT_KEYS = Object.keys(PRODUCTS) as (keyof typeof PRODUCTS)[];
const INR = '\u20B9';
const YEARLY_ESTIMATE_TON = 1;
const KG_PER_TON = 1000;

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

/* Component */
export const PriceCalculatorSection = () => {
  const [selected, setSelected] = useState<string>('tomato');
  // Always defined because selected starts as 'tomato' and only updates from PRODUCT_KEYS
  const data = PRODUCTS[selected] as ProductData;

  /* derived */
  const middlemanLossVsMarket = ((data.market - data.middleman) / data.market) * 100;
  const igoBetterCorrection = ((data.igo - data.middleman) / data.igo) * 100;
  const gainVsMiddleman = ((data.igo - data.middleman) / data.middleman) * 100;
  const igoGapVsMarket = ((data.market - data.igo) / data.market) * 100;

  const yearlyQty = YEARLY_ESTIMATE_TON * KG_PER_TON;
  const yearlyIGO = yearlyQty * data.igo;
  const yearlyMiddle = yearlyQty * data.middleman;
  const yearlyGain = yearlyIGO - yearlyMiddle;

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* soft radial blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-200/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <BarChart2 className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Price Comparison Tool
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              See how much you save from middlemen with IGO
            </p>
          </div>
        </div>

        {/* Outer container */}
        <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-3xl shadow-xl p-6 md:p-8 space-y-8">

          {/* Product Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {PRODUCT_KEYS.map((key) => {
              const p = PRODUCTS[key] as ProductData;
              const isActive = key === selected;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-green-700 text-white border-green-700 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:text-green-700'
                  }`}
                >
                  <span>{p.emoji}</span>
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Comparison Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* 1 - Market Price */}
              <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Market Price
                  </span>
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                    <TrendingUp size={16} className="text-gray-500" />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-800">
                  {INR}{data.market}
                  <span className="text-base font-semibold text-gray-400">/{data.unit}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed" />
              </div>

              {/* 2 - Middleman Price */}
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-red-400">
                    Middleman Price
                  </span>
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                </div>
                <div className="text-3xl font-black text-red-700">
                  {INR}{data.middleman}
                  <span className="text-base font-semibold text-red-400">/{data.unit}</span>
                </div>
                <p className="text-xs text-red-500 leading-relaxed">
                  Lost to middlemen {'\u2014'} you deserve better
                </p>
              </div>

              {/* 3 - IGO Fair Price */}
              <div className="rounded-2xl border-2 border-green-500 bg-green-700 p-5 flex flex-col gap-3 relative overflow-hidden shadow-lg">
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  Best Result ✓
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-green-200">
                    IGO Fair Price
                  </span>
                  <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">
                  {INR}{data.igo}
                  <span className="text-base font-semibold text-green-300">/{data.unit}</span>
                </div>
                <p className="text-xs text-green-200 leading-relaxed">
                  You save
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Summary Row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`summary-${selected}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Middleman Loss */}
              <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <div className="w-12 h-12 bg-red-700 rounded-2xl flex items-center justify-center shrink-0">
                  <ArrowUpRight className="text-white" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-0.5">
                    Middleman Loss
                  </p>
                  <p className="text-2xl font-black text-red-700">
                    -{middlemanLossVsMarket.toFixed(1)}%
                    <span className="text-sm font-semibold text-gray-500 ml-1">loss vs market</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Better with IGO:{' '}
                    <span className="font-bold text-green-600">+{igoBetterCorrection.toFixed(1)}%</span>{' '}
                    {'\u00B7'} IGO vs market gap:{' '}
                    <span className="font-bold text-amber-700">-{igoGapVsMarket.toFixed(1)}%</span>
                  </p>
                </div>
              </div>

              {/* Yearly Estimate */}
              <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                <div className="w-12 h-12 bg-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
                  <Calendar className="text-white" size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-0.5">
                    Yearly Estimate
                  </p>
                  <p className="text-2xl font-black text-emerald-700">
                    {fmt(yearlyIGO)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    For {YEARLY_ESTIMATE_TON} tonne ({yearlyQty.toLocaleString('en-IN')} {data.unit}) yearly
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Extra vs middlemen: <span className="font-bold text-emerald-600">+{fmt(yearlyGain)}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Higher income: <span className="font-bold text-emerald-600">+{gainVsMiddleman.toFixed(2)}%</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center">
            * Estimates shown for {YEARLY_ESTIMATE_TON} tonne ({yearlyQty.toLocaleString('en-IN')} {data.unit}) per year. Estimates are calculated based on real-time market trends, seasonal demand, produce quality, location, and best landing prices.
          </p>
        </div>
      </div>
    </section>
  );
};

