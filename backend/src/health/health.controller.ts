import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('mongodb', { timeout: 1500 }),
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.cacheManager.set('health_check', 'ok', 5000);
          const result = await this.cacheManager.get('health_check');
          return {
            redis: {
              status: result === 'ok' ? 'up' : 'down',
            },
          };
        } catch {
          return {
            redis: {
              status: 'down',
            },
          };
        }
      },
    ]);
  }
}
