import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
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
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYER, UserRole.RESELLER)
  async findAll(
    @Query('entityType') entityType?: EntityType,
    @Query('entityId') entityId?: string,
    @Query('action') action?: AuditAction,
    @Query('actor') actor?: string,
    @Query('companyId') companyId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @CurrentUser() currentUser?: any,
  ): Promise<any> {
    // If filtering by entity type and ID
    if (entityType && entityId) {
      return this.auditsService.getAuditsByEntity(
        entityType,
        entityId,
        page ?? 1,
        limit ?? 10,
      );
    }

    // If filtering by actor
    if (actor) {
      if (currentUser?.role !== UserRole.MASTER_ADMIN) {
        if (actor !== currentUser._id.toString()) {
          throw new ForbiddenException('You can only view your own audit trail');
        }
      }
      return this.auditsService.getAuditsByActor(actor, page ?? 1, limit ?? 10);
    }

    // Company-scoped audits
    if (companyId) {
      if (currentUser?.role !== UserRole.MASTER_ADMIN) {
        if (companyId !== currentUser.companyId?.toString()) {
          throw new ForbiddenException('You can only view audits for your own company');
        }
      }
      return this.auditsService.getAuditsByCompany(companyId, page ?? 1, limit ?? 10, action);
    }

    // Auto-scope for company roles
    if (currentUser?.role === UserRole.COMPANY_ADMIN || currentUser?.role === UserRole.EMPLOYER) {
      const userCompanyId = currentUser.companyId?.toString();
      if (!userCompanyId) throw new BadRequestException('User company not found');
      return this.auditsService.getAuditsByCompany(userCompanyId, page ?? 1, limit ?? 10, action);
    }

    // Resellers see their own actor audit trail
    if (currentUser?.role === UserRole.RESELLER) {
      return this.auditsService.getAuditsByActor(currentUser._id.toString(), page ?? 1, limit ?? 10);
    }

    throw new BadRequestException('Please specify companyId, entityType+entityId, or actor');
  }

  @Get(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYER, UserRole.RESELLER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser?: any,
  ): Promise<any> {
    const audit = await this.auditsService.findById(id);
    if (!audit) throw new NotFoundException('Audit record not found');

    // Scope check: company roles can only view audits for their company
    if (
      currentUser?.role !== UserRole.MASTER_ADMIN &&
      currentUser?.role !== UserRole.RESELLER
    ) {
      const userCompany = currentUser.companyId?.toString();
      if (audit.companyId?.toString() !== userCompany) {
        throw new ForbiddenException('Access denied');
      }
    }

    return audit;
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

    throw new ForbiddenException('Unauthorized');
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
