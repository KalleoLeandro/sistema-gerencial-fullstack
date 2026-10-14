import { AeroProgressComponent } from '../index';

describe('AeroProgressComponent', () => {
  it('limits progress to the valid range and handles nonfinite values', () => {
    const c = new AeroProgressComponent();
    for (const [value, expected] of [
      [-1, 0],
      [125, 100],
      [50, 50],
      [NaN, 0],
      [Infinity, 0],
    ]) {
      c.value = value;
      expect(c.percentage).toBe(expected);
    }
  });
});
