/**
 * Referrals Page
 * Phase 0 Feature: Earn by sharing
 *
 * Allows users to:
 * - See their referral stats
 * - Copy and share referral link
 * - View rewards and tier progression
 * - Track referral earnings
 */

import { motion } from 'motion/react';
import {
  Package,
  TrendingUp,
  UserPlus,
  Users,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { ReferralProgram } from '../components/ReferralProgram';

const REWARD_SYSTEM_CARDS = [
  {
    title: 'Supply Products',
    description: 'Supply vegetables or other farm products to earn IGO coupons automatically.',
    highlight: 'Example: 1 tonne supplied',
    icon: Package,
  },
  {
    title: 'Automatic Coupon Increase',
    description: 'Coupon rewards scale automatically as supply quantity increases.',
    highlight: 'Higher quantity = higher coupon reward',
    icon: TrendingUp,
  },
  {
    title: 'Refer 2 Members',
    description: 'When 2 referred members complete valid activity, reward benefits become double.',
    highlight: '2 referrals = 2x coupon reward',
    icon: UserPlus,
  },
  {
    title: 'Refer 3 Members',
    description: 'When 3 referred members complete valid activity, reward benefits become triple.',
    highlight: '3 referrals = 3x coupon reward',
    icon: Users,
  },
  {
    title: '7 Days Reward Growth',
    description: 'Weekly supply and referral activity is tracked to show coupon growth clearly.',
    highlight: 'Track growth every 7 days',
    icon: CalendarDays,
  },
  {
    title: 'Smart Reward System',
    description: 'Supply more, refer more, and earn more coupons through automatic reward logic.',
    highlight: 'Fully automated coupon engine',
    icon: Sparkles,
  },
] as const;

export const Referrals = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-white via-agri-earth-50 to-white pt-32 pb-24 px-6"
    >
      <ReferralProgram />

      <section className="w-full max-w-5xl mx-auto mt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="text-center mb-8"
        >
          <p className="badge-green mb-3">IGO Rewards Flow</p>
          <h3 className="text-3xl md:text-4xl font-black text-agri-earth-900 mb-3">
            How Coupon Rewards Grow
          </h3>
          <p className="text-agri-earth-600 max-w-3xl mx-auto">
            A clear view of how product supply and referrals increase IGO coupons automatically
            through weekly activity and milestone logic.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {REWARD_SYSTEM_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
                className="group bg-white rounded-2xl border border-agri-earth-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-agri-green-100 text-agri-green-700 flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h4 className="text-lg font-bold text-agri-earth-900 mb-2">{card.title}</h4>
                <p className="text-sm text-agri-earth-600 leading-relaxed mb-4">{card.description}</p>
                <div className="inline-flex items-center rounded-full bg-agri-green-50 border border-agri-green-200 px-3 py-1">
                  <span className="text-xs font-semibold text-agri-green-700">{card.highlight}</span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
};
