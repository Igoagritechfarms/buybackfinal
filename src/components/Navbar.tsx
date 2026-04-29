import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, ShoppingCart, User, LogIn, LogOut } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const isHome = location.pathname === '/';

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setIsMobileOpen(false);
    try { await logout(); } catch { /* ignore */ }
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Market Prices', to: '/market' },
    { label: 'Products', to: '/catalog' },
    { label: 'Contact', to: '/contact' },
  ];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
                    ? 'text-green-700 font-semibold'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50/80'
                }`}
              >
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-xl bg-green-50"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? <User size={12} />}
                </div>
                <span className="max-w-[100px] truncate">{profile?.full_name?.split(' ')[0] ?? 'Account'}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                    >
                      <User size={14} /> My Account
                    </Link>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
              Sell Produce
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
            <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-64px)] overflow-y-auto">
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
              <motion.div className="pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Link
                  to="/sell"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-lime-500 text-white font-bold rounded-xl"
                >
                  <ShoppingCart size={16} />
                  Sell Produce
                </Link>
              </motion.div>
              <motion.div className="pt-1 space-y-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                    >
                      <User size={15} />
                      {profile?.full_name ? `Hi, ${profile.full_name.split(' ')[0]}` : 'My Account'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </>
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
