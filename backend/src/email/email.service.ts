import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    // Stub: log OTP until Phase 4 email is implemented
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(`[EmailService] Password reset OTP for ${email}: ${otp}`);
    }
  }
}
