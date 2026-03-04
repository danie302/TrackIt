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
    const hashedPassword =
      await this.passwordService.validateAndHash(newPassword);
    await this.usersService.updatePassword(String(user._id), hashedPassword);
    await this.rateLimitService.resetRateLimit(email, 'password_reset');
  }
}
