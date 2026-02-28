# Story 14.2-001: S3 Storage

## Metadata
- **Category**: Backend - File Upload
- **Priority**: Low
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 14.1-001
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Integrate AWS S3 for file storage with signed URL generation (optional for production).

## Tasks
1. Install @aws-sdk/client-s3 package
2. Create S3 configuration in environment
3. Implement S3Service for upload/delete operations
4. Generate signed URLs for file access
5. Add toggle between local/S3 storage
6. Update FileUploadService to use S3 when configured

## Acceptance Criteria
- Files uploaded to S3 bucket when configured
- Signed URLs generated for file access
- Falls back to local storage if S3 not configured
- Environment variable controls storage type

## Technical Notes
```typescript
// src/modules/upload/s3.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `${Date.now()}-${file.originalname}`;
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    }));
    return key;
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
```

## Testing Requirements
- Integration test: S3 upload and retrieval

## Related Files
- `src/modules/upload/s3.service.ts` (create)
- `.env` (add S3 config)
