import { describe, it, expect } from 'vitest';
import {
  adaptive,
  carbTarget,
  catalog,
  dateKey,
  demoData,
  emptyDay,
  newData,
  shiftDate,
  totals,
  validateData,
  weightSeries,
} from './model';
describe('nutrition accounting', () => {
  it('scales every nutrient with fractional servings', () => {
    const f = catalog.find((f) => f.id === 'chicken')!;
    expect(totals([{ ...f, entryId: 'a', meal: 'Lunch', quantity: 1.5 }])).toEqual({
      calories: 372,
      protein: 70.5,
      carbs: 0,
      fat: 7.5,
    });
  });
  it('allocates remaining energy to carbs', () => {
    expect(carbTarget(newData().profile)).toBe(243);
  });
  it('returns zero for an empty diary', () => expect(totals([]).calories).toBe(0));
});
describe('adaptive estimates', () => {
  it('does not suggest changes without a baseline', () =>
    expect(adaptive(newData()).ready).toBe(false));
  it('keeps adjustments small and respects macro calorie bounds', () => {
    const d = demoData(),
      a = adaptive(d);
    expect(a.ready).toBe(true);
    expect(Math.abs(a.recommended - d.profile.calories)).toBeLessThanOrEqual(100);
    d.profile.protein = 400;
    d.profile.fat = 0;
    d.profile.calories = 1600;
    expect(adaptive(d).recommended).toBeGreaterThanOrEqual(1600);
  });
  it('does not treat partial logs or today as completed historical intake', () => {
    const d = demoData();
    Object.values(d.days).forEach((v) => (v.complete = false));
    d.days[dateKey()].complete = true;
    expect(adaptive(d).ready).toBe(false);
  });
  it('requires weights spanning at least 14 days', () => {
    const d = demoData();
    Object.entries(d.days).forEach(([key, v]) => {
      if (key < shiftDate(dateKey(), -5)) delete v.weight;
    });
    expect(adaptive(d).ready).toBe(false);
  });
  it('estimates maintenance for stable weight from complete intake', () => {
    const d = demoData();
    Object.values(d.days).forEach((day) => (day.weight = 80));
    d.profile.goal = 'maintain';
    expect(adaptive(d).weeklyChange).toBe(0);
    expect(adaptive(d).expenditure).toBeGreaterThan(2100);
  });
  it('smooths daily noise without modifying recorded weights', () => {
    const d = newData(),
      today = dateKey();
    d.days[shiftDate(today, -1)] = { ...emptyDay(), weight: 80 };
    d.days[today] = { ...emptyDay(), weight: 82 };
    const s = weightSeries(d);
    expect(s[1].weight).toBe(82);
    expect(s[1].trend).toBe(80.5);
  });
});
describe('backup integrity', () => {
  it('accepts valid user and demo backups', () => {
    expect(validateData(newData())).toBe(true);
    expect(validateData(demoData())).toBe(true);
  });
  it('rejects invalid and nonfinite values', () => {
    expect(validateData(null)).toBe(false);
    const d = newData();
    d.profile.calories = NaN;
    expect(validateData(d)).toBe(false);
  });
  it('rejects targets that cannot fit protein and fat', () => {
    const d = newData();
    d.profile.protein = 400;
    d.profile.fat = 100;
    expect(validateData(d)).toBe(false);
  });
  it('rejects invalid check-in dates', () => {
    const d = newData();
    d.profile.lastCheckIn = '2026-02-31';
    expect(validateData(d)).toBe(false);
  });
  it('rejects malformed diary entries', () => {
    const d = demoData();
    d.days[dateKey()].entries[0].quantity = -1;
    expect(validateData(d)).toBe(false);
  });
});
