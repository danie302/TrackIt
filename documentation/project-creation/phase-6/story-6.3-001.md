# Story 6.3-001: E2E Tests

## Metadata
- **Category:** Testing
- **Priority:** Medium
- **Estimated Effort:** 6 hours
- **Dependencies:** Story 6.2-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement end-to-end tests for complete user journeys across all roles.

## Tasks
1. Master Admin creates company and users
2. Company Admin creates inventory and items
3. Reseller creates and gets approved order
4. Reseller creates devolution order
5. Test audit trail for all operations

## Test Scenarios
```typescript
describe('Complete User Journey', () => {
  it('Master Admin flow', async () => {
    // Login as Master Admin
    // Create company
    // Create Company Admin user
    // Verify audit records
  });

  it('Company Admin flow', async () => {
    // Login as Company Admin
    // Create inventory
    // Add items to inventory
    // Create reseller user
    // Add reseller to whitelist
  });

  it('Reseller Order flow', async () => {
    // Login as Reseller
    // View whitelisted inventories
    // Create standard order
    // Company Admin approves order
    // Verify items transferred
    // Check email sent
    // Verify audit trail
  });

  it('Devolution flow', async () => {
    // Reseller creates devolution order
    // Company Admin approves
    // Verify items returned
    // Check audit trail
  });
});
```

## Related Files
- `test/e2e/user-journeys.e2e-spec.ts` (create)
