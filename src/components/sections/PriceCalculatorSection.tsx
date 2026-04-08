import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface ProductData {
  emoji: string;
  label: string;
  market: number;
  middleman: number;
  igo: number;
  unit: string;
  yearlyQty: number;
}

const PRODUCTS = {
  tomato: { emoji: '\u{1F345}', label: 'Tomato', market: 23, middleman: 17, igo: 20, unit: 'kg', yearlyQty: 1000 },
  onion: { emoji: '\u{1F9C5}', label: 'Onion', market: 23, middleman: 17, igo: 20, unit: 'kg', yearlyQty: 1000 },
  carrot: { emoji: '\u{1F955}', label: 'Carrot', market: 33, middleman: 27, igo: 30, unit: 'kg', yearlyQty: 1000 },
  mushroom: { emoji: '\u{1F344}', label: 'Mushroom', market: 220, middleman: 170, igo: 200, unit: 'kg', yearlyQty: 1000 },
  lettuce: { emoji: '\u{1F96C}', label: 'Lettuce', market: 35, middleman: 28, igo: 31, unit: 'kg', yearlyQty: 1000 },
} satisfies Record<string, ProductData>;

const INR = '\u20B9';
type ProductKey = keyof typeof PRODUCTS;
const PRODUCT_KEYS = Object.keys(PRODUCTS) as ProductKey[];

const formatRupee = (value: number) => `${INR}${Math.round(value).toLocaleString('en-IN')}`;

