import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { sellerSchema, buyerSchema, SellerFormData, BuyerFormData } from '../lib/validation';
import { useFormHandler } from './useFormHandler';
import { submitTransaction } from '../lib/supabase';
import { useNotification } from './useNotification';
const RESEND_TIMER_SECONDS = 30;
const OTP_LENGTH = 6;

type SendOtpApiResponse = {
  success?: boolean;
  message?: string;
  sessionId?: string;
  resendAfterSeconds?: number;
  expiresInSeconds?: number;
  error?: string;
  retryAfterSeconds?: number;
};

type VerifyOtpApiResponse = {
  success?: boolean;
  message?: string;
  phone?: string;
  role?: string;
  verifiedAt?: string;
  error?: string;
  attemptsRemaining?: number;
};

async function postJson<TResponse>(
  url: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: TResponse }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as TResponse;
  return { ok: response.ok, status: response.status, data };
}

function normalizeIndianPhone(phone: string) {
  const digitsOnly = String(phone || '').replace(/\D/g, '');
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }

  if (digitsOnly.length > 10) {
    return digitsOnly.slice(-10);
  }

  return digitsOnly;
}

function isValidPhone(countryCode: string, phone: string) {
  const normalizedCountryCode = String(countryCode || '+91').trim();
  const normalizedPhone = normalizeIndianPhone(phone);
  if (normalizedCountryCode !== '+91') {
    return false;
  }

  return /^[6-9]\d{9}$/.test(normalizedPhone);
}

function normalizePhone(countryCode: string, phone: string) {
  const normalizedCountryCode = String(countryCode || '+91').trim() || '+91';
  const normalizedPhone = normalizeIndianPhone(phone);
  return `${normalizedCountryCode}${normalizedPhone}`;
}

function mapSendOtpError(err: unknown) {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    if (
      message.includes('trial accounts cannot send messages to unverified numbers') ||
      (message.includes('unverified') && message.includes('twilio'))
    ) {
      return 'Cannot send OTP to this number right now. This SMS account can only send to verified numbers. Please verify the number in Twilio or upgrade the account.';
    }
    if (message.includes('not configured')) return err.message;
    if (message.includes('invalid') && message.includes('phone')) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (
      message.includes('security purposes') ||
      message.includes('request this after') ||
      message.includes('rate limit') ||
      message.includes('too many')
    ) {
      return 'Too many OTP requests. Please wait and try again.';
    }
    if (message.includes('sms') || message.includes('provider')) {
      return err.message;
    }
    if (message.includes('twilio') || message.includes('sender configuration')) {
      return err.message;
    }
    if (message.includes('network')) {
      return 'Network error while sending OTP. Please check your connection and retry.';
    }
  }

  return 'OTP send failed. Please try again.';
}

function mapVerifyOtpError(err: unknown) {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    if (message.includes('invalid') || message.includes('token')) {
      return 'Invalid OTP. Please try again.';
    }
    if (message.includes('expired') || message.includes('session')) {
      return 'OTP expired. Please request a new OTP.';
    }
    if (message.includes('network')) {
      return 'Network error while verifying OTP. Please check your connection and retry.';
    }
  }

  return 'OTP verification failed. Please try again.';
}

/**
 * Hook for managing the Farmgate form (seller or buyer)
 * Includes server-side Phone OTP verification and transaction submission
 */
