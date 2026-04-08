import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { BuybackForm } from '../components/BuybackForm';

const CATEGORIES = [
  { label: 'Vegetables', items: ['Cucumber', 'Tomato', 'Brinjal', 'Lady Finger', 'Bitter Gourd'], emoji: '🥦' },
  { label: 'Mushrooms', items: ['Oyster Mushroom', 'Button Mushroom', 'Milky Mushroom'], emoji: '🍄' },
  { label: 'Microgreens', items: ['Sunflower Microgreens', 'Pea Shoots', 'Radish Microgreens'], emoji: '🌱' },
];

export const BuyPage = () => (
  <div className="pt-16 min-h-screen bg-agri-earth-50">
    <div className="bg-agri-earth-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <div className="badge-green w-fit mb-4">For Buyers</div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Source Premium Fresh Produce Directly from Farms
          </h1>
          <p className="text-agri-earth-400 text-lg mb-8">
            Cut out middlemen. Get the freshest vegetables, mushrooms, and microgreens delivered to your door or business.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            {['Farm-fresh quality', 'Bulk B2B orders', 'Home delivery', 'Competitive pricing'].map(b => (
              <div key={b} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-agri-earth-300">
                <CheckCircle2 size={14} className="text-agri-green-400" /> {b}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BuybackForm type="buy" />
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-agri-earth-900">Available Products</h3>
          {CATEGORIES.map(cat => (
            <div key={cat.label} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-semibold text-agri-earth-900">{cat.label}</span>
              </div>
              <ul className="space-y-1.5">
                {cat.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-agri-earth-600">
                    <div className="w-1.5 h-1.5 bg-agri-green-500 rounded-full" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card p-5">
            <h4 className="font-semibold text-agri-earth-900 mb-2">Bulk / B2B Orders</h4>
            <p className="text-sm text-agri-earth-500 mb-3">For restaurants, hotels, and retailers needing 50kg+ weekly orders.</p>
            <a
              href="https://wa.me/919999999999?text=I%20need%20bulk%20order%20pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-sm py-2.5"
            >
              WhatsApp for Bulk Rates
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);
