import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MapPin, Calendar } from 'lucide-react';

type VegetableKey = 'cucumber' | 'microgreens' | 'mushroom';

type MonthlyPoint = {
  month: string;
  rate: number;
};

type VegetableSeries = {
  name: string;
  unit: string;
  color: string;
  monthlyRates: MonthlyPoint[];
};

const VEGETABLE_SERIES: Record<VegetableKey, VegetableSeries> = {
  cucumber: {
    name: 'Cucumber',
    unit: 'INR / kg',
    color: '#16a34a',
    monthlyRates: [
      { month: 'Jan', rate: 23 },
      { month: 'Feb', rate: 25 },
      { month: 'Mar', rate: 24 },
      { month: 'Apr', rate: 27 },
      { month: 'May', rate: 29 },
      { month: 'Jun', rate: 28 },
    ],
  },
  microgreens: {
    name: 'Microgreens',
    unit: 'INR / kg',
    color: '#8b5cf6',
    monthlyRates: [
      { month: 'Jan', rate: 255 },
      { month: 'Feb', rate: 262 },
      { month: 'Mar', rate: 268 },
      { month: 'Apr', rate: 275 },
      { month: 'May', rate: 281 },
      { month: 'Jun', rate: 289 },
    ],
  },
  mushroom: {
    name: 'Mushroom',
    unit: 'INR / kg',
    color: '#f59e0b',
    monthlyRates: [
      { month: 'Jan', rate: 178 },
      { month: 'Feb', rate: 184 },
      { month: 'Mar', rate: 181 },
      { month: 'Apr', rate: 188 },
      { month: 'May', rate: 194 },
      { month: 'Jun', rate: 198 },
    ],
  },
};

export const MarketPriceGraph = () => {
  const vegetableKeys = useMemo(() => Object.keys(VEGETABLE_SERIES) as VegetableKey[], []);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedVegetable = vegetableKeys[carouselIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % vegetableKeys.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [vegetableKeys]);

  useEffect(() => {
    const now = new Date();
    setLastUpdated(
      now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  }, [selectedVegetable]);

  useEffect(() => {
    const activeCard = cardRefs.current[carouselIndex];
    const container = cardsContainerRef.current;

    if (activeCard && container) {
      const cardLeft = activeCard.offsetLeft;
      const cardWidth = activeCard.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScroll = cardLeft - (containerWidth - cardWidth) / 2;

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
      return;
    }

    if (activeCard) {
      activeCard.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [carouselIndex]);

  const activeSeries = VEGETABLE_SERIES[selectedVegetable];
  const activeData = useMemo(() => activeSeries.monthlyRates, [activeSeries]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-agri-green-600" />
          <h3 className="text-xl font-bold">Live Vegetable Market Insights</h3>
        </div>
      </div>

      <div className="rounded-2xl border border-agri-earth-200 bg-agri-earth-50 p-3">
        <div ref={cardsContainerRef} className="flex gap-3 overflow-x-auto pb-1">
          {vegetableKeys.map((vegKey, index) => {
            const vegetable = VEGETABLE_SERIES[vegKey];
            const isActive = selectedVegetable === vegKey;
            return (
              <button
                key={vegKey}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onClick={() => setCarouselIndex(vegetableKeys.indexOf(vegKey))}
                className={`min-w-[170px] rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? 'bg-white border-agri-green-500 shadow-sm'
                    : 'bg-agri-earth-100 border-agri-earth-200 hover:bg-white'
                }`}
              >
                <div className="font-bold text-base text-agri-earth-900">{vegetable.name}</div>
                <div className="text-sm font-bold mt-1" style={{ color: vegetable.color }}>
                  {vegetable.monthlyRates[vegetable.monthlyRates.length - 1]?.rate ?? 0} {vegetable.unit}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 py-3 bg-white/80 border-t border-agri-earth-200">
          {vegetableKeys.map((vegKey, index) => (
            <button
              key={vegKey}
              aria-label={`Show ${VEGETABLE_SERIES[vegKey].name}`}
              onClick={() => setCarouselIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === carouselIndex ? 'w-8 bg-agri-green-600' : 'w-2.5 bg-agri-earth-300 hover:bg-agri-earth-400'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full bg-white p-6 rounded-2xl shadow-inner border border-agri-earth-200">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activeData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: number) => [`${value} ${activeSeries.unit}`, activeSeries.name]}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              name={activeSeries.name}
              stroke={activeSeries.color}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-agri-earth-800 opacity-70">
        <span className="flex items-center gap-1">
          <Calendar size={14} /> Updated: {lastUpdated}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={14} /> Region: Tamil Nadu
        </span>
      </div>
    </div>
  );
};
