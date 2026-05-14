import { useQuery } from '@tanstack/react-query';
import type { HitterStats, PitcherStats, ScoutingPlayerCard, SparklineDataPoint, Player } from '../services/types';
import { sortHittersByWOBA, sortPitchersByFIP } from '../utils/sorting';
import { applyQualityGate } from '../utils/filtering';
import {
  getTeamRoster,
  getTeamSchedule,
  getPlayerGameLog,
  batchFetch,
  getToday,
  addDays,
} from '../services/mlbApi';
import { useTeam } from '../context/TeamContext';

const SEASON = 2026;
const PITCHER_POSITIONS = new Set(['P', 'SP', 'RP', 'CL']);

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
 * Calculate hitter stats from game log entries.
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
 * Calculate pitcher stats from game log entries.
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

/**
 * Generate sparkline data from game log entries (daily wRC+ or ERA over time).
 */
function generateSparklineFromGameLog(entries: any[], isHitter: boolean): SparklineDataPoint[] {
  if (entries.length === 0) return [];

  // Take up to 10 most recent entries for sparkline
  const recent = entries.slice(-10);
  return recent.map((entry: any) => {
    const stat = entry.stat ?? {};
    const date = entry.date ?? '';
    let value: number;

    if (isHitter) {
      // Use OPS as sparkline value for hitters
      value = parseFloat(stat.ops ?? '0');
    } else {
      // Use ERA as sparkline value for pitchers
      value = parseFloat(stat.era ?? '0');
    }

    return { date, value: parseFloat(value.toFixed(2)) };
  });
}

/**
 * Determine the next opponent from the team's schedule.
 */
async function getNextOpponent(teamId: number): Promise<{ name: string; teamId: number } | null> {
  const today = getToday();
  const endDate = addDays(today, 7);
  const schedule = await getTeamSchedule(teamId, today, endDate);

  if (schedule.length === 0) return null;

  const nextGame = schedule[0];
  return {
    name: nextGame.opponent,
    teamId: nextGame.opponentId,
  };
}

