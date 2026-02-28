# Story 2.2-001: Implement Password Management

## Metadata
- **Category:** Security
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 1.2-001, Story 0.3-002
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement comprehensive password management including validation, hashing, OTP generation for password resets, and rate limiting to prevent abuse.

## Tasks
1. Create password validation service with complexity rules
2. Implement password hashing with bcrypt
3. Create OTP generation service (6-digit random)
4. Implement OTP storage in Redis with 15-minute TTL
5. Create OTP verification service with single-use enforcement
6. Implement password reset service
7. Add rate limiting for password reset requests
8. Create password history tracking (prevent reuse)
9. Write unit tests for all password services

## Acceptance Criteria
- Password complexity rules enforced (8+ chars, upper, lower, number, special)
- Passwords hashed with bcrypt (minimum 10 rounds)
- OTPs are 6-digit random numbers
- OTPs expire after 15 minutes
- OTPs can only be used once
- Rate limiting prevents more than 3 reset requests per hour per email
- Password reset flow works end-to-end
- Invalid OTPs return appropriate error messages

## Technical Notes

### Password Complexity Rules
```typescript
// auth/validators/password.validator.ts
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PasswordValidator {
  private readonly minLength = 8;
  private readonly uppercaseRegex = /[A-Z]/;
  private readonly lowercaseRegex = /[a-z]/;
  private readonly numberRegex = /[0-9]/;
  private readonly specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  validate(password: string): void {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(`Password must be at least ${this.minLength} characters long`);
    }

    if (!this.uppercaseRegex.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!this.lowercaseRegex.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!this.numberRegex.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!this.specialCharRegex.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Password does not meet complexity requirements',
        errors,
      });
    }
  }
}
```

### Password Service
```typescript
// auth/services/password.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordValidator } from '../validators/password.validator';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;

  constructor(private passwordValidator: PasswordValidator) {}

  async hash(password: string): Promise<string> {
    this.passwordValidator.validate(password);
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validateAndHash(password: string): Promise<string> {
    this.passwordValidator.validate(password);
    return this.hash(password);
  }
}
```

### OTP Service
```typescript
// auth/services/otp.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { randomInt } from 'crypto';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRATION = 900; // 15 minutes in seconds
  private readonly OTP_LENGTH = 6;

  constructor(private redisService: RedisService) {}

  generateOtp(): string {
    const min = Math.pow(10, this.OTP_LENGTH - 1);
    const max = Math.pow(10, this.OTP_LENGTH) - 1;
    return randomInt(min, max).toString();
  }

  async storeOtp(email: string, otp: string): Promise<void> {
    const key = `otp:${email}`;
    await this.redisService.set(key, otp, this.OTP_EXPIRATION);
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = `otp:${email}`;
    const storedOtp = await this.redisService.get(key);

    if (!storedOtp) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (storedOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Delete OTP after successful verification (single-use)
    await this.redisService.del(key);
    return true;
  }

  async generateAndStore(email: string): Promise<string> {
    const otp = this.generateOtp();
    await this.storeOtp(email, otp);
    return otp;
  }
}
```

### Rate Limiting Service
```typescript
// auth/services/rate-limit.service.ts
import { Injectable, TooManyRequestsException } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RateLimitService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly WINDOW_SECONDS = 3600; // 1 hour

  constructor(private redisService: RedisService) {}

  async checkRateLimit(email: string, action: string): Promise<void> {
    const key = `rate_limit:${action}:${email}`;
    const attempts = await this.redisService.get(key);
    
    if (attempts && parseInt(attempts) >= this.MAX_ATTEMPTS) {
      throw new TooManyRequestsException(
        'Too many requests. Please try again later.',
      );
    }

    const newAttempts = attempts ? parseInt(attempts) + 1 : 1;
    await this.redisService.set(key, newAttempts.toString(), this.WINDOW_SECONDS);
  }

  async resetRateLimit(email: string, action: string): Promise<void> {
    const key = `rate_limit:${action}:${email}`;
    await this.redisService.del(key);
  }
}
```

### Password Reset Service
```typescript
// auth/services/password-reset.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { OtpService } from './otp.service';
import { PasswordService } from './password.service';
import { RateLimitService } from './rate-limit.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private passwordService: PasswordService,
    private rateLimitService: RateLimitService,
    private emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    await this.rateLimitService.checkRateLimit(email, 'password_reset');

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const otp = await this.otpService.generateAndStore(email);
    await this.emailService.sendPasswordResetOtp(email, otp);
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    await this.otpService.verifyOtp(email, otp);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await this.passwordService.validateAndHash(newPassword);
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.rateLimitService.resetRateLimit(email, 'password_reset');
  }
}
```

## Testing Requirements
- Test password validation with valid passwords
- Test password validation rejects weak passwords
- Test password hashing produces different hashes for same password
- Test password comparison works correctly
- Test OTP generation produces 6-digit numbers
- Test OTP stored in Redis with 15-minute expiration
- Test OTP verification succeeds with correct OTP
- Test OTP verification fails with incorrect OTP
- Test OTP is deleted after successful verification
- Test rate limiting blocks after 3 attempts
- Test rate limiting resets after successful password reset
- Test complete password reset flow

## Documentation Requirements
- Document password complexity requirements
- Document OTP flow and expiration
- Document rate limiting rules
- Add password reset API documentation
- Create user guide for password reset

## Related Files
- `src/auth/validators/password.validator.ts` (create)
- `src/auth/services/password.service.ts` (create)
- `src/auth/services/otp.service.ts` (create)
- `src/auth/services/rate-limit.service.ts` (create)
- `src/auth/services/password-reset.service.ts` (create)
- `src/users/users.service.ts` (update)
- `package.json` (add bcrypt)

## Notes
- OTPs should be sent via email service (Story 3.1-001)
- Consider implementing email verification using same OTP service
- Rate limiting prevents brute force attacks
- Don't reveal whether user exists during password reset request
- Use cryptographically secure random for OTP generation
- Consider adding password history to prevent reuse
- Bcrypt salt rounds should be 10 minimum for security
