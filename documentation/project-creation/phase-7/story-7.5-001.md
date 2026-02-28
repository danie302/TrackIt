# Story 7.5-001: Shared Components

## Metadata
- **Category:** Frontend Foundation
- **Priority:** High
- **Estimated Effort:** 8 hours
- **Dependencies:** Story 7.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create reusable UI components including layout, data table, forms, modals, and notification system.

## Tasks
1. Create Layout components (Header, Sidebar, Footer)
2. Create DataTable with pagination
3. Create Form components
4. Create Modal/Dialog component
5. Create Notification system
6. Create Loading indicators
7. Create Error boundary

## Key Components

### Layout Components
- Header with user menu
- Sidebar with navigation
- Footer
- Main content wrapper

### DataTable
- Sorting
- Pagination
- Row selection
- Action buttons
- Loading state

### Form Components
- TextInput
- SelectInput
- DatePicker
- FileUpload
- Checkbox
- RadioGroup

### UI Components
- Button variants
- Modal/Dialog
- Notification/Snackbar
- Loading spinner
- Progress bar
- Confirmation dialog

## Component Examples

### DataTable
```typescript
// src/components/DataTable/DataTable.tsx
interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export const DataTable = ({ columns, data, loading, pagination }: DataTableProps) => {
  // Implementation
};
```

### Notification System
```typescript
// src/components/Notification/Notification.tsx
import { Snackbar, Alert } from '@mui/material';
import { useUIStore } from '@stores/uiStore';

export const Notification = () => {
  const { notifications, removeNotification } = useUIStore();

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={6000}
          onClose={() => removeNotification(notification.id)}
        >
          <Alert severity={notification.type} onClose={() => removeNotification(notification.id)}>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};
```

## Related Files
- `src/components/Layout/*` (create)
- `src/components/DataTable/*` (create)
- `src/components/Form/*` (create)
- `src/components/Modal/*` (create)
- `src/components/Notification/*` (create)
- `src/components/Loading/*` (create)
