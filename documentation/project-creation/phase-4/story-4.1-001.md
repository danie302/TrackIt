# Story 4.1-001: Configure Nodemailer and Email Templates

## Metadata
- **Category:** Email & Notifications
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 0.1-002
- **Assignee:** TBD
- **Status:** Not Started

## Description
Set up Nodemailer with SMTP configuration and create comprehensive email template system with HTML and plain text versions. Optionally configure email queue with Bull and Redis.

## Tasks
1. Install Nodemailer and related packages
2. Create email module with SMTP configuration
3. Create email templates directory structure
4. Create base email layout (HTML + plain text)
5. Create order approved notification template
6. Create order rejected notification template
7. Create devolution approved notification template
8. Create devolution rejected notification template
9. Create password reset OTP template
10. Create welcome email template
11. Create user deactivation notice template
12. (Optional) Configure Bull queue for async email sending

## Acceptance Criteria
- Nodemailer configured with SMTP settings
- All 7 email templates created (HTML + plain text)
- Templates support variable injection
- Base layout ensures consistent branding
- Email configuration from environment variables
- Template rendering works correctly
- Optional: Email queue configured with Bull + Redis

## Technical Notes

### Package Installation
```bash
npm install nodemailer
npm install @nestjs-modules/mailer nodemailer handlebars
npm install -D @types/nodemailer
# Optional for queue
npm install @nestjs/bull bull
```

### Environment Variables
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@trackit.com
SMTP_FROM_NAME=TrackIt System
```

### Email Module Configuration
```typescript
// email/email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT'),
          secure: configService.get('SMTP_SECURE') === 'true',
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: `"${configService.get('SMTP_FROM_NAME')}" <${configService.get('SMTP_FROM_EMAIL')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
```

### Directory Structure
```
src/email/
├── email.module.ts
├── email.service.ts
└── templates/
    ├── layouts/
    │   └── base.hbs
    ├── order-approved.hbs
    ├── order-rejected.hbs
    ├── devolution-approved.hbs
    ├── devolution-rejected.hbs
    ├── password-reset.hbs
    ├── welcome.hbs
    └── user-deactivation.hbs
```

### Base Layout Template
```handlebars
<!-- templates/layouts/base.hbs -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #777;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>TrackIt Inventory Management</h1>
  </div>
  <div class="content">
    {{{body}}}
  </div>
  <div class="footer">
    <p>&copy; 2026 TrackIt. All rights reserved.</p>
    <p>This is an automated email. Please do not reply.</p>
  </div>
</body>
</html>
```

### Order Approved Template
```handlebars
<!-- templates/order-approved.hbs -->
<h2>Order Approved!</h2>
<p>Hello {{resellerName}},</p>
<p>Your order request has been approved by {{companyName}}.</p>

<h3>Order Details:</h3>
<ul>
  <li><strong>Order ID:</strong> {{orderId}}</li>
  <li><strong>Order Type:</strong> {{orderType}}</li>
  <li><strong>Items Count:</strong> {{itemCount}}</li>
  <li><strong>Approval Date:</strong> {{approvalDate}}</li>
</ul>

<p>The requested items have been transferred to your inventory.</p>

<a href="{{orderUrl}}" class="button">View Order Details</a>

<p>Thank you for your business!</p>
```

### Password Reset Template
```handlebars
<!-- templates/password-reset.hbs -->
<h2>Password Reset Request</h2>
<p>Hello {{userName}},</p>
<p>We received a request to reset your password.</p>

<p>Your password reset code is:</p>
<h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background-color: #f0f0f0;">{{otp}}</h1>

<p>This code will expire in 15 minutes.</p>
<p>If you didn't request this, please ignore this email.</p>
```

### Welcome Email Template
```handlebars
<!-- templates/welcome.hbs -->
<h2>Welcome to TrackIt!</h2>
<p>Hello {{firstName}} {{lastName}},</p>
<p>Your account has been created successfully.</p>

<h3>Account Details:</h3>
<ul>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Role:</strong> {{role}}</li>
  <li><strong>Company:</strong> {{companyName}}</li>
</ul>

<p>You can now log in to the system and start managing your inventory.</p>

<a href="{{loginUrl}}" class="button">Login Now</a>

<p>If you have any questions, please contact your administrator.</p>
```

## Testing Requirements
- Test SMTP connection
- Test template rendering with variables
- Test HTML and plain text versions
- Test all 7 email templates
- Test email sending (use Mailtrap or similar for testing)
- Test error handling for failed sends

## Documentation Requirements
- Document SMTP setup instructions
- Document template variables for each email type
- Document how to add new templates
- Add examples of email customization

## Related Files
- `src/email/email.module.ts` (create)
- `src/email/email.service.ts` (create)
- `src/email/templates/*.hbs` (create)
- `.env` (add SMTP variables)
- `package.json` (add dependencies)

## Notes
- Use app-specific passwords for Gmail
- For development, use Mailtrap or Ethereal Email
- For production, use SendGrid, AWS SES, or similar
- Templates should be mobile-responsive
- Consider adding email preview functionality
- Optional Bull queue improves performance for bulk emails
