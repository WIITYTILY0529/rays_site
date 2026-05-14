import { useQuery } from '@tanstack/react-query';
import { getPlayoffOdds } from '../services/fangraphsApi';
import type { PlayoffOddsData } from '../services/types';

export function usePlayoffOdds() {
  const { data, isLoading, isError, error, refetch } = useQuery<PlayoffOddsData, Error>({
    queryKey: ['playoffOdds', 'TB'],
    queryFn: () => getPlayoffOdds('TB'),
  });

  return {
    data,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
