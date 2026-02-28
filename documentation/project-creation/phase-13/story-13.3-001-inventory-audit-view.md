# Story 13.3-001: Inventory Audit View

## Metadata
- **Category**: Frontend - Audit Screens
- **Priority**: Medium
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 13.1-001, Story 10.4-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Display audit trail for inventories including whitelist changes.

## Tasks
1. Add "Audit" tab to Inventory Details screen
2. Integrate AuditHistory component with entityType='Inventory'
3. Show creation, updates, whitelist changes
4. Display item additions/removals

## Acceptance Criteria
- Inventory audit visible from inventory details
- Whitelist changes clearly displayed
- All inventory actions logged

## Technical Notes
```typescript
// In InventoryDetails component
<Tab label="Audit" />
{tabIndex === 2 && <AuditHistory entityType="Inventory" entityId={inventoryId} />}
```

## Related Files
- Modify Inventory Details component to add audit tab
