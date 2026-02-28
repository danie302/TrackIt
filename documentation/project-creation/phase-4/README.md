# Phase 4: Core Backend — Email & Notifications

## Overview
This phase implements email service for system notifications using Nodemailer.

**Total Stories:** 3  
**Estimated Effort:** ~10 hours  
**Status:** Not Started  
**Prerequisites:** Phases 0-3 must be completed

---

## Stories

### Story 4.1-001: Configure Nodemailer and Email Templates
**Priority:** High | **Effort:** 4 hours | **Dependencies:** 0.1-002  
Set up Nodemailer with SMTP configuration and create email template structure.

**Key Tasks:**
- Install and configure Nodemailer
- Set up SMTP configuration from environment variables
- Create email templates directory structure
- Create base email layout (HTML + plain text)
- Configure email queue (optional, with Redis/Bull)
- Add email sending error handling
- Create email service module

**Email Templates Needed:**
- Order approved notification
- Order rejected notification  
- Devolution approved notification
- Devolution rejected notification
- Password reset OTP
- Welcome email for new users
- User deactivation notice

**Acceptance Criteria:**
- Nodemailer connects to SMTP server successfully
- Email templates compile correctly
- HTML and plain text versions are generated
- Email queue is configured (if using queue)
- Connection errors are handled gracefully

---

### Story 4.2-001: Implement Email Notification Service
**Priority:** High | **Effort:** 4 hours | **Dependencies:** 4.1-001, 3.6-001  
Create notification service to send emails for various system events.

**Key Methods:**
- sendOrderApprovalEmail()
- sendOrderRejectionEmail()
- sendDevolutionApprovalEmail()
- sendDevolutionRejectionEmail()
- sendPasswordResetEmail()
- sendWelcomeEmail()
- sendUserDeactivationEmail()

**Key Tasks:**
- Create notification service
- Implement email sending for each event type
- Add template variable injection
- Handle sending failures with retry logic
- Log all email activity
- Add rate limiting to prevent spam
- Create unit tests

**Acceptance Criteria:**
- All notification types send correctly
- Template variables are properly injected
- Failed sends are retried (up to 3 times)
- Email activity is logged
- Unit tests cover all notification methods

---

### Story 4.3-001: Integrate Email Notifications with Order Service
**Priority:** High | **Effort:** 2 hours | **Dependencies:** 4.2-001, 3.6-001  
Integrate email notifications into order approval/rejection workflow.

**Key Tasks:**
- Add email sending to order approval logic
- Add email sending to order rejection logic
- Add email sending to devolution approval logic
- Add email sending to devolution rejection logic
- Handle email failures gracefully (don't block order processing)
- Add integration tests

**Acceptance Criteria:**
- Emails are sent asynchronously (non-blocking)
- Order processing completes even if email fails
- Email failures are logged but don't cause order failures
- Integration tests verify email sending

---

## Progress Tracking

| Story ID | Title | Status | Assignee | Progress |
|----------|-------|--------|----------|----------|
| 4.1-001 | Email Configuration | Not Started | TBD | 0% |
| 4.2-001 | Notification Service | Not Started | TBD | 0% |
| 4.3-001 | Order Integration | Not Started | TBD | 0% |

---

## Dependencies Graph

```
0.1-002 (Backend) ──→ 4.1-001 (Email Config) ──→ 4.2-001 (Notification Service) ──→ 4.3-001 (Order Integration)
                                                                                      ↑
3.6-001 (Order Service) ─────────────────────────────────────────────────────────────┘
```

---

## Definition of Done

For Phase 4 to be considered complete:
- [ ] Nodemailer is configured and working
- [ ] All email templates are created
- [ ] Notification service sends all email types
- [ ] Email sending is integrated with order workflow
- [ ] Email failures don't block order processing
- [ ] Email activity is logged
- [ ] Unit and integration tests pass

---

## Technical Notes

### SMTP Configuration
Use environment variables:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

### Email Template Variables
- Order emails: order ID, items list, reseller name, company name, status, reason (if rejected)
- Password reset: OTP code, expiration time, user name
- Welcome email: user name, role, company name
- Deactivation: user name, deactivation reason

### Error Handling
- Use try-catch for all email sends
- Log failures to database/file
- Don't throw errors that would block business logic
- Implement retry with exponential backoff

---

## Notes
- Consider using email queue (Bull + Redis) for better reliability
- Email sending should be asynchronous to not block HTTP responses
- Test with actual SMTP server (e.g., Gmail, SendGrid, Mailtrap for dev)
- In production, consider transactional email service (SendGrid, Mailgun, AWS SES)
