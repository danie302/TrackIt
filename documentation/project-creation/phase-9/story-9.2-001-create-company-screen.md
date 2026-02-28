# Story 9.2-001: Create Company Screen

## Metadata
- **Category**: Frontend - Master Admin Screens
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: 
  - Story 7.1-001 (Frontend Project Setup)
  - Story 9.1-001 (Master Admin Dashboard)
  - Story 5.2-001 (Company API Endpoints)
  - Story 14.3-001 (Frontend File Upload Component)
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement the Create Company screen that allows Master Admin to create new companies with name, description, and logo upload.

## Tasks
1. Create `src/pages/MasterAdmin/CreateCompany.tsx` form component
2. Implement form fields: Name (required), Description (optional), Logo upload
3. Add form validation using react-hook-form
4. Integrate file upload component for logo with preview
5. Implement form submission that calls company creation API
6. Add success notification and redirect to company details
7. Add error handling for API failures and validation errors
8. Implement cancel button that navigates back to dashboard
9. Add loading state during submission
10. Style form with Material UI components
11. Add form field helper texts and error messages
12. Implement responsive layout

## Acceptance Criteria
- Form displays Name, Description, and Logo upload fields
- Name field is required, shows error if empty
- Description field is optional, max 500 characters
- Logo upload allows JPG/PNG files, max 2MB
- Logo preview displayed after file selection
- Clicking "Cancel" navigates back to dashboard without saving
- Clicking "Create" validates form, submits data to API
- Success notification shown, redirects to company details page
- Error message displayed if API call fails
- Form fields retain values if submission fails
- Loading spinner shown during submission, buttons disabled

## Technical Notes

### Create Company Form Component
```typescript
// src/pages/MasterAdmin/CreateCompany.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, Typography, TextField, Button, CircularProgress,
  Alert, Card, CardContent
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { FileUpload } from '../../components/FileUpload';
import { useCompanyStore } from '../../stores/companyStore';

interface CreateCompanyForm {
  name: string;
  description?: string;
  logo?: File;
}

export const CreateCompany = () => {
  const navigate = useNavigate();
  const { createCompany, loading, error } = useCompanyStore();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateCompanyForm>();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const onSubmit = async (data: CreateCompanyForm) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.logo) formData.append('logo', data.logo);

      const newCompany = await createCompany(formData);
      navigate(`/master-admin/companies/${newCompany._id}`);
    } catch (err) {
      // Error handled by store
    }
  };

  const handleLogoChange = (file: File | null) => {
    if (file) {
      setValue('logo', file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setValue('logo', undefined);
      setLogoPreview(null);
    }
  };

  const handleCancel = () => {
    navigate('/master-admin/dashboard');
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>Create New Company</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Company Name"
              {...register('name', { required: 'Company name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
              error={!!errors.description}
              helperText={errors.description?.message || `Optional, max 500 characters`}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <FileUpload
              label="Company Logo"
              accept="image/jpeg,image/png"
              maxSizeMB={2}
              onChange={handleLogoChange}
              preview={logoPreview}
              disabled={loading}
            />

            <Box display="flex" gap={2} mt={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Company'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
```

### Company Store Create Method
```typescript
// src/stores/companyStore.ts (additions)
createCompany: async (formData: FormData) => {
  set({ loading: true, error: null });
  try {
    const response = await apiClient.post('/companies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    set({ loading: false });
    return response.data;
  } catch (error) {
    set({ error: 'Failed to create company', loading: false });
    throw error;
  }
},
```

## Testing Requirements
- Unit test: Form renders with all fields
- Unit test: Name validation works correctly
- Unit test: Description character limit enforced
- Unit test: Logo file type/size validation
- Unit test: Cancel button navigates back
- Integration test: Form submission creates company
- E2E test: Master Admin can create company end-to-end

## Documentation Requirements
- Add JSDoc comments to CreateCompany component
- Document company creation flow in user guide
- Add validation rules to documentation

## Related Files
- `src/pages/MasterAdmin/CreateCompany.tsx` (create)
- `src/stores/companyStore.ts` (update with create method)
- `src/components/FileUpload.tsx` (reuse from Story 14.3-001)
- `src/App.tsx` (add route for `/master-admin/companies/create`)

## Notes
- File upload component should show file size and format requirements
- Consider adding slug/subdomain field for multi-tenancy in future
- Logo should be optional; default avatar shown if not provided
- Form should use FormData to support file upload
