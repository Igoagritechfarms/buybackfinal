import React, { createContext, ReactNode } from 'react';
import { Toaster, toast } from 'sonner';

export interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  success: (message: string, options?: NotificationOptions) => string;
  error: (message: string, options?: NotificationOptions) => string;
  info: (message: string, options?: NotificationOptions) => string;
  warning: (message: string, options?: NotificationOptions) => string;
  loading: (message: string) => string;
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => Promise<T>;
  dismiss: (toastId?: string | number) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  success: () => '',
  error: () => '',
  info: () => '',
  warning: () => '',
  loading: () => '',
  promise: async () => null as any,
  dismiss: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const value: NotificationContextType = {
    success: (message, options) =>
      toast.success(message, {
        duration: options?.duration || 4000,
        action: options?.action,
      }),
    error: (message, options) =>
      toast.error(message, {
        duration: options?.duration || 5000,
        action: options?.action,
      }),
    info: (message, options) =>
      toast.info(message, {
        duration: options?.duration || 4000,
        action: options?.action,
      }),
    warning: (message, options) =>
      toast.warning(message, {
        duration: options?.duration || 4000,
        action: options?.action,
      }),
    loading: (message) => toast.loading(message),
    promise: (promise, messages) =>
      toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      }),
    dismiss: (toastId) => toast.dismiss(toastId),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster position="top-right" richColors />
    </NotificationContext.Provider>
  );
}
