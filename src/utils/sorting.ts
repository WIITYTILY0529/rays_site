/**
 * Sorting utility functions for player statistics.
 */

import type { HitterStats, PitcherStats } from '../services/types';

/**
 * Sorts hitters by wOBA in descending order (highest first).
 * Returns a new array.
 */
export function sortHittersByWOBA(hitters: HitterStats[]): HitterStats[] {
  return [...hitters].sort((a, b) => b.wOBA - a.wOBA);
}

/**
 * Sorts pitchers by FIP in ascending order (lowest first).
 * Returns a new array.
 */
export function sortPitchersByFIP(pitchers: PitcherStats[]): PitcherStats[] {
  return [...pitchers].sort((a, b) => a.fip - b.fip);
}

/**
 * Sorts pitchers by ERA in ascending order (lowest first).
 * Returns a new array.
 */
export function sortPitchersByERA(pitchers: PitcherStats[]): PitcherStats[] {
  return [...pitchers].sort((a, b) => a.era - b.era);
}
