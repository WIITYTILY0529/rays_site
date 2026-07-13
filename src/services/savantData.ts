export interface SavantMetric {
  name: string;
  value: string;
  percentile: number;
}

export interface SavantPlayerData {
  name: string;
  position: string;
  type: 'hitting' | 'pitching';
  metrics: SavantMetric[];
}

export interface SavantData {
  lastUpdated: string | null;
  players: Record<string, SavantPlayerData>;
}

/**
 * Fetch the pre-scraped Baseball Savant percentile data from the static JSON file.
 * Returns empty data if the file hasn't been populated yet.
 */
export async function getSavantData(): Promise<SavantData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/savant-stats.json`);
  if (!response.ok) {
    return { lastUpdated: null, players: {} };
  }
  return response.json();
}

/**
 * Get a single player's Savant percentile data by their MLB player ID.
 */
export function getPlayerSavantData(data: SavantData, playerId: number): SavantPlayerData | null {
  return data.players[String(playerId)] ?? null;
}
