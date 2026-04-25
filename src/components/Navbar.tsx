import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, ShoppingCart, User, LogIn } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { LanguageToggle } from './LanguageToggle';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const isHome = location.pathname === '/';

  const navLinks = [
    { label: t('nav_home'), to: '/' },
    { label: t('nav_market'), to: '/market' },
    { label: 'Products', to: '/catalog' },
    { label: t('nav_earn_rewards'), to: '/referrals' },
    { label: t('nav_contact'), to: '/contact' },
  ];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navBg = isScrolled || !isHome
    ? 'bg-white shadow-md border-b border-gray-100'
    : 'bg-white/95 backdrop-blur-sm border-b border-gray-100';

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <BrandLogo
            to="/"
            className="flex items-center gap-3"
            imageClassName="h-12 w-auto object-contain sm:h-14"
            title="Farmgate Mandi"
            titleClassName="text-sm font-black leading-none tracking-tight text-gray-900 sm:text-base"
            textBlockClassName="flex flex-col items-start justify-center gap-1"
            caption="Powered by IGO Group"
            captionClassName="text-[9px] font-bold leading-none uppercase tracking-[0.15em] text-gray-400"
          />
        </motion.div>

        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                to={link.to}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  location.pathname === link.to
                    ? 'text-green-700 bg-green-50 font-semibold'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50/80'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-xl bg-green-50"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle />

          <Link
            to="/settings"
            className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 flex items-center gap-1"
          >
            {t('nav_settings')}
            <ChevronDown size={14} />
          </Link>

          {user ? (
            <Link
              to="/dashboard"
              title={profile?.full_name ?? 'My Account'}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm transition-all duration-200"
            >
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? <User size={16} />}
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
            >
              <LogIn size={15} />
              Login
            </Link>
          )}

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/sell"
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ShoppingCart size={15} />
              {t('nav_sell')}
            </Link>
          </motion.div>
        </div>

        <motion.button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div animate={{ rotate: isMobileOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.to}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.to
                        ? 'text-lime-700 bg-lime-50'
                        : 'text-gray-700 hover:bg-lime-50 hover:text-lime-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div className="pt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <LanguageToggle />
              </motion.div>
              <motion.div className="pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                <Link
                  to="/sell"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-lime-500 text-white font-bold rounded-xl"
                >
                  <ShoppingCart size={16} />
                  {t('nav_sell')}
                </Link>
              </motion.div>
              <motion.div className="pt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <Link
                  to="/settings"
                  className="block text-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Settings
                </Link>
              </motion.div>
              <motion.div className="pt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                {user ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                  >
                    <User size={15} />
                    {profile?.full_name ? `Hi, ${profile.full_name.split(' ')[0]}` : 'My Account'}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <LogIn size={15} />
                    Login
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
