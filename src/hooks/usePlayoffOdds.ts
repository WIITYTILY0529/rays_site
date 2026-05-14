import { useFangraphsData } from './useFangraphsData';
import { useTeam } from '../context/TeamContext';
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
  const { data: fgData, isLoading, isError, error, refetch } = useFangraphsData();

  const teamOdds = fgData?.playoffOdds?.[teamKey] ?? null;

  return {
    data: teamOdds,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
