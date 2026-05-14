import { useQuery } from '@tanstack/react-query';
import type { HitterStats, PitcherStats } from '../services/types';
import { sortHittersByWOBA, sortPitchersByERA } from '../utils/sorting';

const RAYS_AFFILIATES = [
  'Durham Bulls',
  'Montgomery Biscuits',
  'Bowling Green Hot Rods',
  'Charleston RiverDogs',
];

// Mock data with realistic minor league player names per affiliate
function generateMockMiLBHitters(affiliate: string): HitterStats[] {
  const affiliateData: Record<string, HitterStats[]> = {
    'Durham Bulls': [
      { playerId: 201, name: 'Tristan Peters', position: 'CF', pa: 45, wOBA: 0.410, wRCPlus: 155, ops: 0.920, hr: 4, hits: 15, rbi: 9, sb: 5 },
      { playerId: 202, name: 'Kameron Misner', position: 'LF', pa: 42, wOBA: 0.375, wRCPlus: 140, ops: 0.870, hr: 3, hits: 12, rbi: 7, sb: 3 },
      { playerId: 203, name: 'Rene Pinto', position: 'C', pa: 38, wOBA: 0.345, wRCPlus: 125, ops: 0.810, hr: 2, hits: 10, rbi: 6, sb: 0 },
      { playerId: 204, name: 'Niko Hulsizer', position: 'RF', pa: 40, wOBA: 0.320, wRCPlus: 115, ops: 0.780, hr: 3, hits: 9, rbi: 8, sb: 1 },
      { playerId: 205, name: 'Austin Shenton', position: '3B', pa: 36, wOBA: 0.295, wRCPlus: 100, ops: 0.720, hr: 1, hits: 8, rbi: 4, sb: 0 },
      { playerId: 206, name: 'Jonathan Aranda', position: '1B', pa: 44, wOBA: 0.270, wRCPlus: 88, ops: 0.670, hr: 1, hits: 7, rbi: 3, sb: 0 },
    ],
    'Montgomery Biscuits': [
      { playerId: 211, name: 'Carson Williams', position: 'SS', pa: 48, wOBA: 0.395, wRCPlus: 150, ops: 0.900, hr: 3, hits: 14, rbi: 8, sb: 4 },
      { playerId: 212, name: 'Brock Jones', position: 'CF', pa: 44, wOBA: 0.360, wRCPlus: 135, ops: 0.850, hr: 4, hits: 11, rbi: 10, sb: 2 },
      { playerId: 213, name: 'Tanner Murray', position: '2B', pa: 40, wOBA: 0.330, wRCPlus: 118, ops: 0.790, hr: 1, hits: 10, rbi: 5, sb: 3 },
      { playerId: 214, name: 'Dominic Keegan', position: 'C', pa: 38, wOBA: 0.305, wRCPlus: 105, ops: 0.740, hr: 2, hits: 8, rbi: 6, sb: 0 },
      { playerId: 215, name: 'Chandler Simpson', position: 'LF', pa: 35, wOBA: 0.280, wRCPlus: 90, ops: 0.680, hr: 0, hits: 7, rbi: 2, sb: 6 },
    ],
    'Bowling Green Hot Rods': [
      { playerId: 221, name: 'Xavier Isaac', position: '1B', pa: 50, wOBA: 0.430, wRCPlus: 170, ops: 0.960, hr: 6, hits: 16, rbi: 12, sb: 1 },
      { playerId: 222, name: 'Brayden Taylor', position: '3B', pa: 46, wOBA: 0.370, wRCPlus: 138, ops: 0.860, hr: 3, hits: 13, rbi: 9, sb: 2 },
      { playerId: 223, name: 'Jhon Diaz', position: 'CF', pa: 42, wOBA: 0.340, wRCPlus: 122, ops: 0.800, hr: 2, hits: 11, rbi: 5, sb: 5 },
      { playerId: 224, name: 'Willy Vasquez', position: 'SS', pa: 39, wOBA: 0.310, wRCPlus: 108, ops: 0.750, hr: 1, hits: 9, rbi: 4, sb: 3 },
      { playerId: 225, name: 'Ricardo Gonzalez', position: 'RF', pa: 37, wOBA: 0.285, wRCPlus: 92, ops: 0.690, hr: 1, hits: 7, rbi: 3, sb: 1 },
    ],
    'Charleston RiverDogs': [
      { playerId: 231, name: 'Yoniel Curet', position: 'SS', pa: 44, wOBA: 0.380, wRCPlus: 142, ops: 0.880, hr: 2, hits: 13, rbi: 7, sb: 6 },
      { playerId: 232, name: 'Dru Baker', position: 'CF', pa: 40, wOBA: 0.350, wRCPlus: 130, ops: 0.830, hr: 3, hits: 11, rbi: 8, sb: 4 },
      { playerId: 233, name: 'Odalys Peguero', position: '2B', pa: 38, wOBA: 0.325, wRCPlus: 115, ops: 0.780, hr: 1, hits: 10, rbi: 4, sb: 2 },
      { playerId: 234, name: 'Ruben Cardenas', position: 'LF', pa: 36, wOBA: 0.300, wRCPlus: 102, ops: 0.730, hr: 2, hits: 8, rbi: 5, sb: 1 },
      { playerId: 235, name: 'Angel Moreta', position: 'RF', pa: 34, wOBA: 0.265, wRCPlus: 82, ops: 0.650, hr: 0, hits: 6, rbi: 2, sb: 0 },
    ],
  };

  return affiliateData[affiliate] ?? [];
}

