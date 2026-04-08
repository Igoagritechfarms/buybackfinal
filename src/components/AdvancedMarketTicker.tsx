import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketRates } from '../hooks/useMarketRates';

interface TickerItemProps {
  name: string;
  price: number;
  change: number;
  unit: string;
  category: string;
}

const TickerCard = ({ name, price, change, unit, category }: TickerItemProps) => {
  const isUp = change > 0;
  const isDown = change < 0;
  const percentChange = ((change / price) * 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 min-w-[8rem] w-[8rem] px-1.5 py-1 border-r border-slate-700/35 bg-slate-900/60 hover:bg-slate-800/40 transition-colors cursor-pointer text-[11px]"
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-white font-semibold truncate" title={name}>{name}</span>
        <span className={`px-1 rounded text-[10px] ${isUp ? 'bg-emerald-500/20 text-emerald-300' : isDown ? 'bg-red-500/20 text-red-300' : 'bg-slate-700/30 text-slate-300'}`}>
          {isUp ? '+' : ''}{percentChange}%
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-emerald-300 font-bold text-sm">₹{price}</span>
        <span className="text-slate-400 text-[10px]">/{unit}</span>
      </div>
    </motion.div>
  );
};

export const AdvancedMarketTicker = () => {
  const { rates, isLoading } = useMarketRates();
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // Create ticker items from rates
  const tickerItems = rates.map((r) => ({
    name: r.name,
    price: r.price,
    change: r.price - (r.prev_price || r.price),
    unit: r.unit,
    category: r.category || 'General',
  }));

  // Duplicate items for seamless infinite scroll in a single thin row
  const items = [...tickerItems, ...tickerItems, ...tickerItems];

  useEffect(() => {
    let animationId: number;
    const speed = 0.5; // pixels per frame
    let currentOffset = 0;

    const animate = () => {
      animationId = requestAnimationFrame(() => {
        currentOffset += speed;
        if (trackRef.current) {
          const contentWidth = trackRef.current.offsetWidth;
          const totalWidth = contentWidth / 3; // Since we triplicated items
          if (currentOffset >= totalWidth) {
            currentOffset = 0;
          }
          setOffset(currentOffset);
        }
        animate();
      });
    };

    animate();
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
        <div className="px-2 py-3 text-center">
          <div className="animate-pulse flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-slate-800 rounded-md" />
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden">
          <motion.div
            ref={trackRef}
            animate={{ x: -offset }}
            transition={{ duration: 0, ease: 'linear' }}
            className="flex gap-0"
          >
            {items.map((item, i) => (
              <TickerCard key={`${item.name}-${i}`} {...item} />
            ))}
          </motion.div>
        </div>
      )}

    </section>
  );
};
