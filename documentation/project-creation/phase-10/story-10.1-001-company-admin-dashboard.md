# Story 10.1-001: Company Admin Dashboard

## Metadata
- **Category**: Frontend - Company Admin Screens
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 7.1-001, 7.2-001, 7.3-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement the Company Admin Dashboard with tabbed interface displaying Inventories, Users, and Resellers specific to the logged-in company admin's company.

## Tasks
1. Create `src/pages/CompanyAdmin/Dashboard.tsx` with tabbed layout
2. Implement three tabs: Inventories, Users, Resellers
3. Add Inventories tab with table: Name, Description, Items Count, Created Date, Actions
4. Add Users tab with table: Name, Email, Role, Status, Actions
5. Add Resellers tab with table: Name, Email, Assigned Items, Actions
6. Implement search/filter for each tab
7. Add "Create" buttons for each tab
8. Integrate with respective API endpoints filtered by company
9. Add pagination for all tables
10. Implement role-based UI (hide Users tab for Employer role)
11. Add loading and error states
12. Style with Material UI Tabs component

## Acceptance Criteria
- Dashboard shows three tabs for CompanyAdmin, two tabs for Employer
- Inventories tab displays company's inventories with pagination
- Users tab displays company's users (CompanyAdmin only)
- Resellers tab displays whitelisted resellers
- Search filters data in real-time per tab
- "Create" buttons navigate to respective creation screens
- Row clicks navigate to detail screens
- Data filtered by logged-in user's company automatically
- Loading spinners and error messages displayed appropriately

## Technical Notes

### Dashboard Component
```typescript
// src/pages/CompanyAdmin/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Button } from '@mui/material';
import { useAuthStore } from '../../stores/authStore';
import { InventoriesTab } from './InventoriesTab';
import { UsersTab } from './UsersTab';
import { ResellersTab } from './ResellersTab';

export const CompanyAdminDashboard = () => {
  const { user } = useAuthStore();
  const [tabIndex, setTabIndex] = useState(0);
  const isEmployer = user?.role === 'Employer';

  return (
    <Box p={3}>
      <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
        <Tab label="Inventories" />
        {!isEmployer && <Tab label="Users" />}
        <Tab label="Resellers" />
      </Tabs>

      {tabIndex === 0 && <InventoriesTab companyId={user.companyId} />}
      {tabIndex === 1 && !isEmployer && <UsersTab companyId={user.companyId} />}
      {(tabIndex === 2 || (isEmployer && tabIndex === 1)) && <ResellersTab companyId={user.companyId} />}
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Dashboard renders all tabs correctly
- Unit test: Employer role hides Users tab
- Integration test: Each tab fetches correct company data
- E2E test: CompanyAdmin can navigate tabs

## Documentation Requirements
- Add JSDoc comments to Dashboard
- Document tab functionality in user guide

## Related Files
- `src/pages/CompanyAdmin/Dashboard.tsx` (create)
- `src/pages/CompanyAdmin/InventoriesTab.tsx` (create)
- `src/pages/CompanyAdmin/UsersTab.tsx` (create)
- `src/pages/CompanyAdmin/ResellersTab.tsx` (create)

## Notes
- Tab components should be split into separate files for maintainability
- Consider persisting selected tab in local storage
