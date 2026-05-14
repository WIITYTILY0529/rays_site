/**
 * Extrapolation utility functions for pace projections.
 */

/**
 * Extrapolates a current stat to a full season using linear extrapolation.
 * Returns Math.round(currentStat * (totalGames / gamesPlayed)).
 * If gamesPlayed <= 0, returns 0.
 */
export function extrapolateToFullSeason(
  currentStat: number,
  gamesPlayed: number,
  totalGames: number = 162
): number {
  if (gamesPlayed <= 0) return 0;
  return Math.round(currentStat * (totalGames / gamesPlayed));
}

/**
 * Extrapolates hitter stats to a full 162-game season.
 * Hitters: project based on games played out of 162.
 */
export function extrapolateHitterPace(currentStats: {
  hr: number;
  hits: number;
  rbi: number;
  sb: number;
  gamesPlayed: number;
}): { hr: number; hits: number; rbi: number; sb: number } {
  const { hr, hits, rbi, sb, gamesPlayed } = currentStats;
  return {
    hr: extrapolateToFullSeason(hr, gamesPlayed, 162),
    hits: extrapolateToFullSeason(hits, gamesPlayed, 162),
    rbi: extrapolateToFullSeason(rbi, gamesPlayed, 162),
    sb: extrapolateToFullSeason(sb, gamesPlayed, 162),
  };
}

/**
 * Extrapolates pitcher stats to a full season.
 * Starters: project based on games started out of ~32 starts.
 * Relievers: project based on appearances out of ~65 games.
 * If gamesStarted is provided and > 0, uses starter projection (32 starts).
 * Otherwise uses reliever projection (65 games).
 */
export function extrapolatePitcherPace(currentStats: {
  wins: number;
  strikeouts: number;
  ip: number;
  gamesPlayed: number;
  gamesStarted?: number;
}): { wins: number; strikeouts: number; ip: number } {
  const { wins, strikeouts, ip, gamesPlayed, gamesStarted } = currentStats;

  // Determine if starter or reliever and set appropriate full-season target
  const isStarter = (gamesStarted ?? 0) > 0;
  const fullSeasonGames = isStarter ? 32 : 65;
  const actualGames = gamesPlayed;

  return {
    wins: extrapolateToFullSeason(wins, actualGames, fullSeasonGames),
    strikeouts: extrapolateToFullSeason(strikeouts, actualGames, fullSeasonGames),
    ip: extrapolateToFullSeason(ip, actualGames, fullSeasonGames),
  };
}
