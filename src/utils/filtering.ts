/**
 * Filtering utility functions for player statistics.
 */

import type { HitterStats, PitcherStats } from '../services/types';
import { COLD_THRESHOLDS, QUALITY_GATES } from '../services/types';

/**
 * Returns hitters with wOBA below the cold threshold (< 0.290).
 */
export function filterColdHitters(hitters: HitterStats[]): HitterStats[] {
  return hitters.filter((h) => h.wOBA < COLD_THRESHOLDS.hitterWOBA);
}

/**
 * Returns pitchers with FIP above the cold threshold (> 3.75).
 */
export function filterColdPitchers(pitchers: PitcherStats[]): PitcherStats[] {
  return pitchers.filter((p) => p.fip > COLD_THRESHOLDS.pitcherFIP);
}

/**
 * Ensures mutual exclusion between hot and cold lists.
 * Removes any items from the cold list that appear in the hot list (by playerId).
 * A player cannot be in both lists.
 */
export function ensureMutualExclusion<T extends { playerId: number }>(
  hotList: T[],
  coldList: T[]
): { hot: T[]; cold: T[] } {
  const hotIds = new Set(hotList.map((p) => p.playerId));
  return {
    hot: hotList,
    cold: coldList.filter((p) => !hotIds.has(p.playerId)),
  };
}

/**
 * Filters players based on QUALITY_GATES for the given trailing window.
 * For hitters (identified by 'pa' property), filters by minPA.
 * For pitchers (identified by 'ip' property), filters by minIP.
 */
export function applyQualityGate(
  players: Array<HitterStats | PitcherStats>,
  window: 7 | 14 | 30
): Array<HitterStats | PitcherStats> {
  const gate = QUALITY_GATES[window];
  return players.filter((player) => {
    if ('pa' in player) {
      return player.pa >= gate.minPA;
    }
    if ('ip' in player) {
      return player.ip >= gate.minIP;
    }
    return false;
  });
}
