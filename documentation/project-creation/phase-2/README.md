# Phase 2: Core Backend — Authentication & Authorization

## Overview
This phase implements secure authentication and role-based authorization for the Track It system.

**Total Stories:** 5  
**Estimated Effort:** ~23 hours  
**Status:** Complete  
**Prerequisites:** Phase 0 and Phase 1 must be completed

---

## Stories

### Story 2.1-001: Configure Auth.js with NestJS
**Priority:** Critical | **Effort:** 6 hours | **Dependencies:** 1.2-001, 0.3-002  
Integrate Auth.js with NestJS for JWT-based authentication with Redis session storage.

**Key Tasks:**
- Install Auth.js and JWT dependencies
- Create src/auth/auth.module.ts and related files
- Configure JWT strategy with secret from environment
- Set up token generation (access token 15min, refresh token 7 days)
- Configure Redis for refresh token storage
- Create JWT auth guard
- Create token refresh endpoint logic

**Acceptance Criteria:**
- JWT tokens are generated correctly
- Access tokens expire after 15 minutes
- Refresh tokens are stored in Redis
- Token validation works in guards

---

### Story 2.2-001: Implement Password Management System
**Priority:** Critical | **Effort:** 4 hours | **Dependencies:** 1.2-001, 0.3-002  
Implement secure password hashing, validation, and reset with OTP.

**Key Tasks:**
- Create password validation service with complexity rules (8+ chars, upper, lower, number, special)
- Implement bcrypt hashing in User model pre-save hook
- Create password comparison method
- Create OTP generation service (6-digit random)
- Store OTPs in Redis with 15-minute TTL
- Create OTP verification service
- Add rate limiting for password reset requests

**Acceptance Criteria:**
- Passwords meet complexity requirements
- Passwords are hashed with bcrypt (10 rounds)
- OTPs expire after 15 minutes
- OTPs are single-use only
- Password reset flow works end-to-end

---

### Story 2.3-001: Implement Authentication Endpoints
**Priority:** Critical | **Effort:** 5 hours | **Dependencies:** 2.1-001, 2.2-001  
Create all authentication-related API endpoints.

**Key Endpoints:**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/me

**Key Tasks:**
- Create endpoints with validation DTOs
- Add response DTOs for all endpoints
- Implement proper error handling
- Add request body validation
- Test all authentication flows

**Acceptance Criteria:**
- All endpoints return correct status codes
- Request bodies are validated
- Errors return consistent format
- Login returns access and refresh tokens
- OTP flow works correctly

---

### Story 2.4-001: Implement Authorization Guards and Decorators
**Priority:** Critical | **Effort:** 5 hours | **Dependencies:** 2.1-001, 1.2-001  
Create role-based access control system with guards and decorators.

**Key Tasks:**
- Create RoleGuard for role-based authorization
- Create OwnershipGuard for resource ownership validation
- Create CompanyGuard for company-scoped access
- Create @Roles() decorator
- Create @RequirePermissions() decorator
- Create @CurrentUser() decorator
- Implement permission checking logic
- Create guard unit tests

**Acceptance Criteria:**
- RoleGuard blocks users without required roles
- OwnershipGuard validates resource ownership
- CompanyGuard enforces company data isolation
- Decorators work correctly on controller methods
- Guards can be combined for complex authorization

---

### Story 2.5-001: Define Permission System and Role Matrix
**Priority:** High | **Effort:** 3 hours | **Dependencies:** 2.4-001  
Create comprehensive permission definitions for all roles.

**Key Tasks:**
- Create permission constants file
- Define Master Admin permissions (full system access)
- Define Company Admin permissions
- Define Employer permissions
- Define Reseller permissions
- Create permission validation service
- Create role hierarchy checker
- Document permission matrix in README

**Roles & Permissions:**
- **Master Admin**: Full system access
- **Company Admin**: Full company access + user management
- **Employer**: Inventory management + reseller creation (no user deactivation)
- **Reseller**: View whitelisted inventories + create orders

**Acceptance Criteria:**
- All permissions are clearly defined
- Role hierarchy is enforced
- Permission matrix is documented
- Helper functions validate permissions correctly

---

## Progress Tracking

| Story ID | Title | Status | Assignee | Progress |
|----------|-------|--------|----------|----------|
| 2.1-001 | Auth.js Integration | Complete | - | 100% |
| 2.2-001 | Password Management | Complete | - | 100% |
| 2.3-001 | Auth Endpoints | Complete | - | 100% |
| 2.4-001 | Authorization Guards | Complete | - | 100% |
| 2.5-001 | Permission System | Complete | - | 100% |

---

## Dependencies Graph

```
1.2-001 (User Schema) ──┬──→ 2.1-001 (Auth.js) ──┬──→ 2.3-001 (Auth Endpoints)
                        │                       │
0.3-002 (Redis) ────────┴──→ 2.2-001 (Password) ─┘
                        │
                        └──────────────────────────→ 2.4-001 (Guards) ──→ 2.5-001 (Permissions)
```

---

## Definition of Done

For Phase 2 to be considered complete:
- [x] All 5 stories are implemented and tested
- [x] Authentication endpoints are functional
- [x] JWT tokens are generated and validated correctly
- [x] Password reset with OTP works
- [x] Role-based authorization is enforced
- [x] Guards and decorators are tested
- [x] Permission matrix is documented
- [x] All authentication flows are secure
- [ ] Unit tests pass with >80% coverage (to be added in Phase 6)

---

## Security Considerations
- Use bcrypt with 10 rounds for password hashing
- JWT secrets must be strong and stored securely
- Refresh tokens must be invalidated on logout
- OTPs must be single-use and expire after 15 minutes
- Rate limit password reset requests to prevent abuse
- Implement CORS properly
- Use HTTPS in production

---

## Notes
- This is a critical security layer
- All subsequent phases depend on this authentication system
- Consider adding 2FA in future iterations
- Monitor for suspicious authentication attempts
