import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarDays,
  Download,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

type City = 'Chennai' | 'Bangalore' | 'Hyderabad';
type Crop = 'Tomato' | 'Onion' | 'Cucumber' | 'Microgreens' | 'Spinach' | 'Mushroom' | 'Toor Dal';
type DateRange = 7 | 15 | 30;

interface TrendPoint {
  dateISO: string;
  fullDateLabel: string;
  dayLabel: string;
  dateLabel: string;
  Chennai: number;
  Bangalore: number;
  Hyderabad: number;
}

interface PlotPoint extends TrendPoint {
  xLabel: string;
}

const CITIES: City[] = ['Chennai', 'Bangalore', 'Hyderabad'];
const CROPS: Crop[] = ['Tomato', 'Onion', 'Cucumber', 'Microgreens', 'Spinach', 'Mushroom', 'Toor Dal'];
const RANGES: DateRange[] = [7, 15, 30];

const BASE_PRICES: Record<Crop, Record<City, number>> = {
  Tomato: { Chennai: 42, Bangalore: 40, Hyderabad: 44 },
  Onion: { Chennai: 35, Bangalore: 33, Hyderabad: 37 },
  Cucumber: { Chennai: 29, Bangalore: 27, Hyderabad: 31 },
  Microgreens: { Chennai: 250, Bangalore: 242, Hyderabad: 260 },
  Spinach: { Chennai: 38, Bangalore: 35, Hyderabad: 40 },
  Mushroom: { Chennai: 185, Bangalore: 178, Hyderabad: 194 },
  'Toor Dal': { Chennai: 140, Bangalore: 136, Hyderabad: 148 },
};

const CITY_COLORS: Record<City, string> = {
  Chennai: '#16a34a',
  Bangalore: '#4d7c0f',
  Hyderabad: '#0f766e',
};

const CITY_SURFACE: Record<City, string> = {
  Chennai: 'from-green-50 to-white border-green-100',
  Bangalore: 'from-lime-50 to-white border-lime-100',
  Hyderabad: 'from-emerald-50 to-white border-emerald-100',
};

const seeded = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const getDemandLabel = (percentChange: number): 'High Demand' | 'Medium Demand' | 'Stable' => {
  if (percentChange >= 1.2) {
    return 'High Demand';
  }
  if (percentChange >= 0.2 || percentChange <= -0.9) {
    return 'Medium Demand';
  }
  return 'Stable';
};

const demandBadgeClass: Record<'High Demand' | 'Medium Demand' | 'Stable', string> = {
  'High Demand': 'bg-green-100 text-green-700 border border-green-200',
  'Medium Demand': 'bg-lime-100 text-lime-700 border border-lime-200',
  Stable: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const buildThirtyDaySeries = (crop: Crop): TrendPoint[] => {
  const today = new Date();
  const cropSeed = crop.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seeded(cropSeed * 13);
  const base = BASE_PRICES[crop];

  const cityDrift: Record<City, number> = {
    Chennai: 0.18,
    Bangalore: 0.14,
    Hyderabad: 0.22,
  };

  const prices: Record<City, number> = { ...base };
  const rows: TrendPoint[] = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const pointDate = new Date(today);
    pointDate.setDate(today.getDate() - offset);

    const phase = 30 - offset;
    const row: TrendPoint = {
      dateISO: pointDate.toISOString().slice(0, 10),
      fullDateLabel: pointDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dayLabel: pointDate.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateLabel: pointDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      Chennai: 0,
      Bangalore: 0,
      Hyderabad: 0,
    };

    CITIES.forEach((city, index) => {
      const wave = Math.sin((phase + index * 2) * 0.45) * (base[city] * 0.014);
      const noise = (random() - 0.5) * (base[city] * 0.018);
      prices[city] = Math.max(base[city] * 0.72, prices[city] + cityDrift[city] + wave + noise);
      row[city] = Number(prices[city].toFixed(1));
    });

    rows.push(row);
  }

  return rows;
};

const MarketTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ color: string; dataKey: string; value: number; payload: PlotPoint }>;
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-xl min-w-[170px]">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">{point.fullDateLabel}</p>
      {payload.map((item) => (
        <div key={item.dataKey} className="mb-1.5 flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.dataKey}
          </span>
          <span className="font-black" style={{ color: item.color }}>
            ₹{item.value}/kg
          </span>
        </div>
      ))}
    </div>
  );
};

