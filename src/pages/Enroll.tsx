import { motion } from 'motion/react';
import { CheckCircle2, Play, IndianRupee, Truck, Calendar } from 'lucide-react';
import { EnrollmentForm } from '../components/EnrollmentForm';
import { useI18n } from '../lib/i18n';

const features = [
  {
    icon: <Calendar size={24} className="text-agri-green-600" />,
    titleKey: 'days_365',
    desc: 'Year-round procurement regardless of season. We buy all 12 months, ensuring stable income for your farm.',
  },
  {
    icon: <IndianRupee size={24} className="text-agri-green-600" />,
    titleKey: 'direct_payment',
    desc: 'Payment deposited directly to your bank account within 7 days of pickup — no cash handling, no delays.',
  },
  {
    icon: <Truck size={24} className="text-agri-green-600" />,
    titleKey: 'logistics',
    desc: 'Our team picks up from your farm gate. No transport costs or arrangement needed from your side.',
  },
];

export const Enroll = () => {
  const { t } = useI18n();

  return (
    <div className="pt-16 min-h-screen bg-agri-earth-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-agri-green-700 to-agri-green-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="badge-green bg-white/20 text-white w-fit mb-4">IGO Farmgate mandi</div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-5">
              {t('enroll_title')}
            </h1>
            <p className="text-agri-green-100 text-lg mb-8 max-w-xl">{t('enroll_sub')}</p>
            <div className="flex flex-wrap gap-3">
              {['Free registration', 'No contract lock-in', 'WhatsApp support', 'Best market rates'].map(b => (
                <div key={b} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                  <CheckCircle2 size={14} /> {b}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Features + Video */}
          <div className="space-y-8">
            {/* How It Works Video */}
            <div>
              <h2 className="text-2xl font-black text-agri-earth-900 mb-6">{t('how_title')}</h2>
              {/* Video placeholder — replace src with actual video */}
              <div className="relative rounded-3xl overflow-hidden bg-agri-earth-900 aspect-video flex items-center justify-center group cursor-pointer shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200"
                  alt="How IGO works"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Play size={32} fill="white" className="text-white ml-1" />
                  </div>
                  <p className="text-white font-semibold text-sm">Watch: How IGO Buyback Works</p>
                  <p className="text-white/60 text-xs mt-1">30 seconds</p>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card p-5 flex gap-4 items-start"
                >
                  <div className="w-12 h-12 bg-agri-green-50 rounded-2xl flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-agri-earth-900 mb-1">{t(f.titleKey)}</h3>
                    <p className="text-sm text-agri-earth-500 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: '1,200+', label: 'Farmers' },
                { val: '₹4.5Cr', label: 'Paid Out' },
                { val: '98%', label: 'Satisfaction' },
              ].map(s => (
                <div key={s.val} className="card p-4 text-center">
                  <div className="text-xl font-black text-agri-green-600">{s.val}</div>
                  <div className="text-xs text-agri-earth-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Enrollment Form */}
          <div>
            <EnrollmentForm />
          </div>
        </div>
      </div>
    </div>
  );
};
