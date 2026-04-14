import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, ShieldCheck, Star, Leaf,
  TrendingUp, CheckCircle2, Clock, Users, Award, Globe, BadgeCheck,
} from 'lucide-react';

/**
 * Hero Section — IGO Farmgate Mandi
 * "Sell Direct. Earn Better. Get Paid On Time"
 * Assured Farmgate Mandi · Fast Quality Verification · Technical Support · Trusted Buyer Network
 */
export const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-green-600">
    {/* Decorative blobs */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-10 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-lime-400/15 rounded-full blur-3xl"
      />
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff opacity=0.03%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"
      />
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* ── Left Content ── */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-7"
        >
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-sm font-semibold"
          >
            <ShieldCheck size={15} className="text-lime-300" />
            Trusted by 1,200+ Farmers Across India
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-lime-400 rounded-full"
            />
          </motion.div>

          {/* Main Headline */}
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl xl:text-5xl font-black text-white leading-[0.95] tracking-tighter"
            >
              <span className="block md:whitespace-nowrap">Sell Direct  Earn Better.</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="block text-lime-300 md:whitespace-nowrap"
              >
                Get Paid On Time
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-xl md:text-2xl text-green-50 max-w-xl leading-relaxed font-bold"
            >
              <span className="font-extrabold">IGO Farmgate  Mandi</span>{' '}
              is where your harvest gets the{' '}
              <span>
                value it deserves
              </span>.
            </motion.p>
          </div>

          {/* Benefit Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { icon: <BadgeCheck size={14} />, label: 'Zero Middleman' },
              { icon: <CheckCircle2 size={14} />, label: 'Fast Quality Verification' },
              { icon: <Globe size={14} />, label: 'Technical Support' },
              { icon: <Users size={14} />, label: 'Trusted Buyer Network' },
            ].map((pill, i) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/12 border border-white/20 rounded-full text-white text-xs font-semibold backdrop-blur"
              >
                <span className="text-lime-300">{pill.icon}</span>
                {pill.label}
              </motion.div>
            ))}
          </motion.div>

          {/* Product Verticals Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4"
          >
            <p className="text-sm font-bold text-lime-300 mb-1.5">26+ Product Categories Covered</p>
            <p className="text-green-100 text-sm">
              Vegetables · Fruits · Microgreens · Spices · Dry Fruits · Honey · More
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/enroll"
                className="inline-flex items-center gap-2 px-8 py-4 bg-lime-400 hover:bg-lime-300 text-green-900 font-black rounded-2xl shadow-xl shadow-lime-900/30 transition-all text-base group"
              >
                Register as Farmer
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/market"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/30 transition-all text-base backdrop-blur"
              >
                <TrendingUp size={17} />
                See Farmgate Rates
              </Link>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-5"
          >
            <div className="flex -space-x-2">
              {['🌾', '🥕', '🍅', '🌱', '🍎'].map((emoji, i) => (
                <motion.div
                  key={`avatar-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.08, type: 'spring' }}
                  className="w-9 h-9 rounded-full bg-green-600 border-2 border-green-700 flex items-center justify-center text-base shadow"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#bef264" className="text-lime-300" />
                ))}
                <span className="text-white font-bold text-sm ml-1">4.9/5</span>
              </div>
              <p className="text-green-200 text-xs font-medium">800+ verified farmer reviews across India</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right Side — Stats Glance Card ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-5"
        >
          {/* Stats card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-7"
          >
            <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
              <Award size={20} className="text-lime-300" />
              IGO Farmgate Mandi at a Glance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '₹4.5 Cr', label: 'Paid Out to Farmers', icon: <TrendingUp size={16} /> },
                { value: '1,200+', label: 'Active Farmers', icon: <Users size={16} /> },
                { value: '24/7', label: 'Technical Support', icon: <Globe size={16} /> },
                { value: '12+', label: 'States Covered', icon: <Clock size={16} /> },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.04 }}
                  className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center hover:bg-white/15 transition-colors cursor-default"
                >
                  <div className="flex items-center justify-center mb-2 text-lime-300">{stat.icon}</div>
                  <p className="text-2xl font-black text-lime-300">{stat.value}</p>
                  <p className="text-xs text-green-200 mt-1 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trustmarks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/8 backdrop-blur border border-white/15 rounded-3xl p-6"
          >
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Leaf size={15} className="text-lime-300" /> Why Farmers Choose Us
            </p>
            <div className="space-y-3">
              {[
                { emoji: '🤝', text: 'Assured farmgate mandi support for selected produce' },
                { emoji: '📈', text: 'Best price guidance based on live demand' },
                { emoji: '✅', text: 'Quick quality check and approval process' },
                { emoji: '🚛', text: 'Self transport intake coordination' },
                { emoji: '🌐', text: 'Trusted IGO network across India' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm text-green-100 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);
