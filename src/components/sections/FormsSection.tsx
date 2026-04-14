import { useState } from 'react';
import { BuybackForm } from '../BuybackForm';

/**
 * Forms Section - Sell/Buy form tabs for Farmgate Mandi
 */
export const FormsSection = () => {
  const [tab, setTab] = useState<'sell' | 'buy'>('sell');

  return (
    <section className="py-24 bg-white" id="farmgate">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black tracking-tighter text-agri-earth-900 mb-3">
            {tab === 'sell' ? 'Register to Sell Your Harvest' : 'Register as a Vendor'}
          </h2>
          <p className="text-agri-earth-500">
            Fill in the form and our team will contact you within 2 hours.
          </p>
        </div>
        <div className="flex bg-agri-earth-100 p-1 rounded-2xl mb-8 max-w-sm mx-auto">
          <button
            onClick={() => setTab('sell')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'sell'
                ? 'bg-white shadow text-agri-green-700'
                : 'text-agri-earth-500'
            }`}
          >
            I'm a Farmer
          </button>
          <button
            onClick={() => setTab('buy')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'buy'
                ? 'bg-white shadow text-agri-green-700'
                : 'text-agri-earth-500'
            }`}
          >
            I'm a Vendor
          </button>
        </div>
        <BuybackForm type={tab} />
      </div>
    </section>
  );
};
