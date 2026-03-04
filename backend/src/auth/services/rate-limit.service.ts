import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

const RATE_LIMIT_PREFIX = 'rate_limit:';
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class RateLimitService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async checkRateLimit(email: string, action: string): Promise<void> {
    const key = `${RATE_LIMIT_PREFIX}${action}:${email.trim().toLowerCase()}`;
    const raw = await this.cache.get<string>(key);
    const attempts = raw ? parseInt(raw, 10) : 0;
    if (attempts >= MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.cache.set(key, String(attempts + 1), WINDOW_MS);
  }

  async resetRateLimit(email: string, action: string): Promise<void> {
    const key = `${RATE_LIMIT_PREFIX}${action}:${email.trim().toLowerCase()}`;
    await this.cache.del(key);
  }
}
