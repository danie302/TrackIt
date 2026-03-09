import 'reflect-metadata';
import { normalizeLimit, paginateSkip, toPaginatedResult } from './pagination.dto';

describe('pagination utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeLimit', () => {
    it('returns 10 when limit is undefined', () => {
      expect(normalizeLimit(undefined)).toBe(10);
    });

    it('returns 10 when limit is null-ish (called with no arg)', () => {
      expect(normalizeLimit()).toBe(10);
    });

    it('returns 5 when limit is 5 (allowed)', () => {
      expect(normalizeLimit(5)).toBe(5);
    });

    it('returns 10 when limit is 10 (allowed)', () => {
      expect(normalizeLimit(10)).toBe(10);
    });

    it('returns 20 when limit is 20 (allowed)', () => {
      expect(normalizeLimit(20)).toBe(20);
    });

    it('returns 25 when limit is 25 (allowed)', () => {
      expect(normalizeLimit(25)).toBe(25);
    });

    it('returns 10 for invalid value 7', () => {
      expect(normalizeLimit(7)).toBe(10);
    });

    it('returns 10 for invalid value 100', () => {
      expect(normalizeLimit(100)).toBe(10);
    });

    it('returns 10 for invalid value 1', () => {
      expect(normalizeLimit(1)).toBe(10);
    });

    it('returns 10 for invalid value 0', () => {
      expect(normalizeLimit(0)).toBe(10);
    });

    it('returns 10 for invalid value 15', () => {
      expect(normalizeLimit(15)).toBe(10);
    });
  });

  describe('paginateSkip', () => {
    it('returns 0 for page 1 with limit 10', () => {
      expect(paginateSkip(1, 10)).toBe(0);
    });

    it('returns correct offset for page 2 with limit 10', () => {
      expect(paginateSkip(2, 10)).toBe(10);
    });

    it('returns correct offset for page 3 with limit 10', () => {
      expect(paginateSkip(3, 10)).toBe(20);
    });

    it('returns correct offset for page 2 with limit 25', () => {
      expect(paginateSkip(2, 25)).toBe(25);
    });

    it('treats page < 1 as page 1 (returns 0 for page 0)', () => {
      expect(paginateSkip(0, 10)).toBe(0);
    });

    it('treats page < 1 as page 1 (returns 0 for page -5)', () => {
      expect(paginateSkip(-5, 10)).toBe(0);
    });

    it('handles page 1 with limit 5', () => {
      expect(paginateSkip(1, 5)).toBe(0);
    });

    it('handles page 4 with limit 20', () => {
      expect(paginateSkip(4, 20)).toBe(60);
    });
  });

  describe('toPaginatedResult', () => {
    it('returns the correct shape', () => {
      const data = ['a', 'b', 'c'];
      const result = toPaginatedResult(data, 30, 1, 10);
      expect(result).toEqual({
        data,
        total: 30,
        page: 1,
        limit: 10,
        totalPages: 3,
      });
    });

    it('computes totalPages correctly with partial last page', () => {
      const result = toPaginatedResult([], 21, 1, 10);
      expect(result.totalPages).toBe(3);
    });

    it('computes totalPages = 1 when total equals limit', () => {
      const result = toPaginatedResult([], 10, 1, 10);
      expect(result.totalPages).toBe(1);
    });

    it('handles total = 0: returns totalPages = 1', () => {
      const result = toPaginatedResult([], 0, 1, 10);
      expect(result.totalPages).toBe(1);
      expect(result.total).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('passes through page and limit without modification', () => {
      const result = toPaginatedResult([], 100, 5, 20);
      expect(result.page).toBe(5);
      expect(result.limit).toBe(20);
    });

    it('correctly computes totalPages for limit 25', () => {
      const result = toPaginatedResult([], 50, 1, 25);
      expect(result.totalPages).toBe(2);
    });

    it('returns data array exactly as provided', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = toPaginatedResult(data, 2, 1, 10);
      expect(result.data).toBe(data);
    });
  });
});
