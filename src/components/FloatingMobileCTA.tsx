import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';

export const FloatingMobileCTA = () => {
  const { pathname } = useLocation();
  if (pathname === '/sell' || pathname === '/enroll') return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-safe"
    >
      <div className="bg-white border-t border-gray-100 shadow-2xl px-4 py-3">
        <Link
          to="/sell"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-black text-base rounded-2xl shadow-lg shadow-green-600/30 transition-colors"
        >
          <ShoppingCart size={18} />
          Sell Your Produce
        </Link>
      </div>
    </motion.div>
  );
};
