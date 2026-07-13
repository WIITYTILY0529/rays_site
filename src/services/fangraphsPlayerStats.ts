/**
 * Fetches individual player batting and pitching stats from Fangraphs API.
 * Used for live refresh of season stats.
 */

import type { FangraphsHitter, FangraphsPitcher, FangraphsTeamData } from './fangraphsData';
import { TEAMS } from './teamConfig';

const TIMEOUT_MS = 10000;
const SEASON = 2026;

function buildUrl(teamId: number, stats: 'bat' | 'pit'): string {
  return (
    `https://www.fangraphs.com/api/leaders/major-league/data` +
    `?pos=all&stats=${stats}&lg=all&qual=0&type=8` +
    `&season=${SEASON}&month=0&season1=${SEASON}&ind=0` +
    `&team=${teamId}&rost=1&age=0&filter=&players=0` +
    `&startdate=&enddate=&page=1_50`
  );
}

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

function parsePct(value: unknown): number {
  if (value == null) return 0;
  const val = Number(value);
  if (isNaN(val)) return 0;
  // Fangraphs returns decimals like 0.123
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

/**
 * Fetch live player stats for a team from Fangraphs API.
 */
export async function fetchLivePlayerStats(teamKey: string): Promise<FangraphsTeamData> {
  const teamConfig = TEAMS[teamKey];
  if (!teamConfig) {
    throw new Error(`Unknown team key: ${teamKey}`);
  }

  const teamId = teamConfig.fgTeamId;

  const [batResp, pitResp] = await Promise.all([
    fetchWithTimeout(buildUrl(teamId, 'bat')),
    fetchWithTimeout(buildUrl(teamId, 'pit')),
  ]);

  const batData = await batResp.json();
  const pitData = await pitResp.json();

  const batRows: Record<string, unknown>[] = batData.data ?? [];
  const pitRows: Record<string, unknown>[] = pitData.data ?? [];

  const hitters = batRows
    .map(parseHitter)
    .filter((h) => h.PA > 0)
    .sort((a, b) => b.WAR - a.WAR);

  const pitchers = pitRows
    .map(parsePitcher)
    .sort((a, b) => b.WAR - a.WAR);

  return {
    fgTeamId: teamId,
    hitters,
    pitchers,
  };
}
