# Story 12.1-001: Reseller Dashboard

## Metadata
- **Category**: Frontend - Reseller Screens
- **Priority**: High
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 7.1-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement Reseller Dashboard displaying own inventory and whitelisted companies.

## Tasks
1. Create `src/pages/Reseller/Dashboard.tsx`
2. Display two sections: My Inventory, Available Companies
3. My Inventory: Table with Serial, Name, Category, Assigned Date
4. Available Companies: Cards/list of whitelisted companies
5. Add "Request Items" button for each company
6. Integrate with items and inventory APIs filtered by reseller
7. Add search and pagination
8. Style with Material UI

## Acceptance Criteria
- Reseller sees own assigned items
- Whitelisted companies displayed as clickable cards
- Can navigate to company inventory to create orders
- Pagination works for items
- Search filters items

## Technical Notes
```typescript
// src/pages/Reseller/Dashboard.tsx
import { useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Table, Button } from '@mui/material';
import { useItemStore } from '../../stores/itemStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useAuthStore } from '../../stores/authStore';

export const ResellerDashboard = () => {
  const { user } = useAuthStore();
  const { items, fetchItemsByUser } = useItemStore();
  const { inventories, fetchWhitelistedInventories } = useInventoryStore();

  useEffect(() => {
    fetchItemsByUser(user._id);
    fetchWhitelistedInventories(user._id);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4">My Inventory</Typography>
      <Table>{/* Items table */}</Table>

      <Typography variant="h4" mt={4}>Available Companies</Typography>
      <Grid container spacing={2}>
        {inventories.map(inv => (
          <Grid item xs={12} md={6} lg={4} key={inv._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{inv.companyId.name}</Typography>
                <Button onClick={() => navigate(`/reseller/companies/${inv.companyId._id}`)}>
                  View Items
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
```

## Testing Requirements
- E2E test: Reseller views dashboard and navigates to company inventory

## Related Files
- `src/pages/Reseller/Dashboard.tsx` (create)

## Notes
- Own inventory is read-only; cannot edit items
