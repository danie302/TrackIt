# Story 11.2-001: Employer Inventory Management

## Metadata
- **Category**: Frontend - Employer Screens
- **Priority**: High
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 10.3-001, Story 10.4-001, Story 10.5-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Enable Employer to manage inventories and items with same UI as CompanyAdmin.

## Tasks
1. Reuse InventoryForm, InventoryDetails, ItemForm components
2. Verify backend authorization allows Employer role
3. Test all CRUD operations with Employer user
4. Ensure no additional UI changes needed

## Acceptance Criteria
- Employer can create/edit/delete inventories
- Employer can add/edit/delete items
- Employer can manage whitelist
- Same UI as CompanyAdmin

## Technical Notes
Backend authorization guards already implemented in Phase 2 and 5 to allow both CompanyAdmin and Employer roles for inventory/item operations.

## Testing Requirements
- E2E test: Employer manages inventories and items

## Related Files
- All CompanyAdmin inventory/item components (reuse)

## Notes
- No code changes needed; backend already supports Employer role
- Focus testing on authorization
