import { useQuery } from '@tanstack/react-query';
import { getStandings, getSeasonGameResults, RAYS_TEAM_ID } from '../services/mlbApi';
import type { TeamStanding } from '../services/types';

const AL_LEAGUE_ID = 103;
const PYTHAG_EXPONENT = 1.83;

export interface GameResult {
  gameNumber: number;
  date: string;
  opponent: string;
  isHome: boolean;
  isWin: boolean;
  runsScored: number;
  runsAllowed: number;
  cumulativeWins: number;
  cumulativeLosses: number;
}

export interface RecordTrackerData {
  season2025Games: GameResult[];
  season2026Games: GameResult[];
  currentRecord2026: { wins: number; losses: number };
  record2025AtSamePoint: { wins: number; losses: number };
  homeRecord2026: { wins: number; losses: number };
  awayRecord2026: { wins: number; losses: number };
  pythagRecord2026: { expectedWins: number; expectedLosses: number; runDiff: number; luck: number };
  gamesPlayed2026: number;
  alEastStandings: TeamStanding[];
}

function parseGameResults(rawGames: any[]): GameResult[] {
  let cumulativeWins = 0;
  let cumulativeLosses = 0;

  return rawGames.map((game, index) => {
    if (game.isWin) {
      cumulativeWins++;
    } else {
      cumulativeLosses++;
    }

    return {
      gameNumber: index + 1,
      date: game.date,
      opponent: game.opponent,
      isHome: game.isHome,
      isWin: game.isWin,
      runsScored: game.runsScored,
      runsAllowed: game.runsAllowed,
      cumulativeWins,
      cumulativeLosses,
    };
  });
}

function calculatePythag(games: GameResult[]): { expectedWins: number; expectedLosses: number; runDiff: number; luck: number } {
  if (games.length === 0) {
    return { expectedWins: 0, expectedLosses: 0, runDiff: 0, luck: 0 };
  }

  const totalRS = games.reduce((sum, g) => sum + g.runsScored, 0);
  const totalRA = games.reduce((sum, g) => sum + g.runsAllowed, 0);
  const runDiff = totalRS - totalRA;
  const gamesPlayed = games.length;

  const rsPow = Math.pow(totalRS, PYTHAG_EXPONENT);
  const raPow = Math.pow(totalRA, PYTHAG_EXPONENT);
  const expectedWinPct = rsPow + raPow > 0 ? rsPow / (rsPow + raPow) : 0.5;
  const expectedWins = Math.round(expectedWinPct * gamesPlayed);
  const expectedLosses = gamesPlayed - expectedWins;

  const actualWins = games[games.length - 1].cumulativeWins;
  const luck = actualWins - expectedWins;

  return { expectedWins, expectedLosses, runDiff, luck };
}

export function useRecordTracker() {
  const { data, isLoading, isError, error, refetch } = useQuery<RecordTrackerData>({
    queryKey: ['recordTracker', 'v2'],
    queryFn: async () => {
      const [rawGames2025, rawGames2026, standings2026] = await Promise.all([
        getSeasonGameResults(RAYS_TEAM_ID, 2025),
        getSeasonGameResults(RAYS_TEAM_ID, 2026),
        getStandings(AL_LEAGUE_ID, 2026),
      ]);

      const season2025Games = parseGameResults(rawGames2025);
      const season2026Games = parseGameResults(rawGames2026);

      const gamesPlayed2026 = season2026Games.length;

      // Current 2026 record
      const currentRecord2026 = gamesPlayed2026 > 0
        ? { wins: season2026Games[gamesPlayed2026 - 1].cumulativeWins, losses: season2026Games[gamesPlayed2026 - 1].cumulativeLosses }
        : { wins: 0, losses: 0 };

      // 2025 record at same game count
      const record2025AtSamePoint = gamesPlayed2026 > 0 && season2025Games.length >= gamesPlayed2026
        ? { wins: season2025Games[gamesPlayed2026 - 1].cumulativeWins, losses: season2025Games[gamesPlayed2026 - 1].cumulativeLosses }
        : { wins: 0, losses: 0 };

      // Home/Away splits for 2026
      const homeGames2026 = season2026Games.filter(g => g.isHome);
      const awayGames2026 = season2026Games.filter(g => !g.isHome);
      const homeRecord2026 = {
        wins: homeGames2026.filter(g => g.isWin).length,
        losses: homeGames2026.filter(g => !g.isWin).length,
      };
      const awayRecord2026 = {
        wins: awayGames2026.filter(g => g.isWin).length,
        losses: awayGames2026.filter(g => !g.isWin).length,
      };

      // Pythagorean record
      const pythagRecord2026 = calculatePythag(season2026Games);

      return {
        season2025Games,
        season2026Games,
        currentRecord2026,
        record2025AtSamePoint,
        homeRecord2026,
        awayRecord2026,
        pythagRecord2026,
        gamesPlayed2026,
        alEastStandings: standings2026,
      };
    },
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
