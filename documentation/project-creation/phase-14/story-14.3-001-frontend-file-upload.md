# Story 14.3-001: Frontend File Upload

## Metadata
- **Category**: Frontend - Components
- **Priority**: Medium
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 14.1-001, Story 7.5-001
- **Assignee**: Frontend Developer
- **Status**: Not Started

## Description
Create reusable file upload component with preview and progress indicator.

## Tasks
1. Create `src/components/FileUpload.tsx` reusable component
2. Implement file selection and preview
3. Add progress bar for upload
4. Show file size and validation messages
5. Support drag-and-drop
6. Display uploaded file with remove option
7. Integrate with upload API endpoint

## Acceptance Criteria
- Component handles file selection
- Shows preview for images
- Progress bar displays during upload
- Validation errors shown to user
- Supports drag-and-drop
- Can remove uploaded file

## Technical Notes
```typescript
// src/components/FileUpload.tsx
import { useState } from 'react';
import { Box, Button, LinearProgress, Typography, IconButton } from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { apiClient } from '../api/client';

interface FileUploadProps {
  label: string;
  accept: string;
  maxSizeMB: number;
  onChange: (file: File | null) => void;
  preview?: string | null;
  disabled?: boolean;
}

export const FileUpload = ({ label, accept, maxSizeMB, onChange, preview, disabled }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB`);
      return;
    }

    onChange(file);
  };

  return (
    <Box>
      <Typography>{label}</Typography>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
        id="file-upload-input"
      />
      <label htmlFor="file-upload-input">
        <Button component="span" variant="outlined" startIcon={<CloudUpload />} disabled={disabled}>
          Choose File
        </Button>
      </label>
      {uploading && <LinearProgress variant="determinate" value={progress} />}
      {preview && (
        <Box mt={2}>
          <img src={preview} alt="Preview" style={{ maxWidth: 200 }} />
          <IconButton onClick={() => onChange(null)}>
            <Delete />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
```

## Testing Requirements
- Unit test: File selection and validation
- E2E test: File upload in company creation

## Related Files
- `src/components/FileUpload.tsx` (create)

## Notes
- Used in Story 9.2-001 for company logo upload
- Can be extended for multiple file uploads
