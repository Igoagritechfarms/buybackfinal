import { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketRates } from '../hooks/useMarketRates';

interface TickerItemProps {
  name: string;
  price: number;
  change: number;
  unit: string;
}

const TickerCard = ({ name, price, change, unit }: TickerItemProps) => {
  const isUp = change > 0;
  const isDown = change < 0;
  const percentChange = price > 0 ? ((Math.abs(change) / price) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex-shrink-0 min-w-[8rem] w-[8rem] px-1.5 py-1 border-r border-slate-700/35 bg-slate-900/60 hover:bg-slate-800/40 transition-colors cursor-pointer text-[11px]">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-white font-semibold truncate" title={name}>{name}</span>
        <span className={`px-1 rounded text-[10px] ${isUp ? 'bg-emerald-500/20 text-emerald-300' : isDown ? 'bg-red-500/20 text-red-300' : 'bg-slate-700/30 text-slate-300'}`}>
          {isUp ? <TrendingUp size={9} className="inline" /> : isDown ? <TrendingDown size={9} className="inline" /> : null}
          {isUp ? '+' : isDown ? '-' : ''}{percentChange}%
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-emerald-300 font-bold text-sm">₹{price}</span>
        <span className="text-slate-400 text-[10px]">/{unit}</span>
      </div>
    </div>
  );
};

export const AdvancedMarketTicker = () => {
  const { rates, isLoading } = useMarketRates();
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const tickerItems = rates.map((r) => ({
    name: r.name,
    price: r.price,
    change: r.price - (r.prev_price || r.price),
    unit: r.unit,
  }));

  // Triplicate for seamless loop
  const items = [...tickerItems, ...tickerItems, ...tickerItems];

  useEffect(() => {
    let animationId: number;
    const speed = 40; // pixels per second
    let lastTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (isPausedRef.current || !trackRef.current) {
        lastTime = performance.now();
        return;
      }

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const track = trackRef.current;
      const totalWidth = track.offsetWidth;
      const resetAt = totalWidth / 3; // one-third since items are triplicated

      let next = offsetRef.current + speed * delta;
      if (resetAt > 0) {
        next %= resetAt;
      }
      offsetRef.current = next;
      track.style.transform = `translateX(-${next}px)`;
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="sticky top-16 z-40 bg-slate-950/90 border-b border-slate-800 py-1 overflow-hidden shadow-lg backdrop-blur-md">
      <div className="px-2 pb-1 flex items-center justify-between text-[11px] text-slate-300">
        <div className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Live Market Prices</span>
        </div>
        <div className="text-slate-400">Updated 30s</div>
      </div>

      {isLoading ? (
        <div className="px-2 py-3">
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-slate-800 rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div
          className="overflow-hidden"
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
        >
          <div
            ref={trackRef}
            className="flex gap-0"
            style={{ willChange: 'transform' }}
          >
            {items.map((item, i) => (
              <TickerCard key={`${item.name}-${i}`} {...item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