export function useBuybackForm(
  type: 'sell' | 'buy'
) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpSessionId, setOtpSessionId] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpTimerRef = useRef<number | null>(null);
  const { success, error, promise } = useNotification();

  const initialData =
    type === 'sell'
      ? {
          name: '',
          countryCode: '+91' as const,
          phone: '',
          otp: '',
          location: '',
          product: '',
          quantity: 0,
          price: 0,
          harvestDate: '',
          transport: 'self' as const,
        }
      : {
          name: '',
          countryCode: '+91' as const,
          phone: '',
          otp: '',
          location: '',
          product: '',
          quantity: 0,
          price: 0,
        };

  const schema = type === 'sell' ? sellerSchema : buyerSchema;

  const handleSubmitForm = useCallback(
    async (data: SellerFormData | BuyerFormData) => {
      const submittedPhoneKey = `${data.countryCode}|${normalizeIndianPhone(data.phone)}`;
      const verifiedForThisPhone = otpVerified && otpTargetPhone === submittedPhoneKey;
      if (!verifiedForThisPhone) {
        throw new Error('Please verify OTP before continuing.');
      }

      const fullPhone = normalizePhone(data.countryCode, data.phone);
      const transactionData = {
        name: data.name,
        phone: fullPhone,
        location: data.location,
        product_id: data.product,
        quantity: data.quantity,
        price: data.price,
        type: type as 'sell' | 'buy',
        otp: '',
        otp_verified: true,
        status: 'verified' as const,
        ...(type === 'sell' && {
          harvest_date: 'harvestDate' in data ? data.harvestDate : '',
          transport: 'transport' in data ? data.transport : undefined,
        }),
      };

      await promise(submitTransaction(transactionData), {
        loading: 'Submitting your request...',
        success: 'Request submitted successfully! Check your phone for updates.',
        error: 'Failed to submit request. Please try again.',
      });
    },
    [otpVerified, otpTargetPhone, type, promise]
  );

  const form = useFormHandler(initialData, schema, handleSubmitForm);

  const currentPhoneKey = useMemo(
    () => `${form.formData.countryCode}|${normalizeIndianPhone(form.formData.phone as string)}`,
    [form.formData.countryCode, form.formData.phone]
  );

  const isOtpVerifiedForCurrentPhone = otpVerified && otpTargetPhone === currentPhoneKey;
  const isCurrentPhoneValid = isValidPhone(
    String(form.formData.countryCode || ''),
    String(form.formData.phone || '')
  );

  const clearOtpTimer = useCallback(() => {
    if (otpTimerRef.current !== null) {
      window.clearInterval(otpTimerRef.current);
      otpTimerRef.current = null;
    }
  }, []);

  const startOtpTimer = useCallback(
    (seconds: number) => {
      clearOtpTimer();
      setOtpCountdown(seconds);
      otpTimerRef.current = window.setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearOtpTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearOtpTimer]
  );

  const resetOtpState = useCallback(() => {
    clearOtpTimer();
    setOtpSent(false);
    setOtpCountdown(0);
    setOtpSessionId('');
    setOtpTargetPhone('');
    setOtpVerified(false);
    form.setFieldValue('otp', '');
  }, [clearOtpTimer, form]);

  useEffect(() => {
    return () => {
      clearOtpTimer();
    };
  }, [clearOtpTimer]);

  // Invalidate OTP state when phone number changes after sending an OTP.
  useEffect(() => {
    if (otpTargetPhone && otpTargetPhone !== currentPhoneKey) {
      resetOtpState();
    }
  }, [currentPhoneKey, otpTargetPhone, resetOtpState]);

  const handleSendOtp = useCallback(async () => {
    const countryCode = '+91';
    const phone = normalizeIndianPhone(String(form.formData.phone || ''));
    if (form.formData.countryCode !== '+91') {
      form.setFieldValue('countryCode', '+91');
    }
    if (String(form.formData.phone || '') !== phone) {
      form.setFieldValue('phone', phone);
    }

    if (!isValidPhone(countryCode, phone)) {
      error('Please enter a valid 10-digit Indian mobile number before sending OTP.');
      return;
    }

    try {
      setIsSendingOtp(true);
      const role = type === 'buy' ? 'vendor' : 'farmer';
      const { ok, data } = await postJson<SendOtpApiResponse>('/api/send-sms-otp', {
        countryCode,
        phone,
        role,
      });
      const sessionId = String(data.sessionId || '').trim();
      if (!ok || !data.success || !sessionId) {
        const apiError =
          typeof data.error === 'string' && data.error.trim().length > 0
            ? data.error
            : 'OTP send failed. Please try again.';
        throw new Error(apiError);
      }

      const resendAfterSeconds =
        typeof data.resendAfterSeconds === 'number' && data.resendAfterSeconds > 0
          ? Math.floor(data.resendAfterSeconds)
          : RESEND_TIMER_SECONDS;

      setOtpSessionId(sessionId);
      setOtpTargetPhone(`${countryCode}|${phone}`);
      setOtpVerified(false);
      setOtpSent(true);
      form.setFieldValue('otp', '');
      startOtpTimer(resendAfterSeconds);
      success(
        typeof data.message === 'string' && data.message.trim().length > 0
          ? data.message
          : 'OTP sent successfully.'
      );
    } catch (err) {
      error(mapSendOtpError(err));
    } finally {
      setIsSendingOtp(false);
    }
  }, [form, startOtpTimer, success, error, type]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otpSent) {
      error('Please send OTP first.');
      return;
    }

    const otp = String(form.formData.otp || '').trim();
    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
      error('Please enter a valid 6-digit OTP.');
      return;
    }

    if (!otpSessionId) {
      error('OTP session expired. Please request a new OTP.');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const phone = normalizeIndianPhone(String(form.formData.phone || ''));
      const submittedPhoneKey = `+91|${phone}`;
      if (otpTargetPhone !== submittedPhoneKey) {
        throw new Error('Phone number changed. Please request a new OTP.');
      }

      const { ok, data } = await postJson<VerifyOtpApiResponse>('/api/verify-otp', {
        sessionId: otpSessionId,
        otp,
      });
      if (!ok || !data.success) {
        const apiError =
          typeof data.error === 'string' && data.error.trim().length > 0
            ? data.error
            : 'OTP verification failed. Please try again.';
        throw new Error(apiError);
      }

      setOtpVerified(true);
      success(
        typeof data.message === 'string' && data.message.trim().length > 0
          ? data.message
          : 'Phone number verified successfully.'
      );
    } catch (err) {
      error(mapVerifyOtpError(err));
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [form.formData.otp, form.formData.phone, otpSent, otpSessionId, otpTargetPhone, success, error]);

  const handleResendOtp = useCallback(async () => {
    await handleSendOtp();
  }, [handleSendOtp]);

  return {
    ...form,
    otpSent,
    otpCountdown,
    otpVerified,
    isOtpVerifiedForCurrentPhone,
    isCurrentPhoneValid,
    isSendingOtp,
    isVerifyingOtp,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    canResendOtp: otpSent && otpCountdown === 0 && !isSendingOtp,
    type,
  };
}
