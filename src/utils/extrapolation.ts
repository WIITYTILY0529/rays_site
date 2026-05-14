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
    hr: extrapolateToFullSeason(hr, gamesPlayed),
    hits: extrapolateToFullSeason(hits, gamesPlayed),
    rbi: extrapolateToFullSeason(rbi, gamesPlayed),
    sb: extrapolateToFullSeason(sb, gamesPlayed),
  };
}

/**
 * Extrapolates pitcher stats to a full 162-game season.
 */
export function extrapolatePitcherPace(currentStats: {
  wins: number;
  strikeouts: number;
  ip: number;
  gamesPlayed: number;
}): { wins: number; strikeouts: number; ip: number } {
  const { wins, strikeouts, ip, gamesPlayed } = currentStats;
  return {
    wins: extrapolateToFullSeason(wins, gamesPlayed),
    strikeouts: extrapolateToFullSeason(strikeouts, gamesPlayed),
    ip: extrapolateToFullSeason(ip, gamesPlayed),
  };
}
