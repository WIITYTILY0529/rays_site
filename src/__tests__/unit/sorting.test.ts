import { describe, it, expect } from 'vitest';
import { sortHittersByWOBA, sortPitchersByFIP, sortPitchersByERA } from '../../utils/sorting';
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

describe('sortHittersByWOBA', () => {
  it('sorts hitters by wOBA descending', () => {
    const hitters = [
      makeHitter({ playerId: 1, wOBA: 0.300 }),
      makeHitter({ playerId: 2, wOBA: 0.400 }),
      makeHitter({ playerId: 3, wOBA: 0.350 }),
    ];
    const sorted = sortHittersByWOBA(hitters);
    expect(sorted[0].wOBA).toBe(0.400);
    expect(sorted[1].wOBA).toBe(0.350);
    expect(sorted[2].wOBA).toBe(0.300);
  });

  it('returns a new array without mutating the original', () => {
    const hitters = [
      makeHitter({ playerId: 1, wOBA: 0.300 }),
      makeHitter({ playerId: 2, wOBA: 0.400 }),
    ];
    const sorted = sortHittersByWOBA(hitters);
    expect(sorted).not.toBe(hitters);
    expect(hitters[0].wOBA).toBe(0.300);
  });

  it('handles empty array', () => {
    expect(sortHittersByWOBA([])).toEqual([]);
  });
});

describe('sortPitchersByFIP', () => {
  it('sorts pitchers by FIP ascending', () => {
    const pitchers = [
      makePitcher({ playerId: 1, fip: 4.00 }),
      makePitcher({ playerId: 2, fip: 2.50 }),
      makePitcher({ playerId: 3, fip: 3.25 }),
    ];
    const sorted = sortPitchersByFIP(pitchers);
    expect(sorted[0].fip).toBe(2.50);
    expect(sorted[1].fip).toBe(3.25);
    expect(sorted[2].fip).toBe(4.00);
  });

  it('returns a new array without mutating the original', () => {
    const pitchers = [
      makePitcher({ playerId: 1, fip: 4.00 }),
      makePitcher({ playerId: 2, fip: 2.50 }),
    ];
    const sorted = sortPitchersByFIP(pitchers);
    expect(sorted).not.toBe(pitchers);
    expect(pitchers[0].fip).toBe(4.00);
  });
});

describe('sortPitchersByERA', () => {
  it('sorts pitchers by ERA ascending', () => {
    const pitchers = [
      makePitcher({ playerId: 1, era: 4.50 }),
      makePitcher({ playerId: 2, era: 2.10 }),
      makePitcher({ playerId: 3, era: 3.00 }),
    ];
    const sorted = sortPitchersByERA(pitchers);
    expect(sorted[0].era).toBe(2.10);
    expect(sorted[1].era).toBe(3.00);
    expect(sorted[2].era).toBe(4.50);
  });

  it('returns a new array without mutating the original', () => {
    const pitchers = [
      makePitcher({ playerId: 1, era: 4.50 }),
      makePitcher({ playerId: 2, era: 2.10 }),
    ];
    const sorted = sortPitchersByERA(pitchers);
    expect(sorted).not.toBe(pitchers);
    expect(pitchers[0].era).toBe(4.50);
  });
});
