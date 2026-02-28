# Story 5.1-001: Health & System Endpoints

## Metadata
- **Category:** API Development
- **Priority:** High
- **Estimated Effort:** 2 hours
- **Dependencies:** Story 0.3-001, Story 0.3-002
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement health check endpoints to monitor system status including database connectivity (MongoDB) and Redis status. Returns 200 if healthy, 503 if any system is down.

## Tasks
1. Create HealthController
2. Implement GET /health endpoint
3. Implement GET /api/v1/health endpoint
4. Check MongoDB connection status
5. Check Redis connection status
6. Return appropriate status codes
7. Add response DTOs
8. Write integration tests
9. Add Swagger documentation

## Acceptance Criteria
- Both endpoints return system health status
- Check MongoDB connectivity
- Check Redis connectivity
- Return 200 OK if all systems healthy
- Return 503 Service Unavailable if any system down
- Response includes status of each component
- Proper error handling
- Swagger documentation complete

## Technical Notes

### Health Controller Implementation
```typescript
// health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthCheckDto } from './dto/health-check.dto';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('health')
  @ApiOperation({ summary: 'System health check' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'System is unhealthy' })
  async checkHealth(): Promise<HealthCheckDto> {
    return this.healthService.checkHealth();
  }

  @Get('api/v1/health')
  @ApiOperation({ summary: 'API health check' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @ApiResponse({ status: 503, description: 'API is unhealthy' })
  async checkApiHealth(): Promise<HealthCheckDto> {
    return this.healthService.checkHealth();
  }
}
```

### Health Service
```typescript
// health/health.service.ts
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { HealthCheckDto } from './dto/health-check.dto';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private connection: Connection,
    private redisService: RedisService,
  ) {}

  async checkHealth(): Promise<HealthCheckDto> {
    const mongoStatus = await this.checkMongoDb();
    const redisStatus = await this.checkRedis();

    const isHealthy = mongoStatus.healthy && redisStatus.healthy;

    const response: HealthCheckDto = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
    };

    if (!isHealthy) {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }

  private async checkMongoDb(): Promise<{ healthy: boolean; message: string }> {
    try {
      if (this.connection.readyState === 1) {
        return { healthy: true, message: 'Connected' };
      }
      return { healthy: false, message: 'Not connected' };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }

  private async checkRedis(): Promise<{ healthy: boolean; message: string }> {
    try {
      await this.redisService.ping();
      return { healthy: true, message: 'Connected' };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }
}
```

### Health Check DTO
```typescript
// health/dto/health-check.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class ServiceStatus {
  @ApiProperty()
  healthy: boolean;

  @ApiProperty()
  message: string;
}

export class HealthCheckDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  services: {
    mongodb: ServiceStatus;
    redis: ServiceStatus;
  };
}
```

### Redis Service Ping Method
```typescript
// redis/redis.service.ts (add this method)
async ping(): Promise<string> {
  return this.client.ping();
}
```

## Testing Requirements
- Test health endpoint returns 200 when all systems healthy
- Test health endpoint returns 503 when MongoDB down
- Test health endpoint returns 503 when Redis down
- Test response format includes all services
- Test both / health and /api/v1/health endpoints
- Mock database and Redis for unit tests

## Documentation Requirements
- Document health check response format
- Document status codes
- Add Swagger examples
- Document monitoring integration

## Related Files
- `src/health/health.controller.ts` (create)
- `src/health/health.service.ts` (create)
- `src/health/dto/health-check.dto.ts` (create)
- `src/health/health.module.ts` (create)
- `src/redis/redis.service.ts` (update)

## Notes
- Health checks used by load balancers and monitoring tools
- Don't require authentication for health endpoints
- Keep health checks lightweight
- Consider adding memory/CPU metrics
- Can be extended with database query tests
