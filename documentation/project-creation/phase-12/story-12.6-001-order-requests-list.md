# Story 12.6-001: Order Requests List

## Metadata
- **Category**: Frontend - Reseller Screens
- **Priority**: High
- **Estimated Effort**: 5 hours
- **Dependencies**: Story 12.3-001, Story 5.7-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Display list of reseller's standard order requests with status filtering.

## Tasks
1. Create `src/pages/Reseller/OrdersList.tsx`
2. Display orders table: Order#, Company, Items Count, Status, Created Date, Actions
3. Add status filter: All, Pending, Approved, Rejected
4. Implement "View Details" action
5. Add pagination and search
6. Show status badges with colors
7. Integrate with orders API filtered by reseller

## Acceptance Criteria
- Orders displayed with all relevant info
- Status filter works
- Can view order details
- Pagination works
- Status badges color-coded (Pending=yellow, Approved=green, Rejected=red)

## Technical Notes
```typescript
// src/pages/Reseller/OrdersList.tsx
export const OrdersList = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const { orders, fetchOrdersByReseller } = useOrderStore();

  return (
    <Box p={3}>
      <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Approved">Approved</MenuItem>
        <MenuItem value="Rejected">Rejected</MenuItem>
      </Select>
      <Table>
        {orders.filter(o => statusFilter === 'All' || o.status === statusFilter).map(order => (
          <TableRow key={order._id}>
            <TableCell>{order.orderNumber}</TableCell>
            <TableCell><Chip label={order.status} color={order.status === 'Approved' ? 'success' : 'default'} /></TableCell>
            <TableCell><Button onClick={() => navigate(`/reseller/orders/${order._id}`)}>View</Button></TableCell>
          </TableRow>
        ))}
      </Table>
    </Box>
  );
};
```

## Related Files
- `src/pages/Reseller/OrdersList.tsx` (create)
