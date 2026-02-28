# Story 12.5-001: Create Devolution Order

## Metadata
- **Category**: Frontend - Reseller Screens
- **Priority**: Medium
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 12.4-001, Story 5.7-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Allow reseller to create devolution orders to return items to companies.

## Tasks
1. Create `src/pages/Reseller/CreateDevolution.tsx`
2. Display selected items for return
3. Add reason/notes textarea (required)
4. Implement devolution order creation API
5. Show success notification
6. Redirect to devolution orders list

## Acceptance Criteria
- Selected items displayed
- Reason field is required
- Submit creates devolution order
- Email sent to company admin
- Redirects to orders list

## Technical Notes
```typescript
// src/pages/Reseller/CreateDevolution.tsx
export const CreateDevolution = () => {
  const [reason, setReason] = useState('');
  const handleSubmit = async () => {
    await createOrder({
      itemIds: state.items,
      orderType: 'Devolution',
      status: 'Pending',
      notes: reason
    });
  };
  return <Box><Table>{/* Items */}</Table><TextField label="Reason" value={reason} onChange={e => setReason(e.target.value)} required /><Button onClick={handleSubmit}>Submit</Button></Box>;
};
```

## Related Files
- `src/pages/Reseller/CreateDevolution.tsx` (create)
