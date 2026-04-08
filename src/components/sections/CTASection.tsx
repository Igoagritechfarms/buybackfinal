import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BadgeCheck, Leaf, Phone } from 'lucide-react';

/**
 * CTA Section — IGO Group Guaranteed Buyback Program
 */
export const CTASection = () => (
  <section className="py-24 relative overflow-hidden bg-gray-950">

    {/* Stitched network SVG background */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ctaGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4ade80" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="2" fill="#4ade80" opacity="0.4" />
            <circle cx="60" cy="0" r="2" fill="#4ade80" opacity="0.4" />
            <circle cx="0" cy="60" r="2" fill="#4ade80" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ctaGrid)" />
      </svg>

      {/* Large decorative glows */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-lime-400 rounded-full blur-[100px]"
      />
    </div>

    {/* Horizontal top stitch accent */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/15 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold mb-6"
      >
        <BadgeCheck size={15} />
        IGO Group Guaranteed Buyback Program
        <motion.div
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-green-400 rounded-full"
        />
      </motion.div>

      {/* Main heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-6xl font-black text-white tracking-tight mb-5 leading-tight"
      >
        Expand Farm Profitability
        <br />
        <span className="text-green-400">with IGO Buyback</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
      >
        1,200+ Indian farmers already trust IGO Buyback for fair pricing, rigorous quality checks, and on-time payments. No middlemen. No delays.
      </motion.p>

      {/* Benefit pills */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3 mb-10"
      >
        {['Fair Pricing', 'Quality Verified', 'Secure Payment', 'Farm Pickup', '7-Day Guarantee', 'India-wide'].map((pill) => (
          <span
            key={pill}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white/8 border border-white/15 rounded-full text-gray-300 text-xs font-semibold"
          >
            <Leaf size={10} className="text-green-400" />
            {pill}
          </span>
        ))}
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/enroll"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black px-8 py-4 rounded-2xl text-base shadow-xl shadow-green-900/40 transition-all group"
          >
            Register as Farmer
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 border-2 border-white/20 text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-white/10 transition-all"
          >
            <Phone size={16} />
            Talk to Our Team
          </Link>
        </motion.div>
      </motion.div>

      {/* Trust footer row */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-white/10"
      >
        {[
          { label: '1,200+ Farmers', sub: 'actively enrolled' },
          { label: '₹4.5 Crore+', sub: 'paid out to farmers' },
          { label: '26 Verticals', sub: 'produce categories' },
          { label: '7 Days', sub: 'payment guarantee' },
        ].map((stat) => (
          <div key={stat.label} className="text-center px-4">
            <div className="text-white font-black text-lg">{stat.label}</div>
            <div className="text-gray-500 text-xs font-medium">{stat.sub}</div>
          </div>
        ))}
      </motion.div>
    </div>

    {/* Bottom stitch accent */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
  </section>
);
