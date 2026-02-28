# Story 16.1-001: Backend Error Handling

## Metadata
- **Category**: Backend - Error Handling
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 0.1-001
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Implement global error handling with custom exceptions.

## Tasks
1. Create `src/common/filters/http-exception.filter.ts`
2. Define custom exceptions: ValidationException, NotFoundException, UnauthorizedException
3. Implement global exception filter
4. Add error response formatting
5. Log all errors
6. Add stack traces in development only

## Acceptance Criteria
- All errors caught and formatted consistently
- Custom exceptions work correctly
- Error details logged
- Stack traces hidden in production

## Technical Notes
```typescript
// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack })
    });
  }
}
```

## Related Files
- `src/common/filters/http-exception.filter.ts` (create)
- `src/main.ts` (register filter globally)
