# Story 13.1-001: Audit History Component

## Metadata
- **Category**: Frontend - Audit Screens
- **Priority**: Medium
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 7.5-001, Story 5.8-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Create reusable Audit History component for displaying audit trails across the app.

## Tasks
1. Create `src/components/AuditHistory.tsx` reusable component
2. Display timeline with action, user, timestamp, changes
3. Add filters: Date range, Action type, User
4. Implement pagination
5. Style as timeline/list view toggle
6. Accept props: entityId, entityType
7. Integrate with audit API

## Acceptance Criteria
- Component displays audit entries chronologically
- Filters work correctly
- Pagination functional
- Can switch between timeline and list views
- Reusable across different entity types

## Technical Notes
```typescript
// src/components/AuditHistory.tsx
interface AuditHistoryProps {
  entityType: 'Item' | 'Inventory' | 'OrderRequest';
  entityId: string;
}

export const AuditHistory = ({ entityType, entityId }: AuditHistoryProps) => {
  const { audits, fetchAudits } = useAuditStore();

  return (
    <Box>
      {audits.map(audit => (
        <Box key={audit._id} display="flex" alignItems="center" mb={2}>
          <Avatar>{audit.userId.name[0]}</Avatar>
          <Box ml={2}>
            <Typography>{audit.action} by {audit.userId.name}</Typography>
            <Typography variant="caption">{new Date(audit.createdAt).toLocaleString()}</Typography>
            {audit.changes && <pre>{JSON.stringify(audit.changes, null, 2)}</pre>}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Component renders audit entries
- Integration test: Fetches correct audit data

## Related Files
- `src/components/AuditHistory.tsx` (create)
- `src/stores/auditStore.ts` (update)
