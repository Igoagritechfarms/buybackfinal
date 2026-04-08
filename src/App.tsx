import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { I18nProvider } from './lib/i18n';
import { NotificationProvider } from './lib/notification-context';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LiveChat } from './components/LiveChat';
import { Home } from './pages/Home';
import { Market } from './pages/Market';
import { ProductCatalog } from './pages/ProductCatalog';
import { SellPage } from './pages/SellPage';
import { BuyPage } from './pages/BuyPage';
import { Enroll } from './pages/Enroll';
import { Contact } from './pages/Contact';
import { Referrals } from './pages/Referrals';
import { Settings } from './pages/Settings';
import { AdminLogin } from './pages/AdminLogin';
import { AdminProducts } from './pages/AdminProducts';
import { FarmerDashboard } from './pages/FarmerDashboard';

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <div className={isAdminRoute ? '' : 'pt-[64px]'}>
        <AnimatePresence mode="wait">
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/market" element={<PageWrapper><Market /></PageWrapper>} />
            <Route path="/catalog" element={<PageWrapper><ProductCatalog /></PageWrapper>} />
            <Route path="/sell" element={<PageWrapper><SellPage /></PageWrapper>} />
            <Route path="/buy" element={<PageWrapper><BuyPage /></PageWrapper>} />
            <Route path="/enroll" element={<PageWrapper><Enroll /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/referrals" element={<PageWrapper><Referrals /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />

            {/* Farmer Dashboard */}
            <Route path="/farmer/:farmerId" element={<PageWrapper><FarmerDashboard /></PageWrapper>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<PageWrapper><AdminLogin /></PageWrapper>} />
            <Route path="/admin/products" element={<PageWrapper><AdminProducts /></PageWrapper>} />

            <Route path="*" element={<PageWrapper><Home /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <LiveChat />}
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <I18nProvider>
          <AdminAuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AdminAuthProvider>
        </I18nProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
