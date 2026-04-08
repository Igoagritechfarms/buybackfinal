import { useState, useEffect, useCallback } from 'react';
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
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const prices = await getMarketPrices();

        // If no prices in DB, use defaults (in production, seed the DB)
        if (prices && prices.length > 0) {
          setRates(prices);
        } else {
          setRates(DEFAULT_MARKET_PRICES);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch market prices';
        console.error('Market prices error:', message);
        setError(message);
        setRates(DEFAULT_MARKET_PRICES); // Fallback to defaults
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = subscribeToMarketPrices(
        (prices) => {
          if (prices && prices.length > 0) {
            setRates(prices);
          }
        },
        (err) => {
          console.error('Market price subscription error:', err);
          // Keep using current rates if subscription fails
        }
      );
    } catch (err) {
      console.error('Failed to setup market price subscription:', err);
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
