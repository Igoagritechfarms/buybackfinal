import { useEffect, useCallback } from 'react';

/**
 * Safe interval hook that prevents memory leaks
 * Automatically cleans up interval when component unmounts
 *
 * @param callback - Function to execute on each interval
 * @param delay - Interval delay in milliseconds (null to disable)
 *
 * @example
 * const updateRates = useCallback(() => {
 *   setRates(prev => updatePrices(prev));
 * }, []);
 *
 * useInterval(updateRates, 30000); // Update every 30 seconds
 */
export function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(callback, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay, callback]);
}
