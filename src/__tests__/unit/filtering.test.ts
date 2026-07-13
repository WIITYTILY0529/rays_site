import { describe, it, expect } from 'vitest';
import {
  filterColdHitters,
  filterColdPitchers,
  ensureMutualExclusion,
  applyQualityGate,
} from '../../utils/filtering';
import type { HitterStats, PitcherStats } from '../../services/types';

const makeHitter = (overrides: Partial<HitterStats> = {}): HitterStats => ({
  playerId: 1,
  name: 'Test Hitter',
  position: 'OF',
  pa: 50,
  wOBA: 0.350,
  wRCPlus: 120,
  ops: 0.800,
  hr: 10,
  hits: 50,
  rbi: 30,
  sb: 5,
  ...overrides,
});

const makePitcher = (overrides: Partial<PitcherStats> = {}): PitcherStats => ({
  playerId: 1,
  name: 'Test Pitcher',
  position: 'SP',
  ip: 30,
  fip: 3.50,
  era: 3.20,
  wins: 5,
  strikeouts: 40,
  ...overrides,
});

describe('filterColdHitters', () => {
  it('returns hitters with wOBA < 0.290', () => {
    const hitters = [
      makeHitter({ playerId: 1, wOBA: 0.250 }),
      makeHitter({ playerId: 2, wOBA: 0.310 }),
      makeHitter({ playerId: 3, wOBA: 0.289 }),
    ];
    const cold = filterColdHitters(hitters);
    expect(cold).toHaveLength(2);
    expect(cold.map((h) => h.playerId)).toEqual([1, 3]);
  });

  it('excludes hitters with wOBA exactly 0.290', () => {
    const hitters = [makeHitter({ wOBA: 0.290 })];
    expect(filterColdHitters(hitters)).toHaveLength(0);
  });

  it('returns empty array when no hitters are cold', () => {
    const hitters = [makeHitter({ wOBA: 0.350 })];
    expect(filterColdHitters(hitters)).toHaveLength(0);
  });
});

describe('filterColdPitchers', () => {
  it('returns pitchers with FIP > 3.75', () => {
    const pitchers = [
      makePitcher({ playerId: 1, fip: 4.00 }),
      makePitcher({ playerId: 2, fip: 3.50 }),
      makePitcher({ playerId: 3, fip: 3.76 }),
    ];
    const cold = filterColdPitchers(pitchers);
    expect(cold).toHaveLength(2);
    expect(cold.map((p) => p.playerId)).toEqual([1, 3]);
  });

  it('excludes pitchers with FIP exactly 3.75', () => {
    const pitchers = [makePitcher({ fip: 3.75 })];
    expect(filterColdPitchers(pitchers)).toHaveLength(0);
  });
});

describe('ensureMutualExclusion', () => {
  it('removes players from cold list that appear in hot list', () => {
    const hot = [makeHitter({ playerId: 1 }), makeHitter({ playerId: 2 })];
    const cold = [makeHitter({ playerId: 2 }), makeHitter({ playerId: 3 })];
    const result = ensureMutualExclusion(hot, cold);
    expect(result.hot).toHaveLength(2);
    expect(result.cold).toHaveLength(1);
    expect(result.cold[0].playerId).toBe(3);
  });

  it('returns both lists unchanged when no overlap', () => {
    const hot = [makeHitter({ playerId: 1 })];
    const cold = [makeHitter({ playerId: 2 })];
    const result = ensureMutualExclusion(hot, cold);
    expect(result.hot).toHaveLength(1);
    expect(result.cold).toHaveLength(1);
  });

  it('handles empty lists', () => {
    const result = ensureMutualExclusion([], []);
    expect(result.hot).toEqual([]);
    expect(result.cold).toEqual([]);
  });
});

describe('applyQualityGate', () => {
  it('filters hitters by minPA for 7-day window', () => {
    const players = [
      makeHitter({ playerId: 1, pa: 12 }),
      makeHitter({ playerId: 2, pa: 8 }),
    ];
    const result = applyQualityGate(players, 7);
    expect(result).toHaveLength(1);
    expect((result[0] as HitterStats).playerId).toBe(1);
  });

  it('filters pitchers by minIP for 14-day window', () => {
    const players = [
      makePitcher({ playerId: 1, ip: 4 }),
      makePitcher({ playerId: 2, ip: 2 }),
    ];
    const result = applyQualityGate(players, 14);
    expect(result).toHaveLength(1);
    expect((result[0] as PitcherStats).playerId).toBe(1);
  });

  it('applies 30-day window gates correctly', () => {
    const players = [
      makeHitter({ playerId: 1, pa: 30 }),
      makeHitter({ playerId: 2, pa: 29 }),
      makePitcher({ playerId: 3, ip: 6 }),
      makePitcher({ playerId: 4, ip: 5 }),
    ];
    const result = applyQualityGate(players, 30);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.playerId)).toEqual([1, 3]);
  });
});
