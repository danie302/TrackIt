# Story 9.1-001: Master Admin Dashboard

## Metadata
- **Category**: Frontend - Master Admin Screens
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: 
  - Story 7.1-001 (Frontend Project Setup)
  - Story 7.2-001 (Routing Setup)
  - Story 7.3-001 (Zustand State Management)
  - Story 7.4-001 (API Client Setup)
  - Story 5.2-001 (Company API Endpoints)
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Implement the Master Admin Dashboard screen that displays a list of all companies in the system with search, pagination, and navigation capabilities.

## Tasks
1. Create `src/pages/MasterAdmin/Dashboard.tsx` with main dashboard layout
2. Implement company data table with columns: Logo, Name, Description, Users Count, Created Date, Actions
3. Add search bar for filtering companies by name/description
4. Implement pagination controls (10 companies per page)
5. Add "Create Company" button that navigates to create company screen
6. Implement "View Details" action that navigates to company details screen
7. Add loading states and error handling
8. Integrate with company API endpoints via Zustand store
9. Style components with Material UI for consistent look
10. Add responsive design for mobile/tablet views
11. Implement sorting by name, created date
12. Add empty state when no companies exist

## Acceptance Criteria
- Master Admin can view list of all companies with pagination
- Search filters companies in real-time
- Clicking "Create Company" navigates to `/master-admin/companies/create`
- Clicking company row or "View Details" navigates to `/master-admin/companies/:id`
- Table displays company logo thumbnail, name, description, user count, created date
- Loading spinner shown while fetching data
- Error message displayed if API call fails
- Pagination works correctly with page navigation
- Table is sortable by name and created date
- Responsive design works on mobile devices

## Technical Notes

### Dashboard Component Structure
```typescript
// src/pages/MasterAdmin/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Avatar, CircularProgress, Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useCompanyStore } from '../../stores/companyStore';

export const MasterAdminDashboard = () => {
  const navigate = useNavigate();
  const { companies, loading, error, fetchCompanies } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCompanies({ page: page + 1, limit: rowsPerPage, search: searchTerm });
  }, [page, rowsPerPage, searchTerm]);

  const handleCreateCompany = () => {
    navigate('/master-admin/companies/create');
  };

  const handleViewCompany = (companyId: string) => {
    navigate(`/master-admin/companies/${companyId}`);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Companies</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCompany}
        >
          Create Company
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Search companies"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && companies.items.length === 0 ? (
        <Alert severity="info">No companies found. Create your first company!</Alert>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Logo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.items.map((company) => (
                  <TableRow
                    key={company._id}
                    hover
                    onClick={() => handleViewCompany(company._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Avatar src={company.logoUrl} alt={company.name}>
                        {company.name[0]}
                      </Avatar>
                    </TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.description}</TableCell>
                    <TableCell>{company.userCount || 0}</TableCell>
                    <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleViewCompany(company._id)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={companies.total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </>
      )}
    </Box>
  );
};
```

### Company Store Methods
```typescript
// src/stores/companyStore.ts (additions)
interface CompanyState {
  companies: { items: Company[]; total: number };
  loading: boolean;
  error: string | null;
  fetchCompanies: (params: { page: number; limit: number; search?: string }) => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: { items: [], total: 0 },
  loading: false,
  error: null,
  fetchCompanies: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/companies', { params });
      set({ companies: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch companies', loading: false });
    }
  },
}));
```

## Testing Requirements
- Unit test: Dashboard component renders correctly
- Unit test: Search input filters companies
- Unit test: Pagination changes trigger API calls
- Unit test: Create button navigates to create screen
- Unit test: Row click navigates to company details
- Integration test: Dashboard fetches and displays company data
- E2E test: Master Admin can navigate dashboard and view companies

## Documentation Requirements
- Add JSDoc comments to Dashboard component
- Document dashboard layout and features in user guide
- Add screenshots of dashboard to documentation

## Related Files
- `src/pages/MasterAdmin/Dashboard.tsx` (create)
- `src/stores/companyStore.ts` (update with fetch methods)
- `src/App.tsx` (add route for `/master-admin/dashboard`)

## Notes
- Dashboard should be the default landing page for Master Admin role
- Consider adding company status badges (active/inactive) in future
- Implement debouncing for search input to reduce API calls
- Use Material UI's DataGrid for more advanced table features in future iterations
