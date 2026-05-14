import { useQuery } from '@tanstack/react-query';
import { getStandings } from '../services/mlbApi';
import { calculateWinPct } from '../utils/stats';
import type { SeasonRecord, TeamStanding } from '../services/types';

const AL_LEAGUE_ID = 103;

function extractRaysRecord(standings: TeamStanding[], season: number): SeasonRecord {
  const rays = standings.find(
    (team) => team.teamName.includes('Tampa Bay') || team.teamName.includes('Rays')
  );

  if (!rays) {
    return { season, wins: 0, losses: 0, gamesPlayed: 0, winPct: 0 };
  }

  const gamesPlayed = rays.wins + rays.losses;
  const winPct = calculateWinPct(rays.wins, rays.losses);

  return {
    season,
    wins: rays.wins,
    losses: rays.losses,
    gamesPlayed,
    winPct,
  };
}

export function useRecordTracker() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['recordTracker'],
    queryFn: async () => {
      const [standings2025, standings2026] = await Promise.all([
        getStandings(AL_LEAGUE_ID, 2025),
        getStandings(AL_LEAGUE_ID, 2026),
      ]);

      const season2025 = extractRaysRecord(standings2025, 2025);
      const season2026 = extractRaysRecord(standings2026, 2026);

      return {
        season2025,
        season2026,
        alEastStandings: standings2026,
      };
    },
  });

  return {
    season2025: data?.season2025,
    season2026: data?.season2026,
    alEastStandings: data?.alEastStandings,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
