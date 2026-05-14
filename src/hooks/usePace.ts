import { useQuery } from '@tanstack/react-query';
import type { HitterPaceStats, PitcherPaceStats, Player } from '../services/types';
import { extrapolateHitterPace, extrapolatePitcherPace } from '../utils/extrapolation';
import {
  getTeamRoster,
  getPlayerStats,
  batchFetch,
} from '../services/mlbApi';
import { useTeam } from '../context/TeamContext';

const SEASON = 2026;
const PITCHER_POSITIONS = new Set(['P', 'SP', 'RP', 'CL']);

/**
 * Build hitter pace stats from season stats API response.
 */
function buildHitterPace(player: Player, stats: any): HitterPaceStats | null {
  if (!stats) return null;

  const gamesPlayed = stats.gamesPlayed ?? 0;
  if (gamesPlayed === 0) return null;

  const currentStats = {
    hr: stats.homeRuns ?? 0,
    hits: stats.hits ?? 0,
    rbi: stats.rbi ?? 0,
    sb: stats.stolenBases ?? 0,
    gamesPlayed,
  };

  return {
    player,
    currentStats,
    projectedStats: extrapolateHitterPace(currentStats),
  };
}

/**
 * Build pitcher pace stats from season stats API response.
 */
function buildPitcherPace(player: Player, stats: any): PitcherPaceStats | null {
  if (!stats) return null;

  const gamesPlayed = stats.gamesPlayed ?? 0;
  if (gamesPlayed === 0) return null;

  // Parse innings pitched (comes as string like "82.1")
  const ipStr = stats.inningsPitched ?? '0';
  const ipParts = ipStr.split('.');
  const fullInnings = parseInt(ipParts[0] ?? '0', 10);
  const partialInnings = parseInt(ipParts[1] ?? '0', 10);
  const ip = fullInnings + partialInnings / 3;

  const currentStats = {
    wins: stats.wins ?? 0,
    strikeouts: stats.strikeOuts ?? 0,
    ip: parseFloat(ip.toFixed(1)),
    gamesPlayed,
    gamesStarted: stats.gamesStarted ?? 0,
  };

  return {
    player,
    currentStats,
    projectedStats: extrapolatePitcherPace(currentStats),
  };
}

export interface UsePaceResult {
  hitterPace: HitterPaceStats[];
  pitcherPace: PitcherPaceStats[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePace(): UsePaceResult {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitterPace: HitterPaceStats[];
    pitcherPace: PitcherPaceStats[];
  }>({
    queryKey: ['pace', teamKey],
    queryFn: async () => {
      // Get team roster
      const roster = await getTeamRoster(team.id, SEASON);

      if (roster.length === 0) {
        return { hitterPace: [], pitcherPace: [] };
      }

      // Split roster
      const positionPlayers = roster.filter((p) => !PITCHER_POSITIONS.has(p.position));
      const pitchers = roster.filter((p) => PITCHER_POSITIONS.has(p.position));

      // Fetch hitter season stats in batches
      const hitterResults = await batchFetch(
        positionPlayers,
        async (player: Player) => {
          const stats = await getPlayerStats(player.id, 'hitting', SEASON);
          return buildHitterPace(player, stats);
        },
        8
      );

      const hitterPace: HitterPaceStats[] = hitterResults
        .map((r) => r.result)
        .filter((s): s is HitterPaceStats => s !== null)
        // Sort by projected HR descending for display
        .sort((a, b) => b.projectedStats.hr - a.projectedStats.hr);

      // Fetch pitcher season stats in batches (only SP for pace projections)
      const starters = pitchers.filter((p) => p.position === 'SP' || p.position === 'P');
      const pitcherResults = await batchFetch(
        starters,
        async (player: Player) => {
          const stats = await getPlayerStats(player.id, 'pitching', SEASON);
          return buildPitcherPace(player, stats);
        },
        8
      );

      const pitcherPace: PitcherPaceStats[] = pitcherResults
        .map((r) => r.result)
        .filter((s): s is PitcherPaceStats => s !== null)
        // Sort by projected strikeouts descending
        .sort((a, b) => b.projectedStats.strikeouts - a.projectedStats.strikeouts);

      return { hitterPace, pitcherPace };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    hitterPace: data?.hitterPace ?? [],
    pitcherPace: data?.pitcherPace ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
