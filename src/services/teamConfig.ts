export interface TeamConfig {
  id: number;
  name: string;
  abbreviation: string;
  colors: { primary: string; secondary: string };
  divisionId: number;
  leagueId: number;
  fgTeamId: number;
  fgDivision: { lg: string; div: string };
  fgOddsAbbr: string;
  affiliates: Record<string, { teamId: number; sportId: number; level: string }>;
}

export const TEAMS: Record<string, TeamConfig> = {
  TB: {
    id: 139,
    name: 'Tampa Bay Rays',
    abbreviation: 'TB',
    colors: { primary: '#092C5C', secondary: '#8FBCE6' },
    divisionId: 201,
    leagueId: 103,
    fgTeamId: 12,
    fgDivision: { lg: 'al', div: 'e' },
    fgOddsAbbr: 'TBR',
    affiliates: {
      'AAA': { teamId: 234, sportId: 11, level: 'AAA' },
      'AA': { teamId: 421, sportId: 12, level: 'AA' },
      'High A': { teamId: 2498, sportId: 13, level: 'High A' },
      'A': { teamId: 233, sportId: 14, level: 'A' },
    },
  },
  DET: {
    id: 116,
    name: 'Detroit Tigers',
    abbreviation: 'DET',
    colors: { primary: '#0C2340', secondary: '#FA4616' },
    divisionId: 202,
    leagueId: 103,
    fgTeamId: 6,
    fgDivision: { lg: 'al', div: 'c' },
    fgOddsAbbr: 'DET',
    affiliates: {
      'AAA': { teamId: 512, sportId: 11, level: 'AAA' },
      'AA': { teamId: 106, sportId: 12, level: 'AA' },
      'High A': { teamId: 582, sportId: 13, level: 'High A' },
      'A': { teamId: 570, sportId: 14, level: 'A' },
    },
  },
};

export const DEFAULT_TEAM = 'TB';
