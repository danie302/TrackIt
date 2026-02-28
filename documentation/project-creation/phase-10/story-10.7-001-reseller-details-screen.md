# Story 10.7-001: Reseller Details Screen

## Metadata
- **Category**: Frontend - Company Admin Screens
- **Priority**: Medium
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 10.1-001, Story 5.3-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement reseller details screen showing reseller info, assigned items, and audit history.

## Tasks
1. Create `src/pages/CompanyAdmin/ResellerDetails.tsx`
2. Display reseller info: Name, Email, Company, Status, Created Date
3. Add "Assigned Items" section with table
4. Show items table: Serial, Name, Inventory, Assigned Date, Status
5. Add "Audit History" section showing reseller actions
6. Implement pagination for items and audit
7. Add filter for item status
8. Integrate with user and audit API endpoints
9. Add loading and error states
10. Style with Material UI
11. Add breadcrumb navigation

## Acceptance Criteria
- Reseller details displayed correctly
- Assigned items table shows all items for reseller
- Audit history shows all reseller actions
- Pagination works for items and audit
- Filter works for item status
- Loading and error states handled
- Breadcrumb navigation works

## Technical Notes
```typescript
// src/pages/CompanyAdmin/ResellerDetails.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Table, TablePagination, Chip } from '@mui/material';
import { useUserStore } from '../../stores/userStore';
import { useItemStore } from '../../stores/itemStore';
import { useAuditStore } from '../../stores/auditStore';

export const ResellerDetails = () => {
  const { id } = useParams();
  const { user, fetchUserById } = useUserStore();
  const { items, fetchItemsByUser } = useItemStore();
  const { audits, fetchAuditsByUser } = useAuditStore();

  useEffect(() => {
    fetchUserById(id);
    fetchItemsByUser(id);
    fetchAuditsByUser(id);
  }, [id]);

  return (
    <Box p={3}>
      <Typography variant="h4">{user?.name}</Typography>
      <Typography>Email: {user?.email}</Typography>
      <Chip label={user?.isActive ? 'Active' : 'Inactive'} />

      <Typography variant="h5" mt={3}>Assigned Items</Typography>
      <Table>
        {/* Items table */}
      </Table>

      <Typography variant="h5" mt={3}>Audit History</Typography>
      <Table>
        {/* Audit table */}
      </Table>
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Reseller details render
- Integration test: Fetch reseller data
- E2E test: CompanyAdmin views reseller details

## Related Files
- `src/pages/CompanyAdmin/ResellerDetails.tsx` (create)
- `src/stores/userStore.ts` (update)
- `src/stores/itemStore.ts` (update)
- `src/stores/auditStore.ts` (update)

## Notes
- Consider adding "Send Message" feature to reseller
- Show order history in addition to items
