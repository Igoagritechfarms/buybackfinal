import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, HeartHandshake, CalendarCheck } from 'lucide-react';

/**
 * Logistics Section — Smart Logistics Support
 * No truck numbers, no own-vehicle claims, no specific vehicle tracking
 */
export const LogisticsSection = () => {
  const features = [
    {
      icon: <ShieldCheck size={20} />,
      title: 'Smart Logistics Support',
      desc: 'Coordinated farm-to-market logistics support — we help arrange collection from your farm gate',
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'Quality Assurance at Pickup',
      desc: 'Produce is checked for freshness and graded before dispatch to ensure top value',
    },
    {
      icon: <CreditCard size={20} />,
      title: '7-Day Payment Guarantee',
      desc: 'Direct bank transfer within 7 working days of produce acknowledgement — no delays',
    },
    {
      icon: <HeartHandshake size={20} />,
      title: 'Dedicated Farmer Support',
      desc: '24/7 support team to assist with scheduling, queries, and payment tracking',
    },
  ];

  return (
    <section className="py-24 bg-gray-950 text-white overflow-hidden" id="logistics">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500/10 border border-lime-500/30 rounded-full text-lime-400 text-sm font-semibold">
              <ShieldCheck size={14} />
              Farm-to-Market Support
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              We Support Your{' '}
              <span className="text-lime-400">Entire Journey.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              From coordinating produce collection to strict quality checks and guaranteed on-time payment — IGOBuyback handles the entire process so you can focus on farming.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={`feature-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 p-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 hover:border-lime-500/20 transition-colors"
                >
                  <div className="text-lime-400 shrink-0 mt-0.5">{f.icon}</div>
                  <div>
                    <div className="font-semibold text-sm text-white">{f.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=1000"
                alt="Farmer with fresh produce"
                className="w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent rounded-3xl" />
            </div>

            {/* Promise card — replaces truck tracking */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-2xl max-w-[230px]"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                <span className="text-xs font-black text-lime-700 uppercase tracking-wide">IGO Promise</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck size={18} className="text-green-600" />
                <span className="text-sm font-black text-gray-900">7 Working Days</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Produce acknowledged → strict quality check → payment credited to your bank
              </p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '85%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-lime-400 to-green-600 rounded-full"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">85% paid within 5 days</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
