import type { TeamPlayoffOdds, PlayoffOddsEntry } from './fangraphsData';
import { TEAMS } from './teamConfig';

const TIMEOUT_MS = 10000;
const SEASON_START = '2026-03-27';

/**
 * Fetch wrapper with 10-second timeout using AbortController.
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Fangraphs API error: ${response.status} ${response.statusText}`);
    }
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Fangraphs API request timed out after ${TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
function getTodayStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Generate sample dates every 3 days from season start to today.
 */
function getSampleDates(): string[] {
  const dates: string[] = [];
  const start = new Date(SEASON_START);
  const today = new Date(getTodayStr());

  let current = new Date(start);
  while (current <= today) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 3);
  }
  // Always include today
  const todayStr = getTodayStr();
  if (dates[dates.length - 1] !== todayStr) {
    dates.push(todayStr);
  }
  return dates;
}

interface FgOddsTeamEntry {
  abbName?: string;
  shortName?: string;
  endData?: {
    poffTitle?: number;
    divTitle?: number;
    wcTitle?: number;
    wsWin?: number;
  };
}

/**
 * Fetch live playoff odds for a team directly from Fangraphs API.
 * Returns current odds + history sampled every 3 days.
 */
export async function fetchLivePlayoffOdds(teamKey: string): Promise<TeamPlayoffOdds> {
  const teamConfig = TEAMS[teamKey];
  if (!teamConfig) {
    throw new Error(`Unknown team key: ${teamKey}`);
  }

  const { lg, div } = teamConfig.fgDivision;
  const abbr = teamConfig.fgOddsAbbr;
  const todayStr = getTodayStr();

  // Fetch current odds (today)
  const currentUrl = `https://www.fangraphs.com/api/playoff-odds/odds?dateEnd=${todayStr}&dateDelta=&projectionMode=2&lg=${lg}&div=${div}`;
  const currentResponse = await fetchWithTimeout(currentUrl);
  const currentData: FgOddsTeamEntry[] = await currentResponse.json();

  const teamEntry = currentData.find(
    (t) => t.abbName === abbr || t.shortName === abbr
  );

  if (!teamEntry?.endData) {
    throw new Error(`Team ${abbr} not found in Fangraphs playoff odds response`);
  }

  const current = {
    playoff: teamEntry.endData.poffTitle ?? 0,
    division: teamEntry.endData.divTitle ?? 0,
    wildcard: teamEntry.endData.wcTitle ?? 0,
    worldSeries: teamEntry.endData.wsWin ?? 0,
  };

  // Fetch history (sample dates) — do this in parallel batches to be fast
  const sampleDates = getSampleDates();
  const history: PlayoffOddsEntry[] = [];

  // Fetch in batches of 5 to avoid hammering the API
  const BATCH_SIZE = 5;
  for (let i = 0; i < sampleDates.length; i += BATCH_SIZE) {
    const batch = sampleDates.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (dateStr) => {
        const url = `https://www.fangraphs.com/api/playoff-odds/odds?dateEnd=${dateStr}&dateDelta=&projectionMode=2&lg=${lg}&div=${div}`;
        const resp = await fetchWithTimeout(url);
        const data: FgOddsTeamEntry[] = await resp.json();
        const entry = data.find((t) => t.abbName === abbr || t.shortName === abbr);
        if (entry?.endData?.poffTitle != null) {
          return { date: dateStr, playoff: entry.endData.poffTitle };
        }
        return null;
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        history.push(result.value);
      }
    }
  }

  // Sort history by date
  history.sort((a, b) => a.date.localeCompare(b.date));

  return { current, history };
}
