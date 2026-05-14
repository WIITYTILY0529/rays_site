import { useQuery } from '@tanstack/react-query';
import { getPlayoffOdds } from '../services/fangraphsApi';
import type { PlayoffOddsData } from '../services/types';
import { useTeam } from '../context/TeamContext';

export function usePlayoffOdds() {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<PlayoffOddsData, Error>({
    queryKey: ['playoffOdds', teamKey],
    queryFn: () => getPlayoffOdds(team.abbreviation),
  });

  return {
    data,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
