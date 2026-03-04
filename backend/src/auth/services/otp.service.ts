import { Injectable, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { randomInt } from 'crypto';

const OTP_PREFIX = 'otp:';
const OTP_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes
const OTP_LENGTH = 6;

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  generateOtp(): string {
    const min = Math.pow(10, OTP_LENGTH - 1);
    const max = Math.pow(10, OTP_LENGTH) - 1;
    return randomInt(min, max + 1).toString();
  }

  async storeOtp(email: string, otp: string): Promise<void> {
    const key = `${OTP_PREFIX}${email.trim().toLowerCase()}`;
    await this.cache.set(key, otp, OTP_EXPIRATION_MS);
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = `${OTP_PREFIX}${email.trim().toLowerCase()}`;
    const stored = await this.cache.get<string>(key);
    if (!stored) {
      throw new BadRequestException('OTP expired or not found');
    }
    if (stored !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    await this.cache.del(key);
    return true;
  }

  async generateAndStore(email: string): Promise<string> {
    const otp = this.generateOtp();
    await this.storeOtp(email, otp);
    return otp;
  }
}
