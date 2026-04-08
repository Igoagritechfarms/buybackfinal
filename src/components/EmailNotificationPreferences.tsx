/**
 * Email Notification Preferences UI
 * Phase 0 Feature: User-friendly notification settings management
 *
 * Allows users to:
 * - Toggle notifications on/off
 * - Set frequency preferences
 * - Send test emails
 * - View notification history
 * - Manage subscriptions
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Bell,
  Settings,
  Check,
  X,
  AlertCircle,
  BarChart3,
  Zap,
  Send,
  Clock,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useEmailNotifications } from '../hooks/useEmailNotifications';

interface EmailNotificationPreferencesProps {
  userEmail?: string;
  onPreferenceChange?: (preferences: any[]) => void;
}

export const EmailNotificationPreferences: React.FC<EmailNotificationPreferencesProps> = ({
  userEmail = 'farmer@igobuyback.com',
  onPreferenceChange
}) => {
  const {
    preferences,
    isLoading,
    error,
    updatePreference,
    toggleNotification,
    sendTestEmail,
    unsubscribeAll,
    resubscribeAll,
    subscriptionStatus,
    getPreferencesByType
  } = useEmailNotifications(userEmail);

  const [testEmailSent, setTestEmailSent] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'transactional' | 'updates' | 'deals' | 'marketing'>('all');

  const handleTestEmail = async () => {
    const success = await sendTestEmail();
    if (success) {
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 3000);
    }
  };

  const displayedPreferences = selectedTab === 'all'
    ? preferences
    : getPreferencesByType(selectedTab);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-agri-green-500 to-agri-green-600 rounded-xl">
            <Mail className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-agri-earth-900">Email Preferences</h2>
            <p className="text-agri-earth-600">Manage how and when you receive notifications</p>
          </div>
        </div>

        {/* Email Display */}
        <div className="bg-agri-earth-50 border border-agri-earth-200 rounded-xl p-4">
          <p className="text-xs text-agri-earth-600 font-semibold mb-1">NOTIFICATION EMAIL</p>
          <p className="text-lg font-bold text-agri-earth-900">{userEmail}</p>
        </div>
      </motion.div>

      {/* Subscription Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
      >
        <div className="bg-gradient-to-br from-agri-green-50 to-green-50 rounded-xl p-6 border border-agri-green-200">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-agri-green-600" size={20} />
            <p className="text-sm text-agri-earth-600 font-semibold">Active Notifications</p>
          </div>
          <div className="text-3xl font-black text-agri-green-700">
            {subscriptionStatus.enabled}/{subscriptionStatus.total}
          </div>
          <div className="mt-3 w-full bg-agri-green-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${subscriptionStatus.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-agri-green-600 rounded-full"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-blue-600" size={20} />
            <p className="text-sm text-agri-earth-600 font-semibold">Real-Time Alerts</p>
          </div>
          <div className="text-3xl font-black text-blue-700">
            {getPreferencesByType('transactional').filter(p => p.enabled).length}
          </div>
          <p className="text-xs text-agri-earth-500 mt-3">Critical updates enabled</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-purple-600" size={20} />
            <p className="text-sm text-agri-earth-600 font-semibold">Digest Emails</p>
          </div>
          <div className="text-3xl font-black text-purple-700">
            {getPreferencesByType('updates').filter(p => p.enabled).length}
          </div>
          <p className="text-xs text-agri-earth-500 mt-3">Weekly summaries</p>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
        >
          <AlertCircle size={20} />
          <span className="text-sm font-semibold">{error}</span>
        </motion.div>
      )}

      {/* Success Message */}
      {testEmailSent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
        >
          <Check size={20} />
          <span className="text-sm font-semibold">Test email sent! Check your inbox.</span>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex flex-wrap gap-2"
      >
        {(['all', 'transactional', 'updates', 'deals', 'marketing'] as const).map(tab => (
          <motion.button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedTab === tab
                ? 'bg-agri-green-600 text-white shadow-lg'
                : 'bg-agri-earth-100 text-agri-earth-700 hover:bg-agri-earth-200'
            }`}
          >
            {tab === 'all' && 'All'}
            {tab === 'transactional' && '⚡ Critical'}
            {tab === 'updates' && '📰 Updates'}
            {tab === 'deals' && '🎁 Deals'}
            {tab === 'marketing' && '📣 Marketing'}
          </motion.button>
        ))}
      </motion.div>

      {/* Notification Preferences List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 mb-12"
      >
        {displayedPreferences.map((pref, idx) => (
          <motion.div
            key={pref.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            className="bg-white border-2 border-agri-earth-100 rounded-xl p-6 hover:border-agri-green-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-6">
              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-agri-earth-900 text-lg mb-2">{pref.label}</h3>
                <p className="text-sm text-agri-earth-600 mb-4">{pref.description}</p>

                {/* Frequency Badge */}
                {pref.frequency && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-agri-earth-100 rounded-lg text-xs font-semibold text-agri-earth-700">
                    <Clock size={12} />
                    {pref.frequency === 'real-time' && 'Real-Time'}
                    {pref.frequency === 'daily' && 'Daily'}
                    {pref.frequency === 'weekly' && 'Weekly'}
                    {pref.frequency === 'monthly' && 'Monthly'}
                  </div>
                )}
              </div>

              {/* Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleNotification(pref.id)}
                className={`flex-shrink-0 w-16 h-10 rounded-full transition-all relative ${
                  pref.enabled ? 'bg-agri-green-600' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center ${
                    pref.enabled ? 'right-1' : 'left-1'
                  }`}
                >
                  {pref.enabled ? (
                    <Check className="text-agri-green-600" size={20} />
                  ) : (
                    <X className="text-gray-600" size={20} />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-agri-earth-50 rounded-2xl p-8 border border-agri-earth-200 mb-12"
      >
        <h3 className="font-bold text-agri-earth-900 mb-6 flex items-center gap-2">
          <Settings size={20} />
          Notification Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Test Email */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTestEmail}
            disabled={isLoading}
            className="px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {isLoading ? 'Sending...' : 'Send Test Email'}
          </motion.button>

          {/* Unsubscribe All */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={unsubscribeAll}
            className="px-6 py-4 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
          >
            <X size={18} />
            Unsubscribe All
          </motion.button>

          {/* Resubscribe All */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resubscribeAll}
            className="px-6 py-4 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Resubscribe All
          </motion.button>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4"
      >
        <Eye className="text-blue-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <p className="font-semibold text-blue-900 mb-2">Privacy & Compliance</p>
          <p className="text-sm text-blue-700">
            We respect your privacy. We'll never share your email with third parties. You can unsubscribe from any email at any time.
            We comply with CAN-SPAM and GDPR regulations.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
