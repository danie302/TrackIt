# Story 10.6-001: Order Request Review Screen

## Metadata
- **Category**: Frontend - Company Admin Screens
- **Priority**: High
- **Estimated Effort**: 5 hours
- **Dependencies**: Story 10.1-001, Story 5.7-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement order request review screen for CompanyAdmin/Employer to approve or reject orders.

## Tasks
1. Create `src/pages/CompanyAdmin/OrderReview.tsx`
2. Display order details: Order ID, Reseller name, Requested Date, Type, Status
3. Show items table: Serial, Name, Description, Category
4. Add "Approve" and "Reject" buttons (visible only for Pending orders)
5. Implement rejection reason modal/dialog
6. Add approve/reject API calls
7. Show order history/audit trail
8. Add email notification trigger on approve/reject
9. Disable actions for non-pending orders
10. Add loading and error states
11. Style with Material UI
12. Add breadcrumb navigation

## Acceptance Criteria
- Order details displayed completely
- Items table shows all requested items
- Approve button changes status to Approved
- Reject button shows reason dialog, then rejects order
- Actions disabled for non-Pending orders
- Success notification shown after action
- Email sent to reseller on approve/reject
- Audit trail visible for all actions
- Error messages for API failures

## Technical Notes
```typescript
// src/pages/CompanyAdmin/OrderReview.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Dialog, TextField, Table, Typography, Chip } from '@mui/material';
import { useOrderStore } from '../../stores/orderStore';

export const OrderReview = () => {
  const { id } = useParams();
  const { order, approveOrder, rejectOrder, fetchOrderById, loading } = useOrderStore();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchOrderById(id);
  }, [id]);

  const handleApprove = async () => {
    await approveOrder(id);
  };

  const handleReject = async () => {
    await rejectOrder(id, rejectionReason);
    setRejectDialogOpen(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4">Order #{order?.orderNumber}</Typography>
      <Chip label={order?.status} color={order?.status === 'Pending' ? 'warning' : 'default'} />
      <Typography>Reseller: {order?.resellerId?.name}</Typography>
      <Typography>Type: {order?.orderType}</Typography>

      <Table>
        {/* Items table */}
      </Table>

      {order?.status === 'Pending' && (
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleApprove}>Approve</Button>
          <Button variant="outlined" color="error" onClick={() => setRejectDialogOpen(true)} sx={{ ml: 2 }}>
            Reject
          </Button>
        </Box>
      )}

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <TextField
          label="Rejection Reason"
          multiline
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
        <Button onClick={handleReject}>Submit</Button>
      </Dialog>
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Approve/reject buttons work
- Integration test: Approve/reject API calls
- E2E test: CompanyAdmin reviews and approves order

## Related Files
- `src/pages/CompanyAdmin/OrderReview.tsx` (create)
- `src/stores/orderStore.ts` (update)

## Notes
- Consider adding bulk approve/reject for multiple orders
- Audit trail should show who approved/rejected
