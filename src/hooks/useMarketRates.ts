import { useState, useEffect } from 'react';
import { MarketPrice, getMarketPrices, subscribeToMarketPrices } from '../lib/supabase';

/**
 * Default market prices for seeding and fallback
 * These will be populated in Supabase on first run
 */
const DEFAULT_MARKET_PRICES: MarketPrice[] = [
  { product_id: 'cucumber', name: 'Cucumber', price: 28, prev_price: 26, unit: 'kg', category: 'Vegetables', demand: 'High' },
  { product_id: 'oyster-mushroom', name: 'Oyster Mushroom', price: 198, prev_price: 177, unit: 'kg', category: 'Mushroom', demand: 'Very High' },
  { product_id: 'microgreens', name: 'Microgreens', price: 289, prev_price: 268, unit: 'kg', category: 'Greens', demand: 'Very High' },
  { product_id: 'button-mushroom', name: 'Button Mushroom', price: 220, prev_price: 215, unit: 'kg', category: 'Mushroom', demand: 'High' },
  { product_id: 'tomato', name: 'Tomato', price: 42, prev_price: 40, unit: 'kg', category: 'Vegetables', demand: 'High' },
  { product_id: 'spinach', name: 'Spinach', price: 35, prev_price: 36, unit: 'kg', category: 'Greens', demand: 'Medium' },
  { product_id: 'onion', name: 'Onion', price: 58, prev_price: 55, unit: 'kg', category: 'Vegetables', demand: 'High' },
  { product_id: 'toor-dal', name: 'Toor Dal', price: 145, prev_price: 140, unit: 'kg', category: 'Pulses', demand: 'Medium' },
  { product_id: 'ragi', name: 'Ragi', price: 48, prev_price: 47, unit: 'kg', category: 'Millets', demand: 'Low' },
  { product_id: 'jowar', name: 'Jowar', price: 38, prev_price: 37, unit: 'kg', category: 'Millets', demand: 'Low' },
  { product_id: 'mango', name: 'Mango', price: 90, prev_price: 85, unit: 'kg', category: 'Fruits', demand: 'High' },
  { product_id: 'banana', name: 'Banana', price: 32, prev_price: 30, unit: 'kg', category: 'Fruits', demand: 'High' },
];

const MARKET_RATES_CACHE_TTL_MS = 5000;
let cachedRatesSnapshot: MarketPrice[] | null = null;
let cachedRatesAt = 0;
let inflightRatesRequest: Promise<MarketPrice[]> | null = null;

function logMarketRates(level: 'error' | 'info', message: string, details?: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  console[level](`[market-rates] ${message}`, details);
}

async function loadMarketRates() {
  const now = Date.now();
  if (cachedRatesSnapshot && now - cachedRatesAt < MARKET_RATES_CACHE_TTL_MS) {
    logMarketRates('info', 'Using cached market prices snapshot.');
    return cachedRatesSnapshot;
  }

  if (!inflightRatesRequest) {
    inflightRatesRequest = getMarketPrices()
      .then((prices) => {
        const nextRates = prices.length > 0 ? prices : DEFAULT_MARKET_PRICES;
        cachedRatesSnapshot = nextRates;
        cachedRatesAt = Date.now();
        return nextRates;
      })
      .finally(() => {
        inflightRatesRequest = null;
      });
  } else {
    logMarketRates('info', 'Reusing inflight market prices request.');
  }

  return inflightRatesRequest;
}

/**
 * Hook for fetching and subscribing to real-time market prices
 * Fetches from Supabase or uses fallback data if not yet populated
 *
 * @example
 * const { rates, isLoading, error } = useMarketRates();
 */
export function useMarketRates() {
  const [rates, setRates] = useState<MarketPrice[]>(DEFAULT_MARKET_PRICES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial rates
  useEffect(() => {
    let isActive = true;

    const fetchRates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const prices = await loadMarketRates();
        if (isActive) {
          setRates(prices);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch market prices';
        logMarketRates('error', 'Market prices fetch failed.', err);
        if (isActive) {
          setError(message);
          setRates(DEFAULT_MARKET_PRICES);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchRates();

    return () => {
      isActive = false;
    };
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = subscribeToMarketPrices(
        (prices) => {
          if (prices && prices.length > 0) {
            cachedRatesSnapshot = prices;
            cachedRatesAt = Date.now();
            setRates(prices);
          }
        },
        (err) => {
          logMarketRates('error', 'Market price subscription error.', err);
          // Keep using current rates if subscription fails
        }
      );
    } catch (err) {
      logMarketRates('error', 'Failed to setup market price subscription.', err);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { rates, isLoading, error };
}

/**
 * Hook for getting a single product's current price
 */
export function useProductPrice(productId: string) {
  const { rates } = useMarketRates();
  return rates.find((r) => r.product_id === productId);
}

/**
 * Hook for getting high-demand products
 */
export function useHighDemandProducts() {
  const { rates } = useMarketRates();
  return rates.filter((r) => r.demand === 'High' || r.demand === 'Very High');
}
