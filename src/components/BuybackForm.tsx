import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, MapPin, Package, Calendar, Truck, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBuybackForm } from '../hooks/useBuybackForm';
import { PRODUCTS, Product } from '../config/products';
import ProductPicker from './ProductPicker';

interface FormProps {
  type: 'buy' | 'sell';
}

/**
 * Farmgate Form Component - Refactored with validation
 * Uses react-hook-form patterns with Zod validation
 * Reduced from 275 lines to ~140 lines
 */
export const BuybackForm = ({ type }: FormProps) => {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const {
    formData,
    setFieldValue,
    errors,
    isSubmitting,
    submitError,
    handleSubmit,
    otpSent,
    otpCountdown,
    otpVerified,
    isOtpVerifiedForCurrentPhone,
    isCurrentPhoneValid,
    isSendingOtp,
    isVerifyingOtp,
    canResendOtp,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
  } = useBuybackForm(type);

  useEffect(() => {
    if (
      step === 1 &&
      isOtpVerifiedForCurrentPhone &&
      Boolean(formData.name) &&
      Boolean(formData.phone) &&
      Boolean(formData.location)
    ) {
      setStepError('');
      setStep(2);
    }
  }, [step, isOtpVerifiedForCurrentPhone, formData.name, formData.phone, formData.location]);

  const handleNextStep = () => {
    // Validate current step fields
    const step1Fields = ['name', 'phone', 'location'];
    const hasStep1Errors = step1Fields.some((field) => errors[field]);

    if (hasStep1Errors || !formData.name || !formData.phone || !formData.location) {
      setStepError('Please complete all required fields.');
      return;
    }

    if (!isOtpVerifiedForCurrentPhone) {
      setStepError('Please verify OTP to continue.');
      return;
    }

    if (!hasStep1Errors && formData.name && formData.phone && formData.location) {
      setStepError('');
      setStep(2);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSubmitted = await handleSubmit(e);
    if (isSubmitted) {
      setStep(3);
    }
  };

  const resetForm = () => {
    setStep(1);
    setStepError('');
  };

  const handleSelectProduct = (product: Product) => {
    setFieldValue('product', product.id);
    setShowProductPicker(false);
  };

  const selectedProduct = formData.product
    ? PRODUCTS.find((p) => p.id === formData.product)
    : null;

  const renderInput = (
    field: keyof typeof formData,
    label: string,
    icon: React.ReactNode,
    props?: any
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        {...props}
        value={formData[field] as any}
        onChange={(e) => setFieldValue(field, props?.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        aria-label={label}
        aria-invalid={!!errors[field]}
        aria-describedby={errors[field] ? `${field}-error` : undefined}
        className={`w-full p-3 rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-agri-green-600 outline-none ${
          errors[field] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
        }`}
      />
      {errors[field] && (
        <p id={`${field}-error`} className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={12} /> {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-agri-green-800">
          {type === 'buy' ? 'Vendor Purchase Request' : 'Sell Your Harvest'}
        </h3>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={`step-indicator-${s}`}
              className={`h-2 w-8 rounded-full transition-all ${step >= s ? 'bg-agri-green-600' : 'bg-agri-earth-200'}`}
            />
          ))}
        </div>
      </div>

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

      <form onSubmit={handleFormSubmit}>
        <AnimatePresence mode="wait">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('name', type === 'buy' ? 'Vendor Name' : 'Farmer Name', <User size={16} className="text-agri-green-600" />, {
                  type: 'text',
                  placeholder: 'Enter name',
                })}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Phone size={16} className="text-agri-green-600" /> Phone Number
                  </label>
                  <div className="grid grid-cols-[72px_1fr] gap-2">
                    <div className="p-3 rounded-xl border border-agri-earth-200 bg-agri-earth-50 text-agri-earth-700 text-center font-semibold">
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={formData['phone'] as string}
                      onChange={(e) => {
                        setStepError('');
                        setFieldValue('countryCode', '+91');
                        setFieldValue('phone', e.target.value.replace(/\D/g, ''));
                      }}
                      inputMode="numeric"
                      className={`flex-1 p-3 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                        errors['phone'] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-xs text-agri-earth-600">
                      {isSendingOtp
                        ? 'Sending OTP...'
                        : otpSent
                          ? 'OTP sent successfully.'
                          : 'Enter valid 10-digit mobile number and click Send OTP.'}
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
                  {errors['phone'] && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors['phone']}
                    </p>
                  )}
                </div>
              </div>

              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 rounded-xl border border-agri-green-200 bg-agri-green-50 p-3"
                >
                  <p className="text-sm text-agri-green-800 font-medium">OTP sent successfully.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      inputMode="numeric"
                      value={formData['otp'] as string}
                      onChange={(e) => setFieldValue('otp', e.target.value.replace(/\D/g, ''))}
                      className={`w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                        errors['otp'] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
                      }`}
                      aria-label="SMS OTP"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || otpVerified || String(formData['otp'] || '').trim().length !== 6}
                      className="btn-primary px-4 py-3 whitespace-nowrap"
                    >
                      {isVerifyingOtp ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify OTP'}
                    </button>
                  </div>
                  {errors['otp'] && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors['otp']}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <p className={isOtpVerifiedForCurrentPhone ? 'text-agri-green-700 font-semibold' : 'text-agri-earth-600'}>
                      {isOtpVerifiedForCurrentPhone
                        ? 'OTP verified. You can continue.'
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

              {renderInput('location', type === 'buy' ? 'Delivery Location' : 'Farm Location', <MapPin size={16} className="text-agri-green-600" />, {
                type: 'text',
                placeholder: 'City, Pincode',
              })}

              {stepError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {stepError}
                </p>
              )}

              <button type="button" onClick={handleNextStep} className="w-full btn-primary mt-4" disabled={!formData.name || !formData.phone || !formData.location || !isOtpVerifiedForCurrentPhone}>
                Next Step
              </button>
            </motion.div>
          )}

          {/* STEP 2: Product Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Package size={16} className="text-agri-green-600" /> Product Name
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowProductPicker(true)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left font-medium ${
                      errors['product']
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : selectedProduct
                          ? 'border-agri-green-500 bg-agri-green-50 text-agri-green-900'
                          : 'border-agri-earth-200 text-gray-500 hover:border-agri-green-400'
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
                  {errors['product'] && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors['product']}
                    </p>
                  )}
                </div>

                {renderInput('quantity', 'Quantity (kg/units)', <TrendingUp size={16} className="text-agri-green-600" />, {
                  type: 'number',
                  placeholder: 'Enter quantity',
                  min: 0,
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('price', 'Expected Price (₹)', <TrendingUp size={16} className="text-agri-green-600" />, {
                  type: 'number',
                  placeholder: 'Your price',
                  min: 0,
                })}

                {type === 'sell' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Calendar size={16} className="text-agri-green-600" /> Harvest Date
                    </label>
                    <input
                      type="date"
                      value={'harvestDate' in formData ? (formData['harvestDate'] as string) : ''}
                      onChange={(e) => setFieldValue('harvestDate' as any, e.target.value)}
                      className={`w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-agri-green-600 outline-none ${
                        errors['harvestDate'] ? 'border-red-500 bg-red-50' : 'border-agri-earth-200'
                      }`}
                    />
                    {errors['harvestDate'] && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors['harvestDate']}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {type === 'sell' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Truck size={16} className="text-agri-green-600" /> Transport Details
                  </label>
                  <div className="rounded-xl border border-agri-earth-200 bg-agri-earth-50 px-3 py-2 text-sm font-semibold text-agri-earth-800">
                    Self Transport
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary">
                  Back
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-agri-green-100 text-agri-green-600 rounded-full mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-2xl font-bold text-agri-green-800">Request Submitted!</h4>
              <p className="text-agri-earth-800 opacity-70">
                Our team will contact you within 24 hours to confirm the details.
              </p>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Submit Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Product Picker Modal */}
      <ProductPicker
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelectProduct={handleSelectProduct}
        selectedProductId={formData.product as string}
      />
    </div>
  );
};
