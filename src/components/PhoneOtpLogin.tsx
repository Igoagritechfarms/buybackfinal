import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

// ── Config ────────────────────────────────────────────────────────────────────

// Empty string = same origin as Vite dev server (OTP routes live in vite.config.ts)
const OTP_SERVER = '';
const RESEND_COOLDOWN = 30; // seconds

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'phone' | 'otp' | 'verified';

interface Msg {
  type: 'success' | 'error';
  text: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const INDIAN_DIGITS_RE = /^[6-9]\d{9}$/;

function isValidIndianPhone(value: string) {
  return INDIAN_DIGITS_RE.test(value.replace(/\D/g, '').slice(-10));
}

async function apiPost(endpoint: string, body: Record<string, string>) {
  const res = await fetch(`${OTP_SERVER}/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message || `Request failed (${res.status})`
    );
  }
  return json;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PhoneOtpLogin() {
  const [phase, setPhase] = useState<Phase>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState<Msg | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  // Countdown tick
  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(timerRef.current!);
  }, [countdown]);

  const clearMsg = () => setMsg(null);

  // ── Send OTP ───────────────────────────────────────────────────────────────

  const handleSendOtp = useCallback(async () => {
    if (inFlightRef.current || sending) return;

    const digits = phone.replace(/\D/g, '');
    if (!isValidIndianPhone(digits)) {
      setMsg({ type: 'error', text: 'Please enter a valid 10-digit Indian mobile number.' });
      return;
    }

    inFlightRef.current = true;
    setSending(true);
    clearMsg();

    try {
      await apiPost('send-otp', { phone: digits });
      setPhase('otp');
      setOtp('');
      setCountdown(RESEND_COOLDOWN);
      setMsg({ type: 'success', text: 'OTP sent. Check the server console (simulated SMS).' });
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to send OTP.' });
    } finally {
      inFlightRef.current = false;
      setSending(false);
    }
  }, [phone, sending]);

  // ── Verify OTP ─────────────────────────────────────────────────────────────

  const handleVerifyOtp = useCallback(async () => {
    if (inFlightRef.current || verifying) return;

    if (!/^\d{6}$/.test(otp)) {
      setMsg({ type: 'error', text: 'Please enter the 6-digit OTP.' });
      return;
    }

    inFlightRef.current = true;
    setVerifying(true);
    clearMsg();

    try {
      const data = await apiPost('verify-otp', { phone: phone.replace(/\D/g, ''), otp });
      setVerifiedPhone((data as { phone?: string }).phone ?? `+91${phone}`);
      setPhase('verified');
      setMsg({ type: 'success', text: 'Phone number verified successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Verification failed.' });
    } finally {
      inFlightRef.current = false;
      setVerifying(false);
    }
  }, [otp, phone, verifying]);

  // ── Resend OTP ─────────────────────────────────────────────────────────────

  const handleResend = useCallback(async () => {
    if (countdown > 0 || sending) return;
    await handleSendOtp();
  }, [countdown, handleSendOtp, sending]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setPhase('phone');
    setPhone('');
    setOtp('');
    setMsg(null);
    setCountdown(0);
    setVerifiedPhone('');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full">
            <Phone size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Phone OTP Login</h1>
          <p className="text-sm text-gray-500">
            {phase === 'phone' && 'Enter your Indian mobile number to receive an OTP.'}
            {phase === 'otp' && `OTP sent to +91 ${phone}. Check the server console.`}
            {phase === 'verified' && 'You are verified!'}
          </p>
        </div>

        {/* Message banner */}
        {msg && (
          <div
            className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
              msg.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* ── Phase: phone ── */}
        {phase === 'phone' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-semibold text-sm select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => {
                    clearMsg();
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending || !isValidIndianPhone(phone)}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sending ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </div>
        )}

        {/* ── Phase: otp ── */}
        {phase === 'otp' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => {
                  clearMsg();
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition tracking-[0.4em] text-center text-lg font-semibold"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifying || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {verifying ? 'Verifying…' : 'Verify OTP'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  clearMsg();
                  setPhase('phone');
                  setOtp('');
                }}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Change number
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || sending}
                className="flex items-center gap-1 font-semibold text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <RefreshCw size={13} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: verified ── */}
        {phase === 'verified' && (
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <ShieldCheck size={32} className="text-green-600" />
            </div>
            <p className="text-gray-700 font-semibold">{verifiedPhone}</p>
            <p className="text-sm text-gray-500">
              Your phone number has been verified successfully.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 rounded-xl border border-green-600 text-green-700 font-semibold hover:bg-green-50 transition"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
