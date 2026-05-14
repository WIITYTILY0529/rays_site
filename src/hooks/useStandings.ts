import { useQuery } from '@tanstack/react-query';
import { getFullStandings } from '../services/mlbApi';
import { useTeam } from '../context/TeamContext';
import type { StandingsRow } from '../services/types';

export function useStandings() {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<StandingsRow[]>({
    queryKey: ['standings', teamKey],
    queryFn: () => getFullStandings(team.leagueId, 2026, team.divisionId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data ?? null,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
