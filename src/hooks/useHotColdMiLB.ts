import { useQuery } from '@tanstack/react-query';
import type { MiLBHitterStats, MiLBPitcherStats, Player } from '../services/types';
import {
  getTeamRoster,
  getPlayerGameLog,
  batchFetch,
  getToday,
  addDays,
} from '../services/mlbApi';
import { useTeam } from '../context/TeamContext';
import type { TeamConfig } from '../services/teamConfig';

const SEASON = 2026;
const PITCHER_POSITIONS = new Set(['P', 'SP', 'RP', 'CL']);

// Quality gates for "All" tab only
const ALL_TAB_MIN_PA = 10;
const ALL_TAB_MIN_IP = 2;

type AffiliateKey = 'All' | 'AAA' | 'AA' | 'High A' | 'A';

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
 * Calculate MiLB hitter stats from game log entries.
 */
function calculateMiLBHitterStats(
  player: Player,
  entries: any[],
  level: string
): MiLBHitterStats | null {
  if (entries.length === 0) return null;

  let totalPA = 0;
  let totalAB = 0;
  let totalH = 0;
  let totalHR = 0;
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

  const avg = totalAB > 0 ? totalH / totalAB : 0;

  return {
    playerId: player.id,
    name: player.fullName,
    position: player.position,
    level,
    pa: totalPA,
    wOBA: parseFloat(wOBA.toFixed(3)),
    avg: parseFloat(avg.toFixed(3)),
    hr: totalHR,
  };
}

/**
 * Calculate MiLB pitcher stats from game log entries.
 */
function calculateMiLBPitcherStats(
  player: Player,
  entries: any[],
  level: string
): MiLBPitcherStats | null {
  if (entries.length === 0) return null;

  let totalIP = 0;
  let totalER = 0;
  let totalK = 0;
  let totalBB = 0;
  let totalH = 0;

  for (const entry of entries) {
    const stat = entry.stat ?? {};
    const ipStr = stat.inningsPitched ?? '0';
    const ipParts = ipStr.split('.');
    const fullInnings = parseInt(ipParts[0] ?? '0', 10);
    const partialInnings = parseInt(ipParts[1] ?? '0', 10);
    totalIP += fullInnings + partialInnings / 3;

    totalER += stat.earnedRuns ?? 0;
    totalK += stat.strikeOuts ?? 0;
    totalBB += stat.baseOnBalls ?? 0;
    totalH += stat.hits ?? 0;
  }

  if (totalIP === 0) return null;

  const era = (totalER / totalIP) * 9;
  const whip = (totalBB + totalH) / totalIP;

  return {
    playerId: player.id,
    name: player.fullName,
    position: player.position,
    level,
    ip: parseFloat(totalIP.toFixed(1)),
    era: parseFloat(era.toFixed(2)),
    whip: parseFloat(whip.toFixed(2)),
    strikeouts: totalK,
  };
}

/**
 * Fetch stats for a single affiliate level.
 */
async function fetchAffiliateStats(
  levelKey: string,
  windowDays: number,
  affiliates: TeamConfig['affiliates']
): Promise<{ hitters: MiLBHitterStats[]; pitchers: MiLBPitcherStats[] }> {
  const affiliate = affiliates[levelKey];
  if (!affiliate) return { hitters: [], pitchers: [] };

  const { teamId, sportId, level } = affiliate;
  const roster = await getTeamRoster(teamId, SEASON);

  if (roster.length === 0) return { hitters: [], pitchers: [] };

  const positionPlayers = roster.filter((p) => !PITCHER_POSITIONS.has(p.position));
  const pitcherRoster = roster.filter((p) => PITCHER_POSITIONS.has(p.position));

  // Fetch hitter game logs
  const hitterResults = await batchFetch(
    positionPlayers,
    async (player: Player) => {
      const gameLog = await getPlayerGameLog(player.id, 'hitting', SEASON, sportId);
      const windowEntries = filterGameLogByWindow(gameLog, windowDays);
      return calculateMiLBHitterStats(player, windowEntries, level);
    },
    6
  );

  const hitters: MiLBHitterStats[] = hitterResults
    .map((r) => r.result)
    .filter((s): s is MiLBHitterStats => s !== null);

  // Fetch pitcher game logs
  const pitcherResults = await batchFetch(
    pitcherRoster,
    async (player: Player) => {
      const gameLog = await getPlayerGameLog(player.id, 'pitching', SEASON, sportId);
      const windowEntries = filterGameLogByWindow(gameLog, windowDays);
      return calculateMiLBPitcherStats(player, windowEntries, level);
    },
    6
  );

  const pitchers: MiLBPitcherStats[] = pitcherResults
    .map((r) => r.result)
    .filter((s): s is MiLBPitcherStats => s !== null);

  return { hitters, pitchers };
}

export interface UseHotColdMiLBResult {
  hotHitters: MiLBHitterStats[];
  coldHitters: MiLBHitterStats[];
  hotPitchers: MiLBPitcherStats[];
  coldPitchers: MiLBPitcherStats[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHotColdMiLB(affiliate: AffiliateKey, window: 7 | 14 = 14): UseHotColdMiLBResult {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitters: MiLBHitterStats[];
    pitchers: MiLBPitcherStats[];
  }>({
    queryKey: ['hotColdMiLB', teamKey, affiliate, window],
    queryFn: async () => {
      let allHitters: MiLBHitterStats[] = [];
      let allPitchers: MiLBPitcherStats[] = [];

      if (affiliate === 'All') {
        // Fetch all 4 affiliates
        const levels: string[] = ['AAA', 'AA', 'High A', 'A'];
        for (const level of levels) {
          const { hitters, pitchers } = await fetchAffiliateStats(level, window, team.affiliates);
          allHitters = allHitters.concat(hitters);
          allPitchers = allPitchers.concat(pitchers);
        }
        // Apply quality gates for "All" tab
        allHitters = allHitters.filter((h) => h.pa >= ALL_TAB_MIN_PA);
        allPitchers = allPitchers.filter((p) => p.ip >= ALL_TAB_MIN_IP);
      } else {
        const { hitters, pitchers } = await fetchAffiliateStats(affiliate, window, team.affiliates);
        allHitters = hitters;
        allPitchers = pitchers;
      }

      return { hitters: allHitters, pitchers: allPitchers };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const hitters = data?.hitters ?? [];
  const pitchers = data?.pitchers ?? [];

  // Sort hitters by wOBA descending for hot, ascending for cold
  const sortedByWOBADesc = [...hitters].sort((a, b) => b.wOBA - a.wOBA);
  const sortedByWOBAAsc = [...hitters].sort((a, b) => a.wOBA - b.wOBA);

  // Sort pitchers by ERA ascending for hot, descending for cold
  const sortedByERAAsc = [...pitchers].sort((a, b) => a.era - b.era);
  const sortedByERADesc = [...pitchers].sort((a, b) => b.era - a.era);

  // Take top 5 for each section
  const hotHitters = sortedByWOBADesc.slice(0, 5);
  const coldHitters = sortedByWOBAAsc.slice(0, 5);
  const hotPitchers = sortedByERAAsc.slice(0, 5);
  const coldPitchers = sortedByERADesc.slice(0, 5);

  return {
    hotHitters,
    coldHitters,
    hotPitchers,
    coldPitchers,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
