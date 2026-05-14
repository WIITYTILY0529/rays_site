import { useQuery } from '@tanstack/react-query';
import type { ScheduledGame, PitcherGameLog } from '../services/types';
import {
  getTeamSchedule,
  getPlayerGameLog,
  getTeamStats,
  getToday,
  addDays,
  batchFetch,
} from '../services/mlbApi';
import { useTeam } from '../context/TeamContext';

const SEASON = 2026;

/**
 * Extracts the last 3 starts from a pitcher's game log.
 */
function extractLastThreeStarts(gameLog: any[]): PitcherGameLog[] {
  // Game log entries are typically in chronological order; take last 3
  const recentStarts = gameLog.slice(-3).reverse();
  return recentStarts.map((entry: any) => ({
    date: entry.date ?? '',
    opponent: entry.opponent?.abbreviation ?? entry.opponent?.name ?? 'Unknown',
    ip: parseFloat(entry.stat?.inningsPitched ?? '0'),
    era: parseFloat(entry.stat?.era ?? '0'),
    strikeouts: entry.stat?.strikeOuts ?? 0,
    result: entry.stat?.wins === 1 ? 'W' as const
      : entry.stat?.losses === 1 ? 'L' as const
      : 'ND' as const,
  }));
}

export interface UseScheduleResult {
  upcomingGames: ScheduledGame[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSchedule(): UseScheduleResult {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<ScheduledGame[]>({
    queryKey: ['schedule', teamKey],
    queryFn: async () => {
      const today = getToday();
      const endDate = addDays(today, 14);

      // Fetch schedule with probable pitchers hydrated
      const rawGames = await getTeamSchedule(team.id, today, endDate);

      if (rawGames.length === 0) {
        return [];
      }

      // Collect unique opponent team IDs for team stats
      const opponentIds = [...new Set(rawGames.map((g: any) => g.opponentId).filter(Boolean))] as number[];

      // Fetch opponent team ERA and OPS in parallel
      const teamStatsMap = new Map<number, { era: number; ops: number }>();
      const teamStatResults = await batchFetch(
        opponentIds,
        async (teamId: number) => {
          const [pitchingStats, hittingStats] = await Promise.all([
            getTeamStats(teamId, 'pitching', SEASON),
            getTeamStats(teamId, 'hitting', SEASON),
          ]);
          return {
            era: parseFloat(pitchingStats?.era ?? '0'),
            ops: parseFloat(hittingStats?.ops ?? '0'),
          };
        },
        5
      );

      for (const { item, result } of teamStatResults) {
        if (result) {
          teamStatsMap.set(item, result);
        }
      }

      // Collect unique probable pitcher IDs for game logs
      const pitcherIds = [...new Set(
        rawGames.map((g: any) => g.probablePitcherId).filter(Boolean)
      )] as number[];

      // Fetch pitcher game logs in batches
      const pitcherLogMap = new Map<number, PitcherGameLog[]>();
      const pitcherLogResults = await batchFetch(
        pitcherIds,
        async (pitcherId: number) => {
          const gameLog = await getPlayerGameLog(pitcherId, 'pitching', SEASON);
          return extractLastThreeStarts(gameLog);
        },
        5
      );

      for (const { item, result } of pitcherLogResults) {
        if (result) {
          pitcherLogMap.set(item, result);
        }
      }

      // Assemble final ScheduledGame objects
      const games: ScheduledGame[] = rawGames.map((g: any) => {
        const opponentStats = teamStatsMap.get(g.opponentId) ?? { era: 0, ops: 0 };
        const pitcherLog = g.probablePitcherId ? pitcherLogMap.get(g.probablePitcherId) ?? [] : [];

        return {
          date: g.date,
          opponent: g.opponent,
          isHome: g.isHome,
          probablePitcher: g.probablePitcherName
            ? { name: g.probablePitcherName, lastThreeStarts: pitcherLog }
            : null,
          opponentTeamERA: opponentStats.era,
          opponentTeamOPS: opponentStats.ops,
        };
      });

      // Return up to 10 games
      return games.slice(0, 10);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    upcomingGames: data ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
