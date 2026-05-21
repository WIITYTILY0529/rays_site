import { useQuery } from '@tanstack/react-query';
import { getStandings, getSeasonGameResults } from '../services/mlbApi';
import { useTeam } from '../context/TeamContext';
import type { TeamStanding } from '../services/types';

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
  divisionStandings: TeamStanding[];
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

export function useRecordTracker() {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<RecordTrackerData>({
    queryKey: ['recordTracker', teamKey],
    queryFn: async () => {
      const [rawGames2025, rawGames2026, standings2026] = await Promise.all([
        getSeasonGameResults(team.id, 2025),
        getSeasonGameResults(team.id, 2026),
        getStandings(team.leagueId, 2026, team.divisionId),
      ]);

      const season2025Games = parseGameResults(rawGames2025);
      const season2026Games = parseGameResults(rawGames2026);

      // Get full standings data with splits for accurate home/away and run differential
      const fullStandingsUrl = `https://statsapi.mlb.com/api/v1/standings?leagueId=${team.leagueId}&season=2026&hydrate=team`;
      const fullResp = await fetch(fullStandingsUrl);
      const fullData = await fullResp.json();

      let standingsWins = 0;
      let standingsLosses = 0;
      let homeWins = 0, homeLosses = 0;
      let awayWins = 0, awayLosses = 0;
      let runsScored = 0, runsAllowed = 0;

      for (const record of fullData.records ?? []) {
        for (const tr of record.teamRecords ?? []) {
          if (tr.team?.id === team.id) {
            standingsWins = tr.wins ?? 0;
            standingsLosses = tr.losses ?? 0;
            runsScored = tr.runsScored ?? 0;
            runsAllowed = tr.runsAllowed ?? 0;

            const splits: any[] = tr.records?.splitRecords ?? [];
            for (const s of splits) {
              if (s.type === 'home') { homeWins = s.wins ?? 0; homeLosses = s.losses ?? 0; }
              if (s.type === 'away') { awayWins = s.wins ?? 0; awayLosses = s.losses ?? 0; }
            }
            break;
          }
        }
      }

      const gamesPlayed2026 = standingsWins + standingsLosses;
      const currentRecord2026 = { wins: standingsWins, losses: standingsLosses };

      // 2025 record at same game count
      const record2025AtSamePoint = gamesPlayed2026 > 0 && season2025Games.length >= gamesPlayed2026
        ? { wins: season2025Games[gamesPlayed2026 - 1].cumulativeWins, losses: season2025Games[gamesPlayed2026 - 1].cumulativeLosses }
        : { wins: 0, losses: 0 };

      // Home/Away from standings (always accurate)
      const homeRecord2026 = { wins: homeWins, losses: homeLosses };
      const awayRecord2026 = { wins: awayWins, losses: awayLosses };

      // Pythagorean record from standings run data
      const runDiff = runsScored - runsAllowed;
      const rsPow = Math.pow(runsScored, PYTHAG_EXPONENT);
      const raPow = Math.pow(runsAllowed, PYTHAG_EXPONENT);
      const expectedWinPct = rsPow + raPow > 0 ? rsPow / (rsPow + raPow) : 0.5;
      const expectedWins = Math.round(expectedWinPct * gamesPlayed2026);
      const expectedLosses = gamesPlayed2026 - expectedWins;
      const luck = standingsWins - expectedWins;

      const pythagRecord2026 = { expectedWins, expectedLosses, runDiff, luck };

      return {
        season2025Games,
        season2026Games,
        currentRecord2026,
        record2025AtSamePoint,
        homeRecord2026,
        awayRecord2026,
        pythagRecord2026,
        gamesPlayed2026,
        divisionStandings: standings2026,
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
