import { useQuery } from '@tanstack/react-query';
import { useTeam } from '../context/TeamContext';
import { fetchTeamRankings, type TeamRankings } from '../services/fangraphsTeamRankings';

export function useTeamRankings() {
  const { team } = useTeam();
  const fgAbbr = team.fgOddsAbbr;

  return useQuery<TeamRankings>({
    queryKey: ['teamRankings', fgAbbr],
    queryFn: () => fetchTeamRankings(fgAbbr),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
