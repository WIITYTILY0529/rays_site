import { useQuery } from '@tanstack/react-query';
import type { MiLBSeasonHitter, MiLBSeasonPitcher, Player } from '../services/types';
import {
  getTeamRoster,
  getPlayerStats,
  batchFetch,
} from '../services/mlbApi';
import { useTeam } from '../context/TeamContext';

const SEASON = 2026;
const PITCHER_POSITIONS = new Set(['P', 'SP', 'RP', 'CL']);

// Minimum thresholds for "All" tab
const ALL_TAB_MIN_PA = 30;
const ALL_TAB_MIN_IP = 10;

type AffiliateKey = 'All' | 'AAA' | 'AA' | 'High A' | 'A';

export interface UseMiLBNotableResult {
  hitters: MiLBSeasonHitter[];
  pitchers: MiLBSeasonPitcher[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMiLBNotable(affiliate: AffiliateKey): UseMiLBNotableResult {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<{
    hitters: MiLBSeasonHitter[];
    pitchers: MiLBSeasonPitcher[];
  }>({
    queryKey: ['milbNotable', teamKey, affiliate],
    queryFn: async () => {
      // Determine which affiliates to fetch
      const levels: string[] = affiliate === 'All'
        ? Object.keys(team.affiliates)
        : [affiliate];

      let allHitters: MiLBSeasonHitter[] = [];
      let allPitchers: MiLBSeasonPitcher[] = [];

      for (const level of levels) {
        const affInfo = team.affiliates[level];
        if (!affInfo) continue;

        const roster = await getTeamRoster(affInfo.teamId, SEASON);
        if (roster.length === 0) continue;

        const posPlayers = roster.filter((p) => !PITCHER_POSITIONS.has(p.position));
        const pitcherRoster = roster.filter((p) => PITCHER_POSITIONS.has(p.position));

        // Fetch hitter season stats
        const hitterResults = await batchFetch(
          posPlayers,
          async (player: Player) => {
            const stats = await getPlayerStats(player.id, 'hitting', SEASON, affInfo.sportId);
            if (!stats || !stats.gamesPlayed) return null;
            return {
              playerId: player.id,
              name: player.fullName,
              position: player.position,
              level: affInfo.level,
              G: stats.gamesPlayed ?? 0,
              PA: stats.plateAppearances ?? 0,
              HR: stats.homeRuns ?? 0,
              SB: stats.stolenBases ?? 0,
              BB: stats.baseOnBalls ?? 0,
              K: stats.strikeOuts ?? 0,
              OBP: parseFloat(stats.obp ?? '0'),
              SLG: parseFloat(stats.slg ?? '0'),
              BABIP: parseFloat(stats.babip ?? '0'),
            } as MiLBSeasonHitter;
          },
          8
        );

        allHitters.push(
          ...hitterResults.map((r) => r.result).filter((s): s is MiLBSeasonHitter => s !== null)
        );

        // Fetch pitcher season stats
        const pitcherResults = await batchFetch(
          pitcherRoster,
          async (player: Player) => {
            const stats = await getPlayerStats(player.id, 'pitching', SEASON, affInfo.sportId);
            if (!stats || !stats.gamesPitched) return null;
            return {
              playerId: player.id,
              name: player.fullName,
              position: player.position,
              level: affInfo.level,
              G: stats.gamesPitched ?? 0,
              GS: stats.gamesStarted ?? 0,
              IP: parseFloat(stats.inningsPitched ?? '0'),
              ERA: parseFloat(stats.era ?? '0'),
              K9: parseFloat(stats.strikeoutsPer9Inn ?? '0'),
              BB9: parseFloat(stats.walksPer9Inn ?? '0'),
            } as MiLBSeasonPitcher;
          },
          8
        );

        allPitchers.push(
          ...pitcherResults.map((r) => r.result).filter((s): s is MiLBSeasonPitcher => s !== null)
        );
      }

      // Apply minimum thresholds for "All" tab
      if (affiliate === 'All') {
        allHitters = allHitters.filter((h) => h.PA >= ALL_TAB_MIN_PA);
        allPitchers = allPitchers.filter((p) => p.IP >= ALL_TAB_MIN_IP);
      }

      // Default sort: hitters by OPS desc, pitchers by ERA asc
      allHitters.sort((a, b) => (b.OBP + b.SLG) - (a.OBP + a.SLG));
      allPitchers.sort((a, b) => a.ERA - b.ERA);

      return { hitters: allHitters, pitchers: allPitchers };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    hitters: data?.hitters ?? [],
    pitchers: data?.pitchers ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
