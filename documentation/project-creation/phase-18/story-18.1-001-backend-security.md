# Story 18.1-001: Backend Security

## Metadata
- **Category**: Backend - Security
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 0.1-001
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Harden backend security with Helmet, CORS, rate limiting, and input sanitization.

## Tasks
1. Install and configure helmet for security headers
2. Configure CORS with whitelist
3. Implement rate limiting with express-rate-limit
4. Add input sanitization/validation
5. Enable HTTPS in production
6. Add CSRF protection
7. Configure secure session cookies
8. Implement request validation with class-validator

## Acceptance Criteria
- Helmet configured with all headers
- CORS restricted to whitelisted domains
- Rate limiting active (100 req/15min per IP)
- All inputs sanitized
- HTTPS enforced in production
- CSRF protection enabled

## Technical Notes
```typescript
// main.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

## Related Files
- `src/main.ts` (add security middleware)
