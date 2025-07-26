import { formatYearMonth, monthBuckets, toEpoch } from '../dateFormatter.util';

describe('date utils', () => {
  describe('toEpoch()', () => {
    it('converts ISO string to epoch', () => {
      const iso = '2025-07-26T00:00:00.000Z';
      expect(toEpoch(iso)).toBe(new Date(iso).getTime());
    });

    it('returns epoch for Date instance unchanged', () => {
      const d = new Date('2023-01-15T12:34:56.000Z');
      expect(toEpoch(d)).toBe(d.getTime());
    });
  });

  describe('formatYearMonth()', () => {
    it('returns YYYY-MM for ISO string', () => {
      expect(formatYearMonth('2024-02-19T08:00:00Z')).toBe('2024-02');
    });

    it('returns YYYY-MM for Date object', () => {
      expect(formatYearMonth(new Date('1999-12-25T23:59:59Z'))).toBe('1999-12');
    });
  });

  describe('monthBuckets()', () => {
    it('lists one bucket when start == end (inclusive)', () => {
      expect(monthBuckets('2025-04-01', '2025-04-30')).toEqual(['2025-04']);
    });

    it('lists consecutive months across a year boundary', () => {
      expect(monthBuckets('2024-11-01', '2025-02-15')).toEqual([
        '2024-11',
        '2024-12',
        '2025-01',
        '2025-02',
      ]);
    });

    it('pads single-digit months with a leading zero', () => {
      expect(monthBuckets('2025-01-05', '2025-03-05')).toEqual(['2025-01', '2025-02', '2025-03']);
    });
  });
});
