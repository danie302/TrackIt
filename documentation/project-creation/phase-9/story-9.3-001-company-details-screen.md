# Story 9.3-001: Company Details Screen

## Metadata
- **Category**: Frontend - Master Admin Screens
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: 
  - Story 9.1-001 (Master Admin Dashboard)
  - Story 9.2-001 (Create Company Screen)
  - Story 5.2-001 (Company API Endpoints)
  - Story 5.3-001 (User API Endpoints)
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement the Company Details screen that displays company information, allows editing, and shows a list of users within the company with management capabilities.

## Tasks
1. Create `src/pages/MasterAdmin/CompanyDetails.tsx` details component
2. Display company info: Logo, Name, Description, Created Date, User Count
3. Add "Edit" button to toggle edit mode for name/description/logo
4. Implement inline editing with save/cancel actions
5. Display users table with columns: Name, Email, Role, Status, Actions
6. Add "Add User" button to create new users for the company
7. Implement "Edit User" and "Delete User" actions in users table
8. Add confirmation dialog for delete user action
9. Add loading states and error handling
10. Integrate with company and user API endpoints
11. Style with Material UI for consistent design
12. Add breadcrumb navigation (Dashboard > Company Details)

## Acceptance Criteria
- Company details displayed with logo, name, description, created date
- "Edit" button enables inline editing of company info
- Saving changes updates company via API, shows success notification
- Cancel discards changes and reverts to original values
- Users table displays all users for the company
- "Add User" button opens user creation modal/screen
- "Edit User" opens user edit modal/screen
- "Delete User" shows confirmation dialog, deletes on confirm
- Loading spinner shown while fetching data
- Error messages displayed for API failures
- Breadcrumb navigation works correctly

## Technical Notes

### Company Details Component
```typescript
// src/pages/MasterAdmin/CompanyDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Avatar, Card, CardContent,
  TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Breadcrumbs, Link,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert
} from '@mui/material';
import {
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
  Delete as DeleteIcon, PersonAdd as PersonAddIcon, Home as HomeIcon
} from '@mui/icons-material';
import { useCompanyStore } from '../../stores/companyStore';
import { useUserStore } from '../../stores/userStore';

export const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company, loading: companyLoading, error: companyError, fetchCompanyById, updateCompany } = useCompanyStore();
  const { users, loading: usersLoading, fetchUsersByCompany, deleteUser } = useUserStore();
  
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCompanyById(id);
      fetchUsersByCompany(id);
    }
  }, [id]);

  useEffect(() => {
    if (company) {
      setEditedName(company.name);
      setEditedDescription(company.description || '');
    }
  }, [company]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    if (id) {
      await updateCompany(id, { name: editedName, description: editedDescription });
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditedName(company?.name || '');
    setEditedDescription(company?.description || '');
    setEditMode(false);
  };

  const handleAddUser = () => {
    navigate(`/master-admin/companies/${id}/users/create`);
  };

  const handleEditUser = (userId: string) => {
    navigate(`/master-admin/companies/${id}/users/${userId}/edit`);
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete && id) {
      await deleteUser(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsersByCompany(id);
    }
  };

  if (companyLoading) return <CircularProgress />;
  if (companyError) return <Alert severity="error">{companyError}</Alert>;
  if (!company) return <Alert severity="warning">Company not found</Alert>;

  return (
    <Box p={3}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/master-admin/dashboard" underline="hover" display="flex" alignItems="center">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary">{company.name}</Typography>
      </Breadcrumbs>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar src={company.logoUrl} alt={company.name} sx={{ width: 80, height: 80 }}>
              {company.name[0]}
            </Avatar>
            <Box flex={1}>
              {editMode ? (
                <>
                  <TextField
                    fullWidth
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Typography variant="h4">{company.name}</Typography>
                  <Typography color="text.secondary">{company.description}</Typography>
                </>
              )}
            </Box>
            <Box>
              {editMode ? (
                <>
                  <IconButton color="primary" onClick={handleSave}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={handleCancel}>
                    <CancelIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton color="primary" onClick={handleEdit}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Created: {new Date(company.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Users ({users.length})</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleAddUser}>
          Add User
        </Button>
      </Box>

      {usersLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEditUser(user._id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteUser(user._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteUser} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

## Testing Requirements
- Unit test: Company details render correctly
- Unit test: Edit mode toggles and saves changes
- Unit test: Users table displays correctly
- Unit test: Delete confirmation dialog works
- Integration test: Company update via API
- Integration test: User deletion via API
- E2E test: Master Admin can view and manage company

## Documentation Requirements
- Add JSDoc comments to CompanyDetails component
- Document company management features in user guide
- Add screenshots of company details screen

## Related Files
- `src/pages/MasterAdmin/CompanyDetails.tsx` (create)
- `src/stores/companyStore.ts` (update with update method)
- `src/stores/userStore.ts` (update with fetch/delete methods)
- `src/App.tsx` (add route for `/master-admin/companies/:id`)

## Notes
- Consider adding inventories count and resellers count to company info
- User management might be split into separate modal components
- Breadcrumb should use React Router's Link for proper navigation
- Add confirmation before navigating away with unsaved changes in edit mode
