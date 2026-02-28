# Story 10.5-001: Add/Edit Item Screen

## Metadata
- **Category**: Frontend - Company Admin Screens
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 10.4-001, Story 5.6-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement item creation and editing screen for inventory items with serial number validation.

## Tasks
1. Create `src/pages/CompanyAdmin/ItemForm.tsx`
2. Add fields: Serial Number, Name, Description, Category (dropdown), Assigned User (optional)
3. Implement serial number uniqueness validation
4. Add category dropdown populated from Categories API
5. Add assigned user dropdown (optional, filtered by company)
6. Implement create/update API calls
7. Add form validation
8. Pre-populate data in edit mode
9. Handle validation errors from backend
10. Style with Material UI

## Acceptance Criteria
- Form displays all required fields
- Serial number validated for uniqueness
- Category dropdown populated from API
- Assigned user is optional
- Successful submission redirects to inventory details
- Edit mode pre-fills all data
- Error messages for validation/API failures
- Serial number cannot be changed in edit mode

## Technical Notes
```typescript
// src/pages/CompanyAdmin/ItemForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { TextField, Select, MenuItem, FormControl, InputLabel, Box, Button } from '@mui/material';
import { useItemStore } from '../../stores/itemStore';
import { useCategoryStore } from '../../stores/categoryStore';

export const ItemForm = () => {
  const { createItem, updateItem, loading } = useItemStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { register, control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    await createItem({ ...data, inventoryId: inventoryId });
  };

  return (
    <Box p={3}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Serial Number"
          {...register('serialNumber', { required: 'Serial number required' })}
          disabled={!!id}
          error={!!errors.serialNumber}
          helperText={errors.serialNumber?.message}
          sx={{ mb: 2 }}
        />
        <TextField fullWidth label="Name" {...register('name', { required: true })} sx={{ mb: 2 }} />
        <TextField fullWidth multiline rows={3} label="Description" {...register('description')} sx={{ mb: 2 }} />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                {categories.map(cat => <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>)}
              </Select>
            )}
          />
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading}>Save Item</Button>
      </form>
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Form validation
- Unit test: Serial number uniqueness check
- Integration test: Create/update item
- E2E test: CompanyAdmin adds item to inventory

## Related Files
- `src/pages/CompanyAdmin/ItemForm.tsx` (create)
- `src/stores/itemStore.ts` (update)
- `src/stores/categoryStore.ts` (update)

## Notes
- Serial number should be auto-generated option in future
- Consider barcode scanning integration
