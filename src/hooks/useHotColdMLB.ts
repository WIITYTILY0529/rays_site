import { useQuery } from '@tanstack/react-query';
import type { HitterStats, PitcherStats } from '../services/types';
import { sortHittersByWOBA, sortPitchersByFIP } from '../utils/sorting';
import { filterColdHitters, filterColdPitchers, ensureMutualExclusion } from '../utils/filtering';

// Mock data with realistic Tampa Bay Rays player names
function generateMockHitters(window: 7 | 14): HitterStats[] {
  const baseHitters: HitterStats[] = [
    { playerId: 1, name: 'Yandy Díaz', position: '1B', pa: window === 7 ? 28 : 52, wOBA: 0.420, wRCPlus: 165, ops: 0.950, hr: 3, hits: 12, rbi: 8, sb: 0 },
    { playerId: 2, name: 'Josh Lowe', position: 'LF', pa: window === 7 ? 30 : 55, wOBA: 0.385, wRCPlus: 145, ops: 0.890, hr: 2, hits: 10, rbi: 6, sb: 3 },
    { playerId: 3, name: 'Randy Arozarena', position: 'RF', pa: window === 7 ? 26 : 48, wOBA: 0.365, wRCPlus: 135, ops: 0.860, hr: 4, hits: 9, rbi: 10, sb: 2 },
    { playerId: 4, name: 'Brandon Lowe', position: '2B', pa: window === 7 ? 25 : 50, wOBA: 0.340, wRCPlus: 125, ops: 0.820, hr: 2, hits: 8, rbi: 5, sb: 1 },
    { playerId: 5, name: 'Isaac Paredes', position: '3B', pa: window === 7 ? 27 : 51, wOBA: 0.330, wRCPlus: 120, ops: 0.800, hr: 1, hits: 7, rbi: 4, sb: 0 },
    { playerId: 6, name: 'Harold Ramírez', position: 'DH', pa: window === 7 ? 24 : 46, wOBA: 0.310, wRCPlus: 110, ops: 0.760, hr: 1, hits: 8, rbi: 3, sb: 0 },
    { playerId: 7, name: 'José Siri', position: 'CF', pa: window === 7 ? 22 : 44, wOBA: 0.275, wRCPlus: 85, ops: 0.680, hr: 1, hits: 5, rbi: 2, sb: 4 },
    { playerId: 8, name: 'Taylor Walls', position: 'SS', pa: window === 7 ? 20 : 42, wOBA: 0.260, wRCPlus: 75, ops: 0.620, hr: 0, hits: 4, rbi: 1, sb: 1 },
    { playerId: 9, name: 'René Pinto', position: 'C', pa: window === 7 ? 18 : 38, wOBA: 0.245, wRCPlus: 68, ops: 0.590, hr: 0, hits: 3, rbi: 2, sb: 0 },
    { playerId: 10, name: 'Curtis Mead', position: 'DH', pa: window === 7 ? 21 : 40, wOBA: 0.230, wRCPlus: 60, ops: 0.560, hr: 0, hits: 3, rbi: 1, sb: 0 },
  ];
  return baseHitters;
}

function generateMockPitchers(window: 7 | 14): PitcherStats[] {
  const basePitchers: PitcherStats[] = [
    { playerId: 101, name: 'Shane McClanahan', position: 'SP', ip: window === 7 ? 12 : 24, fip: 2.65, era: 2.80, wins: 2, strikeouts: 18 },
    { playerId: 102, name: 'Tyler Glasnow', position: 'SP', ip: window === 7 ? 13 : 26, fip: 2.90, era: 3.10, wins: 1, strikeouts: 20 },
    { playerId: 103, name: 'Zach Eflin', position: 'SP', ip: window === 7 ? 11 : 22, fip: 3.15, era: 3.30, wins: 1, strikeouts: 14 },
    { playerId: 104, name: 'Pete Fairbanks', position: 'RP', ip: window === 7 ? 5 : 10, fip: 3.40, era: 3.20, wins: 0, strikeouts: 8 },
    { playerId: 105, name: 'Jason Adam', position: 'RP', ip: window === 7 ? 6 : 12, fip: 3.60, era: 3.50, wins: 1, strikeouts: 9 },
    { playerId: 106, name: 'Drew Rasmussen', position: 'SP', ip: window === 7 ? 10 : 20, fip: 3.90, era: 4.10, wins: 0, strikeouts: 12 },
    { playerId: 107, name: 'Taj Bradley', position: 'SP', ip: window === 7 ? 9 : 18, fip: 4.50, era: 4.80, wins: 0, strikeouts: 10 },
    { playerId: 108, name: 'Colin Poche', position: 'RP', ip: window === 7 ? 4 : 8, fip: 5.20, era: 5.50, wins: 0, strikeouts: 5 },
  ];
  return basePitchers;
}

export interface UseHotColdMLBResult {
  hotHitters: HitterStats[];
  coldHitters: HitterStats[];
  hotPitchers: PitcherStats[];
  coldPitchers: PitcherStats[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHotColdMLB(window: 7 | 14): UseHotColdMLBResult {
  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitters: HitterStats[];
    pitchers: PitcherStats[];
  }>({
    queryKey: ['hotColdMLB', window],
    queryFn: async () => {
      // For now, returns mock data since game log data requires multiple API calls
      return {
        hitters: generateMockHitters(window),
        pitchers: generateMockPitchers(window),
      };
    },
  });

  const hitters = data?.hitters ?? [];
  const pitchers = data?.pitchers ?? [];

  // Sort hitters by wOBA descending (hot = top of list)
  const sortedHitters = sortHittersByWOBA(hitters);
  // Sort pitchers by FIP ascending (hot = top of list)
  const sortedPitchers = sortPitchersByFIP(pitchers);

  // Filter cold lists
  const coldHittersList = filterColdHitters(sortedHitters);
  const coldPitchersList = filterColdPitchers(sortedPitchers);

  // Ensure mutual exclusion: hot list is the sorted full list minus cold players
  const hitterExclusion = ensureMutualExclusion(
    sortedHitters.filter((h) => h.wOBA >= 0.290),
    coldHittersList
  );
  const pitcherExclusion = ensureMutualExclusion(
    sortedPitchers.filter((p) => p.fip <= 3.75),
    coldPitchersList
  );

  return {
    hotHitters: hitterExclusion.hot,
    coldHitters: hitterExclusion.cold,
    hotPitchers: pitcherExclusion.hot,
    coldPitchers: pitcherExclusion.cold,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
