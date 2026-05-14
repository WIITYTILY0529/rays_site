import type { PlayoffOddsData } from './types';

const TIMEOUT_MS = 10000;

/**
 * Fetch wrapper with 10-second timeout using AbortController.
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Fangraphs API error: ${response.status} ${response.statusText} for ${url}`);
    }
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Fangraphs API request timed out after ${TIMEOUT_MS}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get playoff odds for a given team.
 *
 * TODO: Fangraphs does not have a public API. This function currently returns
 * mock/sample data. In the future, this should be connected to either:
 * - A server-side proxy that scrapes Fangraphs data
 * - A third-party API that provides Fangraphs-equivalent data
 * - A manual data entry system
 */
export async function getPlayoffOdds(teamAbbr: string): Promise<PlayoffOddsData> {
  // TODO: Replace with real API call when a data source is available.
  // Example future implementation:
  // const url = `${FANGRAPHS_PROXY_URL}/playoff-odds?team=${teamAbbr}`;
  // const response = await fetchWithTimeout(url);
  // const data = await response.json();
  // return parsePlayoffOddsResponse(data);

  // Mock data for Tampa Bay Rays
  return {
    currentOdds: 42.5,
    previousWeekOdds: 39.8,
    trend: 42.5 - 39.8,
  };
}

/**
 * Get leaderboard data for a given team and stat type.
 *
 * TODO: Fangraphs does not have a public API. This function currently returns
 * mock/sample data. In the future, this should be connected to either:
 * - A server-side proxy that scrapes Fangraphs leaderboard data
 * - A third-party API that provides equivalent leaderboard data
 */
export async function getLeaderboard(params: {
  season: number;
  team: string;
  type: 'bat' | 'pit';
}): Promise<any[]> {
  // TODO: Replace with real API call when a data source is available.
  // Example future implementation:
  // const url = `${FANGRAPHS_PROXY_URL}/leaders?season=${params.season}&team=${params.team}&type=${params.type}`;
  // const response = await fetchWithTimeout(url);
  // const data = await response.json();
  // return parseLeaderboardResponse(data);

  // Mock data
  if (params.type === 'bat') {
    return [
      { name: 'Yandy Díaz', wOBA: 0.365, wRCPlus: 138, pa: 320 },
      { name: 'Josh Lowe', wOBA: 0.342, wRCPlus: 125, pa: 295 },
      { name: 'Brandon Lowe', wOBA: 0.330, wRCPlus: 118, pa: 280 },
    ];
  }

  // Pitching leaderboard
  return [
    { name: 'Zack Littell', fip: 3.12, era: 3.05, ip: 98.2 },
    { name: 'Ryan Pepiot', fip: 3.45, era: 3.28, ip: 85.1 },
    { name: 'Shane Baz', fip: 3.68, era: 3.55, ip: 72.0 },
  ];
}
