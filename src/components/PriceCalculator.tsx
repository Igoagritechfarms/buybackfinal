import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Package } from 'lucide-react';
import { PRODUCTS } from '../config/products';

export const PriceCalculator = () => {
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const qty = parseFloat(quantity);
    if (!isNaN(qty) && qty > 0) {
      setResult(qty * product.basePrice);
    }
  };

  const gross = result ?? 0;
  const logistics = gross > 0 ? Math.round(gross * 0.05) : 0;
  const net = gross - logistics;

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-agri-green-100 rounded-xl flex items-center justify-center">
          <Calculator size={20} className="text-agri-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-agri-earth-900">Price Calculator</h3>
          <p className="text-xs text-agri-earth-500">Estimate your earnings instantly</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Product Select */}
        <div>
          <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">Select Product</label>
          <div className="grid grid-cols-3 gap-2">
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProduct(p);
                  setResult(null);
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  product.id === p.id
                    ? 'bg-agri-green-600 border-agri-green-600 text-white shadow-md'
                    : 'bg-white border-agri-earth-200 text-agri-earth-600 hover:border-agri-green-300'
                }`}
              >
                <div className="text-base mb-0.5">{p.emoji}</div>
                <div className="leading-tight">{p.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">
            Quantity ({product.unit})
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-agri-earth-400" />
              <input
                type="number"
                placeholder={`Enter quantity in ${product.unit}`}
                className="input pl-9"
                value={quantity}
                min="0"
                onChange={e => { setQuantity(e.target.value); setResult(null); }}
                onKeyDown={e => e.key === 'Enter' && calculate()}
              />
            </div>
            <button onClick={calculate} className="btn-primary px-5 shrink-0">
              Calculate
            </button>
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-br from-agri-green-600 to-agri-green-700 rounded-2xl p-5 text-white"
            >
              <p className="text-sm text-agri-green-100 mb-3 font-medium">
                Estimated Earnings for {quantity} {product.unit} of {product.name}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-agri-green-200">Gross Amount</span>
                  <span className="font-bold">₹{gross.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-agri-green-200">Logistics (5%)</span>
                  <span className="font-medium text-agri-green-300">- ₹{logistics.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-agri-green-500 pt-2 flex justify-between">
                  <span className="font-bold">Net Payout</span>
                  <span className="text-xl font-black">₹{net.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="text-[11px] text-agri-green-200 mt-3">* Paid within 7 days of pickup. Prices subject to quality inspection.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
