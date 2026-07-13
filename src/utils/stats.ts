/**
 * Statistical utility functions for the Rays Analytics Dashboard.
 */

/**
 * Calculates win percentage rounded to 3 decimal places.
 * Returns 0 if total games (wins + losses) is 0.
 */
export function calculateWinPct(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 1000) / 1000;
}

/**
 * Calculates trend value as the difference between current and previous.
 */
export function calculateTrend(current: number, previous: number): number {
  return current - previous;
}
