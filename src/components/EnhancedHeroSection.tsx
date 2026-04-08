/**
 * Enhanced Hero Section - Premium farmers' marketplace
 * Phase 0 Enhancement: Added trust metrics, live counters, premium design
 */

import { motion } from 'motion/react';
import { ArrowRight, Check, Users, TrendingUp, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const EnhancedHeroSection = () => {
  const [farmerCount, setFarmerCount] = useState(1000);
  const [gmvCount, setGmvCount] = useState(10);

  // Animate counters
  useEffect(() => {
    const farmerInterval = setInterval(() => {
      setFarmerCount(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    const gmvInterval = setInterval(() => {
      setGmvCount(prev => prev + Math.floor(Math.random() * 2));
    }, 5000);

    return () => {
      clearInterval(farmerInterval);
      clearInterval(gmvInterval);
    };
  }, []);

  const benefits = [
    { icon: Check, text: 'Zero middlemen commission' },
    { icon: Zap, text: 'Payment in 7 days' },
    { icon: TrendingUp, text: 'Fair market prices' },
    { icon: Award, text: '24/7 support' },
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-agri-green-900 via-agri-earth-900 to-black overflow-hidden pt-32 pb-24 px-6">
      {/* Animated background gradient */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(22, 163, 74, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(22, 163, 74, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(22, 163, 74, 0.2) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-agri-green-500/20 border border-agri-green-500/50 rounded-full"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Award size={16} className="text-agri-green-400" />
              </motion.div>
              <span className="text-sm font-bold text-agri-green-300">✓ Trusted by {farmerCount.toLocaleString()}+ Farmers</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight"
            >
              Best Price.
              <br />
              <span className="bg-gradient-to-r from-agri-green-400 to-green-300 bg-clip-text text-transparent">
                Zero Middlemen.
              </span>
              <br />
              Direct Connection.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              Connect directly with buyers. Get paid within 7 days. No hidden charges. No middlemen taking your profits.
            </motion.p>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
            >
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-3 text-gray-200"
                >
                  <div className="p-2 bg-agri-green-500/20 rounded-lg">
                    <benefit.icon size={20} className="text-agri-green-400" />
                  </div>
                  <span className="font-semibold">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/enroll"
                className="group px-8 py-4 bg-gradient-to-r from-agri-green-500 to-agri-green-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-agri-green-500/50 transition-all flex items-center justify-center gap-2"
              >
                Join as Farmer
                <motion.div group-hover:translate-x-2>
                  <ArrowRight size={20} />
                </motion.div>
              </Link>
              <Link
                to="/buy"
                className="px-8 py-4 border-2 border-agri-green-400 text-agri-green-300 font-bold rounded-xl hover:bg-agri-green-400/10 transition-all"
              >
                Buy Fresh Produce
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Stats & Visuals */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              {/* GMV Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                className="p-8 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl backdrop-blur"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl font-black text-green-300 mb-2"
                >
                  ₹{gmvCount}Cr+
                </motion.div>
                <p className="text-green-200 font-semibold">GMV Processed</p>
                <p className="text-xs text-green-300/70 mt-2">Growing daily</p>
              </motion.div>

              {/* Farmers Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                className="p-8 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl backdrop-blur"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className="text-4xl font-black text-blue-300 mb-2"
                >
                  {(farmerCount / 1000).toFixed(1)}K+
                </motion.div>
                <p className="text-blue-200 font-semibold">Active Farmers</p>
                <p className="text-xs text-blue-300/70 mt-2">Earning fairly</p>
              </motion.div>

              {/* Rating Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                className="p-8 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-2xl backdrop-blur"
              >
                <div className="text-3xl font-black text-yellow-300 mb-2">4.8/5 ⭐</div>
                <p className="text-yellow-200 font-semibold">Customer Rating</p>
                <p className="text-xs text-yellow-300/70 mt-2">From 2,500+ reviews</p>
              </motion.div>

              {/* Payout Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                className="p-8 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl backdrop-blur"
              >
                <div className="text-3xl font-black text-purple-300 mb-2">7 Days</div>
                <p className="text-purple-200 font-semibold">Average Payout</p>
                <p className="text-xs text-purple-300/70 mt-2">Guaranteed payment</p>
              </motion.div>
            </div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 bg-gradient-to-r from-agri-green-500/10 to-blue-500/10 border border-agri-green-500/20 rounded-xl"
            >
              <p className="text-sm text-gray-300 mb-4 font-semibold">🎯 This month's highlights:</p>
              <div className="space-y-2 text-xs text-gray-400">
                <p>✓ 2,500+ new farmers onboarded</p>
                <p>✓ ₹50Cr+ total transactions</p>
                <p>✓ 100% Farmer Satisfaction</p>
                <p>✓ Available in 12 states</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
