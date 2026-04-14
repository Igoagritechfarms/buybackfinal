import { motion } from 'motion/react';
import {
  Leaf,
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  FileText,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  tint: string;
};

const FEATURES: FeatureCard[] = [
  {
    icon: Leaf,
    title: 'Direct Farmgate Procurement',
    description:
      'We source produce directly through our farmgate network, helping reduce unnecessary middlemen and improving supply efficiency.',
    accent: '#15803d',
    tint: '#f0fdf4',
  },
  {
    icon: TrendingUp,
    title: 'Assured Market Linkage',
    description:
      'Our farmgate mandi system connects farmers with reliable demand channels, creating better market access and more consistent business opportunities.',
    accent: '#166534',
    tint: '#ecfdf5',
  },
  {
    icon: IndianRupee,
    title: 'Transparent Price Process',
    description:
      'We follow a clear and professional procurement process with quality-based evaluation and fair pricing communication.',
    accent: '#16a34a',
    tint: '#f0fdf4',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Check & Grading',
    description:
      'Every produce lot goes through proper quality inspection and grading to help maintain consistency and supply standards.',
    accent: '#0f766e',
    tint: '#ecfeff',
  },
  {
    icon: FileText,
    title: 'Fast Billing & Support',
    description:
      'We focus on smooth billing coordination, operational clarity, and responsive support to make the procurement process easier.',
    accent: '#15803d',
    tint: '#f7fee7',
  },
  {
    icon: Warehouse,
    title: 'Scalable Supply Network',
    description:
      'From local sourcing to large-volume movement, our network is built to support procurement across multiple regions and buyer requirements.',
    accent: '#14532d',
    tint: '#f0fdf4',
  },
];

export const WhyChooseUsSection = () => (
  <section
    id="why-choose-us"
    className="relative overflow-hidden py-24 bg-gradient-to-b from-agri-earth-50 via-white to-agri-green-50"
  >
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-agri-green-100/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-agri-green-200/40 blur-3xl" />
    </div>

    <div className="relative max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="text-center mb-14"
      >
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-agri-earth-900">
          Why Choose Us?
        </h2>
        <div className="mt-4 mb-4 h-1 w-24 rounded-full bg-agri-green-600 mx-auto" />
        <p className="text-base md:text-lg text-agri-earth-600 max-w-2xl mx-auto">
          Why farmers, aggregators, and buyers trust Farmgate Mandi
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, index) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: index * 0.09, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -8 }}
            className="group relative rounded-3xl border border-agri-earth-100 bg-white/90 p-6 shadow-[0_8px_30px_rgba(20,32,20,0.06)] hover:shadow-[0_18px_40px_rgba(22,163,74,0.14)] hover:border-agri-green-200 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ backgroundColor: feature.accent }} />

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: feature.tint, color: feature.accent }}
            >
              <feature.icon size={24} strokeWidth={2} />
            </div>

            <h3 className="text-xl font-bold text-agri-earth-900 mb-3 tracking-tight">
              {feature.title}
            </h3>
            <p className="text-sm md:text-[15px] leading-relaxed text-agri-earth-600">
              {feature.description}
            </p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

