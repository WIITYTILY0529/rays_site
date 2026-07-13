/**
 * Fetches team-level batting and pitching rankings from Fangraphs API.
 */

const TIMEOUT_MS = 10000;
const SEASON = 2026;

const BAT_URL = `https://www.fangraphs.com/api/leaders/major-league/data?pos=all&stats=bat&lg=all&qual=0&type=8&season=${SEASON}&month=0&season1=${SEASON}&ind=0&team=0%2Cts&rost=0&age=0&filter=&players=0&startdate=&enddate=&page=1_50`;

const PIT_URL = `https://www.fangraphs.com/api/leaders/major-league/data?pos=all&stats=pit&lg=all&qual=0&type=8&season=${SEASON}&month=0&season1=${SEASON}&ind=0&team=0%2Cts&rost=0&age=0&filter=&players=0&startdate=&enddate=&page=1_50`;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Fangraphs API error: ${response.status}`);
    }
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Fangraphs API request timed out`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface TeamRankings {
  batting: {
    wRCPlus: number;
    wRCPlusRank: number;
    WAR: number;
    WARRank: number;
  };
  pitching: {
    FIP: number;
    FIPRank: number;
    WAR: number;
    WARRank: number;
  };
}

interface FgTeamRow {
  TeamNameAbb?: string;
  'wRC+'?: number;
  WAR?: number;
  FIP?: number;
}

function getRank(teams: FgTeamRow[], teamAbbr: string, key: string, ascending: boolean): { value: number; rank: number } {
  const sorted = [...teams].sort((a, b) => {
    const aVal = Number(a[key as keyof FgTeamRow] ?? 0);
    const bVal = Number(b[key as keyof FgTeamRow] ?? 0);
    return ascending ? aVal - bVal : bVal - aVal;
  });

  const idx = sorted.findIndex((t) => t.TeamNameAbb === teamAbbr);
  const value = Number(sorted[idx]?.[key as keyof FgTeamRow] ?? 0);

  return { value: Math.round(value * 100) / 100, rank: idx + 1 };
}

/**
 * Fetch team batting and pitching rankings from Fangraphs.
 * @param fgTeamAbbr - Fangraphs team abbreviation (e.g. "TBR", "DET")
 */
export async function fetchTeamRankings(fgTeamAbbr: string): Promise<TeamRankings> {
  const [batResp, pitResp] = await Promise.all([
    fetchWithTimeout(BAT_URL),
    fetchWithTimeout(PIT_URL),
  ]);

  const batData = await batResp.json();
  const pitData = await pitResp.json();

  const batTeams: FgTeamRow[] = batData.data ?? [];
  const pitTeams: FgTeamRow[] = pitData.data ?? [];

  // wRC+ and WAR: higher is better (descending)
  const wRCPlus = getRank(batTeams, fgTeamAbbr, 'wRC+', false);
  const batWAR = getRank(batTeams, fgTeamAbbr, 'WAR', false);

  // FIP: lower is better (ascending), WAR: higher is better (descending)
  const FIP = getRank(pitTeams, fgTeamAbbr, 'FIP', true);
  const pitWAR = getRank(pitTeams, fgTeamAbbr, 'WAR', false);

  return {
    batting: {
      wRCPlus: wRCPlus.value,
      wRCPlusRank: wRCPlus.rank,
      WAR: batWAR.value,
      WARRank: batWAR.rank,
    },
    pitching: {
      FIP: FIP.value,
      FIPRank: FIP.rank,
      WAR: pitWAR.value,
      WARRank: pitWAR.rank,
    },
  };
}
