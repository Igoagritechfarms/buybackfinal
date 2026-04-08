import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, ShoppingCart } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useI18n } from '../lib/i18n';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();
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

  useEffect(() => { setIsMobileOpen(false); }, [location]);

  const navBg = isScrolled || !isHome
    ? 'bg-white shadow-md border-b border-gray-100'
    : 'bg-white/95 backdrop-blur-sm border-b border-gray-100';

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {/* IGOBuyback cart + leaf icon */}
            <div className="w-10 h-10 flex items-center justify-center bg-green-600 rounded-xl shadow-sm">
              <svg viewBox="0 0 60 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M8 44 L5 14 L54 14 L51 44 Z" stroke="white" strokeWidth="5" strokeLinejoin="round" fill="none"/>
                <path d="M5 14 L2 7" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                <circle cx="18" cy="52" r="5" fill="white" opacity="0.9"/>
                <circle cx="42" cy="52" r="5" fill="white" opacity="0.9"/>
                <path d="M28 40 Q12 20 26 2 Q46 16 28 40Z" fill="#84CC16"/>
                <path d="M38 38 Q26 18 40 4 Q52 18 38 38Z" fill="#A3E635" opacity="0.85"/>
              </svg>
            </div>

            {/* Brand name — always visible */}
            <div>
              <div className="text-lg font-black tracking-tight leading-none text-gray-900">
                IGO <span className="text-green-600">Farmgate mandi</span>
              </div>
              <div className="text-[9px] font-bold leading-none uppercase tracking-[0.15em] text-gray-400 mt-0.5">
                Powered by IGO Group
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── Desktop Nav ── */}
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

        {/* ── Right Side ── */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle />

          <Link
            to="/settings"
            className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 flex items-center gap-1"
          >
            {t('nav_settings')}
            <ChevronDown size={14} />
          </Link>

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

        {/* ── Mobile Toggle ── */}
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

      {/* ── Mobile Menu ── */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
