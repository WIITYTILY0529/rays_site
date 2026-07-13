import { describe, it, expect } from 'vitest';
import { calculateWinPct, calculateTrend } from '../../utils/stats';

describe('calculateWinPct', () => {
  it('returns 0 when wins + losses is 0', () => {
    expect(calculateWinPct(0, 0)).toBe(0);
  });

  it('calculates win percentage rounded to 3 decimal places', () => {
    expect(calculateWinPct(90, 72)).toBe(0.556);
  });

  it('returns 1 when all games are wins', () => {
    expect(calculateWinPct(10, 0)).toBe(1);
  });

  it('returns 0 when all games are losses', () => {
    expect(calculateWinPct(0, 10)).toBe(0);
  });

  it('handles a .500 record', () => {
    expect(calculateWinPct(81, 81)).toBe(0.5);
  });

  it('rounds correctly for repeating decimals', () => {
    // 1/3 = 0.333...
    expect(calculateWinPct(1, 2)).toBe(0.333);
  });
});

describe('calculateTrend', () => {
  it('returns positive value when current > previous', () => {
    expect(calculateTrend(55, 50)).toBe(5);
  });

  it('returns negative value when current < previous', () => {
    expect(calculateTrend(45, 50)).toBe(-5);
  });

  it('returns 0 when current equals previous', () => {
    expect(calculateTrend(50, 50)).toBe(0);
  });

  it('handles decimal values', () => {
    expect(calculateTrend(55.5, 50.2)).toBeCloseTo(5.3);
  });
});
