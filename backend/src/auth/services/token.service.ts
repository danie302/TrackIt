import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiration: string;
  private readonly refreshExpiration: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
    this.accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      this.configService.get<string>('JWT_SECRET')!;
    this.refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.get<string>('JWT_SECRET')!;
    this.accessExpiration =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') ?? '15m';
    this.refreshExpiration =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') ?? '7d';
  }

  async generateTokens(userId: string, email: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiration as '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiration as '7d',
    });
    const key = `${REFRESH_TOKEN_PREFIX}${userId}`;
    await this.cache.set(key, refreshToken, REFRESH_TTL_MS);
    const expiresInMs =
      this.accessExpiration === '15m'
        ? 15 * 60 * 1000
        : parseInt(this.accessExpiration, 10) * 1000 || 900000;
    return { accessToken, refreshToken, expiresIn: expiresInMs };
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
      const key = `${REFRESH_TOKEN_PREFIX}${payload.sub}`;
      const stored = await this.cache.get<string>(key);
      if (stored !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.cache.del(`${REFRESH_TOKEN_PREFIX}${userId}`);
  }
}
