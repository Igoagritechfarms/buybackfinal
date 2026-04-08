import { useState, useCallback } from 'react';
import { sellerSchema, buyerSchema, SellerFormData, BuyerFormData } from '../lib/validation';
import { useFormHandler } from './useFormHandler';
import { submitTransaction } from '../lib/supabase';
import { useNotification } from './useNotification';

/**
 * Hook for managing the Buyback form (seller or buyer)
 * Includes OTP verification and form submission
 */
export function useBuybackForm(type: 'sell' | 'buy') {
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const { success, error, promise } = useNotification();

  const initialData =
    type === 'sell'
      ? {
          name: '',
          phone: '',
          otp: '',
          location: '',
          product: '',
          quantity: 0,
          price: 0,
          harvestDate: '',
          transport: 'needed' as const,
        }
      : {
          name: '',
          phone: '',
          otp: '',
          location: '',
          product: '',
          quantity: 0,
          price: 0,
        };

  const schema = type === 'sell' ? sellerSchema : buyerSchema;

  // Generate mock OTP (6 digits)
  const generateOtp = useCallback(() => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, []);

  // Submit form to Supabase
  const handleSubmitForm = async (data: SellerFormData | BuyerFormData) => {
    try {
      const transactionData = {
        name: data.name,
        phone: data.phone,
        location: data.location,
        product_id: data.product,
        quantity: data.quantity,
        price: data.price,
        type: type as 'sell' | 'buy',
        otp: data.otp || generatedOtp,
        otp_verified: data.otp === generatedOtp, // Mock verification
        status: data.otp === generatedOtp ? 'verified' : 'pending' as const,
        ...(type === 'sell' && {
          harvest_date: ('harvestDate' in data ? data.harvestDate : ''),
          transport: ('transport' in data ? data.transport : undefined),
        }),
      };

      await promise(
        submitTransaction(transactionData),
        {
          loading: 'Submitting your request...',
          success: 'Request submitted successfully! Check your phone for updates.',
          error: 'Failed to submit request. Please try again.',
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      error(message);
      throw err;
    }
  };

  const form = useFormHandler(initialData, schema, handleSubmitForm);

  // Handle OTP sending
  const handleSendOtp = useCallback(() => {
    const phoneField = form.formData.phone;
    if (phoneField && /^[6-9]\d{9}$/.test(phoneField)) {
      const otp = generateOtp();
      setGeneratedOtp(otp);
      setOtpSent(true);
      setOtpCountdown(60);

      success(`Mock OTP: ${otp} (expires in 60 seconds)`);

      // Countdown timer
      const interval = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setOtpSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      error('Please enter a valid 10-digit phone number');
    }
  }, [form.formData.phone, generateOtp, success, error]);

  // Handle OTP resend
  const handleResendOtp = useCallback(() => {
    setOtpCountdown(0);
    handleSendOtp();
  }, [handleSendOtp]);

  return {
    ...form,
    otpSent,
    setOtpSent,
    otpCountdown,
    generatedOtp,
    handleSendOtp,
    handleResendOtp,
    type,
  };
}
