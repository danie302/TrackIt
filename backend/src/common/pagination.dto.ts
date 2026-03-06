import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

const ALLOWED_LIMITS = [5, 10, 20, 25] as const;
const DEFAULT_LIMIT = 10;

export function normalizeLimit(limit?: number): number {
  if (limit == null) return DEFAULT_LIMIT;
  const n = Number(limit);
  if (ALLOWED_LIMITS.includes(n as (typeof ALLOWED_LIMITS)[number])) return n;
  return DEFAULT_LIMIT;
}

export function paginateSkip(page: number, limit: number): number {
  const p = Math.max(1, page);
  return (p - 1) * limit;
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(25)
  limit?: number = DEFAULT_LIMIT;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit) || 1;
  return { data, total, page, limit, totalPages };
}
