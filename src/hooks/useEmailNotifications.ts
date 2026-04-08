/**
 * Email Notification System Hook
 * Phase 0 Feature: User preference management + notification tracking
 *
 * Manages:
 * - Email preference settings
 * - Notification delivery tracking
 * - Unsubscribe management
 * - Notification templates
 */

import { useState, useCallback } from 'react';

export interface EmailNotificationPreference {
  id: string;
  type: 'marketing' | 'transactional' | 'updates' | 'deals';
  label: string;
  description: string;
  enabled: boolean;
  frequency?: 'real-time' | 'daily' | 'weekly' | 'monthly';
}

export interface NotificationLog {
  id: string;
  type: string;
  subject: string;
  recipient: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'bounced' | 'opened' | 'clicked';
  openedAt?: Date;
  clickedAt?: Date;
}

const DEFAULT_PREFERENCES: EmailNotificationPreference[] = [
  {
    id: 'price-alerts',
    type: 'updates',
    label: 'Price Alerts',
    description: 'Get notified when prices change for your products',
    enabled: true,
    frequency: 'real-time'
  },
  {
    id: 'buyer-requests',
    type: 'transactional',
    label: 'New Buyer Requests',
    description: 'Receive notifications for new buyer inquiries',
    enabled: true,
    frequency: 'real-time'
  },
  {
    id: 'order-updates',
    type: 'transactional',
    label: 'Order Status Updates',
    description: 'Track your orders and deliveries',
    enabled: true,
    frequency: 'real-time'
  },
  {
    id: 'payment-alerts',
    type: 'transactional',
    label: 'Payment Confirmations',
    description: 'Receive payment notifications and receipts',
    enabled: true,
    frequency: 'real-time'
  },
  {
    id: 'weekly-digest',
    type: 'updates',
    label: 'Weekly Market Digest',
    description: 'Receive a weekly summary of market trends',
    enabled: true,
    frequency: 'weekly'
  },
  {
    id: 'best-deals',
    type: 'deals',
    label: 'Best Deals & Promotions',
    description: 'Get notified about special offers and promotions',
    enabled: true,
    frequency: 'weekly'
  },
  {
    id: 'education',
    type: 'marketing',
    label: 'Educational Content',
    description: 'Tips, guides, and farming best practices',
    enabled: false,
    frequency: 'weekly'
  },
  {
    id: 'referral-rewards',
    type: 'marketing',
    label: 'Referral Rewards',
    description: 'Updates about your referral earnings',
    enabled: true,
    frequency: 'daily'
  },
];

export const useEmailNotifications = (userEmail?: string) => {
  const [preferences, setPreferences] = useState<EmailNotificationPreference[]>(DEFAULT_PREFERENCES);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update email preference
   */
  const updatePreference = useCallback(
    (id: string, enabled: boolean, frequency?: string) => {
      setPreferences(prev =>
        prev.map(pref =>
          pref.id === id
            ? { ...pref, enabled, frequency: (frequency as any) || pref.frequency }
            : pref
        )
      );
    },
    []
  );

  /**
   * Toggle notification type on/off
   */
  const toggleNotification = useCallback((id: string) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  }, []);

  /**
   * Send test email
   */
  const sendTestEmail = useCallback(async () => {
    if (!userEmail) {
      setError('User email not found');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to logs
      const log: NotificationLog = {
        id: `test-${Date.now()}`,
        type: 'test',
        subject: 'Test Notification - IGO Agritech',
        recipient: userEmail,
        sentAt: new Date(),
        status: 'sent',
        openedAt: undefined,
        clickedAt: undefined
      };

      setNotificationLogs(prev => [log, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test email');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  /**
   * Unsubscribe from all notifications
   */
  const unsubscribeAll = useCallback(() => {
    setPreferences(prev =>
      prev.map(pref => ({ ...pref, enabled: false }))
    );
  }, []);

  /**
   * Resubscribe to all notifications
   */
  const resubscribeAll = useCallback(() => {
    setPreferences(prev =>
      prev.map(pref => ({ ...pref, enabled: true }))
    );
  }, []);

  /**
   * Get enabled preferences
   */
  const enabledPreferences = preferences.filter(p => p.enabled);

  /**
   * Get disabled preferences
   */
  const disabledPreferences = preferences.filter(p => !p.enabled);

  /**
   * Get preferences by type
   */
  const getPreferencesByType = (type: string) => {
    return preferences.filter(p => p.type === type);
  };

  /**
   * Calculate subscription status
   */
  const subscriptionStatus = {
    total: preferences.length,
    enabled: enabledPreferences.length,
    disabled: disabledPreferences.length,
    percentage: Math.round((enabledPreferences.length / preferences.length) * 100)
  };

  return {
    preferences,
    notificationLogs,
    isLoading,
    error,
    updatePreference,
    toggleNotification,
    sendTestEmail,
    unsubscribeAll,
    resubscribeAll,
    enabledPreferences,
    disabledPreferences,
    getPreferencesByType,
    subscriptionStatus
  };
};
