# Story 10.4-001: Inventory Details Screen

## Metadata
- **Category**: Frontend - Company Admin Screens
- **Priority**: High
- **Estimated Effort**: 5 hours
- **Dependencies**: Story 10.3-001, Story 5.5-001, Story 5.6-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement inventory details screen showing inventory info, items list, and orders tab.

## Tasks
1. Create `src/pages/CompanyAdmin/InventoryDetails.tsx`
2. Display inventory info: Name, Description, Created Date, Items Count
3. Add Edit button for inventory
4. Implement two tabs: Items, Orders
5. Items tab: Table with Serial, Name, Description, Category, Status, Actions
6. Add "Add Item" button in Items tab
7. Implement Edit/Delete item actions
8. Orders tab: List order requests related to inventory
9. Add pagination for items and orders
10. Integrate with API endpoints
11. Add confirmation dialog for delete item
12. Style with Material UI

## Acceptance Criteria
- Inventory details displayed correctly
- Edit button updates inventory
- Items tab shows all items in inventory
- Can add, edit, delete items
- Orders tab shows related order requests
- Pagination works for both tabs
- Delete confirmation prevents accidental deletion
- Loading and error states handled

## Technical Notes
```typescript
// src/pages/CompanyAdmin/InventoryDetails.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab, Box, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useItemStore } from '../../stores/itemStore';

export const InventoryDetails = () => {
  const { id } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const { inventory, fetchInventoryById } = useInventoryStore();
  const { items, fetchItemsByInventory } = useItemStore();

  useEffect(() => {
    fetchInventoryById(id);
    fetchItemsByInventory(id);
  }, [id]);

  return (
    <Box p={3}>
      <Typography variant="h4">{inventory?.name}</Typography>
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
        <Tab label="Items" />
        <Tab label="Orders" />
      </Tabs>
      {tabIndex === 0 && (
        <Box>
          <Button onClick={() => navigate(`/company-admin/inventories/${id}/items/create`)}>Add Item</Button>
          <Table>
            {/* Items table */}
          </Table>
        </Box>
      )}
      {tabIndex === 1 && <Box>{/* Orders list */}</Box>}
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Tabs switch correctly
- Integration test: Fetch items and orders
- E2E test: CompanyAdmin views inventory details

## Related Files
- `src/pages/CompanyAdmin/InventoryDetails.tsx` (create)
- `src/stores/inventoryStore.ts` (update)
- `src/stores/itemStore.ts` (update)

## Notes
- Orders tab shows both standard and devolution orders
- Consider adding filters for item status
