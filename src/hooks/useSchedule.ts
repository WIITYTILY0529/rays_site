import { useQuery } from '@tanstack/react-query';
import type { ScheduledGame, PitcherGameLog } from '../services/types';

// Mock data for upcoming 10 games with probable pitchers
function generateMockSchedule(): ScheduledGame[] {
  const mockLastThreeStarts = (name: string): PitcherGameLog[] => {
    const bases: Record<string, PitcherGameLog[]> = {
      'Shane McClanahan': [
        { date: '2026-06-10', opponent: 'NYY', ip: 7.0, era: 2.45, strikeouts: 9, result: 'W' },
        { date: '2026-06-05', opponent: 'BOS', ip: 6.1, era: 2.80, strikeouts: 7, result: 'L' },
        { date: '2026-05-30', opponent: 'BAL', ip: 6.2, era: 2.60, strikeouts: 8, result: 'W' },
      ],
      'Zach Eflin': [
        { date: '2026-06-11', opponent: 'TOR', ip: 6.0, era: 3.20, strikeouts: 6, result: 'W' },
        { date: '2026-06-06', opponent: 'NYY', ip: 5.2, era: 3.45, strikeouts: 5, result: 'ND' },
        { date: '2026-06-01', opponent: 'MIN', ip: 7.0, era: 3.10, strikeouts: 8, result: 'W' },
      ],
      'Taj Bradley': [
        { date: '2026-06-12', opponent: 'BOS', ip: 5.1, era: 4.10, strikeouts: 7, result: 'L' },
        { date: '2026-06-07', opponent: 'BAL', ip: 6.0, era: 3.90, strikeouts: 6, result: 'W' },
        { date: '2026-06-02', opponent: 'TOR', ip: 5.0, era: 4.30, strikeouts: 5, result: 'ND' },
      ],
      'Drew Rasmussen': [
        { date: '2026-06-13', opponent: 'MIN', ip: 5.2, era: 3.60, strikeouts: 4, result: 'W' },
        { date: '2026-06-08', opponent: 'TOR', ip: 6.0, era: 3.50, strikeouts: 5, result: 'ND' },
        { date: '2026-06-03', opponent: 'NYY', ip: 4.2, era: 3.80, strikeouts: 3, result: 'L' },
      ],
      'Aaron Civale': [
        { date: '2026-06-14', opponent: 'BAL', ip: 5.0, era: 4.50, strikeouts: 4, result: 'L' },
        { date: '2026-06-09', opponent: 'BOS', ip: 6.1, era: 4.20, strikeouts: 5, result: 'W' },
        { date: '2026-06-04', opponent: 'MIN', ip: 5.2, era: 4.40, strikeouts: 4, result: 'ND' },
      ],
    };
    return bases[name] ?? [];
  };

  const games: ScheduledGame[] = [
    {
      date: '2026-06-20',
      opponent: 'New York Yankees',
      isHome: true,
      probablePitcher: { name: 'Shane McClanahan', lastThreeStarts: mockLastThreeStarts('Shane McClanahan') },
      opponentTeamERA: 3.85,
      opponentTeamOPS: 0.742,
    },
    {
      date: '2026-06-21',
      opponent: 'New York Yankees',
      isHome: true,
      probablePitcher: { name: 'Zach Eflin', lastThreeStarts: mockLastThreeStarts('Zach Eflin') },
      opponentTeamERA: 3.85,
      opponentTeamOPS: 0.742,
    },
    {
      date: '2026-06-22',
      opponent: 'New York Yankees',
      isHome: true,
      probablePitcher: { name: 'Taj Bradley', lastThreeStarts: mockLastThreeStarts('Taj Bradley') },
      opponentTeamERA: 3.85,
      opponentTeamOPS: 0.742,
    },
    {
      date: '2026-06-23',
      opponent: 'Boston Red Sox',
      isHome: false,
      probablePitcher: { name: 'Drew Rasmussen', lastThreeStarts: mockLastThreeStarts('Drew Rasmussen') },
      opponentTeamERA: 4.10,
      opponentTeamOPS: 0.728,
    },
    {
      date: '2026-06-24',
      opponent: 'Boston Red Sox',
      isHome: false,
      probablePitcher: null,
      opponentTeamERA: 4.10,
      opponentTeamOPS: 0.728,
    },
    {
      date: '2026-06-25',
      opponent: 'Boston Red Sox',
      isHome: false,
      probablePitcher: { name: 'Aaron Civale', lastThreeStarts: mockLastThreeStarts('Aaron Civale') },
      opponentTeamERA: 4.10,
      opponentTeamOPS: 0.728,
    },
    {
      date: '2026-06-27',
      opponent: 'Baltimore Orioles',
      isHome: true,
      probablePitcher: { name: 'Shane McClanahan', lastThreeStarts: mockLastThreeStarts('Shane McClanahan') },
      opponentTeamERA: 3.65,
      opponentTeamOPS: 0.755,
    },
    {
      date: '2026-06-28',
      opponent: 'Baltimore Orioles',
      isHome: true,
      probablePitcher: null,
      opponentTeamERA: 3.65,
      opponentTeamOPS: 0.755,
    },
    {
      date: '2026-06-29',
      opponent: 'Baltimore Orioles',
      isHome: true,
      probablePitcher: { name: 'Taj Bradley', lastThreeStarts: mockLastThreeStarts('Taj Bradley') },
      opponentTeamERA: 3.65,
      opponentTeamOPS: 0.755,
    },
    {
      date: '2026-06-30',
      opponent: 'Toronto Blue Jays',
      isHome: false,
      probablePitcher: { name: 'Drew Rasmussen', lastThreeStarts: mockLastThreeStarts('Drew Rasmussen') },
      opponentTeamERA: 4.25,
      opponentTeamOPS: 0.710,
    },
  ];

  return games;
}

export interface UseScheduleResult {
  upcomingGames: ScheduledGame[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSchedule(): UseScheduleResult {
  const { data, isLoading, isError, error, refetch } = useQuery<ScheduledGame[]>({
    queryKey: ['schedule'],
    queryFn: async () => {
      return generateMockSchedule();
    },
  });

  return {
    upcomingGames: data ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
