import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp, Leaf, Clock, MapPin, Shield, Truck } from 'lucide-react';
import { BuybackForm } from '../components/BuybackForm';

export const SellPage = () => (
  <div className="pt-16 min-h-screen bg-agri-earth-50">
    {/* Header */}
    <div className="bg-gradient-to-r from-agri-green-600 to-agri-green-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <div className="badge-green bg-white/20 text-white w-fit mb-4">For Farmers</div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Sell Your Harvest at Best Price
          </h1>
          <p className="text-agri-green-100 text-lg mb-8 leading-relaxed">
            No middlemen, no negotiation. Get guaranteed fair market prices for your produce with trusted logistics and payment in 7 days.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <TrendingUp size={18} />, text: 'Best Price' },
              { icon: <Leaf size={18} />, text: 'All Products' },
              { icon: <Clock size={18} />, text: '7-Day Payment' },
              { icon: <Truck size={18} />, text: 'Smart Logistics' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur"
              >
                {item.icon}
                <span className="text-sm font-semibold">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - wider on desktop */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BuybackForm type="sell" />
          </motion.div>
        </div>

        {/* Right Sidebar - Information Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* How It Works Card */}
          <div className="card p-6 bg-gradient-to-br from-agri-green-50 to-white border border-agri-green-200">
            <h3 className="text-xl font-black text-agri-earth-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              {[
                { step: '1', icon: '📋', title: 'Register', desc: 'Fill in farm & produce details' },
                { step: '2', icon: '✓', title: 'Get Quote', desc: 'Receive fair market price' },
                { step: '3', icon: '🚚', title: 'Pickup', desc: 'Free collection from farm' },
                { step: '4', icon: '💰', title: 'Payment', desc: 'Paid within 7 days' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex gap-3 items-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-agri-green-600 text-white text-sm font-bold flex items-center justify-center flex-col">
                    {item.step}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="font-semibold text-agri-earth-900 text-sm">{item.title}</p>
                    <p className="text-xs text-agri-earth-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Why Choose Us Card */}
          <div className="card p-6 bg-gradient-to-br from-white to-agri-earth-50 border border-agri-earth-200">
            <h3 className="text-lg font-black text-agri-earth-900 mb-4">Why Choose IGO?</h3>
            <div className="space-y-3">
              {[
                { icon: <Shield size={18} />, text: 'Zero Middlemen' },
                { icon: <TrendingUp size={18} />, text: 'Fair Market Rates' },
                { icon: <Clock size={18} />, text: 'Fast Payment' },
                { icon: <MapPin size={18} />, text: 'Logistics & Delivery' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-agri-green-50 transition"
                >
                  <div className="text-agri-green-600">{item.icon}</div>
                  <span className="text-sm font-medium text-agri-earth-900">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Support Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6 bg-gradient-to-br from-agri-earth-900 to-agri-earth-800 text-white border-0"
          >
            <h4 className="font-bold mb-2">24/7 Farmer Support</h4>
            <p className="text-agri-earth-300 text-sm mb-4">
              Have questions? Our farm support team is here to help you maximize your earnings.
            </p>
            <div className="space-y-2">
              <a
                href="tel:+919999999999"
                className="w-full flex items-center justify-center gap-2 bg-agri-green-600 hover:bg-agri-green-700 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105"
              >
                📞 Call Us
              </a>
            </div>
            <p className="text-xs text-agri-earth-400 mt-3 text-center">Mon–Sat, 8 AM to 6 PM</p>
          </motion.div>

          {/* Stats Card */}
          <div className="card p-6 bg-gradient-to-br from-agri-green-100 to-agri-earth-100 border border-agri-green-300">
            <div className="space-y-3 text-center">
              <div>
                <p className="text-3xl font-black text-agri-green-600">₹4.5 Cr</p>
                <p className="text-sm font-semibold text-agri-earth-700">Paid to Farmers</p>
              </div>
              <div className="border-t border-agri-green-300 pt-3">
                <p className="text-2xl font-black text-agri-earth-900">1,200+</p>
                <p className="text-sm font-semibold text-agri-earth-700">Trusted Farmers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);
