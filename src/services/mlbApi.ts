import type { Player, ScheduledGame, TeamStanding } from './types';

const MLB_BASE_URL = 'https://statsapi.mlb.com/api/v1';

export const RAYS_TEAM_ID = 139;
export const AL_EAST_DIVISION_ID = 201;

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
    throw new Error(`Invalid roster response for team ${teamId}, season ${season}`);
  }

  return data.roster.map((entry: any) => ({
    id: entry.person?.id,
    fullName: entry.person?.fullName ?? 'Unknown',
    position: entry.position?.abbreviation ?? entry.position?.name ?? 'Unknown',
    team: entry.parentTeamId?.toString() ?? teamId.toString(),
  }));
}

/**
 * Get team schedule between two dates.
 * Endpoint: /schedule?teamId={teamId}&startDate={startDate}&endDate={endDate}&sportId=1
 */
export async function getTeamSchedule(
  teamId: number,
  startDate: string,
  endDate: string
): Promise<ScheduledGame[]> {
  const url = `${MLB_BASE_URL}/schedule?teamId=${teamId}&startDate=${startDate}&endDate=${endDate}&sportId=1`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.dates || !Array.isArray(data.dates)) {
    throw new Error(`Invalid schedule response for team ${teamId}`);
  }

  const games: ScheduledGame[] = [];

  for (const dateEntry of data.dates) {
    if (!dateEntry.games || !Array.isArray(dateEntry.games)) continue;

    for (const game of dateEntry.games) {
      const isHome = game.teams?.home?.team?.id === teamId;
      const opponent = isHome
        ? game.teams?.away?.team?.name ?? 'Unknown'
        : game.teams?.home?.team?.name ?? 'Unknown';

      games.push({
        date: dateEntry.date ?? game.gameDate ?? '',
        opponent,
        isHome,
        probablePitcher: null, // Will be enriched by hooks
        opponentTeamERA: 0,   // Will be enriched by hooks
        opponentTeamOPS: 0,   // Will be enriched by hooks
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
    throw new Error(`Invalid standings response for league ${leagueId}, season ${season}`);
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
): Promise<any> {
  const url = `${MLB_BASE_URL}/people/${playerId}/stats?stats=season&group=${group}&season=${season}`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.stats || !Array.isArray(data.stats) || data.stats.length === 0) {
    throw new Error(`No ${group} stats found for player ${playerId}, season ${season}`);
  }

  const splits = data.stats[0]?.splits;
  if (!splits || !Array.isArray(splits) || splits.length === 0) {
    throw new Error(`No stat splits found for player ${playerId}, season ${season}`);
  }

  return splits[0].stat;
}

/**
 * Get player game log for pitching stats.
 * Endpoint: /people/{playerId}/stats?stats=gameLog&group=pitching&season={season}
 */
export async function getGameLog(playerId: number, season: number): Promise<any[]> {
  const url = `${MLB_BASE_URL}/people/${playerId}/stats?stats=gameLog&group=pitching&season=${season}`;
  const response = await fetchWithTimeout(url);
  const data = await response.json();

  if (!data.stats || !Array.isArray(data.stats) || data.stats.length === 0) {
    throw new Error(`No game log found for player ${playerId}, season ${season}`);
  }

  const splits = data.stats[0]?.splits;
  if (!splits || !Array.isArray(splits)) {
    throw new Error(`No game log splits found for player ${playerId}, season ${season}`);
  }

  return splits;
}
