import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Eye, EyeOff, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      await login(email, password);
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-400/8 rounded-full blur-3xl" />
        </div>

        <BrandLogo
          to="/"
          className="relative z-10 flex flex-col items-start gap-1.5"
          imageClassName="h-16 w-auto rounded-xl"
          caption="Admin Portal"
          captionClassName="pl-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500"
        />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="text-5xl font-black text-white leading-tight mb-4">
              Manage Your
              <br />
              <span className="text-lime-400">Farm Marketplace</span>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Control product listings, market prices, and farmgate marketplace operations from one powerful dashboard.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { emoji: '📦', text: 'Manage 170+ products & live prices' },
              { emoji: '📊', text: 'Real-time market analytics dashboard' },
              { emoji: '👨‍🌾', text: 'Monitor farmer marketplace leads' },
              { emoji: '💳', text: 'Track all buy/sell transactions' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/8 rounded-xl"
              >
                <span className="text-xl">{feature.emoji}</span>
                <span className="text-sm text-gray-300 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-gray-600">
          © 2026 Farmgate Mandi · IGO Agritech Farms
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-10 flex justify-center">
            <BrandLogo
              to="/"
              className="flex flex-col items-center gap-1.5"
              imageClassName="h-16 w-auto rounded-xl"
              caption="Admin Portal"
              captionClassName="text-[10px] font-semibold uppercase tracking-widest text-gray-500"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-lime-100 rounded-xl">
                  <ShieldCheck size={22} className="text-lime-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Admin Login</h1>
                  <p className="text-sm text-gray-500">Sign in to manage products & prices</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
              {(error || authError) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <AlertCircle className="text-red-500 shrink-0" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-red-900">{error || authError}</p>
                    <p className="text-xs text-red-600 mt-0.5">Demo: admin@igo.com / admin123</p>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@igo.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-lime-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-lime-500 focus:outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-xl transition-all shadow-md shadow-lime-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Lock size={18} />
                    </motion.div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In to Admin
                  </>
                )}
              </motion.button>

              <div className="p-4 bg-lime-50 border border-lime-100 rounded-xl">
                <p className="text-xs font-bold text-lime-800 mb-1">Demo Credentials</p>
                <p className="text-xs text-lime-700">Email: <strong>admin@igo.com</strong></p>
                <p className="text-xs text-lime-700">Password: <strong>admin123</strong></p>
              </div>
            </form>

            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Need help?{' '}
                <Link to="/contact" className="text-lime-600 font-semibold hover:underline">
                  Contact support
                </Link>
              </p>
              <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Back to site
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
