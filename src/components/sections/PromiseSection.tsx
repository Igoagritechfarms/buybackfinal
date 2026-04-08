import { motion } from 'motion/react';
import {
  ShieldCheck, IndianRupee, Star, Truck, Warehouse, Leaf,
} from 'lucide-react';

const PROMISES = [
  {
    icon: ShieldCheck,
    emoji: '🔍',
    title: 'Fair & Transparent Buyback',
    desc: 'Every buyback transaction is fully visible — prices, deductions, acceptance criteria, and payment are shown clearly at every stage.',
    accent: '#059669',
    light: '#d1fae5',
  },
  {
    icon: IndianRupee,
    emoji: '📊',
    title: 'Real-time Price Quote',
    desc: 'Live market-linked buyback quotes give farmers competitive rates with zero hidden commission or deduction surprises.',
    accent: '#16a34a',
    light: '#dcfce7',
  },
  {
    icon: Star,
    emoji: '✅',
    title: 'Quality-first Produce Handling',
    desc: 'Grade A & B certification through our trained quality verification team — no arbitrariness, just clear objective standards.',
    accent: '#0d9488',
    light: '#ccfbf1',
  },
  {
    icon: IndianRupee,
    emoji: '🏦',
    title: 'Secure & Timely Payments',
    desc: 'Farmer payments are processed within 7 working days directly to registered bank accounts — absolutely no delay.',
    accent: '#65a30d',
    light: '#ecfccb',
  },
  {
    icon: Truck,
    emoji: '🚚',
    title: 'Reliable Pickup & Warehouse',
    desc: 'Our logistics team arranges pickup from your farm gate, nearby collection point, or warehouse — tracked and efficient.',
    accent: '#15803d',
    light: '#bbf7d0',
  },
  {
    icon: Leaf,
    emoji: '🌾',
    title: 'Farmer-first Commitment',
    desc: 'Every process, feature, and policy at IGO Buyback is designed for the benefit of the farmer — not middlemen or traders.',
    accent: '#4d7c0f',
    light: '#d9f99d',
  },
];

export const PromiseSection = () => (
  <section
    id="our-promise"
    className="relative py-24 overflow-hidden"
    style={{ background: 'linear-gradient(to bottom, #f9fafb, #f0fdf4)' }}
  >
    {/* ── Stitched / pencil-art background ── */}
    <div className="absolute inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="promise-bg" width="60" height="60" patternUnits="userSpaceOnUse">
            {/* Diamond grid */}
            <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#16a34a" strokeWidth="0.6" strokeDasharray="3 5" />
            <circle cx="30" cy="0" r="1.5" fill="#16a34a" />
            <circle cx="60" cy="30" r="1.5" fill="#16a34a" />
            <circle cx="30" cy="60" r="1.5" fill="#16a34a" />
            <circle cx="0" cy="30" r="1.5" fill="#16a34a" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#promise-bg)" />
      </svg>

      {/* Large watermark illustration — warehouse icon */}
      <svg
        className="absolute right-0 bottom-0 opacity-[0.03] w-[380px] h-[380px]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Warehouse sketch */}
        <rect x="20" y="80" width="160" height="100" stroke="#166534" strokeWidth="3" strokeDasharray="6 4" />
        <path d="M 20 80 L 100 30 L 180 80" stroke="#166534" strokeWidth="3" strokeDasharray="6 4" />
        <rect x="70" y="110" width="60" height="70" stroke="#166534" strokeWidth="2" />
        {/* Truck approaching */}
        <rect x="30" y="140" width="40" height="20" stroke="#166534" strokeWidth="2" />
        <rect x="15" y="148" width="18" height="12" stroke="#166534" strokeWidth="2" />
        <circle cx="30" cy="162" r="5" stroke="#166534" strokeWidth="2" />
        <circle cx="55" cy="162" r="5" stroke="#166534" strokeWidth="2" />
        {/* Arrow */}
        <path d="M 110 155 L 140 155 L 130 148 M 140 155 L 130 162" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>

    {/* Top accent rule */}
    <div className="absolute top-0 left-0 right-0">
      <div className="flex gap-0 overflow-hidden h-1">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className={`flex-1 h-full ${i % 4 === 1 ? 'bg-green-500' : i % 4 === 3 ? 'bg-lime-400' : 'bg-transparent'}`} />
        ))}
      </div>
    </div>

    <div className="relative max-w-7xl mx-auto px-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-green-200 rounded-full text-green-700 text-xs font-black uppercase tracking-widest mb-5 shadow-sm">
          <ShieldCheck size={12} />
          Our Promise
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
          Our <span className="text-green-600">Promise</span> to Every Farmer
        </h2>
        <p className="text-base text-gray-500 max-w-xl mx-auto">
          Six pillars that define how we operate — built on trust, transparency, and an unwavering farmer-first commitment.
        </p>
      </motion.div>

      {/* Promise card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROMISES.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:border-green-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Top color accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{ background: p.accent }}
            />

            {/* Hover background tint */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
              style={{ background: p.light, opacity: 0 }}
            />

            <div className="relative">
              {/* Icon + emoji badge */}
              <div className="flex items-start justify-between mb-5">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  className="w-13 h-13 w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-md text-2xl"
                  style={{ background: p.light }}
                >
                  {p.emoji}
                </motion.div>

                {/* Step indicator dot */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  className="w-3 h-3 rounded-full mt-1 shadow-sm"
                  style={{ background: p.accent }}
                />
              </div>

              <h4 className="text-base font-black text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
                {p.title}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Bottom trust badge ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 py-6 border-t border-green-100"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
            <Warehouse size={16} className="text-white" />
          </div>
          <span className="font-black text-gray-900 text-sm">IGO Group Guaranteed Buyback</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-gray-200" />
        <div className="flex flex-wrap gap-2 justify-center">
          {['1,200+ Farmers', '₹4.5 Crore+ Paid', '7-Day Payment', 'India-wide'].map((tag) => (
            <span key={tag} className="px-3 py-1 bg-white border border-green-200 rounded-full text-xs font-bold text-green-700 shadow-sm">
              ✓ {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Bottom stitch */}
    <div className="absolute bottom-0 left-0 right-0 flex gap-0 overflow-hidden h-px">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className={`flex-1 h-full ${i % 3 === 0 ? 'bg-green-200' : 'bg-transparent'}`} />
      ))}
    </div>
  </section>
);