function generateMockMiLBPitchers(affiliate: string): PitcherStats[] {
  const affiliateData: Record<string, PitcherStats[]> = {
    'Durham Bulls': [
      { playerId: 301, name: 'Taj Bradley', position: 'SP', ip: 22, fip: 2.80, era: 2.95, wins: 3, strikeouts: 28 },
      { playerId: 302, name: 'Shane Baz', position: 'SP', ip: 18, fip: 3.20, era: 3.40, wins: 2, strikeouts: 22 },
      { playerId: 303, name: 'Kevin Kelly', position: 'RP', ip: 12, fip: 3.50, era: 3.30, wins: 1, strikeouts: 15 },
      { playerId: 304, name: 'Mason Montgomery', position: 'SP', ip: 20, fip: 3.85, era: 4.10, wins: 1, strikeouts: 24 },
      { playerId: 305, name: 'Joe Rock', position: 'SP', ip: 16, fip: 4.20, era: 4.50, wins: 1, strikeouts: 18 },
    ],
    'Montgomery Biscuits': [
      { playerId: 311, name: 'Duncan Davitt', position: 'SP', ip: 24, fip: 2.60, era: 2.75, wins: 4, strikeouts: 30 },
      { playerId: 312, name: 'Antonio Jimenez', position: 'SP', ip: 20, fip: 3.10, era: 3.25, wins: 2, strikeouts: 25 },
      { playerId: 313, name: 'Ian Seymour', position: 'SP', ip: 18, fip: 3.45, era: 3.60, wins: 2, strikeouts: 20 },
      { playerId: 314, name: 'Jayden Murray', position: 'RP', ip: 14, fip: 3.80, era: 3.90, wins: 1, strikeouts: 16 },
    ],
    'Bowling Green Hot Rods': [
      { playerId: 321, name: 'Hector Yan', position: 'SP', ip: 22, fip: 2.90, era: 3.05, wins: 3, strikeouts: 26 },
      { playerId: 322, name: 'Adam Leverett', position: 'SP', ip: 19, fip: 3.30, era: 3.50, wins: 2, strikeouts: 22 },
      { playerId: 323, name: 'Cole Wilcox', position: 'SP', ip: 16, fip: 3.65, era: 3.80, wins: 1, strikeouts: 18 },
      { playerId: 324, name: 'Conner Whittaker', position: 'RP', ip: 10, fip: 4.10, era: 4.30, wins: 0, strikeouts: 12 },
    ],
    'Charleston RiverDogs': [
      { playerId: 331, name: 'Brayden Kurtz', position: 'SP', ip: 20, fip: 3.00, era: 3.15, wins: 3, strikeouts: 24 },
      { playerId: 332, name: 'Logan Workman', position: 'SP', ip: 18, fip: 3.40, era: 3.55, wins: 2, strikeouts: 20 },
      { playerId: 333, name: 'Yoniel Ramirez', position: 'SP', ip: 15, fip: 3.75, era: 3.90, wins: 1, strikeouts: 16 },
      { playerId: 334, name: 'Alfredo Zarraga', position: 'RP', ip: 12, fip: 4.00, era: 4.20, wins: 1, strikeouts: 14 },
    ],
  };

  return affiliateData[affiliate] ?? [];
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

export function useHotColdMiLB(affiliate: string): UseHotColdMiLBResult {
  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitters: HitterStats[];
    pitchers: PitcherStats[];
  }>({
    queryKey: ['hotColdMiLB', affiliate],
    queryFn: async () => {
      // Returns mock data for minor league affiliates
      return {
        hitters: generateMockMiLBHitters(affiliate),
        pitchers: generateMockMiLBPitchers(affiliate),
      };
    },
  });

  const hitters = data?.hitters ?? [];
  const pitchers = data?.pitchers ?? [];

  // Sort hitters by wOBA descending, pitchers by ERA ascending
  // No Quality Gate filtering applied per requirement 5.4
  const sortedHitters = sortHittersByWOBA(hitters);
  const sortedPitchers = sortPitchersByERA(pitchers);

  return {
    hitters: sortedHitters,
    pitchers: sortedPitchers,
    affiliates: RAYS_AFFILIATES,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