export interface UseScoutingResult {
  hotHitters: HitterStats[];
  coldHitters: HitterStats[];
  hotPitchers: PitcherStats[];
  coldPitchers: PitcherStats[];
  scoutingCards: ScoutingPlayerCard[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useScouting(window: 7 | 14 | 30, opponent: string): UseScoutingResult {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitters: HitterStats[];
    pitchers: PitcherStats[];
    scoutingCards: ScoutingPlayerCard[];
    opponentName: string;
  }>({
    queryKey: ['scouting', teamKey, opponent, window],
    queryFn: async () => {
      // Determine the opponent - use provided name or find next opponent
      let opponentInfo: { name: string; teamId: number } | null = null;

      if (opponent) {
        // Try to find the opponent team ID from the schedule
        const today = getToday();
        const endDate = addDays(today, 14);
        const schedule = await getTeamSchedule(team.id, today, endDate);
        const matchingGame = schedule.find((g: any) =>
          g.opponent.toLowerCase().includes(opponent.toLowerCase())
        );
        if (matchingGame) {
          opponentInfo = { name: matchingGame.opponent, teamId: matchingGame.opponentId };
        }
      }

      if (!opponentInfo) {
        opponentInfo = await getNextOpponent(team.id);
      }

      if (!opponentInfo || !opponentInfo.teamId) {
        return { hitters: [], pitchers: [], scoutingCards: [], opponentName: opponent || 'Unknown' };
      }

      // Get opponent roster
      const roster = await getTeamRoster(opponentInfo.teamId, SEASON);

      if (roster.length === 0) {
        return { hitters: [], pitchers: [], scoutingCards: [], opponentName: opponentInfo.name };
      }

      const positionPlayers = roster.filter((p) => !PITCHER_POSITIONS.has(p.position));
      const pitcherRoster = roster.filter((p) => PITCHER_POSITIONS.has(p.position));

      // Fetch hitter game logs
      const hitterResults = await batchFetch(
        positionPlayers,
        async (player: Player) => {
          const gameLog = await getPlayerGameLog(player.id, 'hitting', SEASON);
          const windowEntries = filterGameLogByWindow(gameLog, window);
          const stats = calculateHitterStatsFromLog(player, windowEntries);
          const sparkline = window === 30 ? generateSparklineFromGameLog(gameLog.slice(-30), true) : [];
          return { stats, sparkline };
        },
        6
      );

      const hitters: HitterStats[] = [];
      const hitterSparklines = new Map<number, SparklineDataPoint[]>();

      for (const { result } of hitterResults) {
        if (result?.stats) {
          hitters.push(result.stats);
          if (result.sparkline.length > 0) {
            hitterSparklines.set(result.stats.playerId, result.sparkline);
          }
        }
      }

      // Fetch pitcher game logs
      const pitcherResults = await batchFetch(
        pitcherRoster,
        async (player: Player) => {
          const gameLog = await getPlayerGameLog(player.id, 'pitching', SEASON);
          const windowEntries = filterGameLogByWindow(gameLog, window);
          const stats = calculatePitcherStatsFromLog(player, windowEntries);
          const sparkline = window === 30 ? generateSparklineFromGameLog(gameLog.slice(-30), false) : [];
          return { stats, sparkline };
        },
        6
      );

      const pitchers: PitcherStats[] = [];
      const pitcherSparklines = new Map<number, SparklineDataPoint[]>();

      for (const { result } of pitcherResults) {
        if (result?.stats) {
          pitchers.push(result.stats);
          if (result.sparkline.length > 0) {
            pitcherSparklines.set(result.stats.playerId, result.sparkline);
          }
        }
      }

      // Determine probable starters from schedule
      const today = getToday();
      const endDate = addDays(today, 4);
      const opponentSchedule = await getTeamSchedule(opponentInfo.teamId, today, endDate);
      const probableStarterIds = new Set(
        opponentSchedule
          .map((g: any) => g.probablePitcherId)
          .filter(Boolean)
      );

      // Build scouting cards for 30-day window
      const scoutingCards: ScoutingPlayerCard[] = [];
      if (window === 30) {
        for (const hitter of hitters) {
          scoutingCards.push({
            player: { id: hitter.playerId, fullName: hitter.name, position: hitter.position, team: opponentInfo.name },
            stat: hitter.wRCPlus,
            sparklineData: hitterSparklines.get(hitter.playerId) ?? [],
            isProbableStarter: false,
            colorClass: hitter.wRCPlus >= 100 ? 'green' : hitter.wRCPlus >= 80 ? 'neutral' : 'red',
          });
        }
        for (const pitcher of pitchers) {
          scoutingCards.push({
            player: { id: pitcher.playerId, fullName: pitcher.name, position: pitcher.position, team: opponentInfo.name },
            stat: pitcher.fip,
            sparklineData: pitcherSparklines.get(pitcher.playerId) ?? [],
            isProbableStarter: probableStarterIds.has(pitcher.playerId),
            colorClass: pitcher.fip <= 3.50 ? 'green' : pitcher.fip <= 4.00 ? 'neutral' : 'red',
          });
        }
      }

      return { hitters, pitchers, scoutingCards, opponentName: opponentInfo.name };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const rawHitters = data?.hitters ?? [];
  const rawPitchers = data?.pitchers ?? [];

  // Apply quality gate filtering
  const filteredHitters = applyQualityGate(rawHitters, window) as HitterStats[];
  const filteredPitchers = applyQualityGate(rawPitchers, window) as PitcherStats[];

  // Sort
  const sortedHitters = sortHittersByWOBA(filteredHitters);
  const sortedPitchers = sortPitchersByFIP(filteredPitchers);

  // Split hot/cold for hitters (wOBA >= 0.290 = hot, < 0.290 = cold)
  const hotHitters = sortedHitters.filter((h) => h.wOBA >= 0.290);
  const coldHitters = sortedHitters.filter((h) => h.wOBA < 0.290);

  // Split hot/cold for pitchers (FIP <= 3.75 = hot, > 3.75 = cold)
  const hotPitchers = sortedPitchers.filter((p) => p.fip <= 3.75);
  const coldPitchers = sortedPitchers.filter((p) => p.fip > 3.75);

  return {
    hotHitters,
    coldHitters,
    hotPitchers,
    coldPitchers,
    scoutingCards: data?.scoutingCards ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
