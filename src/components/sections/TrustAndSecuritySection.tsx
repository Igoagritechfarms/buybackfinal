/**
 * Trust & Security Section
 * Phase 0 Enhancement: Build confidence with security badges and trust metrics
 */

import { motion } from 'motion/react';
import { Shield, Lock, CheckCircle2, Award, Zap, BarChart3, TrendingUp, Users } from 'lucide-react';

const trustFeatures = [
  {
    icon: Lock,
    title: 'Secure Transactions',
    description: 'Bank-level encryption for all payments',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Award,
    title: 'Verified Farmers',
    description: 'Identity verified & quality certified',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Zap,
    title: 'Instant Settlements',
    description: 'Guaranteed payment within 7 days',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: BarChart3,
    title: 'Fair Pricing',
    description: 'Transparent, market-based pricing',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Zero Hidden Fees',
    description: 'Only 3-5% commission, nothing more',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Users,
    title: '24/7 Support',
    description: 'Always available to help you',
    color: 'from-indigo-500 to-indigo-600'
  },
];

const certifications = [
  { name: 'ISO 27001', icon: '🔒' },
  { name: 'PCI-DSS', icon: '💳' },
  { name: 'GDPR Ready', icon: '📋' },
  { name: 'GST Compliant', icon: '✓' },
];

export const TrustAndSecuritySection = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-agri-earth-50 to-white overflow-hidden px-6">
      {/* Decorative elements */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-10 right-10 w-64 h-64 bg-agri-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="badge-green mx-auto w-fit mb-4">
            <Shield size={16} className="mr-2" />
            Trust & Security
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-agri-earth-900 mb-3">
            Built on Trust. Secured by Technology.
          </h2>
          <p className="text-lg text-agri-earth-600 max-w-2xl mx-auto">
            Your data is secure. Your money is protected. Your success is our priority.
          </p>
        </motion.div>

        {/* Trust Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {trustFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-300`} />

              {/* Card content */}
              <div className="relative p-8 bg-white border-2 border-agri-earth-100 group-hover:border-agri-green-300 rounded-2xl transition-all">
                {/* Icon */}
                <motion.div
                  group-hover:scale-110
                  transition={{ type: 'spring', stiffness: 400 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="text-white" size={24} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-agri-earth-900 mb-2">{feature.title}</h3>
                <p className="text-agri-earth-600">{feature.description}</p>

                {/* Hover indicator */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="mt-4 flex items-center gap-2 text-agri-green-600 font-semibold text-sm"
                >
                  <CheckCircle2 size={16} />
                  Verified
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications & Compliance */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-agri-green-50 to-blue-50 border-2 border-agri-green-200 rounded-2xl p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-agri-earth-900 mb-2">Certified & Compliant</h3>
            <p className="text-agri-earth-600">We meet international standards for security and privacy</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="text-center p-6 bg-white rounded-xl border border-agri-green-200 hover:border-agri-green-400 transition-colors"
              >
                <div className="text-3xl mb-2">{cert.icon}</div>
                <div className="font-bold text-agri-earth-900 text-sm">{cert.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl font-black text-agri-green-600 mb-2"
            >
              100%
            </motion.div>
            <p className="text-agri-earth-600 font-semibold">Payment Success Rate</p>
            <p className="text-xs text-agri-earth-500 mt-1">All transactions completed</p>
          </div>

          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="text-5xl font-black text-blue-600 mb-2"
            >
              7 Days
            </motion.div>
            <p className="text-agri-earth-600 font-semibold">Average Payment Time</p>
            <p className="text-xs text-agri-earth-500 mt-1">Guaranteed settlement</p>
          </div>

          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="text-5xl font-black text-purple-600 mb-2"
            >
              99.9%
            </motion.div>
            <p className="text-agri-earth-600 font-semibold">Platform Uptime</p>
            <p className="text-xs text-agri-earth-500 mt-1">Always available</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
