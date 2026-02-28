# Story 14.1-001: Backend File Upload

## Metadata
- **Category**: Backend - File Upload
- **Priority**: Medium
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 0.1-001
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Implement backend file upload handling using Multer with validation and local storage.

## Tasks
1. Install multer and file-type packages
2. Create `src/common/multer.config.ts` with file validation
3. Add file size/type restrictions (images: JPG/PNG, max 2MB)
4. Create upload directory `/uploads` with subdirectories
5. Add file cleanup service for old files
6. Create `FileUploadController` with upload endpoint
7. Add error handling for invalid files
8. Implement file metadata storage in MongoDB

## Acceptance Criteria
- Files validated for type and size
- Uploaded files stored locally in `/uploads`
- File metadata saved to database
- Invalid files rejected with error messages
- Cleanup service removes old unused files

## Technical Notes
```typescript
// src/common/multer.config.ts
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
});
```

## Testing Requirements
- Unit test: File validation
- Integration test: File upload and storage

## Related Files
- `src/common/multer.config.ts` (create)
- `src/modules/upload/upload.controller.ts` (create)
- `src/modules/upload/upload.service.ts` (create)

## Notes
- Ensure `/uploads` directory in .gitignore
- Consider adding virus scanning in production
