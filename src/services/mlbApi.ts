import type { Player, TeamStanding } from './types';

const MLB_BASE_URL = 'https://statsapi.mlb.com/api/v1';

export const RAYS_TEAM_ID = 139;
export const AL_EAST_DIVISION_ID = 201;

// Minor league affiliate team IDs
export const RAYS_AFFILIATES: Record<string, number> = {
  'Durham Bulls': 235,
  'Montgomery Biscuits': 421,
  'Bowling Green Hot Rods': 3712,
  'Charleston RiverDogs': 233,
};

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
      throw new Error(`MLB API error: ${response.status} ${response.statusText} for ${url}`);
    }
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`MLB API request timed out after ${TIMEOUT_MS}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get team roster for a given season.
 * Endpoint: /teams/{teamId}/roster?season={season}
 */
export async function getTeamRoster(teamId: number, season: number): Promise<Player[]> {
  const url = `${MLB_BASE_URL}/teams/${teamId}/roster?season=${season}`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.roster || !Array.isArray(data.roster)) {
    return [];
  }

  return data.roster.map((entry: any) => ({
    id: entry.person?.id,
    fullName: entry.person?.fullName ?? 'Unknown',
    position: entry.position?.abbreviation ?? entry.position?.name ?? 'Unknown',
    team: entry.parentTeamId?.toString() ?? teamId.toString(),
  }));
}

/**
 * Get team schedule between two dates with probable pitchers hydrated.
 * Endpoint: /schedule?teamId={teamId}&startDate={startDate}&endDate={endDate}&sportId=1&hydrate=probablePitcher(note),team
 */
export async function getTeamSchedule(
  teamId: number,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const url = `${MLB_BASE_URL}/schedule?teamId=${teamId}&startDate=${startDate}&endDate=${endDate}&sportId=1&hydrate=probablePitcher(note),team`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.dates || !Array.isArray(data.dates)) {
    return [];
  }

  const games: any[] = [];

  for (const dateEntry of data.dates) {
    if (!dateEntry.games || !Array.isArray(dateEntry.games)) continue;

    for (const game of dateEntry.games) {
      const isHome = game.teams?.home?.team?.id === teamId;
      const opponent = isHome
        ? game.teams?.away?.team
        : game.teams?.home?.team;
      const probablePitcher = isHome
        ? game.teams?.home?.probablePitcher
        : game.teams?.away?.probablePitcher;
      const opponentId = opponent?.id ?? null;

      games.push({
        date: dateEntry.date ?? game.gameDate?.substring(0, 10) ?? '',
        opponent: opponent?.name ?? 'Unknown',
        opponentId,
        isHome,
        probablePitcherId: probablePitcher?.id ?? null,
        probablePitcherName: probablePitcher?.fullName ?? null,
      });
    }
  }

  return games;
}

/**
 * Get division standings for a given league and season.
 * Endpoint: /standings?leagueId={leagueId}&season={season}
 * AL East division ID: 201
 */
export async function getStandings(leagueId: number, season: number): Promise<TeamStanding[]> {
  const url = `${MLB_BASE_URL}/standings?leagueId=${leagueId}&season=${season}`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.records || !Array.isArray(data.records)) {
    return [];
  }

  const standings: TeamStanding[] = [];

  for (const record of data.records) {
    // Filter for AL East division
    if (record.division?.id !== AL_EAST_DIVISION_ID) continue;

    if (!record.teamRecords || !Array.isArray(record.teamRecords)) continue;

    for (const teamRecord of record.teamRecords) {
      standings.push({
        teamName: teamRecord.team?.name ?? 'Unknown',
        wins: teamRecord.wins ?? 0,
        losses: teamRecord.losses ?? 0,
        winPct: parseFloat(teamRecord.winningPercentage ?? '0'),
        gamesBehind: parseFloat(teamRecord.gamesBack ?? '0'),
      });
    }
  }

  return standings;
}

/**
 * Get player season stats for a specific stat group.
 * Endpoint: /people/{playerId}/stats?stats=season&group={group}&season={season}
 */
export async function getPlayerStats(
  playerId: number,
  group: 'hitting' | 'pitching',
  season: number
): Promise<any | null> {
  const url = `${MLB_BASE_URL}/people/${playerId}/stats?stats=season&group=${group}&season=${season}`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.stats || !Array.isArray(data.stats) || data.stats.length === 0) {
    return null;
  }

  const splits = data.stats[0]?.splits;
  if (!splits || !Array.isArray(splits) || splits.length === 0) {
    return null;
  }

  return splits[0].stat;
}

/**
 * Get player game log for a specific stat group and season.
 * Endpoint: /people/{playerId}/stats?stats=gameLog&group={group}&season={season}
 */
export async function getPlayerGameLog(
  playerId: number,
  group: 'hitting' | 'pitching',
  season: number
): Promise<any[]> {
  const url = `${MLB_BASE_URL}/people/${playerId}/stats?stats=gameLog&group=${group}&season=${season}`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.stats || !Array.isArray(data.stats) || data.stats.length === 0) {
    return [];
  }

  const splits = data.stats[0]?.splits;
  if (!splits || !Array.isArray(splits)) {
    return [];
  }

  return splits;
}

/**
 * Get team season stats for a specific stat group.
 * Endpoint: /teams/{teamId}/stats?stats=season&group={group}&season={season}
 */
export async function getTeamStats(
  teamId: number,
  group: 'hitting' | 'pitching',
  season: number
): Promise<any | null> {
  const url = `${MLB_BASE_URL}/teams/${teamId}/stats?stats=season&group=${group}&season=${season}`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.stats || !Array.isArray(data.stats) || data.stats.length === 0) {
    return null;
  }

  const splits = data.stats[0]?.splits;
  if (!splits || !Array.isArray(splits) || splits.length === 0) {
    return null;
  }

  return splits[0].stat;
}

/**
 * Batch fetch utility: fetches data for multiple items in groups to avoid overwhelming the API.
 * Uses Promise.allSettled so one failure doesn't break the batch.
 */
export async function batchFetch<T, R>(
  items: T[],
  fetcher: (item: T) => Promise<R>,
  batchSize: number = 5
): Promise<Array<{ item: T; result: R | null; error?: string }>> {
  const results: Array<{ item: T; result: R | null; error?: string }> = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map(fetcher));

    for (let j = 0; j < batch.length; j++) {
      const outcome = settled[j];
      if (outcome.status === 'fulfilled') {
        results.push({ item: batch[j], result: outcome.value });
      } else {
        results.push({ item: batch[j], result: null, error: outcome.reason?.message ?? 'Unknown error' });
      }
    }
  }

  return results;
}

/**
 * Get all completed regular-season game results for a team in a given season.
 * Endpoint: /schedule?teamId={teamId}&season={season}&sportId=1&gameType=R&hydrate=linescore
 */
export async function getSeasonGameResults(teamId: number, season: number): Promise<any[]> {
  const url = `${MLB_BASE_URL}/schedule?teamId=${teamId}&season=${season}&sportId=1&gameType=R&hydrate=linescore`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  const games: any[] = [];
  for (const dateEntry of data.dates ?? []) {
    for (const game of dateEntry.games ?? []) {
      if (game.status?.detailedState !== 'Final') continue;

      const isHome = game.teams?.home?.team?.id === teamId;
      const raysTeam = isHome ? game.teams.home : game.teams.away;
      const oppTeam = isHome ? game.teams.away : game.teams.home;

      games.push({
        date: dateEntry.date,
        opponent: oppTeam.team?.name ?? 'Unknown',
        isHome,
        isWin: raysTeam.isWinner ?? false,
        runsScored: raysTeam.score ?? 0,
        runsAllowed: oppTeam.score ?? 0,
      });
    }
  }
  return games;
}

/**
 * Helper: format a Date to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper: get today's date as YYYY-MM-DD.
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * Helper: add days to a date and return YYYY-MM-DD.
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}
