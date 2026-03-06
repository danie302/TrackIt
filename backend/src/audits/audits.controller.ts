import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuditResponseDto, AuditQueryDto } from './dto/audit.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { EntityType, AuditAction } from './schemas/audit.schema';

@Controller('audits')
@UseGuards(RolesGuard)
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Get()
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async findAll(
    @Query('entityType') entityType?: EntityType,
    @Query('entityId') entityId?: string,
    @Query('action') action?: AuditAction,
    @Query('actor') actor?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @CurrentUser() currentUser?: any,
  ): Promise<any> {
    // If filtering by entity type and ID
    if (entityType && entityId) {
      // COMPANY_ADMIN can only see audits for their own company
      if (currentUser?.role === UserRole.COMPANY_ADMIN) {
        // TODO: Verify entity belongs to user's company
      }

      return this.auditsService.getAuditsByEntity(
        entityType,
        entityId,
        page ?? 1,
        limit ?? 10,
      );
    }

    // If filtering by actor
    if (actor) {
      // COMPANY_ADMIN can only see audits for their own company's users
      if (currentUser?.role === UserRole.COMPANY_ADMIN) {
        // TODO: Verify actor belongs to user's company
      }

      // Users can only see their own audit trail unless they are MASTER_ADMIN
      if (currentUser?.role !== UserRole.MASTER_ADMIN) {
        if (actor !== currentUser._id.toString()) {
          throw new Error('You can only view your own audit trail');
        }
      }

      return this.auditsService.getAuditsByActor(
        actor,
        page ?? 1,
        limit ?? 10,
      );
    }

    // If filtering by company
    // TODO: Add companyId query parameter

    throw new Error('Please specify entityType+entityId or actor');
  }

  @Get('item/:itemId/trail')
  async getItemAuditTrail(
    @Param('itemId') itemId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @CurrentUser() currentUser?: any,
  ): Promise<any> {
    // MASTER_ADMIN can see all item audit trails
    if (currentUser?.role === UserRole.MASTER_ADMIN) {
      return this.auditsService.getItemAuditTrail(
        itemId,
        page ?? 1,
        limit ?? 10,
      );
    }

    // COMPANY_ADMIN can see audit trails for items in their company's inventories
    if (currentUser?.role === UserRole.COMPANY_ADMIN) {
      // TODO: Verify item belongs to company's inventory
      return this.auditsService.getItemAuditTrail(
        itemId,
        page ?? 1,
        limit ?? 10,
      );
    }

    // RESELLER can see audit trails for items in their inventories
    if (currentUser?.role === UserRole.RESELLER) {
      // TODO: Verify item belongs to reseller's inventory
      return this.auditsService.getItemAuditTrail(
        itemId,
        page ?? 1,
        limit ?? 10,
      );
    }

    throw new Error('Unauthorized');
  }

  private toResponseDto(audit: any): AuditResponseDto {
    return {
      _id: audit._id.toString(),
      entityType: audit.entityType,
      entityId: audit.entityId?.toString(),
      action: audit.action,
      actor: audit.actor?.toString(),
      description: audit.description,
      metadata: audit.metadata,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
    };
  }
}
