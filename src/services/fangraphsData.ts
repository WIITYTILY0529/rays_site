export interface FangraphsHitter {
  name: string;
  fgPlayerId: number;
  PA: number;
  H: number;
  HR: number;
  bbPct: number;
  kPct: number;
  BABIP: number;
  barrelPct: number;
  wRCPlus: number;
  WAR: number;
}

export interface FangraphsPitcher {
  name: string;
  fgPlayerId: number;
  G: number;
  GS: number;
  IP: number;
  kPct: number;
  bbPct: number;
  BABIP: number;
  FIP: number;
  pbStuff: number;
  pbCommand: number;
  WAR: number;
}

export interface FangraphsTeamData {
  fgTeamId: number;
  hitters: FangraphsHitter[];
  pitchers: FangraphsPitcher[];
}

export interface PlayoffOddsEntry {
  date: string;
  playoff: number;
}

export interface TeamPlayoffOdds {
  current: {
    playoff: number;
    division: number;
    wildcard: number;
    worldSeries: number;
  };
  history: PlayoffOddsEntry[];
}

export interface FangraphsData {
  lastUpdated: string | null;
  season: number;
  teams: Record<string, FangraphsTeamData>;
  playoffOdds?: Record<string, TeamPlayoffOdds>;
}

export async function getFangraphsData(): Promise<FangraphsData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/fangraphs-stats.json`, {
    cache: 'no-cache',
  });
  if (!response.ok) {
    return { lastUpdated: null, season: 2026, teams: {} };
  }
  return response.json();
}
