import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerSchema, buyerSchema, SellerFormData, BuyerFormData } from '../lib/validation';
import { useFormHandler } from './useFormHandler';
import { supabase, saveBuybackSubmission, upsertProfile } from '../lib/supabase';
import { useNotification } from './useNotification';
import { useAuth } from '../contexts/AuthContext';
import {
  mapPhoneAuthError,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../lib/phoneAuth';
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  buildE164Phone,
  isValidMobileNumber,
  sanitizeCountryCode,
  sanitizePhoneDigits,
} from '../lib/phone';
import { PRODUCTS } from '../config/products';

const RESEND_TIMER_SECONDS = 30;
const OTP_LENGTH = 6;

function logOtpFailure(context: string, details: Record<string, unknown>) {
  if (!import.meta.env.DEV) return;
  console.error(`[OTP] ${context}`, details);
}

export function useBuybackForm(type: 'sell' | 'buy') {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpTimerRef = useRef<number | null>(null);
  const sendOtpInFlightRef = useRef(false);
  const verifyOtpInFlightRef = useRef(false);
  const submitInFlightRef = useRef(false);
  const { success, error, promise } = useNotification();

  const isLoggedIn = Boolean(user);
  // Only skip OTP when logged in AND profile already has a phone number
  const hasVerifiedAccountPhone = isLoggedIn && Boolean(profile?.phone);

  const initialData =
    type === 'sell'
      ? {
          name: profile?.full_name ?? '',
          countryCode: DEFAULT_PHONE_COUNTRY_CODE,
          phone: profile?.phone?.replace('+91', '') ?? '',
          otp: '',
          location: '',
          product: '',
          quantity: 0,
          price: 0,
          harvestDate: '',
          transport: 'self' as const,
          quantityUnit: 'kg',
          siteVisitDate: '',
          scheduleNotes: '',
        }
      : {
          name: profile?.full_name ?? '',
          countryCode: DEFAULT_PHONE_COUNTRY_CODE,
          phone: profile?.phone?.replace('+91', '') ?? '',
          otp: '',
          location: '',
          product: '',
          quantity: 0,
          price: 0,
          quantityUnit: 'kg',
          deliveryDate: '',
          siteVisitDate: '',
          scheduleNotes: '',
        };

  const schema = type === 'sell' ? sellerSchema : buyerSchema;

  const handleSubmitForm = useCallback(
    async (data: SellerFormData | BuyerFormData) => {
      if (submitInFlightRef.current) return;

      const fullPhone = buildE164Phone(data.countryCode, data.phone);
      const verifiedForThisPhone =
        hasVerifiedAccountPhone || (otpVerified && otpTargetPhone === fullPhone);

      if (!verifiedForThisPhone || !fullPhone) {
        throw new Error('Please verify your phone number with OTP before continuing.');
      }

      const selectedProduct = PRODUCTS.find((p) => p.id === data.product);

      submitInFlightRef.current = true;
      try {
        await promise(
          saveBuybackSubmission({
            contact_name: data.name,
            contact_phone: fullPhone,
            product_id: data.product,
            product_name: selectedProduct?.name ?? data.product,
            quantity: data.quantity,
            quantity_unit: data.quantityUnit ?? 'kg',
            expected_price: data.price > 0 ? data.price : null,
            harvest_date:
              type === 'sell' && 'harvestDate' in data && data.harvestDate
                ? data.harvestDate
                : type === 'buy' && 'deliveryDate' in data && data.deliveryDate
                ? data.deliveryDate
                : null,
            location: data.location,
            site_visit_date: data.siteVisitDate || null,
            schedule_notes: data.scheduleNotes || null,
            submission_type: type,
            form_payload: data as unknown as Record<string, unknown>,
          }),
          {
            loading: 'Submitting your request...',
            success: 'Request submitted! Our team will contact you shortly.',
            error: 'Failed to submit request. Please try again.',
          }
        );

        // After successful submission, update profile with name+phone and navigate to dashboard
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser) {
          try {
            await upsertProfile({
              id: sessionUser.id,
              full_name: data.name,
              phone: fullPhone,
            });
          } catch (profileErr) {
            console.error('[Form] Profile save failed:', profileErr);
          }
          navigate('/dashboard');
        }
        // If no session (anonymous submit), still return successfully so form shows success state
      } finally {
        submitInFlightRef.current = false;
      }
    },
    [otpTargetPhone, otpVerified, promise, type, isLoggedIn, hasVerifiedAccountPhone, navigate]
  );

  const form = useFormHandler(initialData, schema, handleSubmitForm);

  // Sync profile data into form when profile loads
  useEffect(() => {
    if (profile) {
      if (profile.full_name && !form.formData.name) {
        form.setFieldValue('name', profile.full_name);
      }
      if (profile.phone) {
        const digits = profile.phone.replace('+91', '').replace(/\D/g, '');
        if (!form.formData.phone) {
          form.setFieldValue('phone', digits);
        }
      }
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const normalizedCountryCode = useMemo(
    () => sanitizeCountryCode(String(form.formData.countryCode || DEFAULT_PHONE_COUNTRY_CODE)),
    [form.formData.countryCode]
  );

  const normalizedPhone = useMemo(
    () => sanitizePhoneDigits(String(form.formData.phone || '')),
    [form.formData.phone]
  );

  const currentPhoneE164 = useMemo(
    () => buildE164Phone(normalizedCountryCode, normalizedPhone),
    [normalizedCountryCode, normalizedPhone]
  );

  // If logged in with a profile phone, treat OTP as verified for that phone
  const isOtpVerifiedForCurrentPhone = useMemo(() => {
    if (isLoggedIn && profile?.phone && profile.phone === currentPhoneE164) return true;
    return otpVerified && Boolean(currentPhoneE164) && otpTargetPhone === currentPhoneE164;
  }, [isLoggedIn, profile?.phone, currentPhoneE164, otpVerified, otpTargetPhone]);

  const isCurrentPhoneValid = isValidMobileNumber(normalizedCountryCode, normalizedPhone);

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
    setOtpTargetPhone('');
    setOtpVerified(false);
    form.setFieldValue('otp', '');
  }, [clearOtpTimer, form]);

  useEffect(() => () => clearOtpTimer(), [clearOtpTimer]);

  useEffect(() => {
    if (!otpTargetPhone) return;
    if (!currentPhoneE164 || currentPhoneE164 !== otpTargetPhone) {
      resetOtpState();
    }
  }, [currentPhoneE164, otpTargetPhone, resetOtpState]);

  const handleSendOtp = useCallback(async () => {
    if (sendOtpInFlightRef.current) return;

    const countryCode = sanitizeCountryCode(
      String(form.formData.countryCode || DEFAULT_PHONE_COUNTRY_CODE)
    );
    const phone = sanitizePhoneDigits(String(form.formData.phone || ''));
    const e164Phone = buildE164Phone(countryCode, phone);

    if (!e164Phone || !e164Phone.startsWith(DEFAULT_PHONE_COUNTRY_CODE)) {
      error('Please enter a valid Indian mobile number');
      return;
    }

    try {
      sendOtpInFlightRef.current = true;
      setIsSendingOtp(true);

      const sendResult = await sendPhoneOtp(e164Phone);

      setOtpTargetPhone(sendResult.phone);
      setOtpVerified(false);
      setOtpSent(true);
      startOtpTimer(RESEND_TIMER_SECONDS);
      success('OTP sent to your phone');
    } catch (err) {
      logOtpFailure('Send OTP flow error.', {
        error: err instanceof Error ? err.message : String(err),
      });
      error(mapPhoneAuthError(err, 'send'));
    } finally {
      sendOtpInFlightRef.current = false;
      setIsSendingOtp(false);
    }
  }, [error, form, startOtpTimer, success]);

  const handleVerifyOtp = useCallback(async () => {
    if (verifyOtpInFlightRef.current) return;

    if (!otpSent) {
      error('Please send OTP first.');
      return;
    }

    const otp = String(form.formData.otp || '').trim();
    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
      error('Please enter a valid 6-digit OTP.');
      return;
    }

    const e164Phone = buildE164Phone(
      sanitizeCountryCode(String(form.formData.countryCode || DEFAULT_PHONE_COUNTRY_CODE)),
      sanitizePhoneDigits(String(form.formData.phone || ''))
    );

    if (!e164Phone || otpTargetPhone !== e164Phone) {
      error('OTP expired. Please request a new one.');
      return;
    }

    try {
      verifyOtpInFlightRef.current = true;
      setIsVerifyingOtp(true);

      const verifyResult = await verifyPhoneOtp(e164Phone, otp);
      const authPhone = String(verifyResult.phone || e164Phone).trim();

      setOtpTargetPhone(authPhone);
      setOtpVerified(true);
      success('Phone verified successfully');
    } catch (err) {
      logOtpFailure('Verify OTP flow error.', {
        error: err instanceof Error ? err.message : String(err),
      });
      error(mapPhoneAuthError(err, 'verify'));
    } finally {
      verifyOtpInFlightRef.current = false;
      setIsVerifyingOtp(false);
    }
  }, [
    error,
    form.formData.countryCode,
    form.formData.otp,
    form.formData.phone,
    otpSent,
    otpTargetPhone,
    success,
  ]);

  const handleResendOtp = useCallback(async () => {
    if (!otpSent || otpCountdown > 0) return;
    await handleSendOtp();
  }, [handleSendOtp, otpCountdown, otpSent]);

  return {
    ...form,
    otpSent,
    otpCountdown,
    otpVerified,
    isOtpVerifiedForCurrentPhone,
    isCurrentPhoneValid,
    isLoggedIn,
    hasVerifiedAccountPhone,
    isSendingOtp,
    isVerifyingOtp,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    canResendOtp: otpSent && otpCountdown === 0 && !isSendingOtp,
    type,
  };
}
