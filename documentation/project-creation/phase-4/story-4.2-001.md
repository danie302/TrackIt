# Story 4.2-001: Implement Email Notification Service

## Metadata
- **Category:** Email & Notifications
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 4.1-001, Story 3.6-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement comprehensive email notification service with all required methods, retry logic, activity logging, and rate limiting to prevent spam.

## Tasks
1. Create EmailService with Nodemailer integration
2. Implement sendOrderApprovalEmail()
3. Implement sendOrderRejectionEmail()
4. Implement sendDevolutionApprovalEmail()
5. Implement sendDevolutionRejectionEmail()
6. Implement sendPasswordResetEmail()
7. Implement sendWelcomeEmail()
8. Implement sendUserDeactivationEmail()
9. Add retry logic (up to 3 attempts)
10. Add email activity logging
11. Add rate limiting
12. Write unit and integration tests

## Acceptance Criteria
- All 7 email methods implemented
- Template variable injection works
- Retry logic handles failures (max 3 attempts)
- Email activity logged to database
- Rate limiting prevents spam
- Both HTML and plain text versions sent
- Proper error handling
- Async/non-blocking execution

## Technical Notes

### Email Service Implementation
```typescript
// email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailLog } from './schemas/email-log.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly MAX_RETRIES = 3;

  constructor(
    private mailerService: MailerService,
    @InjectModel(EmailLog.name) private emailLogModel: Model<EmailLog>,
  ) {}

  async sendOrderApprovalEmail(order: any, reseller: any): Promise<void> {
    const context = {
      resellerName: `${reseller.firstName} ${reseller.lastName}`,
      companyName: order.companyName,
      orderId: order.id,
      orderType: order.orderType,
      itemCount: order.items.length,
      approvalDate: new Date(order.approvalDate).toLocaleDateString(),
      orderUrl: `${process.env.APP_URL}/orders/${order.id}`,
    };

    await this.sendEmailWithRetry({
      to: reseller.email,
      subject: 'Order Approved - TrackIt',
      template: 'order-approved',
      context,
    });
  }

  async sendOrderRejectionEmail(order: any, reseller: any, reason: string): Promise<void> {
    const context = {
      resellerName: `${reseller.firstName} ${reseller.lastName}`,
      companyName: order.companyName,
      orderId: order.id,
      orderType: order.orderType,
      rejectionReason: reason,
      rejectionDate: new Date(order.approvalDate).toLocaleDateString(),
      orderUrl: `${process.env.APP_URL}/orders/${order.id}`,
    };

    await this.sendEmailWithRetry({
      to: reseller.email,
      subject: 'Order Rejected - TrackIt',
      template: 'order-rejected',
      context,
    });
  }

  async sendDevolutionApprovalEmail(order: any, reseller: any): Promise<void> {
    const context = {
      resellerName: `${reseller.firstName} ${reseller.lastName}`,
      companyName: order.companyName,
      orderId: order.id,
      itemCount: order.items.length,
      approvalDate: new Date(order.approvalDate).toLocaleDateString(),
      orderUrl: `${process.env.APP_URL}/orders/${order.id}`,
    };

    await this.sendEmailWithRetry({
      to: reseller.email,
      subject: 'Devolution Request Approved - TrackIt',
      template: 'devolution-approved',
      context,
    });
  }

  async sendDevolutionRejectionEmail(order: any, reseller: any, reason: string): Promise<void> {
    const context = {
      resellerName: `${reseller.firstName} ${reseller.lastName}`,
      companyName: order.companyName,
      orderId: order.id,
      rejectionReason: reason,
      rejectionDate: new Date(order.approvalDate).toLocaleDateString(),
      orderUrl: `${process.env.APP_URL}/orders/${order.id}`,
    };

    await this.sendEmailWithRetry({
      to: reseller.email,
      subject: 'Devolution Request Rejected - TrackIt',
      template: 'devolution-rejected',
      context,
    });
  }

  async sendPasswordResetEmail(email: string, otp: string, userName: string): Promise<void> {
    const context = {
      userName,
      otp,
    };

    await this.sendEmailWithRetry({
      to: email,
      subject: 'Password Reset Request - TrackIt',
      template: 'password-reset',
      context,
    });
  }

  async sendWelcomeEmail(user: any, companyName: string): Promise<void> {
    const context = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      companyName,
      loginUrl: `${process.env.APP_URL}/login`,
    };

    await this.sendEmailWithRetry({
      to: user.email,
      subject: 'Welcome to TrackIt!',
      template: 'welcome',
      context,
    });
  }

  async sendUserDeactivationEmail(user: any): Promise<void> {
    const context = {
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };

    await this.sendEmailWithRetry({
      to: user.email,
      subject: 'Account Deactivated - TrackIt',
      template: 'user-deactivation',
      context,
    });
  }

  private async sendEmailWithRetry(options: any, attempt: number = 1): Promise<void> {
    try {
      await this.mailerService.sendMail(options);
      
      await this.logEmailActivity({
        to: options.to,
        subject: options.subject,
        template: options.template,
        status: 'sent',
        attemptCount: attempt,
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Email send failed (attempt ${attempt}/${this.MAX_RETRIES}):`, error);

      if (attempt < this.MAX_RETRIES) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendEmailWithRetry(options, attempt + 1);
      }

      await this.logEmailActivity({
        to: options.to,
        subject: options.subject,
        template: options.template,
        status: 'failed',
        attemptCount: attempt,
        error: error.message,
      });

      // Don't throw error - email failures should not break the main flow
      this.logger.error(`Email send failed after ${this.MAX_RETRIES} attempts`);
    }
  }

  private async logEmailActivity(data: any): Promise<void> {
    try {
      const emailLog = new this.emailLogModel({
        ...data,
        sentAt: new Date(),
      });
      await emailLog.save();
    } catch (error) {
      this.logger.error('Failed to log email activity:', error);
    }
  }

  async checkRateLimit(email: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEmails = await this.emailLogModel.countDocuments({
      to: email,
      sentAt: { $gte: oneHourAgo },
    }).exec();

    return recentEmails < 10; // Max 10 emails per hour per recipient
  }
}
```

### Email Log Schema
```typescript
// email/schemas/email-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmailLog extends Document {
  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  template: string;

  @Prop({ required: true, enum: ['sent', 'failed'] })
  status: string;

  @Prop({ required: true })
  attemptCount: number;

  @Prop()
  error?: string;

  @Prop({ required: true })
  sentAt: Date;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