export const PriceCalculatorSection = () => {
  const [selected, setSelected] = useState<ProductKey>('tomato');
  const data = PRODUCTS[selected] ?? PRODUCTS.tomato;

  const middlemanLossPct = ((data.middleman - data.market) / data.market) * 100;
  const igoVsMarketPct = ((data.igo - data.market) / data.market) * 100;
  const igoGainVsMiddlePct = ((data.igo - data.middleman) / data.middleman) * 100;
  const yearlyIgo = data.igo * data.yearlyQty;
  const yearlyMiddle = data.middleman * data.yearlyQty;
  const yearlyExtra = yearlyIgo - yearlyMiddle;

  return (
    <section className="py-10 bg-agri-earth-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {PRODUCT_KEYS.map((key) => {
            const product = PRODUCTS[key];
            const active = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                  active
                    ? 'bg-agri-green-700 text-white shadow-md'
                    : 'bg-white text-agri-earth-700 border border-agri-earth-200 hover:border-agri-green-300'
                }`}
              >
                <span>{product.emoji}</span>
                <span>{product.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="rounded-[22px] border border-[#d5ebdf] bg-gradient-to-b from-[#f7fbf8] to-[#f2f7f4] p-3.5 sm:p-4.5 lg:p-5 shadow-[0_8px_24px_rgba(21,128,61,0.08)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <article className="rounded-[18px] border-2 border-[#d8dce3] bg-white p-4 sm:p-4.5 min-h-[150px] sm:min-h-[160px] flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-extrabold tracking-[0.1em] uppercase text-[#7f8898]">
                    Market Price
                  </p>
                  <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-[#edf0f4]">
                    <TrendingUp className="text-[#6f7786]" size={18} />
                  </div>
                </div>
                <p className="mt-3 text-4xl sm:text-[44px] leading-none font-black text-[#223047]">
                  {INR}{data.market}
                  <span className="ml-1 text-2xl sm:text-[28px] font-extrabold text-[#8f97a8]">/{data.unit}</span>
                </p>
              </article>

              <article className="rounded-[18px] border-2 border-[#f5bfc4] bg-[#fff4f5] p-4 sm:p-4.5 min-h-[150px] sm:min-h-[160px] flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-extrabold tracking-[0.1em] uppercase text-[#f1565f]">
                    Middleman Price
                  </p>
                  <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-[#fbe2e4]">
                    <AlertTriangle className="text-[#ff3d4a]" size={18} />
                  </div>
                </div>
                <p className="mt-3 text-4xl sm:text-[44px] leading-none font-black text-[#cb0010]">
                  {INR}{data.middleman}
                  <span className="ml-1 text-2xl sm:text-[28px] font-extrabold text-[#f1565f]">/{data.unit}</span>
                </p>
                <p className="mt-2 text-sm sm:text-base font-semibold text-[#ff3d4a] leading-snug">
                  Lost to middlemen {'\u2014'} you deserve better
                </p>
              </article>

              <article className="relative rounded-[18px] border-2 border-[#22b75f] bg-[#18883e] p-4 sm:p-4.5 min-h-[150px] sm:min-h-[160px] flex flex-col shadow-[0_8px_20px_rgba(22,128,61,0.25)]">
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#d8f6e4] px-2.5 py-1 text-[10px] sm:text-[11px] font-black tracking-wide text-[#1d8648]">
                  BEST RESULT
                  <CheckCircle2 size={14} />
                </span>
                <p className="text-xs sm:text-sm font-extrabold tracking-[0.1em] uppercase text-[#b8f0ce]">
                  IGO Fair Price
                </p>
                <p className="mt-3 text-4xl sm:text-[44px] leading-none font-black text-white">
                  {INR}{data.igo}
                  <span className="ml-1 text-2xl sm:text-[28px] font-extrabold text-[#9fe4ba]">/{data.unit}</span>
                </p>
                <p className="mt-2 text-sm sm:text-base font-semibold text-[#9fe4ba]">You save</p>
              </article>
            </div>

            <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-2 gap-3">
              <article className="rounded-[18px] border-2 border-[#f2b2b9] bg-[#fff3f4] p-4 sm:p-4.5 min-h-[138px] sm:min-h-[146px]">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d80010] text-white shrink-0">
                    <ArrowUpRight size={24} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold tracking-[0.12em] uppercase text-[#636f84]">
                      Middleman Loss
                    </p>
                    <p className="mt-2 text-3xl sm:text-4xl leading-none font-black text-[#d80010]">
                      {middlemanLossPct.toFixed(1)}%
                      <span className="ml-2 text-lg sm:text-xl text-[#68768d]">loss vs market</span>
                    </p>
                    <p className="mt-2 text-xs sm:text-sm text-[#8b96a8] leading-snug">
                      Better with IGO: <span className="font-black text-[#149a50]">+{igoGainVsMiddlePct.toFixed(1)}%</span>
                      {' \u00B7 '}
                      IGO vs market gap: <span className="font-black text-[#cc6a22]">{igoVsMarketPct.toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-[18px] border-2 border-[#9ee6be] bg-[#eef8f3] p-4 sm:p-4.5 min-h-[138px] sm:min-h-[146px]">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#067d50] text-white shrink-0">
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold tracking-[0.12em] uppercase text-[#636f84]">
                      Yearly Estimate
                    </p>
                    <p className="mt-2 text-3xl sm:text-4xl leading-none font-black text-[#067d50]">
                      {formatRupee(yearlyIgo)}
                    </p>
                    <p className="mt-2 text-xs sm:text-sm text-[#7c8ba0]">
                      For 1 tonne ({data.yearlyQty.toLocaleString('en-IN')} {data.unit}) yearly
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm text-[#7c8ba0]">
                      Extra vs middlemen: <span className="font-black text-[#067d50]">+{formatRupee(yearlyExtra)}</span>
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm text-[#7c8ba0]">
                      Higher income: <span className="font-black text-[#067d50]">+{igoGainVsMiddlePct.toFixed(2)}%</span>
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <p className="mt-3.5 text-center text-[11px] sm:text-xs leading-relaxed text-[#8a96a8]">
              * Estimates shown for 1 tonne ({data.yearlyQty.toLocaleString('en-IN')} {data.unit}) per year. Estimates are calculated based on real-time market trends, seasonal demand, produce quality, location, and best landing prices.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
