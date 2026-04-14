import { motion } from 'motion/react';
import {
  Eye, Target, Leaf, Warehouse, PackageCheck,
  HandCoins, Truck, Star, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Card data ─── */
const CARDS = [
  {
    id: 'vision',
    Icon: Eye,
    emoji: '🌐',
    gradient: 'from-green-700 via-emerald-700 to-green-900',
    accentColor: '#15803d',
    lightBg: '#f0fdf4',
    borderColor: '#86efac',
    badge: 'Our Vision',
    headline: "India's Most Trusted Farmgate Mandi Ecosystem",
    body: "We're building India's most transparent farmgate mandi network — connecting farmers, warehouses, and markets with fair pricing, reliable logistics, and direct payments. Zero middlemen.",
    highlights: [
      { Icon: Warehouse,    label: 'Warehouse-to-market flow' },
      { Icon: PackageCheck, label: 'Transparent quality checks' },
      { Icon: Star,         label: 'India-wide farmer trust' },
    ],
    cta: { label: 'Learn more', to: '/about' },
  },
  {
    id: 'mission',
    Icon: Target,
    emoji: '🎯',
    gradient: 'from-gray-900 via-gray-800 to-gray-950',
    accentColor: '#4d7c0f', // lime-700
    lightBg: '#f7fee7',
    borderColor: '#bef264',
    badge: 'Our Mission',
    headline: 'Simplify Produce Selling for Every Indian Farmers',
    body: "From farm-gate quality checks to direct bank transfers, we make the selling journey effortless. Fair pricing. Smart self transport logistics. Secure payments — within 7 working days, every time.",
    highlights: [
      { Icon: HandCoins, label: 'Secure, on-time payment' },
      { Icon: Truck,     label: 'Self transport intake' },
      { Icon: Leaf,      label: 'Farmer-first always' },
    ],
    cta: { label: 'How it works', to: '/#how-it-works' },
  },
];

/* ─── Individual Card ─── */
const Card = ({ card, i }: { card: (typeof CARDS)[0]; i: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, delay: i * 0.1 }}
    className="flex flex-col rounded-3xl overflow-hidden border shadow-md hover:shadow-xl transition-shadow duration-300"
    style={{ borderColor: card.borderColor }}
  >
    {/* Gradient header */}
    <div className={`bg-gradient-to-br ${card.gradient} px-7 py-6 relative overflow-hidden`}>
      {/* Subtle grid texture */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${card.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="3 5" />
            <circle cx="0" cy="0" r="1.2" fill="white" opacity="0.45" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${card.id})`} />
      </svg>
      {/* Decorative blobs */}
      <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative z-10 flex items-start gap-4">
        {/* Emoji icon */}
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0 select-none">
          {card.emoji}
        </div>
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white/60 block mb-1">
            {card.badge}
          </span>
          <h3 className="text-xl font-black text-white leading-snug tracking-tight">
            {card.headline}
          </h3>
        </div>
      </div>
    </div>

    {/* Body */}
    <div
      className="flex flex-col flex-1 px-7 py-6 gap-5"
      style={{ backgroundColor: card.lightBg }}
    >
      <p className="text-sm text-gray-600 leading-relaxed font-medium">
        {card.body}
      </p>

      {/* Highlights */}
      <div className="flex flex-col gap-2">
        {card.highlights.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border"
            style={{ borderColor: card.borderColor }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: card.accentColor + '15' }}
            >
              <Icon size={12} style={{ color: card.accentColor }} />
            </div>
            <span className="text-xs font-semibold text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        to={card.cta.to}
        className="mt-auto inline-flex items-center gap-2 text-sm font-bold transition-colors"
        style={{ color: card.accentColor }}
      >
        {card.cta.label}
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </motion.div>
);

/* ─── Section ─── */
export const VisionMissionSection = () => (
  <section id="vision-mission" className="py-16 bg-white">
    <div className="max-w-5xl mx-auto px-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-green-50 border border-green-200 rounded-full text-green-700 text-[10px] font-black uppercase tracking-widest">
          <Leaf size={11} />
          Who We Are
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
          Our <span className="text-green-600">Vision</span> &amp;{' '}
          <span className="text-green-600">Mission</span>
        </h2>
      </motion.div>

      {/* Two-column side-by-side cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARDS.map((card, i) => (
          <Card key={card.id} card={card} i={i} />
        ))}
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { val: '1,200+', label: 'Registered Farmers' },
          { val: '₹4.5 Cr+', label: 'Farmer Payouts' },
          { val: '26',     label: 'Produce Verticals' },
          { val: '7 Days', label: 'Payment Guarantee' },
        ].map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -2 }}
            className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center hover:border-green-300 transition-all duration-200"
          >
            <div className="text-xl font-black text-green-700 mb-0.5">{s.val}</div>
            <div className="text-[11px] font-semibold text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);
