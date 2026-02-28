# Story 12.7-001: Devolution Requests List

## Metadata
- **Category**: Frontend - Reseller Screens
- **Priority**: Medium
- **Estimated Effort**: 5 hours
- **Dependencies**: Story 12.5-001, Story 5.7-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Display list of reseller's devolution orders with status filtering.

## Tasks
1. Create `src/pages/Reseller/DevolutionsList.tsx` (can reuse OrdersList with orderType filter)
2. Display devolution orders table
3. Add status filter
4. Show reason/notes column
5. Implement "View Details" action
6. Add pagination
7. Integrate with orders API filtered by reseller and orderType=Devolution

## Acceptance Criteria
- Devolution orders displayed
- Reason column shows notes
- Status filter works
- Can view details
- Pagination works

## Technical Notes
```typescript
// src/pages/Reseller/DevolutionsList.tsx
// Similar to OrdersList but filtered by orderType='Devolution'
export const DevolutionsList = () => {
  const { orders, fetchOrdersByReseller } = useOrderStore();
  const devolutions = orders.filter(o => o.orderType === 'Devolution');

  return (
    <Box p={3}>
      <Table>
        {devolutions.map(order => (
          <TableRow key={order._id}>
            <TableCell>{order.orderNumber}</TableCell>
            <TableCell>{order.notes}</TableCell>
            <TableCell><Chip label={order.status} /></TableCell>
            <TableCell><Button onClick={() => navigate(`/reseller/devolutions/${order._id}`)}>View</Button></TableCell>
          </TableRow>
        ))}
      </Table>
    </Box>
  );
};
```

## Related Files
- `src/pages/Reseller/DevolutionsList.tsx` (create)