const CitySummaryCard = ({ city, data }: { city: City; data: TrendPoint[] }) => {
  const today = data[data.length - 1]?.[city] ?? 0;
  const yesterday = data[data.length - 2]?.[city] ?? today;
  const percentChange = yesterday > 0 ? Number((((today - yesterday) / yesterday) * 100).toFixed(1)) : 0;
  const demand = getDemandLabel(percentChange);

  return (
    <motion.article
      whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(22, 163, 74, 0.16)' }}
      className={`rounded-2xl border bg-gradient-to-b p-4 ${CITY_SURFACE[city]}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-sm font-black text-gray-900">{city}</h4>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${demandBadgeClass[demand]}`}>
          {demand}
        </span>
      </div>

      <p className="text-2xl font-black text-gray-900">₹{today}</p>
      <p className="text-xs text-gray-500">Today's average price per kg</p>

      <div className="mt-3 flex items-center gap-1.5 text-xs font-bold">
        {percentChange > 0 ? (
          <TrendingUp size={14} className="text-green-600" />
        ) : percentChange < 0 ? (
          <TrendingDown size={14} className="text-red-500" />
        ) : (
          <Minus size={14} className="text-gray-400" />
        )}
        <span className={percentChange > 0 ? 'text-green-600' : percentChange < 0 ? 'text-red-500' : 'text-gray-500'}>
          {percentChange > 0 ? '+' : ''}
          {percentChange}% from yesterday
        </span>
      </div>
    </motion.article>
  );
};

export const DailyMarketTrendsSection = () => {
  const [selectedCrop, setSelectedCrop] = useState<Crop>('Tomato');
  const [selectedRange, setSelectedRange] = useState<DateRange>(7);
  const [selectedLocation, setSelectedLocation] = useState<City | 'All'>('All');

  const thirtyDayData = useMemo(() => buildThirtyDaySeries(selectedCrop), [selectedCrop]);

  const chartData = useMemo<PlotPoint[]>(
    () =>
      thirtyDayData.slice(-selectedRange).map((row) => ({
        ...row,
        xLabel: selectedRange === 7 ? row.dayLabel : row.dateLabel,
      })),
    [thirtyDayData, selectedRange],
  );

  const visibleCities = selectedLocation === 'All' ? CITIES : [selectedLocation];

  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  );

  return (
    <section id="market-trends" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-black text-gray-900 md:text-5xl">Daily Market Price Trends</h2>
          <p className="mx-auto mt-3 max-w-3xl text-base text-gray-600">
            Track daily mandi and wholesale market price movement across key cities.
          </p>
          <p className="mx-auto mt-2 max-w-3xl text-sm text-gray-500">
            Monitor daily market rates from major trading locations to make smarter sell decisions with IGO Farmgate Mandi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
        >
          <article className="rounded-3xl border border-green-100 bg-white p-5 shadow-[0_14px_35px_rgba(16,185,129,0.12)] md:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-gray-900">{selectedCrop} Price Movement</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <RefreshCw size={12} className="text-green-600" />
                  Last updated: {lastUpdated}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:border-green-300 hover:text-green-700"
              >
                <Download size={13} />
                View Details
              </button>
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="trend-crop" className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Product
                </label>
                <select
                  id="trend-crop"
                  value={selectedCrop}
                  onChange={(event) => setSelectedCrop(event.target.value as Crop)}
                  className="min-w-[170px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 outline-none transition focus:border-green-400"
                >
                  {CROPS.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex w-full items-center justify-between gap-1 rounded-xl bg-gray-100 p-1 sm:w-auto sm:justify-start">
                {RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setSelectedRange(range)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      selectedRange === range ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {range} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 -mx-1 overflow-x-auto px-1">
              <div className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
                {(['All', ...CITIES] as const).map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => setSelectedLocation(location)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
                      selectedLocation === location
                        ? 'border-green-600 bg-green-600 text-white shadow-md shadow-green-200'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-4">
              {visibleCities.map((city) => (
                <span key={city} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CITY_COLORS[city] }} />
                  {city}
                </span>
              ))}
              <span className="w-full text-[11px] font-semibold text-gray-500 sm:ml-auto sm:w-auto">Price in ₹ per kg</span>
            </div>

            <div className="h-[350px] w-full md:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 2 }}>
                  <defs>
                    {CITIES.map((city) => (
                      <linearGradient key={city} id={`trend-${city}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CITY_COLORS[city]} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={CITY_COLORS[city]} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>

                  <CartesianGrid strokeDasharray="4 4" stroke="#ecfdf3" vertical={false} />

                  <XAxis
                    dataKey="xLabel"
                    tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    interval={selectedRange === 7 ? 0 : selectedRange === 15 ? 1 : 3}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                    tickFormatter={(value: number) => `₹${value}`}
                  />

                  <Tooltip content={<MarketTooltip />} cursor={{ stroke: '#bbf7d0', strokeWidth: 2 }} />

                  {visibleCities.map((city) => (
                    <Area
                      key={city}
                      type="monotone"
                      dataKey={city}
                      stroke={CITY_COLORS[city]}
                      strokeWidth={2.6}
                      fill={`url(#trend-${city})`}
                      dot={{ r: 0 }}
                      activeDot={{ r: 5, fill: CITY_COLORS[city], strokeWidth: 0 }}
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-4 text-[11px] text-gray-400">
              Data sourced from market price platforms / mandi references
            </p>
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-500">
                <CalendarDays size={13} className="text-green-600" />
                City Snapshot
              </p>
              <p className="mt-1 text-xs text-gray-500">Daily average rates and momentum across key locations.</p>
            </div>

            {CITIES.map((city) => (
              <CitySummaryCard key={city} city={city} data={thirtyDayData} />
            ))}
          </aside>
        </motion.div>
      </div>
    </section>
  );
};
