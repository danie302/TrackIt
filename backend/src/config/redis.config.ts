import { ConfigService } from '@nestjs/config';
import { CacheModuleAsyncOptions, Cache } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

export const getRedisConfig = (): CacheModuleAsyncOptions => ({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const host = configService.get<string>('REDIS_HOST', 'localhost');
    const port = configService.get<number>('REDIS_PORT', 6379);
    const password = configService.get<string>('REDIS_PASSWORD', '');
    const ttl = configService.get<number>('REDIS_TTL', 3600) * 1000;

    const redisUrl = password
      ? `redis://:${password}@${host}:${port}`
      : `redis://${host}:${port}`;

    return {
      stores: [createKeyv(redisUrl)],
      ttl,
    };
  },
});
