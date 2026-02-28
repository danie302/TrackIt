# Story 10.3-001: Create/Edit Inventory Screen

## Metadata
- **Category**: Frontend - Company Admin Screens
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 10.1-001, Story 5.5-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement inventory creation and editing screen with whitelist management for resellers.

## Tasks
1. Create `src/pages/CompanyAdmin/InventoryForm.tsx`
2. Add fields: Name (required), Description, Whitelist (multi-select resellers)
3. Implement multi-select dropdown for whitelist with search
4. Add form validation
5. Implement create/update API calls
6. Add success/error notifications
7. Pre-populate data in edit mode
8. Add cancel button
9. Display current whitelist with remove option
10. Style with Material UI

## Acceptance Criteria
- Form displays name, description, whitelist fields
- Whitelist multi-select shows available resellers
- Name is required, description optional
- Successful submission redirects to inventory details
- Edit mode pre-fills all data including whitelist
- Can add/remove resellers from whitelist
- Error messages for validation/API failures

## Technical Notes
```typescript
// src/pages/CompanyAdmin/InventoryForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { Autocomplete, TextField, Chip, Box, Button } from '@mui/material';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useUserStore } from '../../stores/userStore';

export const InventoryForm = () => {
  const { createInventory, updateInventory, loading } = useInventoryStore();
  const { resellers, fetchResellers } = useUserStore();
  const { control, register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      whitelistedResellers: data.whitelistedResellers.map(r => r._id)
    };
    await createInventory(payload);
  };

  return (
    <Box p={3}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField fullWidth label="Name" {...register('name', { required: true })} sx={{ mb: 2 }} />
        <TextField fullWidth multiline rows={3} label="Description" {...register('description')} sx={{ mb: 2 }} />
        <Controller
          name="whitelistedResellers"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={resellers}
              getOptionLabel={(option) => option.name}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option.name} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Whitelisted Resellers" />}
              {...field}
              onChange={(e, data) => field.onChange(data)}
            />
          )}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save</Button>
      </form>
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Form validation
- Unit test: Whitelist multi-select works
- Integration test: Create/update inventory
- E2E test: CompanyAdmin manages inventory

## Related Files
- `src/pages/CompanyAdmin/InventoryForm.tsx` (create)
- `src/stores/inventoryStore.ts` (update)

## Notes
- Whitelist is optional; empty means no resellers have access
- Consider adding "Select All Resellers" button
