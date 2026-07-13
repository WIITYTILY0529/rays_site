import { useQuery } from '@tanstack/react-query';
import { getSavantData, type SavantData } from '../services/savantData';

/**
 * TanStack Query hook for fetching pre-scraped Baseball Savant percentile data.
 * Data is updated daily via GitHub Actions, so a 1-hour stale time is appropriate.
 */
export function useSavantData() {
  return useQuery<SavantData>({
    queryKey: ['savantData'],
    queryFn: getSavantData,
    staleTime: 60 * 60 * 1000, // 1 hour (data only updates daily)
  });
}
