# Story 11.1-001: Employer Dashboard

## Metadata
- **Category**: Frontend - Employer Screens
- **Priority**: High
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 10.1-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement Employer Dashboard by reusing CompanyAdmin Dashboard with Users tab hidden.

## Tasks
1. Reuse `CompanyAdmin/Dashboard.tsx` component
2. Add role-based conditional rendering to hide Users tab
3. Ensure Inventories and Resellers tabs visible
4. Apply role-based permissions in routing
5. Test with Employer user

## Acceptance Criteria
- Employer sees only Inventories and Resellers tabs
- Cannot access Users management
- All other functionality same as CompanyAdmin

## Technical Notes
Already implemented in Story 10.1-001 with role check:
```typescript
const isEmployer = user?.role === 'Employer';
{!isEmployer && <Tab label="Users" />}
```

## Testing Requirements
- E2E test: Employer cannot access Users tab

## Related Files
- `src/pages/CompanyAdmin/Dashboard.tsx` (reuse)

## Notes
- No separate component needed; already handled
