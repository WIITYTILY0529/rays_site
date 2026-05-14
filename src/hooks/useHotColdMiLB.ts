import { useQuery } from '@tanstack/react-query';
import type { HitterStats, PitcherStats, Player } from '../services/types';
import { sortHittersByWOBA, sortPitchersByERA } from '../utils/sorting';
import {
  getTeamRoster,
  getPlayerGameLog,
  batchFetch,
  getToday,
  addDays,
  RAYS_AFFILIATES,
} from '../services/mlbApi';

const SEASON = 2026;
const PITCHER_POSITIONS = new Set(['P', 'SP', 'RP', 'CL']);

const AFFILIATE_NAMES = [
  'Durham Bulls',
  'Montgomery Biscuits',
  'Bowling Green Hot Rods',
  'Charleston RiverDogs',
];

/**
 * Filter game log entries to only those within the trailing window.
 */
function filterGameLogByWindow(gameLog: any[], windowDays: number): any[] {
  const today = getToday();
  const windowStart = addDays(today, -windowDays);
  return gameLog.filter((entry: any) => {
    const gameDate = entry.date ?? '';
    return gameDate >= windowStart && gameDate <= today;
  });
}

/**
 * Calculate hitter stats from game log entries within the window.
 */
function calculateHitterStatsFromLog(
  player: Player,
  entries: any[]
): HitterStats | null {
  if (entries.length === 0) return null;

  let totalPA = 0;
  let totalAB = 0;
  let totalH = 0;
  let totalHR = 0;
  let totalRBI = 0;
  let totalSB = 0;
  let totalBB = 0;
  let totalHBP = 0;
  let totalSF = 0;
  let totalDoubles = 0;
  let totalTriples = 0;

  for (const entry of entries) {
    const stat = entry.stat ?? {};
    totalPA += stat.plateAppearances ?? 0;
    totalAB += stat.atBats ?? 0;
    totalH += stat.hits ?? 0;
    totalHR += stat.homeRuns ?? 0;
    totalRBI += stat.rbi ?? 0;
    totalSB += stat.stolenBases ?? 0;
    totalBB += stat.baseOnBalls ?? 0;
    totalHBP += stat.hitByPitch ?? 0;
    totalSF += stat.sacFlies ?? 0;
    totalDoubles += stat.doubles ?? 0;
    totalTriples += stat.triples ?? 0;
  }

  if (totalPA === 0) return null;

  const singles = totalH - totalDoubles - totalTriples - totalHR;
  const denominator = totalAB + totalBB + totalSF + totalHBP;
  const wOBA = denominator > 0
    ? (0.69 * totalBB + 0.72 * totalHBP + 0.89 * singles + 1.27 * totalDoubles + 1.62 * totalTriples + 2.10 * totalHR) / denominator
    : 0;

  const obp = denominator > 0 ? (totalH + totalBB + totalHBP) / denominator : 0;
  const slg = totalAB > 0 ? (singles + 2 * totalDoubles + 3 * totalTriples + 4 * totalHR) / totalAB : 0;
  const ops = obp + slg;

  const leagueWOBA = 0.320;
  const wRCPlus = leagueWOBA > 0 ? Math.round((wOBA / leagueWOBA) * 100) : 100;

  return {
    playerId: player.id,
    name: player.fullName,
    position: player.position,
    pa: totalPA,
    wOBA: parseFloat(wOBA.toFixed(3)),
    wRCPlus,
    ops: parseFloat(ops.toFixed(3)),
    hr: totalHR,
    hits: totalH,
    rbi: totalRBI,
    sb: totalSB,
  };
}

/**
 * Calculate pitcher stats from game log entries within the window.
 */
function calculatePitcherStatsFromLog(
  player: Player,
  entries: any[]
): PitcherStats | null {
  if (entries.length === 0) return null;

  let totalIP = 0;
  let totalER = 0;
  let totalK = 0;
  let totalW = 0;
  let totalBB = 0;
  let totalHR = 0;
  let totalHBP = 0;

  for (const entry of entries) {
    const stat = entry.stat ?? {};
    const ipStr = stat.inningsPitched ?? '0';
    const ipParts = ipStr.split('.');
    const fullInnings = parseInt(ipParts[0] ?? '0', 10);
    const partialInnings = parseInt(ipParts[1] ?? '0', 10);
    totalIP += fullInnings + partialInnings / 3;

    totalER += stat.earnedRuns ?? 0;
    totalK += stat.strikeOuts ?? 0;
    totalW += stat.wins ?? 0;
    totalBB += stat.baseOnBalls ?? 0;
    totalHR += stat.homeRuns ?? 0;
    totalHBP += stat.hitByPitch ?? 0;
  }

  if (totalIP === 0) return null;

  const era = (totalER / totalIP) * 9;
  const fip = ((13 * totalHR + 3 * (totalBB + totalHBP) - 2 * totalK) / totalIP) + 3.10;

  return {
    playerId: player.id,
    name: player.fullName,
    position: player.position,
    ip: parseFloat(totalIP.toFixed(1)),
    fip: parseFloat(fip.toFixed(2)),
    era: parseFloat(era.toFixed(2)),
    wins: totalW,
    strikeouts: totalK,
  };
}

export interface UseHotColdMiLBResult {
  hitters: HitterStats[];
  pitchers: PitcherStats[];
  affiliates: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHotColdMiLB(affiliate: string, window: 7 | 14 = 14): UseHotColdMiLBResult {
  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitters: HitterStats[];
    pitchers: PitcherStats[];
  }>({
    queryKey: ['hotColdMiLB', affiliate, window],
    queryFn: async () => {
      const teamId = RAYS_AFFILIATES[affiliate];
      if (!teamId) {
        return { hitters: [], pitchers: [] };
      }

      // Get affiliate roster
      const roster = await getTeamRoster(teamId, SEASON);

      if (roster.length === 0) {
        return { hitters: [], pitchers: [] };
      }

      // Split roster into position players and pitchers
      const positionPlayers = roster.filter((p) => !PITCHER_POSITIONS.has(p.position));
      const pitcherRoster = roster.filter((p) => PITCHER_POSITIONS.has(p.position));

      // Fetch hitter game logs in batches
      const hitterResults = await batchFetch(
        positionPlayers,
        async (player: Player) => {
          const gameLog = await getPlayerGameLog(player.id, 'hitting', SEASON);
          const windowEntries = filterGameLogByWindow(gameLog, window);
          return calculateHitterStatsFromLog(player, windowEntries);
        },
        6
      );

      const hitters: HitterStats[] = hitterResults
        .map((r) => r.result)
        .filter((s): s is HitterStats => s !== null);

      // Fetch pitcher game logs in batches
      const pitcherResults = await batchFetch(
        pitcherRoster,
        async (player: Player) => {
          const gameLog = await getPlayerGameLog(player.id, 'pitching', SEASON);
          const windowEntries = filterGameLogByWindow(gameLog, window);
          return calculatePitcherStatsFromLog(player, windowEntries);
        },
        6
      );

      const pitchers: PitcherStats[] = pitcherResults
        .map((r) => r.result)
        .filter((s): s is PitcherStats => s !== null);

      return { hitters, pitchers };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const hitters = data?.hitters ?? [];
  const pitchers = data?.pitchers ?? [];

  // Sort hitters by wOBA descending, pitchers by ERA ascending
  const sortedHitters = sortHittersByWOBA(hitters);
  const sortedPitchers = sortPitchersByERA(pitchers);

  return {
    hitters: sortedHitters,
    pitchers: sortedPitchers,
    affiliates: AFFILIATE_NAMES,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
