import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User, RefreshCw, ShieldCheck, AlertCircle, Lock, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { supabase } from '../lib/supabaseClient';

async function callApi(path: string, body: Record<string, unknown>) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let data: Record<string, unknown> = {};
  if (raw.trim()) {
    try { data = JSON.parse(raw) as Record<string, unknown>; }
    catch { throw new Error(`Server returned an invalid response (${res.status}).`); }
  }
  if (!res.ok) {
    const message = typeof data['message'] === 'string' ? data['message'] : '';
    throw new Error(message || `Request failed (${res.status}).`);
  }
  return data;
}

function sanitizeToIndianMobileDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

function isValidIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value);
}

export const SignupPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isPhoneValid = isValidIndianMobile(phoneDigits);
  const canSubmit =
    fullName.trim().length >= 2 &&
    username.trim().length >= 3 &&
    isPhoneValid &&
    password.length >= 6;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !canSubmit) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const data = await callApi('/signup-direct', {
        name: fullName.trim(),
        username: username.trim(),
        phone: phoneDigits,
        ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
        password,
      });

      const authEmail = typeof data['email'] === 'string' ? data['email'] : '';
      const authPassword = typeof data['password'] === 'string' ? data['password'] : '';

      if (!authEmail || !authPassword) {
        throw new Error('Account created but login credentials were not returned.');
      }

      setSuccessMessage('Account created! Logging you in…');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (signInError) throw new Error(signInError.message);

      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to site
        </Link>
        <BrandLogo to="/" imageClassName="h-8 w-auto" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-green-600 px-8 py-6 text-center text-white">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="mt-1 text-green-100 font-medium">Join Farmgate Mandi today</p>
          </div>

          <div className="px-8 py-8">
            {errorMessage && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Choose a username (min 3 chars)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center bg-gray-50 border border-gray-200 px-3 rounded-xl text-gray-600 font-bold">+91</span>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="10-digit number"
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(sanitizeToIndianMobileDigits(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Email Address <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">At least 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                {isSubmitting ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <p className="pt-4 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-bold hover:underline">Log in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
