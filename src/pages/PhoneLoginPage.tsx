import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, ShieldCheck, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import {
  loginWithEmailOtp,
  loginWithOtp,
  loginWithPassword,
  mapPhoneAuthError,
  sendEmailOtp,
  sendPhoneOtp,
} from '../lib/phoneAuth';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type LoginMethod = 'password' | 'otp-phone' | 'otp-email';

function sanitizeToIndianMobileDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

function isValidIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value);
}

function sanitizeToEmail(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export const PhoneLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const [method, setMethod] = useState<LoginMethod>('password');
  const [step, setStep] = useState<'input' | 'otp-verify'>('input');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [sending, setSending] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const timerRef = useRef<number | null>(null);

  const isPhoneValid = useMemo(() => isValidIndianMobile(identifier), [identifier]);
  const isEmailValid = useMemo(() => isValidEmail(identifier), [identifier]);
  const isPasswordIdentifierValid = useMemo(() => isPhoneValid || isEmailValid, [isPhoneValid, isEmailValid]);
  const canSubmit = useMemo(() => {
    if (method === 'password') return isPasswordIdentifierValid && password.length >= 6;
    if (method === 'otp-phone') return isPhoneValid;
    if (method === 'otp-email') return isEmailValid;
    return false;
  }, [method, isPasswordIdentifierValid, isPhoneValid, isEmailValid, password]);

  const canVerifyOtp = useMemo(() => otpToken.length === OTP_LENGTH, [otpToken]);

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [from, loading, navigate, user]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendIn(RESEND_SECONDS);
    timerRef.current = window.setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (step === 'otp-verify') {
      setLoggingIn(true);
      try {
        if (method === 'otp-phone') {
          await loginWithOtp(`+91${identifier}`, otpToken);
        } else {
          await loginWithEmailOtp(identifier, otpToken);
        }
        // navigation handled by useEffect on user state change
      } catch (err) {
        setErrorMessage(mapPhoneAuthError(err, 'verify'));
      } finally {
        setLoggingIn(false);
      }
      return;
    }

    if (method === 'password') {
      setLoggingIn(true);
      try {
        await loginWithPassword(identifier, password);
        // navigation handled by useEffect
      } catch (err) {
        setErrorMessage(mapPhoneAuthError(err, 'login'));
      } finally {
        setLoggingIn(false);
      }
    } else {
      setSending(true);
      try {
        if (method === 'otp-phone') {
          await sendPhoneOtp(`+91${identifier}`);
        } else {
          await sendEmailOtp(identifier);
        }
        setStep('otp-verify');
        setInfoMessage('OTP sent! Please check your ' + (method === 'otp-email' ? 'email' : 'phone') + '.');
        startResendTimer();
      } catch (err) {
        setErrorMessage(mapPhoneAuthError(err, 'send'));
      } finally {
        setSending(false);
      }
    }
  }, [step, method, identifier, password, otpToken, startResendTimer]);

  const handleResendOtp = useCallback(async () => {
    setErrorMessage('');
    setInfoMessage('');
    setSending(true);
    try {
      if (method === 'otp-phone') {
        await sendPhoneOtp(`+91${identifier}`);
      } else {
        await sendEmailOtp(identifier);
      }
      setInfoMessage('OTP resent successfully!');
      startResendTimer();
    } catch (err) {
      setErrorMessage(mapPhoneAuthError(err, 'send'));
    } finally {
      setSending(false);
    }
  }, [method, identifier, startResendTimer]);

  if (loading || (user && !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  void canVerifyOtp;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to site
        </Link>
        <BrandLogo to="/" imageClassName="h-8 w-auto" title="Farmgate Mandi" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-green-600 px-8 py-6 text-center text-white">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="mt-1 text-green-100 font-medium">Log in to manage your account</p>
          </div>

          <div className="px-8 py-8">
            {/* Login Method Toggle */}
            {step === 'input' && (
              <div className="mb-6 flex p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMethod('password')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${method === 'password' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('otp-phone')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${method === 'otp-phone' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
                >
                  Phone OTP
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('otp-email')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${method === 'otp-email' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
                >
                  Email OTP
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-6 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {step === 'input' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      {method === 'otp-email' ? 'Email Address' : method === 'password' ? 'Mobile Number or Email' : 'Mobile Number'}
                    </label>
                    <div className={`flex gap-2 ${method === 'otp-phone' ? 'items-center' : ''}`}>
                      {method === 'otp-phone' && (
                        <span className="flex items-center bg-gray-50 border border-gray-200 px-3 rounded-xl text-gray-600 font-bold">+91</span>
                      )}
                      <input
                        type={method === 'otp-email' ? 'email' : method === 'otp-phone' ? 'tel' : 'text'}
                        maxLength={method === 'otp-phone' ? 10 : undefined}
                        placeholder={
                          method === 'otp-email' ? 'your@email.com'
                          : method === 'password' ? '10-digit number or email'
                          : '10-digit number'
                        }
                        value={identifier}
                        onChange={e => {
                          const value = method === 'otp-phone'
                            ? sanitizeToIndianMobileDigits(e.target.value)
                            : method === 'password'
                            ? e.target.value.trim()
                            : sanitizeToEmail(e.target.value);
                          setIdentifier(value);
                        }}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {method === 'password' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loggingIn || sending || !canSubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loggingIn || sending ? <RefreshCw size={18} className="animate-spin" /> : (method === 'password' ? <Lock size={18} /> : <ShieldCheck size={18} />)}
                    {loggingIn ? 'Logging in...' : sending ? 'Sending OTP...' : (method === 'password' ? 'Login with Password' : 'Send OTP')}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={otpToken}
                      onChange={e => setOtpToken(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-200 rounded-xl py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      autoFocus
                    />
                    <div className="mt-2 flex justify-between items-center text-xs">
                       <button type="button" onClick={() => setStep('input')} className="text-gray-500 hover:text-gray-700 underline font-medium">
                         Change {method === 'otp-email' ? 'email' : 'number'}
                       </button>
                       {resendIn > 0 ? (
                         <span className="text-gray-400">Resend in {resendIn}s</span>
                       ) : (
                         <button type="button" onClick={handleResendOtp} className="text-green-600 font-bold hover:underline">Resend OTP</button>
                       )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loggingIn || otpToken.length !== OTP_LENGTH}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loggingIn ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {loggingIn ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </>
              )}

              <p className="pt-4 text-center text-sm text-gray-500">
                Don&apos;t have an account? <Link to="/signup" className="text-green-600 font-bold hover:underline">Sign up</Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

    </div>
  );
};
