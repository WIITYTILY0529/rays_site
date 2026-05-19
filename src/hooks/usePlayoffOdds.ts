import { useQuery } from '@tanstack/react-query';
import { useTeam } from '../context/TeamContext';
import { fetchLivePlayoffOdds } from '../services/fangraphsApi';
import type { TeamPlayoffOdds } from '../services/fangraphsData';

export interface UsePlayoffOddsResult {
  data: TeamPlayoffOdds | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePlayoffOdds(): UsePlayoffOddsResult {
  const { teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<TeamPlayoffOdds>({
    queryKey: ['playoffOdds', teamKey],
    queryFn: () => fetchLivePlayoffOdds(teamKey),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    data: data ?? null,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
