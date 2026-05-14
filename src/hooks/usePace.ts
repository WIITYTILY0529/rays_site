import { useQuery } from '@tanstack/react-query';
import type { HitterPaceStats, PitcherPaceStats } from '../services/types';
import { extrapolateHitterPace, extrapolatePitcherPace } from '../utils/extrapolation';

// Mock data with realistic Rays player current stats (as if ~60 games into the season)
function generateMockHitterPace(): HitterPaceStats[] {
  const hitters = [
    { player: { id: 1, fullName: 'Yandy Díaz', position: '1B', team: 'TB' }, currentStats: { hr: 10, hits: 72, rbi: 38, sb: 2, gamesPlayed: 60 } },
    { player: { id: 2, fullName: 'Josh Lowe', position: 'LF', team: 'TB' }, currentStats: { hr: 14, hits: 65, rbi: 42, sb: 12, gamesPlayed: 58 } },
    { player: { id: 3, fullName: 'Randy Arozarena', position: 'RF', team: 'TB' }, currentStats: { hr: 18, hits: 60, rbi: 48, sb: 8, gamesPlayed: 62 } },
    { player: { id: 4, fullName: 'Brandon Lowe', position: '2B', team: 'TB' }, currentStats: { hr: 12, hits: 55, rbi: 35, sb: 3, gamesPlayed: 55 } },
    { player: { id: 5, fullName: 'Isaac Paredes', position: '3B', team: 'TB' }, currentStats: { hr: 8, hits: 58, rbi: 30, sb: 1, gamesPlayed: 57 } },
  ];

  return hitters.map((h) => ({
    player: h.player,
    currentStats: h.currentStats,
    projectedStats: extrapolateHitterPace(h.currentStats),
  }));
}

function generateMockPitcherPace(): PitcherPaceStats[] {
  const pitchers = [
    { player: { id: 101, fullName: 'Shane McClanahan', position: 'SP', team: 'TB' }, currentStats: { wins: 7, strikeouts: 95, ip: 82, gamesPlayed: 14 } },
    { player: { id: 102, fullName: 'Zach Eflin', position: 'SP', team: 'TB' }, currentStats: { wins: 6, strikeouts: 78, ip: 75, gamesPlayed: 13 } },
    { player: { id: 103, fullName: 'Taj Bradley', position: 'SP', team: 'TB' }, currentStats: { wins: 5, strikeouts: 88, ip: 70, gamesPlayed: 12 } },
    { player: { id: 104, fullName: 'Drew Rasmussen', position: 'SP', team: 'TB' }, currentStats: { wins: 4, strikeouts: 62, ip: 65, gamesPlayed: 11 } },
  ];

  return pitchers.map((p) => ({
    player: p.player,
    currentStats: p.currentStats,
    projectedStats: extrapolatePitcherPace(p.currentStats),
  }));
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
  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitterPace: HitterPaceStats[];
    pitcherPace: PitcherPaceStats[];
  }>({
    queryKey: ['pace'],
    queryFn: async () => {
      return {
        hitterPace: generateMockHitterPace(),
        pitcherPace: generateMockPitcherPace(),
      };
    },
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