```

### Order Rejected Template
```handlebars
<!-- templates/order-rejected.hbs -->
<h2>Order Rejected</h2>
<p>Hello {{resellerName}},</p>
<p>Unfortunately, your order request has been rejected by {{companyName}}.</p>

<h3>Order Details:</h3>
<ul>
  <li><strong>Order ID:</strong> {{orderId}}</li>
  <li><strong>Order Type:</strong> {{orderType}}</li>
  <li><strong>Rejection Date:</strong> {{rejectionDate}}</li>
</ul>

<h3>Reason for Rejection:</h3>
<p style="padding: 15px; background-color: #f0f0f0; border-left: 4px solid #ff5722;">
  {{rejectionReason}}
</p>

<p>If you have any questions, please contact {{companyName}} directly.</p>

<a href="{{orderUrl}}" class="button">View Order Details</a>
```

## Testing Requirements
- Test all 7 email methods
- Test retry logic with simulated failures
- Test exponential backoff delays
- Test email logging
- Test rate limiting
- Test with invalid SMTP credentials
- Test HTML and plain text rendering
- Test async execution (non-blocking)

## Documentation Requirements
- Document all email methods
- Document retry logic and backoff strategy
- Document rate limiting rules
- Document email logging structure
- Add troubleshooting guide

## Related Files
- `src/email/email.service.ts` (create)
- `src/email/schemas/email-log.schema.ts` (create)
- `src/email/templates/order-rejected.hbs` (create)
- `src/email/templates/devolution-approved.hbs` (create)
- `src/email/templates/devolution-rejected.hbs` (create)
- `src/email/templates/user-deactivation.hbs` (create)

## Notes
- Email sending is async and non-blocking
- Failures don't break the main application flow
- Rate limiting prevents abuse
- Exponential backoff: 2s, 4s, 8s
- Consider using Bull queue for better performance
- Email logs useful for debugging and compliance
