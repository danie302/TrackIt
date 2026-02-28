# Story 12.4-001: Own Inventory View

## Metadata
- **Category**: Frontend - Reseller Screens
- **Priority**: Medium
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 12.1-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Display reseller's assigned items with ability to select for devolution orders.

## Tasks
1. Create `src/pages/Reseller/OwnInventory.tsx`
2. Display items table with checkboxes
3. Add "Create Devolution Order" button
4. Integrate with items API filtered by assigned user
5. Add search and pagination
6. Pass selected items to devolution order creation

## Acceptance Criteria
- Reseller sees only own assigned items
- Can select items via checkboxes
- "Create Devolution Order" enabled when items selected
- Navigates to devolution order creation

## Technical Notes
```typescript
// src/pages/Reseller/OwnInventory.tsx
export const OwnInventory = () => {
  const [selected, setSelected] = useState([]);
  const handleDevolution = () => {
    navigate('/reseller/devolution/create', { state: { items: selected } });
  };
  return <Box><Table>{/* Items with checkboxes */}</Table><Button onClick={handleDevolution}>Return Items</Button></Box>;
};
```

## Related Files
- `src/pages/Reseller/OwnInventory.tsx` (create)
