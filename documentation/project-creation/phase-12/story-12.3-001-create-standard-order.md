# Story 12.3-001: Create Standard Order

## Metadata
- **Category**: Frontend - Reseller Screens
- **Priority**: High
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 12.2-001, Story 5.7-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement order creation screen for resellers to request items from companies.

## Tasks
1. Create `src/pages/Reseller/CreateOrder.tsx`
2. Display selected items in review table
3. Add remove item capability
4. Show order summary: Total items, Company name
5. Add submit button
6. Implement order creation API call
7. Show success notification
8. Redirect to orders list after submission

## Acceptance Criteria
- Selected items displayed for review
- Can remove items before submission
- Submit creates order with Pending status
- Success message shown
- Redirects to order list
- Email notification sent to company admin

## Technical Notes
```typescript
// src/pages/Reseller/CreateOrder.tsx
export const CreateOrder = () => {
  const { state } = useLocation();
  const { createOrder } = useOrderStore();

  const handleSubmit = async () => {
    await createOrder({
      itemIds: state.items,
      orderType: 'Standard',
      status: 'Pending'
    });
    navigate('/reseller/orders');
  };

  return <Box><Table>{/* Items */}</Table><Button onClick={handleSubmit}>Submit Order</Button></Box>;
};
```

## Testing Requirements
- E2E test: Reseller creates standard order

## Related Files
- `src/pages/Reseller/CreateOrder.tsx` (create)
- `src/stores/orderStore.ts` (update)
