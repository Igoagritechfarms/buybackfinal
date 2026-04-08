import { useCallback, useRef, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useMarketRates } from '../hooks/useMarketRates';
import { SkeletonTicker } from './Skeletons';

type TickerItem = {
  name: string;
  price: number;
  prev: number;
  unit: string;
  category: string;
};

interface TickerCardProps {
  item: TickerItem;
}

const TickerCard = ({ item }: TickerCardProps) => {
  const change = item.price - item.prev;
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <div className="flex items-center gap-3 px-5 py-3 border-r border-white/10 shrink-0 min-w-[220px] bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <div className="min-w-[96px]">
        <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wide">{item.category}</span>
        <div className="text-base font-extrabold tracking-tight text-white/90">{item.name}</div>
      </div>
      <div className="text-right">
        <div className="text-base font-black text-amber-300">₹{item.price}/{item.unit}</div>
        <div className={`text-xs flex items-center gap-1 font-semibold ${isUp ? 'text-emerald-300' : isDown ? 'text-rose-300' : 'text-slate-300'}`}>
          {isUp && <TrendingUp size={12} />}
          {isDown && <TrendingDown size={12} />}
          {!isUp && !isDown && <Minus size={12} />}
          {isUp ? '+' : ''}{change}
        </div>
      </div>
    </div>
  );
};

export const MarketTicker = () => {
  const { rates, isLoading } = useMarketRates();
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);

  // Convert market prices to ticker format
  const tickerItems: TickerItem[] = rates.map((r) => ({
    name: r.name,
    price: r.price,
    prev: r.prev_price || r.price,
    unit: r.unit,
    category: r.category || 'General',
  }));

  // Duplicate items for seamless infinite scroll
  const items = [...tickerItems, ...tickerItems];

  useEffect(() => {
    let animationId: number;
    const speed = 40; // pixels per second (tuned for readability)
    let lastTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (isPaused || !trackRef.current) {
        lastTime = performance.now();
        return;
      }

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const track = trackRef.current;
      const contentWidth = track.offsetWidth;
      const halfWidth = contentWidth / 2;

      let nextOffset = offsetRef.current + speed * delta;
      if (halfWidth > 0) {
        nextOffset %= halfWidth;
      }
      offsetRef.current = nextOffset;
      track.style.transform = `translateX(-${nextOffset}px)`;
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  if (isLoading) {
    return (
      <div className="bg-agri-earth-900 border-b border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-2">
          {[...Array(5)].map((_, i) => (
            <SkeletonTicker key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-b border-gold-500/30 sticky top-16 z-40 overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.2)]">
      <div className="flex items-center">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 z-10 rounded-r-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">{t('ticker_label')}</span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div
            ref={trackRef}
            className="flex"
            style={{
              transform: `translateX(-${offsetRef.current}px)`,
              transition: 'none',
              willChange: 'transform',
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {items.map((item, i) => (
              <TickerCard
                key={`ticker-${item.name}-${i}`}
                item={item}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
