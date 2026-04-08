import { Link } from 'react-router-dom';
import { BarChart3, ChevronRight } from 'lucide-react';
import { MarketPriceGraph } from '../MarketPriceGraph';

/**
 * Market Section - Real-time market prices and demand insights
 */
export const MarketSection = () => {
  const demandByCity = [
    { city: 'Chennai', product: 'Mushroom', level: 'Very High', pct: 90 },
    { city: 'Coimbatore', product: 'Cucumber', level: 'Medium', pct: 55 },
    { city: 'Madurai', product: 'Microgreens', level: 'High', pct: 75 },
    { city: 'Salem', product: 'Vegetables', level: 'High', pct: 70 },
  ];

  return (
    <section className="py-24 bg-agri-earth-50" id="market">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="badge-green mx-auto w-fit mb-4">
            <BarChart3 size={14} /> Price Transparency
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-agri-earth-900 mb-4">
            Real-Time Market Prices
          </h2>
          <p className="text-agri-earth-500 max-w-lg mx-auto">
            We guarantee fair prices based on live market data — no middlemen, no manipulation.
          </p>
          <p className="mt-4 text-sm font-semibold text-agri-green-600">
            100% on-time payment guarantee • 26 product verticals • Fully transparent mandi rates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card p-6 md:p-8">
            <MarketPriceGraph />
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h4 className="font-bold text-agri-earth-900 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-agri-green-600" /> Demand by City
              </h4>
              <div className="space-y-3">
                {demandByCity.map((demand) => (
                  <div key={`demand-${demand.city}`} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-agri-earth-800">
                        {demand.city}{' '}
                        <span className="text-agri-earth-400 font-normal">· {demand.product}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          demand.level === 'Very High' || demand.level === 'High'
                            ? 'text-agri-green-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {demand.level}
                      </span>
                    </div>
                    <div className="h-1.5 bg-agri-earth-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-agri-green-500 rounded-full"
                        style={{ width: `${demand.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5 bg-agri-green-600 text-white border-0">
              <h4 className="font-bold mb-2">Weekly Price Alert</h4>
              <p className="text-agri-green-100 text-sm mb-4">
                Get WhatsApp updates every Monday with the latest buyback rates.
              </p>
              <a
                href="https://wa.me/919999999999?text=Subscribe%20to%20price%20alerts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-agri-green-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-agri-green-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Subscribe Free
              </a>
            </div>

            <Link to="/market" className="btn-secondary w-full text-sm">
              View Full Market Dashboard <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
