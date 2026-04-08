import { useContext } from 'react';
import { NotificationContext } from '../lib/notification-context';

/**
 * Hook to access notification functions
 * Provides toast notifications for success, error, info, warning, and loading states
 *
 * @example
 * const { success, error } = useNotification();
 *
 * // Show success notification
 * success('Form submitted successfully!');
 *
 * // Show error notification
 * error('Something went wrong!');
 *
 * // Show loading notification with promise
 * notification.promise(submitForm(), {
 *   loading: 'Submitting...',
 *   success: 'Submitted successfully!',
 *   error: 'Failed to submit'
 * });
 */
export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  return context;
}
