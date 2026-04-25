import { motion, AnimatePresence } from 'motion/react';
import {
  User, Phone, MapPin, Package, Calendar, Truck, CheckCircle2,
  TrendingUp, AlertCircle, ClipboardList, ChevronRight, ChevronLeft,
  ShieldCheck, FileText,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useBuybackForm } from '../hooks/useBuybackForm';
import { PRODUCTS, Product } from '../config/products';
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  sanitizeCountryCode,
  sanitizePhoneDigits,
} from '../lib/phone';
import ProductPicker from './ProductPicker';

interface FormProps {
  type: 'buy' | 'sell';
}

const STEPS = ['Personal', 'Product', 'Schedule', 'Review'];

export const BuybackForm = ({ type }: FormProps) => {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    formData,
    setFieldValue,
    errors,
    isSubmitting,
    submitError,
    handleSubmit,
    otpSent,
    otpCountdown,
    isOtpVerifiedForCurrentPhone,
    isCurrentPhoneValid,
    isLoggedIn,
    isSendingOtp,
    isVerifyingOtp,
    canResendOtp,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
  } = useBuybackForm(type);

  // Bracket notation required by noPropertyAccessFromIndexSignature tsconfig rule
  const fd = formData as Record<string, unknown>;
  const er = errors as Record<string, string | undefined>;

  const selectedProduct = fd['product']
    ? PRODUCTS.find((p) => p.id === String(fd['product'] ?? ''))
    : null;

  const handleSelectProduct = (product: Product) => {
    setFieldValue('product', product.id);
    setShowProductPicker(false);
  };

  // ── Step validation ─────────────────────────────────────────────────────────

  const validateStep1 = useCallback((): string => {
    if (!formData.name || String(formData.name).trim().length < 2)
      return 'Please enter your full name.';
    if (!formData.phone || String(formData.phone).length < 10)
      return 'Please enter a valid 10-digit mobile number.';
    if (!isLoggedIn && !isOtpVerifiedForCurrentPhone)
      return 'Please verify your phone number with OTP.';
    return '';
  }, [formData.name, formData.phone, isLoggedIn, isOtpVerifiedForCurrentPhone]);

  const validateStep2 = useCallback((): string => {
    if (!formData.product) return 'Please select a product.';
    const qty = Number(formData.quantity);
    if (!qty || qty <= 0) return 'Please enter a valid quantity.';
    return '';
  }, [formData.product, formData.quantity]);

  const validateStep3 = useCallback((): string => {
    if (!fd['location'] || String(fd['location']).trim().length < 3)
      return 'Please enter your location (city or pincode).';
    if (type === 'sell' && 'harvestDate' in formData) {
      const hd = fd['harvestDate'] as string;
      if (hd && new Date(hd) > new Date()) return 'Harvest date cannot be in the future.';
    }
    return '';
  }, [formData, type]);

  const goNext = useCallback(() => {
    let err = '';
    if (step === 1) err = validateStep1();
    else if (step === 2) err = validateStep2();
    else if (step === 3) err = validateStep3();

    if (err) {
      setStepError(err);
      return;
    }
    setStepError('');
    setStep((s) => Math.min(s + 1, 4));
  }, [step, validateStep1, validateStep2, validateStep3]);

  const goBack = () => {
    setStepError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Re-validate all steps before submit
    const s1 = validateStep1();
    const s2 = validateStep2();
    const s3 = validateStep3();
    if (s1) { setStepError(s1); setStep(1); return; }
    if (s2) { setStepError(s2); setStep(2); return; }
    if (s3) { setStepError(s3); setStep(3); return; }
    setStepError('');

    try {
      const ok = await handleSubmit(e);
      if (ok) {
        setSubmitted(true);
      }
    } catch (err) {
      setStepError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    }
  };

  const resetForm = () => {
    setStep(1);
    setStepError('');
    setSubmitted(false);
  };

  const renderFieldError = (field: string) =>
    errors[field] ? (
      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
        <AlertCircle size={12} /> {errors[field]}
      </p>
    ) : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-agri-green-800">
          {type === 'buy' ? 'Vendor Purchase Request' : 'Sell Your Harvest'}
        </h3>
        {/* Step indicators */}
        {!submitted && (
          <div className="flex items-center gap-1">
            {STEPS.map((label, idx) => {
              const s = idx + 1;
              return (
                <div key={label} className="flex items-center gap-1">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                      step > s
                        ? 'bg-agri-green-600 text-white'
                        : step === s
                        ? 'bg-agri-green-700 text-white ring-2 ring-agri-green-300'
                        : 'bg-agri-earth-100 text-agri-earth-500'
                    }`}
                  >
                    {step > s ? <CheckCircle2 size={12} /> : s}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`w-6 h-0.5 rounded transition-all ${
                        step > s ? 'bg-agri-green-500' : 'bg-agri-earth-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global submit error */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 items-start"
        >
          <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{submitError}</p>
        </motion.div>
      )}

      <form onSubmit={handleFormSubmit} noValidate>
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════════════════ STEP 1 */}
          {!submitted && step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs font-semibold text-agri-earth-500 uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} /> Step 1 — Personal Details
              </p>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <User size={15} className="text-agri-green-600" />
                  {type === 'buy' ? 'Vendor Name' : 'Farmer / Contact Name'} *
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={String(fd['name'] || '')}
                  onChange={(e) => setFieldValue('name', e.target.value)}
                  className={`w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                    er['name'] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
                  }`}
                />
                {renderFieldError('name')}
              </div>

              {/* Phone + OTP */}
              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Phone size={15} className="text-agri-green-600" /> Phone Number *
                </label>
                <div className="grid grid-cols-[72px_1fr] gap-2">
                  <div className="p-3 rounded-xl border border-agri-earth-200 bg-agri-earth-50 text-agri-earth-700 text-center font-semibold text-sm">
                    {sanitizeCountryCode(
                      String(fd['countryCode'] || DEFAULT_PHONE_COUNTRY_CODE)
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="numeric"
                    value={String(fd['phone'] || '')}
                    onChange={(e) => {
                      setStepError('');
                      setFieldValue('countryCode', DEFAULT_PHONE_COUNTRY_CODE);
                      setFieldValue('phone', sanitizePhoneDigits(e.target.value));
                    }}
                    disabled={isLoggedIn}
                    className={`flex-1 p-3 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                      isLoggedIn
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : er['phone']
                        ? 'border-red-500 bg-red-50'
                        : 'border-agri-earth-200'
                    }`}
                  />
                </div>
                {renderFieldError('phone')}

                {/* OTP section — skip if logged in */}
                {isLoggedIn ? (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                    <ShieldCheck size={14} className="text-green-600 shrink-0" />
                    <p className="text-xs text-green-700 font-medium">
                      Phone verified via your account.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-agri-earth-500">
                      {isSendingOtp
                        ? 'Sending OTP...'
                        : otpSent
                        ? 'OTP sent. Enter below to verify.'
                        : 'Enter a valid number and send OTP.'}
                    </p>
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || !isCurrentPhoneValid}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-agri-green-300 text-agri-green-700 bg-agri-green-50 hover:bg-agri-green-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                )}

                {/* OTP input */}
                {!isLoggedIn && otpSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 space-y-2 p-3 bg-agri-green-50 border border-agri-green-200 rounded-xl"
                  >
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        inputMode="numeric"
                        value={String(fd['otp'] || '')}
                        onChange={(e) =>
                          setFieldValue('otp', e.target.value.replace(/\D/g, ''))
                        }
                        className={`w-full p-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                          er['otp'] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={
                          isVerifyingOtp ||
                          isOtpVerifiedForCurrentPhone ||
                          String(fd['otp'] || '').length !== 6
                        }
                        className="btn-primary px-4 py-2.5 whitespace-nowrap text-sm"
                      >
                        {isVerifyingOtp
                          ? 'Verifying...'
                          : isOtpVerifiedForCurrentPhone
                          ? 'Verified ✓'
                          : 'Verify OTP'}
                      </button>
                    </div>
                    {renderFieldError('otp')}
                    <div className="flex items-center justify-between text-xs">
                      <p
                        className={
                          isOtpVerifiedForCurrentPhone
                            ? 'text-agri-green-700 font-semibold'
                            : 'text-agri-earth-500'
                        }
                      >
                        {isOtpVerifiedForCurrentPhone
                          ? '✓ OTP verified. You can continue.'
                          : 'Enter OTP and click Verify OTP.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={!canResendOtp}
                        className="font-semibold text-agri-green-700 disabled:text-agri-earth-400"
                      >
                        {canResendOtp ? 'Resend OTP' : `Resend in ${otpCountdown}s`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Step error */}
              {stepError && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {stepError}
                </p>
              )}

              <button type="button" onClick={goNext} className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
                Next Step <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════ STEP 2 */}
          {!submitted && step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs font-semibold text-agri-earth-500 uppercase tracking-wider flex items-center gap-1.5">
                <Package size={13} /> Step 2 — Product Details
              </p>

              {/* Product picker */}
              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Package size={15} className="text-agri-green-600" /> Product *
                </label>
                <button
                  type="button"
                  onClick={() => setShowProductPicker(true)}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left font-medium ${
                    er['product']
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : selectedProduct
                      ? 'border-agri-green-500 bg-agri-green-50 text-agri-green-900'
                      : 'border-agri-earth-200 text-gray-400 hover:border-agri-green-400'
                  }`}
                >
                  {selectedProduct ? (
                    <div className="flex items-center justify-between">
                      <span>
                        {selectedProduct.emoji} {selectedProduct.name}
                      </span>
                      <span className="text-sm font-semibold text-agri-green-600">
                        ₹{selectedProduct.basePrice}/{selectedProduct.unit}
                      </span>
                    </div>
                  ) : (
                    'Click to select product...'
                  )}
                </button>
                {renderFieldError('product')}
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp size={15} className="text-agri-green-600" /> Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    min={0.1}
                    step={0.1}
                    value={Number(fd['quantity']) || ''}
                    onChange={(e) => setFieldValue('quantity', parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                      er['quantity'] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
                    }`}
                  />
                  {renderFieldError('quantity')}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold">Unit</label>
                  <select
                    value={String(fd['quantityUnit'] || 'kg')}
                    onChange={(e) => setFieldValue('quantityUnit', e.target.value)}
                    className="w-full p-3 rounded-xl border border-agri-earth-200 bg-white focus:ring-2 focus:ring-agri-green-600 outline-none"
                  >
                    {['kg', 'quintal', 'ton', 'bundles', 'pieces', 'liter', 'dozen'].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expected Price */}
              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp size={15} className="text-agri-green-600" /> Expected Price (₹) per unit
                </label>
                <input
                  type="number"
                  placeholder="Your expected price"
                  min={0}
                  value={Number(fd['price']) || ''}
                  onChange={(e) => setFieldValue('price', parseFloat(e.target.value) || 0)}
                  className={`w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                    er['price'] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
                  }`}
                />
                {renderFieldError('price')}
              </div>

              {stepError && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {stepError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={goBack} className="flex-1 btn-secondary flex items-center justify-center gap-1.5">
                  <ChevronLeft size={15} /> Back
                </button>
                <button type="button" onClick={goNext} className="flex-1 btn-primary flex items-center justify-center gap-1.5">
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════ STEP 3 */}
          {!submitted && step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs font-semibold text-agri-earth-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} /> Step 3 — Location & Schedule
              </p>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <MapPin size={15} className="text-agri-green-600" />
                  {type === 'buy' ? 'Delivery Location' : 'Farm Location'} *
                </label>
                <input
                  type="text"
                  placeholder="City, Pincode or full address"
                  value={String(fd['location'] || '')}
                  onChange={(e) => setFieldValue('location', e.target.value)}
                  className={`w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                    er['location'] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
                  }`}
                />
                {renderFieldError('location')}
              </div>

              {/* Harvest / Delivery date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar size={15} className="text-agri-green-600" />
                    {type === 'sell' ? 'Harvest Date' : 'Preferred Delivery Date'}
                  </label>
                  <input
                    type="date"
                    value={
                      type === 'sell'
                        ? String(fd['harvestDate'] ?? '')
                        : String(fd['deliveryDate'] ?? '')
                    }
                    max={type === 'sell' ? new Date().toISOString().split('T')[0] : undefined}
                    onChange={(e) =>
                      setFieldValue(
                        (type === 'sell' ? 'harvestDate' : 'deliveryDate') as keyof typeof formData,
                        e.target.value
                      )
                    }
                    className="w-full p-3 rounded-xl border border-agri-earth-200 focus:ring-2 focus:ring-agri-green-600 outline-none"
                  />
                  {type === 'sell' && renderFieldError('harvestDate')}
                </div>

                {/* Site visit date */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar size={15} className="text-agri-green-600" />
                    Preferred Visit Date
                    <span className="text-agri-earth-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={String(fd['siteVisitDate'] || '')}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFieldValue('siteVisitDate' as keyof typeof formData, e.target.value)}
                    className="w-full p-3 rounded-xl border border-agri-earth-200 focus:ring-2 focus:ring-agri-green-600 outline-none"
                  />
                </div>
              </div>

              {/* Transport (sell only) */}
              {type === 'sell' && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Truck size={15} className="text-agri-green-600" /> Transport
                  </label>
                  <div className="rounded-xl border border-agri-earth-200 bg-agri-earth-50 px-3 py-2 text-sm font-semibold text-agri-earth-800">
                    Self Transport (you bring to collection point)
                  </div>
                </div>
              )}

              {/* Schedule notes */}
              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <ClipboardList size={15} className="text-agri-green-600" />
                  Additional Notes
                  <span className="text-agri-earth-400 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="Any specific requirements, timing preferences, or notes..."
                  rows={3}
                  maxLength={500}
                  value={String(fd['scheduleNotes'] || '')}
                  onChange={(e) => setFieldValue('scheduleNotes' as keyof typeof formData, e.target.value)}
                  className="w-full p-3 rounded-xl border border-agri-earth-200 focus:ring-2 focus:ring-agri-green-600 outline-none resize-none"
                />
              </div>

              {stepError && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {stepError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={goBack} className="flex-1 btn-secondary flex items-center justify-center gap-1.5">
                  <ChevronLeft size={15} /> Back
                </button>
                <button type="button" onClick={goNext} className="flex-1 btn-primary flex items-center justify-center gap-1.5">
                  Review <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════ STEP 4 */}
          {!submitted && step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs font-semibold text-agri-earth-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} /> Step 4 — Review & Submit
              </p>

              <div className="rounded-2xl border border-agri-earth-200 divide-y divide-agri-earth-100 overflow-hidden">
                {[
                  {
                    label: type === 'buy' ? 'Vendor Name' : 'Farmer Name',
                    value: String(fd['name'] || '—'),
                  },
                  {
                    label: 'Phone',
                    value: `+91 ${fd['phone'] ?? ''}`,
                  },
                  {
                    label: 'Product',
                    value: selectedProduct
                      ? `${selectedProduct.emoji} ${selectedProduct.name}`
                      : '—',
                  },
                  {
                    label: 'Quantity',
                    value: `${fd['quantity'] || '—'} ${fd['quantityUnit'] || 'kg'}`,
                  },
                  {
                    label: 'Expected Price',
                    value: fd['price'] ? `₹${fd['price']}/unit` : '—',
                  },
                  {
                    label: type === 'sell' ? 'Farm Location' : 'Delivery Location',
                    value: String(fd['location'] || '—'),
                  },
                  {
                    label: type === 'sell' ? 'Harvest Date' : 'Delivery Date',
                    value: String(
                      type === 'sell' ? (fd['harvestDate'] ?? '') : (fd['deliveryDate'] ?? '')
                    ) || '—',
                  },
                  ...(fd['siteVisitDate']
                    ? [{ label: 'Preferred Visit Date', value: String(fd['siteVisitDate']) }]
                    : []),
                  ...(fd['scheduleNotes']
                    ? [{ label: 'Notes', value: String(fd['scheduleNotes']) }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between px-4 py-2.5 text-sm">
                    <span className="text-agri-earth-500 font-medium min-w-[120px]">{label}</span>
                    <span className="text-agri-earth-900 font-semibold text-right">{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-agri-earth-500 text-center">
                By submitting, you agree that our team will contact you within 24 hours to confirm.
              </p>

              {(stepError || submitError) && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium justify-center">
                  <AlertCircle size={12} /> {stepError || submitError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={goBack} className="flex-1 btn-secondary flex items-center justify-center gap-1.5">
                  <ChevronLeft size={15} /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════ SUCCESS */}
          {submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-agri-green-100 text-agri-green-600 rounded-full">
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-2xl font-bold text-agri-green-800">Request Submitted!</h4>
              <p className="text-agri-earth-600 text-sm">
                Our team will contact you within 24 hours to confirm the details.
              </p>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Submit Another Request
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <ProductPicker
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelectProduct={handleSelectProduct}
        selectedProductId={String(formData.product || '')}
      />
    </div>
  );
};
