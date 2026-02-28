# Story 12.2-001: Company Inventory View

## Metadata
- **Category**: Frontend - Reseller Screens
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 12.1-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Allow Reseller to view company inventory items and select items for ordering.

## Tasks
1. Create `src/pages/Reseller/CompanyInventory.tsx`
2. Display company info and inventory list
3. Items table: Checkbox, Serial, Name, Description, Category, Status
4. Add filters: Available only, By category
5. Implement multi-select with checkboxes
6. Add "Create Order" button (enabled when items selected)
7. Integrate with inventory API
8. Add pagination and search

## Acceptance Criteria
- Reseller can view company's available items
- Can select multiple items via checkboxes
- Filter shows only available items
- "Create Order" redirects to order creation with selected items
- Cannot select unavailable/assigned items

## Technical Notes
```typescript
// src/pages/Reseller/CompanyInventory.tsx
import { useState } from 'react';
import { Checkbox, Button, Table, Select, MenuItem } from '@mui/material';

export const CompanyInventory = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleCreateOrder = () => {
    navigate('/reseller/orders/create', { state: { items: selectedItems } });
  };

  return (
    <Box p={3}>
      <Button disabled={selectedItems.length === 0} onClick={handleCreateOrder}>
        Create Order ({selectedItems.length} items)
      </Button>
      <Table>
        <TableBody>
          {items.filter(i => i.status === 'Available').map(item => (
            <TableRow key={item._id}>
              <TableCell>
                <Checkbox onChange={() => handleSelect(item._id)} />
              </TableCell>
              <TableCell>{item.serialNumber}</TableCell>
              <TableCell>{item.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
```

## Testing Requirements
- E2E test: Reseller selects items and creates order

## Related Files
- `src/pages/Reseller/CompanyInventory.tsx` (create)
