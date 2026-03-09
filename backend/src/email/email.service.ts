import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface OrderEmailContext {
  orderId: string;
  orderType: 'Standard' | 'Devolution';
  itemCount: number;
  companyName?: string;
  rejectionReason?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    this.fromAddress = this.config.get<string>('SMTP_FROM') ?? 'noreply@trackit.com';
    this.configured = !!host;
  }

  onModuleInit() {
    if (!this.configured) {
      this.logger.warn('SMTP not configured — emails will be logged to console only');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT') ?? 587,
      secure: (this.config.get<number>('SMTP_PORT') ?? 587) === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
    }
  }

  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const subject = 'TrackIt — Password Reset Code';
    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#1565C0">Password Reset</h2>
        <p>Use the code below to reset your TrackIt password. It expires in <strong>15 minutes</strong>.</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1565C0;padding:16px;background:#f0f4ff;border-radius:8px;text-align:center">
          ${otp}
        </div>
        <p style="color:#666;font-size:13px;margin-top:24px">If you did not request this, ignore this email.</p>
      </div>
    `;
    await this.send(email, subject, html);
  }

  async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
    const subject = 'Welcome to TrackIt';
    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#1565C0">Welcome to TrackIt, ${name}!</h2>
        <p>Your account has been created with the role of <strong>${role}</strong>.</p>
        <p>You can now log in and start managing your inventory.</p>
        <p style="color:#666;font-size:13px;margin-top:24px">If you have any questions, contact your company administrator.</p>
      </div>
    `;
    await this.send(email, subject, html);
  }

  async sendUserDeactivationEmail(email: string, name: string): Promise<void> {
    const subject = 'TrackIt — Account Deactivated';
    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#c62828">Account Deactivated</h2>
        <p>Hi ${name},</p>
        <p>Your TrackIt account has been deactivated. You will no longer be able to log in.</p>
        <p>Contact your company administrator if you believe this is a mistake.</p>
      </div>
    `;
    await this.send(email, subject, html);
  }

  async sendOrderApprovedEmail(email: string, ctx: OrderEmailContext): Promise<void> {
    const label = ctx.orderType === 'Devolution' ? 'Devolution Request' : 'Order Request';
    const subject = `TrackIt — ${label} Approved`;
    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#2e7d32">${label} Approved</h2>
        <p>Your ${label.toLowerCase()} has been <strong>approved</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#555">Order ID</td><td style="padding:8px"><code>${ctx.orderId}</code></td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#555">Items</td><td style="padding:8px">${ctx.itemCount}</td></tr>
          ${ctx.companyName ? `<tr><td style="padding:8px;color:#555">Company</td><td style="padding:8px">${ctx.companyName}</td></tr>` : ''}
        </table>
        <p>The items have been transferred to your inventory.</p>
      </div>
    `;
    await this.send(email, subject, html);
  }

  async sendOrderRejectedEmail(email: string, ctx: OrderEmailContext): Promise<void> {
    const label = ctx.orderType === 'Devolution' ? 'Devolution Request' : 'Order Request';
    const subject = `TrackIt — ${label} Rejected`;
    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#c62828">${label} Rejected</h2>
        <p>Your ${label.toLowerCase()} has been <strong>rejected</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#555">Order ID</td><td style="padding:8px"><code>${ctx.orderId}</code></td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#555">Items</td><td style="padding:8px">${ctx.itemCount}</td></tr>
          ${ctx.rejectionReason ? `<tr><td style="padding:8px;color:#555">Reason</td><td style="padding:8px">${ctx.rejectionReason}</td></tr>` : ''}
        </table>
        <p>Contact your company administrator for more information.</p>
      </div>
    `;
    await this.send(email, subject, html);
  }
}
