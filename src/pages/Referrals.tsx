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
import { ReferralProgram } from '../components/ReferralProgram';

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
    </motion.div>
  );
};
