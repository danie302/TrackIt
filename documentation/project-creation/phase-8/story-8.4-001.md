# Story 8.4-001: Reset Password Screen

## Metadata
- **Category:** Frontend Auth
- **Priority:** Medium
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 8.3-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement reset password screen with OTP and new password inputs.

## Tasks
1. Create ResetPasswordPage component
2. OTP input (6 digits)
3. New password input with validation
4. Confirm password input
5. Call reset password API
6. Handle expired OTP
7. Redirect to login on success

## Acceptance Criteria
- OTP validation (6 digits)
- Password complexity validated
- Expired OTP handled
- Success redirects to login

## Related Files
- `src/pages/Auth/ResetPasswordPage.tsx` (create)
