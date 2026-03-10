import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InventoriesService, CreateInventoryDto, UpdateInventoryDto } from './inventories.service';
import {
  CreateInventoryDto as CreateInventoryValidationDto,
  UpdateInventoryDto as UpdateInventoryValidationDto,
  InventoryResponseDto,
  AddToWhitelistDto,
  RemoveFromWhitelistDto,
} from './dto/inventory.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('inventories')
@UseGuards(RolesGuard)
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.RESELLER)
  async create(
    @Body() createInventoryDto: CreateInventoryValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<InventoryResponseDto> {
    // COMPANY_ADMIN can only create company inventories
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (createInventoryDto.companyId !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only create inventories in your own company');
      }
      createInventoryDto.isResellerInventory = false;
    }

    // RESELLER can only create reseller inventories
    if (currentUser.role === UserRole.RESELLER) {
      createInventoryDto.isResellerInventory = true;
      createInventoryDto.resellerId = currentUser._id.toString();
    }

    const inventory = await this.inventoriesService.createInventory(
      createInventoryDto as any,
      currentUser._id.toString(),
    );
    return this.toResponseDto(inventory);
  }

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('resellerId') resellerId?: string,
    @Query('includeReseller') includeReseller?: string,
    @Query('whitelisted') whitelisted?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @CurrentUser() currentUser?: any,
  ): Promise<any> {
    // MASTER_ADMIN can see all inventories with filters
    if (currentUser?.role === UserRole.MASTER_ADMIN) {
      if (companyId) {
        return this.inventoriesService.getInventoriesByCompany(
          companyId,
          page ?? 1,
          limit ?? 10,
          includeReseller === 'true',
        );
      }
      if (resellerId) {
        return this.inventoriesService.getResellerInventories(resellerId);
      }
      throw new BadRequestException('Please specify companyId or resellerId');
    }

    // COMPANY_ADMIN and EMPLOYER can see their company's inventories
    if (currentUser?.role === UserRole.COMPANY_ADMIN || currentUser?.role === UserRole.EMPLOYER) {
      const userCompanyId = currentUser.companyId?.toString();
      if (!userCompanyId) {
        throw new BadRequestException('User company not found');
      }
      return this.inventoriesService.getInventoriesByCompany(
        userCompanyId,
        page ?? 1,
        limit ?? 10,
        true,
      );
    }

    // RESELLER can see their own inventories or whitelisted company inventories
    if (currentUser?.role === UserRole.RESELLER) {
      if (whitelisted === 'true') {
        return this.inventoriesService.getWhitelistedInventoriesForReseller(
          currentUser._id.toString(),
          page ?? 1,
          limit ?? 10,
        );
      }
      return this.inventoriesService.getResellerInventories(currentUser._id.toString());
    }

    throw new ForbiddenException('Unauthorized');
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<InventoryResponseDto> {
    const inventory = await this.inventoriesService.getInventoryByIdWithAccess(
      id,
      currentUser._id.toString(),
      currentUser.role,
      currentUser.companyId,
    );
    return this.toResponseDto(inventory);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.RESELLER)
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<InventoryResponseDto> {
    // Verify access first
    const inventory = await this.inventoriesService.getInventoryByIdWithAccess(
      id,
      currentUser._id.toString(),
      currentUser.role,
      currentUser.companyId,
    );

    // COMPANY_ADMIN can only update company inventories
    if (currentUser.role === UserRole.COMPANY_ADMIN && inventory.isResellerInventory) {
      throw new ForbiddenException('Company admins can only update company inventories');
    }

    // RESELLER can only update their own inventories
    if (currentUser.role === UserRole.RESELLER && !inventory.isResellerInventory) {
      throw new ForbiddenException('Resellers can only update their own inventories');
    }

    const updated = await this.inventoriesService.updateInventory(
      id,
      updateInventoryDto as any,
      currentUser._id.toString(),
    );
    return this.toResponseDto(updated);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.RESELLER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    // Verify access first
    const inventory = await this.inventoriesService.getInventoryByIdWithAccess(
      id,
      currentUser._id.toString(),
      currentUser.role,
      currentUser.companyId,
    );

    // COMPANY_ADMIN can only delete company inventories
    if (currentUser.role === UserRole.COMPANY_ADMIN && inventory.isResellerInventory) {
      throw new ForbiddenException('Company admins can only delete company inventories');
    }

    // RESELLER can only delete their own inventories
    if (currentUser.role === UserRole.RESELLER && !inventory.isResellerInventory) {
      throw new ForbiddenException('Resellers can only delete their own inventories');
    }

    await this.inventoriesService.deleteInventory(id, currentUser._id.toString());
  }

  @Post(':id/whitelist')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async addToWhitelist(
    @Param('id') id: string,
    @Body() addToWhitelistDto: AddToWhitelistDto,
    @CurrentUser() currentUser: any,
  ): Promise<InventoryResponseDto> {
    const inventory = await this.inventoriesService.getInventoryById(id);

    // COMPANY_ADMIN can only modify their own company's inventories
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (inventory.companyId.toString() !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only modify your own company\'s inventories');
      }
    }

    const updated = await this.inventoriesService.addResellerToWhitelist(
      id,
      addToWhitelistDto.resellerId,
      currentUser._id.toString(),
    );
    return this.toResponseDto(updated);
  }

  @Delete(':id/whitelist')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromWhitelist(
    @Param('id') id: string,
    @Body() removeFromWhitelistDto: RemoveFromWhitelistDto,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const inventory = await this.inventoriesService.getInventoryById(id);

    // COMPANY_ADMIN can only modify their own company's inventories
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (inventory.companyId.toString() !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only modify your own company\'s inventories');
      }
    }

    await this.inventoriesService.removeResellerFromWhitelist(
      id,
      removeFromWhitelistDto.resellerId,
      currentUser._id.toString(),
    );
  }

  private toResponseDto(inventory: any): InventoryResponseDto {
    return {
      _id: inventory._id.toString(),
      name: inventory.name,
      companyId: inventory.companyId?.toString(),
      resellerId: inventory.resellerId?.toString(),
      isResellerInventory: inventory.isResellerInventory,
      categories: inventory.categories?.map((c: any) => c.toString()) ?? [],
      whitelist: inventory.whitelist?.map((w: any) => w.toString()) ?? [],
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    };
  }
}
