import { describe, it, expect } from 'vitest';
import {
  extrapolateToFullSeason,
  extrapolateHitterPace,
  extrapolatePitcherPace,
} from '../../utils/extrapolation';

describe('extrapolateToFullSeason', () => {
  it('extrapolates stat to 162 games', () => {
    // 10 HR in 81 games → 20 HR in 162 games
    expect(extrapolateToFullSeason(10, 81)).toBe(20);
  });

  it('returns 0 when gamesPlayed is 0', () => {
    expect(extrapolateToFullSeason(10, 0)).toBe(0);
  });

  it('returns 0 when gamesPlayed is negative', () => {
    expect(extrapolateToFullSeason(10, -5)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    // 7 HR in 50 games → 7 * (162/50) = 22.68 → 23
    expect(extrapolateToFullSeason(7, 50)).toBe(23);
  });

  it('uses custom totalGames when provided', () => {
    // 10 HR in 81 games, 100 game season → 10 * (100/81) ≈ 12.35 → 12
    expect(extrapolateToFullSeason(10, 81, 100)).toBe(12);
  });

  it('handles stat of 0', () => {
    expect(extrapolateToFullSeason(0, 81)).toBe(0);
  });
});

describe('extrapolateHitterPace', () => {
  it('extrapolates all hitter stats to 162 games', () => {
    const result = extrapolateHitterPace({
      hr: 10,
      hits: 50,
      rbi: 30,
      sb: 5,
      gamesPlayed: 81,
    });
    expect(result.hr).toBe(20);
    expect(result.hits).toBe(100);
    expect(result.rbi).toBe(60);
    expect(result.sb).toBe(10);
  });

  it('returns 0 for all stats when gamesPlayed is 0', () => {
    const result = extrapolateHitterPace({
      hr: 10,
      hits: 50,
      rbi: 30,
      sb: 5,
      gamesPlayed: 0,
    });
    expect(result.hr).toBe(0);
    expect(result.hits).toBe(0);
    expect(result.rbi).toBe(0);
    expect(result.sb).toBe(0);
  });
});

describe('extrapolatePitcherPace', () => {
  it('extrapolates all pitcher stats to 162 games', () => {
    const result = extrapolatePitcherPace({
      wins: 8,
      strikeouts: 100,
      ip: 90,
      gamesPlayed: 81,
    });
    expect(result.wins).toBe(16);
    expect(result.strikeouts).toBe(200);
    expect(result.ip).toBe(180);
  });

  it('returns 0 for all stats when gamesPlayed is 0', () => {
    const result = extrapolatePitcherPace({
      wins: 8,
      strikeouts: 100,
      ip: 90,
      gamesPlayed: 0,
    });
    expect(result.wins).toBe(0);
    expect(result.strikeouts).toBe(0);
    expect(result.ip).toBe(0);
  });
});
