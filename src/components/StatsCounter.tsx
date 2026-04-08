import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

interface StatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  decimals?: number;
}

const Counter = ({ value, suffix = '', prefix = '', label, sublabel, decimals = 0 }: StatProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(parseFloat(start.toFixed(decimals)));
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, value, decimals]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center px-4"
    >
      <div className="text-4xl md:text-5xl font-black text-green-600 tabular-nums">
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </div>
      <div className="text-sm font-bold text-gray-800 mt-2">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
    </motion.div>
  );
};

export const StatsCounter = () => (
  <section className="py-16 bg-white border-y border-gray-100">
    <div className="max-w-5xl mx-auto px-6">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-xs font-bold text-green-600 uppercase tracking-widest mb-10"
      >
        IGOBuyback by the Numbers
      </motion.p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
        <Counter value={1200} suffix="+" label="Registered Farmers" sublabel="India-wide" />
        <Counter value={7} suffix=" Days" label="On-time Payment" sublabel="Guaranteed" />
        <Counter value={100} suffix="%" label="Farmer Satisfaction" sublabel="Verified reviews" />
        <Counter value={4.5} suffix="Cr+" prefix="₹" decimals={1} label="Total Payouts" sublabel="To farmers across India" />
      </div>
    </div>
  </section>
);
