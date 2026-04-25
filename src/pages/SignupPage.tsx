import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User, RefreshCw, ShieldCheck, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { supabase } from '../lib/supabaseClient';

/** POST a JSON body to the Express OTP server and return parsed JSON. */
async function callApi(path: string, body: Record<string, unknown>) {
    const res = await fetch(`/api${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const raw = await res.text();
    let data: Record<string, unknown> = {};

    if (raw.trim()) {
        try {
            data = JSON.parse(raw) as Record<string, unknown>;
        } catch {
            throw new Error(`Server returned an invalid response (${res.status}).`);
        }
    }

    if (!res.ok && !raw.trim() && res.status === 500) {
        throw new Error('OTP server is not running. Start it with: npm run server:otp');
    }

    if (!res.ok) {
        const message = typeof data['message'] === 'string' ? data['message'] : '';
        throw new Error(message || `Request failed (${res.status}). Make sure the OTP server is running.`);
    }

    if (!raw.trim()) {
        throw new Error('OTP server returned an empty response. Restart the OTP server and try again.');
    }

    return data;
}

const OTP_LENGTH = 6;

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
    const requestIdRef = useRef(0);
    const [step, setStep] = useState<'input' | 'otp-verify'>('input');
    const [fullName, setFullName] = useState('');
    const [phoneDigits, setPhoneDigits] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otpToken, setOtpToken] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const isPhoneValid = isValidIndianMobile(phoneDigits);
    const canSubmitInput = fullName.length >= 3 && isPhoneValid && username.length >= 3 && password.length >= 6;

    const handleSendOTP = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (isSubmitting) return;
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setErrorMessage('');
        setInfoMessage('');

        setIsSubmitting(true);
        try {
            const data = await callApi('/send-otp', { phone: phoneDigits });
            if (requestIdRef.current !== requestId) return;

            setErrorMessage('');
            setStep('otp-verify');

            if (data.devMode && data.otp) {
                // Dev mode: OTP returned in response, show on screen
                setInfoMessage(`OTP sent to +91 ${phoneDigits} — Dev code: ${data.otp}`);
                console.log('[SignupPage] Dev OTP:', data.otp);
            } else {
                setInfoMessage(`OTP sent to +91 ${phoneDigits} via SMS.`);
            }
        } catch (error: any) {
            if (requestIdRef.current !== requestId) return;
            setInfoMessage('');
            setErrorMessage(error.message || 'Failed to send OTP. Is the OTP server running?');
        } finally {
            if (requestIdRef.current === requestId) {
                setIsSubmitting(false);
            }
        }
    };

    const handleVerifyAndSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setErrorMessage('');

        setIsSubmitting(true);
        try {
            // Verifies OTP + creates Supabase user + returns email/password
            const data = await callApi('/signup', {
                phone: phoneDigits,
                otp: otpToken,
                password,
                name: fullName,
            });

            // Sign into Supabase with the generated email+password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (signInError) throw new Error(signInError.message);

            navigate('/dashboard');
        } catch (error: any) {
            if (requestIdRef.current !== requestId) return;
            setErrorMessage(error.message || 'Signup failed. Please try again.');
        } finally {
            if (requestIdRef.current === requestId) {
                setIsSubmitting(false);
            }
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

                        {step === 'input' ? (
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your full name"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Choose a username"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mobile Number</label>
                                    <div className="flex gap-2">
                                        <span className="flex items-center bg-gray-50 border border-gray-200 px-3 rounded-xl text-gray-600 font-bold">+91</span>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            required
                                            placeholder="10-digit number"
                                            value={phoneDigits}
                                            onChange={e => setPhoneDigits(sanitizeToIndianMobileDigits(e.target.value))}
                                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            placeholder="Create a password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">At least 6 characters long</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !canSubmitInput}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                    {isSubmitting ? 'Sending OTP...' : 'Sign Up'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyAndSignup} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">OTP Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        placeholder="6-digit code"
                                        value={otpToken}
                                        onChange={e => setOtpToken(e.target.value.replace(/\D/g, ''))}
                                        className="w-full border border-gray-200 rounded-xl py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        autoFocus
                                    />
                                    <div className="mt-2 flex justify-between items-center text-xs">
                                         <button type="button" onClick={() => setStep('input')} className="text-gray-500 hover:text-gray-700 underline font-medium">Change details</button>
                                         <button type="button" onClick={handleSendOTP} className="text-green-600 font-bold hover:underline">Resend OTP</button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || otpToken.length !== OTP_LENGTH}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                    {isSubmitting ? 'Verifying...' : 'Verify & Create Account'}
                                </button>
                            </form>
                        )}

                        <p className="pt-4 text-center text-sm text-gray-500">
                            Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Log in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
