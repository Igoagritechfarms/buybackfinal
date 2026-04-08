/**
 * Referral Program Widget
 * Phase 0 Feature: Viral growth mechanism
 *
 * Features:
 * - Unique referral link generation
 * - Invite friends / family
 * - Track referral rewards
 * - Leaderboard view
 * - Social sharing
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Share2,
  Copy,
  Check,
  Gift,
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  Smartphone,
  Trophy,
  Lock,
  Unlock
} from 'lucide-react';

interface ReferralTier {
  level: number;
  name: string;
  referralsNeeded: number;
  totalReward: number;
  bonusPerReferral: number;
  badge: string;
  color: string;
  unlocked: boolean;
}

interface ReferralUser {
  name: string;
  status: 'referred' | 'signed_up' | 'completed_sale';
  referralBonus: number;
  date: string;
}

const REFERRAL_TIERS: ReferralTier[] = [
  {
    level: 1,
    name: 'Starter',
    referralsNeeded: 0,
    totalReward: 0,
    bonusPerReferral: 100,
    badge: '🌱',
    color: 'from-blue-500 to-blue-600',
    unlocked: true
  },
  {
    level: 2,
    name: 'Grower',
    referralsNeeded: 5,
    totalReward: 500,
    bonusPerReferral: 150,
    badge: '🌿',
    color: 'from-green-500 to-green-600',
    unlocked: true
  },
  {
    level: 3,
    name: 'Pro Farmer',
    referralsNeeded: 15,
    totalReward: 2000,
    bonusPerReferral: 200,
    badge: '🌾',
    color: 'from-amber-500 to-amber-600',
    unlocked: false
  },
  {
    level: 4,
    name: 'Elite',
    referralsNeeded: 30,
    totalReward: 5000,
    bonusPerReferral: 300,
    badge: '👑',
    color: 'from-purple-500 to-purple-600',
    unlocked: false
  },
];

const SAMPLE_REFERRALS: ReferralUser[] = [
  {
    name: 'Ramesh Kumar',
    status: 'completed_sale',
    referralBonus: 250,
    date: '2 days ago'
  },
  {
    name: 'Priya Sharma',
    status: 'signed_up',
    referralBonus: 150,
    date: '1 week ago'
  },
  {
    name: 'Amit Patel',
    status: 'referred',
    referralBonus: 0,
    date: '10 days ago'
  },
];

export const ReferralProgram = () => {
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'friends' | 'rewards'>('overview');
  const [totalEarnings, setTotalEarnings] = useState(400);
  const referralCode = 'IGO-RAMESH-2024';
  const referralLink = `https://igobuyback.com/join?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentReferrals = 7;
  const currentTier = REFERRAL_TIERS[1];
  const nextTier = REFERRAL_TIERS[2];
  const progressToNextTier = (currentReferrals / nextTier.referralsNeeded) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-agri-green-500 to-agri-green-600 rounded-xl">
            <Gift className="text-white" size={28} />
          </div>
          <h2 className="text-4xl font-black text-agri-earth-900">Earn by Sharing</h2>
        </div>
        <p className="text-lg text-agri-earth-600">
          Invite farmers and buyers to IGO. Earn rewards for every successful referral.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-gradient-to-br from-agri-green-50 to-white rounded-3xl p-8 border-2 border-agri-green-200 shadow-xl"
        >
          <h3 className="text-xl font-bold text-agri-earth-900 mb-6">Your Referral Link</h3>

          {/* Link Display */}
          <div className="bg-white border-2 border-agri-green-300 rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-agri-earth-600 mb-1">Share this link:</p>
              <p className="text-sm font-mono text-agri-green-600 truncate">{referralLink}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="px-4 py-2 bg-agri-green-600 text-white rounded-lg hover:bg-agri-green-700 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>

          {/* Referral Code */}
          <div className="bg-agri-earth-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-agri-earth-600 uppercase font-bold tracking-wide mb-2">Your Referral Code</p>
            <p className="text-2xl font-black text-agri-green-600 font-mono">{referralCode}</p>
          </div>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors flex flex-col items-center gap-2 font-semibold"
            >
              <MessageSquare size={24} />
              <span className="text-xs">WhatsApp</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center gap-2 font-semibold"
            >
              <Mail size={24} />
              <span className="text-xs">Email</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors flex flex-col items-center gap-2 font-semibold"
            >
              <Smartphone size={24} />
              <span className="text-xs">SMS</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors flex flex-col items-center gap-2 font-semibold"
            >
              <Share2 size={24} />
              <span className="text-xs">More</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-agri-green-600 to-agri-green-700 rounded-3xl p-8 text-white shadow-xl"
        >
          <div className="mb-8">
            <p className="text-green-100 text-sm font-semibold mb-2">Your Earnings</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">₹{totalEarnings}</span>
              <span className="text-green-100">total earned</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-green-100 text-xs mb-1">Referrals</p>
              <p className="text-2xl font-bold">{currentReferrals}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-green-100 text-xs mb-1">Current Tier</p>
              <p className="text-2xl font-bold">{currentTier.badge} {currentTier.name}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-green-100 text-xs mb-1">Bonus per Referral</p>
              <p className="text-2xl font-bold">₹{currentTier.bonusPerReferral}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 px-4 py-3 bg-white text-agri-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp size={18} />
            Withdraw Earnings
          </motion.button>
        </motion.div>
      </div>

      {/* Progress to Next Tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-8 border border-agri-earth-200 shadow-lg mb-12"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-agri-earth-900">Progress to {nextTier.badge} {nextTier.name}</h3>
            <span className="text-sm font-bold text-agri-green-600">{currentReferrals}/{nextTier.referralsNeeded}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-agri-earth-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextTier}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-agri-green-500 to-agri-green-600"
            />
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-agri-green-50 rounded-xl border border-agri-green-200">
            <p className="text-xs font-semibold text-agri-earth-600 mb-2">Referrals Needed</p>
            <p className="text-2xl font-bold text-agri-green-700">
              {Math.max(0, nextTier.referralsNeeded - currentReferrals)}
            </p>
            <p className="text-xs text-agri-earth-500 mt-1">more to reach next tier</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs font-semibold text-agri-earth-600 mb-2">Bonus per Referral</p>
            <p className="text-2xl font-bold text-amber-700">₹{nextTier.bonusPerReferral}</p>
            <p className="text-xs text-agri-earth-500 mt-1">up from ₹{currentTier.bonusPerReferral}</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-xs font-semibold text-agri-earth-600 mb-2">Tier Bonus</p>
            <p className="text-2xl font-bold text-purple-700">₹{nextTier.totalReward - currentTier.totalReward}</p>
            <p className="text-xs text-agri-earth-500 mt-1">one-time achievement bonus</p>
          </div>
        </div>
      </motion.div>

      {/* Tier Progression */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h3 className="text-xl font-bold text-agri-earth-900 mb-6">Referral Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REFERRAL_TIERS.map((tier, idx) => {
            const tierClass = tier.unlocked
              ? `bg-gradient-to-br ${tier.color} text-white border-transparent shadow-lg select-none` 
              : 'bg-gray-50 border-gray-200 text-gray-600 opacity-80';

            return (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className={`rounded-2xl p-6 border-2 transition-all transform ${tierClass} hover:-translate-y-1 hover:shadow-xl cursor-pointer min-h-[210px]`}
              >
                <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-3xl mb-1">{tier.badge}</p>
                  <h4 className="font-bold text-lg">{tier.name}</h4>
                </div>
                {tier.unlocked ? (
                  <Unlock size={20} />
                ) : (
                  <Lock size={20} />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p>Referrals: <span className="font-bold">{tier.referralsNeeded}+</span></p>
                <p>Bonus: <span className="font-bold">₹{tier.bonusPerReferral}</span></p>
                <p>Tier Reward: <span className="font-bold">₹{tier.totalReward}</span></p>
              </div>

              {tier.unlocked && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-4 inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold"
                >
                  ✓ Unlocked
                </motion.div>
              )}
            </motion.div>
          );
          })}
        </div>
      </motion.div>

      {/* Recent Referrals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-8 border border-agri-earth-200 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-agri-green-600" size={24} />
          <h3 className="text-xl font-bold text-agri-earth-900">Recent Referrals</h3>
        </div>

        <div className="space-y-4">
          {SAMPLE_REFERRALS.map((referral, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-agri-earth-50 rounded-xl border border-agri-earth-200 hover:border-agri-green-300 transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold text-agri-earth-900">{referral.name}</p>
                <p className="text-xs text-agri-earth-600">{referral.date}</p>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-agri-earth-900">
                  {referral.status === 'completed_sale' && '✅ Sale Completed'}
                  {referral.status === 'signed_up' && '📝 Signed Up'}
                  {referral.status === 'referred' && '👤 Invited'}
                </div>
                <div className={`text-lg font-black ${
                  referral.referralBonus > 0 ? 'text-agri-green-600' : 'text-agri-earth-500'
                }`}>
                  {referral.referralBonus > 0 ? `+₹${referral.referralBonus}` : 'Pending'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
