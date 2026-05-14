import { useQuery } from '@tanstack/react-query';
import type { HitterStats, PitcherStats, ScoutingPlayerCard, SparklineDataPoint } from '../services/types';
import { sortHittersByWOBA, sortPitchersByFIP } from '../utils/sorting';
import { applyQualityGate } from '../utils/filtering';

// Generate sparkline data for 30-day view
function generateSparklineData(baseValue: number, variance: number): SparklineDataPoint[] {
  const points: SparklineDataPoint[] = [];
  for (let i = 0; i < 10; i++) {
    const date = `2026-06-${String(i + 1).padStart(2, '0')}`;
    const value = baseValue + (Math.sin(i * 0.8) * variance);
    points.push({ date, value: parseFloat(value.toFixed(2)) });
  }
  return points;
}

// Mock opponent 40-man roster hitters
function generateMockOpponentHitters(window: 7 | 14 | 30): HitterStats[] {
  const paMultiplier = window === 7 ? 1 : window === 14 ? 2 : 4;
  return [
    { playerId: 201, name: 'Aaron Judge', position: 'RF', pa: 12 * paMultiplier, wOBA: 0.450, wRCPlus: 185, ops: 1.020, hr: 5, hits: 14, rbi: 12, sb: 1 },
    { playerId: 202, name: 'Juan Soto', position: 'LF', pa: 11 * paMultiplier, wOBA: 0.410, wRCPlus: 165, ops: 0.960, hr: 3, hits: 12, rbi: 8, sb: 0 },
    { playerId: 203, name: 'Anthony Volpe', position: 'SS', pa: 10 * paMultiplier, wOBA: 0.350, wRCPlus: 125, ops: 0.820, hr: 2, hits: 9, rbi: 5, sb: 3 },
    { playerId: 204, name: 'Gleyber Torres', position: '2B', pa: 9 * paMultiplier, wOBA: 0.320, wRCPlus: 110, ops: 0.780, hr: 1, hits: 8, rbi: 4, sb: 1 },
    { playerId: 205, name: 'Austin Wells', position: 'C', pa: 8 * paMultiplier, wOBA: 0.310, wRCPlus: 105, ops: 0.750, hr: 2, hits: 7, rbi: 5, sb: 0 },
    { playerId: 206, name: 'Jazz Chisholm Jr.', position: '3B', pa: 10 * paMultiplier, wOBA: 0.295, wRCPlus: 95, ops: 0.720, hr: 1, hits: 6, rbi: 3, sb: 4 },
    { playerId: 207, name: 'Alex Verdugo', position: 'DH', pa: 7 * paMultiplier, wOBA: 0.270, wRCPlus: 80, ops: 0.660, hr: 0, hits: 5, rbi: 2, sb: 0 },
    { playerId: 208, name: 'Ben Rice', position: '1B', pa: 6 * paMultiplier, wOBA: 0.250, wRCPlus: 70, ops: 0.620, hr: 1, hits: 4, rbi: 2, sb: 0 },
    { playerId: 209, name: 'Trent Grisham', position: 'CF', pa: 5 * paMultiplier, wOBA: 0.230, wRCPlus: 60, ops: 0.580, hr: 0, hits: 3, rbi: 1, sb: 2 },
  ];
}

// Mock opponent 40-man roster pitchers
function generateMockOpponentPitchers(window: 7 | 14 | 30): PitcherStats[] {
  const ipMultiplier = window === 7 ? 1 : window === 14 ? 2 : 4;
  return [
    { playerId: 301, name: 'Gerrit Cole', position: 'SP', ip: 6 * ipMultiplier, fip: 2.80, era: 2.95, wins: 2, strikeouts: 12 },
    { playerId: 302, name: 'Carlos Rodón', position: 'SP', ip: 5 * ipMultiplier, fip: 3.20, era: 3.40, wins: 1, strikeouts: 10 },
    { playerId: 303, name: 'Marcus Stroman', position: 'SP', ip: 5 * ipMultiplier, fip: 3.60, era: 3.80, wins: 1, strikeouts: 7 },
    { playerId: 304, name: 'Clay Holmes', position: 'RP', ip: 3 * ipMultiplier, fip: 3.90, era: 3.50, wins: 0, strikeouts: 6 },
    { playerId: 305, name: 'Luke Weaver', position: 'RP', ip: 2 * ipMultiplier, fip: 4.20, era: 4.50, wins: 0, strikeouts: 5 },
    { playerId: 306, name: 'Tim Hill', position: 'RP', ip: 2 * ipMultiplier, fip: 4.80, era: 5.10, wins: 0, strikeouts: 3 },
    { playerId: 307, name: 'Clarke Schmidt', position: 'SP', ip: 4 * ipMultiplier, fip: 3.45, era: 3.60, wins: 1, strikeouts: 8 },
  ];
}

// Determine which pitchers are probable starters for the upcoming series
function markProbableStarters(pitchers: PitcherStats[]): Map<number, boolean> {
  const starters = new Map<number, boolean>();
  // Mark first 2 SPs as probable starters
  const sps = pitchers.filter((p) => p.position === 'SP');
  sps.slice(0, 2).forEach((p) => starters.set(p.playerId, true));
  return starters;
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
  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitters: HitterStats[];
    pitchers: PitcherStats[];
  }>({
    queryKey: ['scouting', opponent, window],
    queryFn: async () => {
      return {
        hitters: generateMockOpponentHitters(window),
        pitchers: generateMockOpponentPitchers(window),
      };
    },
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

  // Mark probable starters
  const probableStarters = markProbableStarters(rawPitchers);

  // Generate scouting cards for 30-day view
  const scoutingCards: ScoutingPlayerCard[] = [];
  if (window === 30) {
    for (const hitter of sortedHitters) {
      scoutingCards.push({
        player: { id: hitter.playerId, fullName: hitter.name, position: hitter.position, team: opponent },
        stat: hitter.wRCPlus,
        sparklineData: generateSparklineData(hitter.wRCPlus, 15),
        isProbableStarter: false,
        colorClass: hitter.wRCPlus >= 100 ? 'green' : hitter.wRCPlus >= 80 ? 'neutral' : 'red',
      });
    }
    for (const pitcher of sortedPitchers) {
      scoutingCards.push({
        player: { id: pitcher.playerId, fullName: pitcher.name, position: pitcher.position, team: opponent },
        stat: pitcher.fip,
        sparklineData: generateSparklineData(pitcher.fip, 0.5),
        isProbableStarter: probableStarters.get(pitcher.playerId) ?? false,
        colorClass: pitcher.fip <= 3.50 ? 'green' : pitcher.fip <= 4.00 ? 'neutral' : 'red',
      });
    }
  }

  return {
    hotHitters,
    coldHitters,
    hotPitchers,
    coldPitchers,
    scoutingCards,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
