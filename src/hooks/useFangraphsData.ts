import { useQuery } from '@tanstack/react-query';
import { useTeam } from '../context/TeamContext';
import { fetchLivePlayerStats } from '../services/fangraphsPlayerStats';
import type { FangraphsTeamData } from '../services/fangraphsData';

export interface UseFangraphsDataResult {
  data: { teams: Record<string, FangraphsTeamData> } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches player stats live from Fangraphs API.
 * Refreshes when the user clicks the refresh button (invalidateQueries).
 */
export function useFangraphsData(): UseFangraphsDataResult {
  const { teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['fangraphsPlayerStats', teamKey],
    queryFn: async () => {
      const teamData = await fetchLivePlayerStats(teamKey);
      return { teams: { [teamKey]: teamData } };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
