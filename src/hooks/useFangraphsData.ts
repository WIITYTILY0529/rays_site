import { useQuery } from '@tanstack/react-query';
import { getFangraphsData, type FangraphsData } from '../services/fangraphsData';

/**
 * TanStack Query hook for fetching pre-collected Fangraphs leaderboard data.
 * Data is updated daily via GitHub Actions, so a 1-hour stale time is appropriate.
 */
export function useFangraphsData() {
  return useQuery<FangraphsData>({
    queryKey: ['fangraphsData'],
    queryFn: getFangraphsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}
