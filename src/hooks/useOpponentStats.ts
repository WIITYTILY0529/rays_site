import { useQuery } from '@tanstack/react-query';
import { useTeam } from '../context/TeamContext';
import { getTeamSchedule, getToday, addDays } from '../services/mlbApi';
import type { FangraphsHitter, FangraphsPitcher } from '../services/fangraphsData';

const SEASON = 2026;
const TIMEOUT_MS = 10000;

/**
 * MLB team ID → Fangraphs team ID mapping.
 */
const MLB_TO_FG_TEAM: Record<number, number> = {
  108: 1,   // LAA
  109: 15,  // ARI
  110: 2,   // BAL
  111: 3,   // BOS
  112: 17,  // CHC
  113: 18,  // CIN
  114: 5,   // CLE
  115: 19,  // COL
  116: 6,   // DET
  117: 21,  // HOU
  118: 7,   // KCR
  119: 22,  // LAD
  120: 24,  // WSN
  121: 25,  // NYM
  133: 10,  // ATH
  134: 27,  // PIT
  135: 29,  // SDP
  136: 11,  // SEA
  137: 30,  // SFG
  138: 28,  // STL
  139: 12,  // TBR
  140: 13,  // TEX
  141: 14,  // TOR
  142: 8,   // MIN
  143: 26,  // PHI
  144: 16,  // ATL
  145: 4,   // CWS
  146: 20,  // MIA
  147: 9,   // NYY
  158: 23,  // MIL
};

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parsePct(value: unknown): number {
  if (value == null) return 0;
  const val = Number(value);
  if (isNaN(val)) return 0;
  return Math.round(val * 1000) / 1000;
}

function safeFloat(value: unknown, decimals = 1): number {
  if (value == null) return 0;
  const val = Number(value);
  if (isNaN(val)) return 0;
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}

function parseHitter(row: Record<string, unknown>): FangraphsHitter {
  return {
    name: String(row['PlayerName'] ?? 'Unknown'),
    fgPlayerId: Number(row['playerid'] ?? 0),
    mlbId: Number(row['xMLBAMID'] ?? 0),
    PA: Math.round(Number(row['PA'] ?? 0)),
    H: Math.round(Number(row['H'] ?? 0)),
    HR: Math.round(Number(row['HR'] ?? 0)),
    OBP: safeFloat(row['OBP'], 3),
    SLG: safeFloat(row['SLG'], 3),
    bbPct: parsePct(row['BB%']),
    kPct: parsePct(row['K%']),
    BABIP: safeFloat(row['BABIP'], 3),
    wRCPlus: Math.round(Number(row['wRC+'] ?? 0)),
    WAR: safeFloat(row['WAR'], 1),
  };
}

function parsePitcher(row: Record<string, unknown>): FangraphsPitcher {
  return {
    name: String(row['PlayerName'] ?? 'Unknown'),
    fgPlayerId: Number(row['playerid'] ?? 0),
    mlbId: Number(row['xMLBAMID'] ?? 0),
    G: Math.round(Number(row['G'] ?? 0)),
    GS: Math.round(Number(row['GS'] ?? 0)),
    IP: safeFloat(row['IP'], 1),
    kPct: parsePct(row['K%']),
    bbPct: parsePct(row['BB%']),
    BABIP: safeFloat(row['BABIP'], 3),
    FIP: safeFloat(row['FIP'], 2),
    pbStuff: safeFloat(row['pb_stuff'], 1),
    pbCommand: safeFloat(row['pb_command'], 1),
    WAR: safeFloat(row['WAR'], 1),
  };
}

async function fetchOpponentFangraphs(fgTeamId: number): Promise<{
  hitters: FangraphsHitter[];
  pitchers: FangraphsPitcher[];
}> {
  const baseUrl = 'https://www.fangraphs.com/api/leaders/major-league/data';

  const [batResp, pitResp] = await Promise.all([
    fetchWithTimeout(
      `${baseUrl}?pos=all&stats=bat&lg=all&qual=0&type=8&season=${SEASON}&month=0&season1=${SEASON}&ind=0&team=${fgTeamId}&rost=1&age=0&filter=&players=0&startdate=&enddate=`
    ),
    fetchWithTimeout(
      `${baseUrl}?pos=all&stats=pit&lg=all&qual=0&type=8&season=${SEASON}&month=0&season1=${SEASON}&ind=0&team=${fgTeamId}&rost=1&age=0&filter=&players=0&startdate=&enddate=`
    ),
  ]);

  const batData = await batResp.json();
  const pitData = await pitResp.json();

  const hitters = (batData.data ?? [])
    .map(parseHitter)
    .filter((h: FangraphsHitter) => h.PA > 0)
    .sort((a: FangraphsHitter, b: FangraphsHitter) => b.WAR - a.WAR);

  const pitchers = (pitData.data ?? [])
    .map(parsePitcher)
    .sort((a: FangraphsPitcher, b: FangraphsPitcher) => b.WAR - a.WAR);

  return { hitters, pitchers };
}

export interface UseOpponentStatsResult {
  opponentName: string;
  hitters: FangraphsHitter[];
  pitchers: FangraphsPitcher[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useOpponentStats(): UseOpponentStatsResult {
  const { team, teamKey } = useTeam();

  const { data, isLoading, isError, error, refetch } = useQuery<{
    opponentName: string;
    hitters: FangraphsHitter[];
    pitchers: FangraphsPitcher[];
  }>({
    queryKey: ['opponentStats', teamKey],
    queryFn: async () => {
      // Find next opponent from schedule
      const today = getToday();
      const endDate = addDays(today, 7);
      const schedule = await getTeamSchedule(team.id, today, endDate);

      if (schedule.length === 0) {
        return { opponentName: 'TBD', hitters: [], pitchers: [] };
      }

      const nextGame = schedule[0];
      const opponentMlbId = nextGame.opponentId;
      const opponentName = nextGame.opponent ?? 'Unknown';

      if (!opponentMlbId) {
        return { opponentName, hitters: [], pitchers: [] };
      }

      const fgTeamId = MLB_TO_FG_TEAM[opponentMlbId];
      if (!fgTeamId) {
        return { opponentName, hitters: [], pitchers: [] };
      }

      const { hitters, pitchers } = await fetchOpponentFangraphs(fgTeamId);
      return { opponentName, hitters, pitchers };
    },
    staleTime: 15 * 60 * 1000,
  });

  return {
    opponentName: data?.opponentName ?? 'TBD',
    hitters: data?.hitters ?? [],
    pitchers: data?.pitchers ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
