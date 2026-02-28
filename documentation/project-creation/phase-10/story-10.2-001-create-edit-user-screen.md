# Story 10.2-001: Create/Edit User Screen

## Metadata
- **Category**: Frontend - Company Admin Screens
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 10.1-001, Story 5.3-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement user creation and editing screen for Company Admin to manage users within their company.

## Tasks
1. Create `src/pages/CompanyAdmin/UserForm.tsx` component
2. Add form fields: Name, Email, Password (create only), Role dropdown, Active status
3. Implement role dropdown with options: CompanyAdmin, Employer
4. Add form validation (email format, password strength)
5. Implement create and update API calls
6. Add success/error notifications
7. Handle password field visibility (create vs edit mode)
8. Add cancel button to navigate back
9. Pre-populate form data in edit mode
10. Style with Material UI

## Acceptance Criteria
- Form displays all required fields correctly
- Role dropdown shows only CompanyAdmin and Employer options
- Password field only shown in create mode
- Email validation prevents invalid formats
- Password requires 8+ chars, uppercase, lowercase, number
- Successful submission redirects to dashboard/user list
- Error messages displayed for validation/API failures
- Edit mode pre-fills all existing user data

## Technical Notes

```typescript
// src/pages/CompanyAdmin/UserForm.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Button, Box } from '@mui/material';
import { useUserStore } from '../../stores/userStore';
import { useAuthStore } from '../../stores/authStore';

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'CompanyAdmin' | 'Employer';
  isActive: boolean;
}

export const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { createUser, updateUser, fetchUserById, user, loading } = useUserStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>();

  useEffect(() => {
    if (id) {
      fetchUserById(id).then(data => reset(data));
    }
  }, [id]);

  const onSubmit = async (data: UserFormData) => {
    const payload = { ...data, companyId: currentUser.companyId };
    if (id) {
      await updateUser(id, payload);
    } else {
      await createUser(payload);
    }
    navigate('/company-admin/dashboard');
  };

  return (
    <Box p={3}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Name"
          {...register('name', { required: 'Name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{ mb: 2 }}
        />
        {!id && (
          <TextField
            fullWidth
            label="Password"
            type="password"
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 2 }}
          />
        )}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select {...register('role', { required: true })} defaultValue="Employer">
            <MenuItem value="CompanyAdmin">Company Admin</MenuItem>
            <MenuItem value="Employer">Employer</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Switch {...register('isActive')} defaultChecked />}
          label="Active"
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" disabled={loading}>
            {id ? 'Update' : 'Create'} User
          </Button>
          <Button onClick={() => navigate('/company-admin/dashboard')} sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Form validation works
- Unit test: Password field hidden in edit mode
- Integration test: Create user API call
- E2E test: CompanyAdmin creates and edits user

## Documentation Requirements
- Document user creation process
- Add password requirements to user guide

## Related Files
- `src/pages/CompanyAdmin/UserForm.tsx` (create)
- `src/stores/userStore.ts` (update)

## Notes
- CompanyAdmin cannot create MasterAdmin or Reseller users
- Consider email uniqueness validation on backend
