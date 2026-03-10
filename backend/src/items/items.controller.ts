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
  BadRequestException,
} from '@nestjs/common';
import { ItemsService, CreateItemDto, UpdateItemDto } from './items.service';
import {
  CreateItemDto as CreateItemValidationDto,
  UpdateItemDto as UpdateItemValidationDto,
  ItemResponseDto,
} from './dto/item.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('items')
@UseGuards(RolesGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYER)
  async create(
    @Body() createItemDto: CreateItemValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ItemResponseDto> {
    // COMPANY_ADMIN and EMPLOYER can only add items to their company's inventories
    if (currentUser.role !== UserRole.MASTER_ADMIN) {
      // TODO: Verify inventory belongs to user's company
    }

    const item = await this.itemsService.addItem(
      createItemDto as any,
      currentUser._id.toString(),
    );
    return this.toResponseDto(item);
  }

  @Get()
  async findAll(
    @Query('inventoryId') inventoryId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<any> {
    if (!inventoryId) {
      throw new BadRequestException('Inventory ID is required');
    }

    return this.itemsService.getItemsByInventory(
      inventoryId,
      page ?? 1,
      limit ?? 10,
      categoryId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ItemResponseDto> {
    // TODO: Verify user has access to this item
    const item = await this.itemsService.getItemById(id);
    return this.toResponseDto(item);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYER)
  async update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ItemResponseDto> {
    // TODO: Verify user has access to update this item
    const item = await this.itemsService.updateItem(
      id,
      updateItemDto as any,
      currentUser._id.toString(),
    );
    return this.toResponseDto(item);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    // TODO: Verify user has access to delete this item
    await this.itemsService.deleteItem(id, currentUser._id.toString());
  }

  @Patch(':id/move')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.RESELLER)
  async move(
    @Param('id') id: string,
    @Body('targetInventoryId') targetInventoryId: string,
    @CurrentUser() currentUser: any,
  ): Promise<ItemResponseDto> {
    // TODO: Verify user has access to both inventories
    const item = await this.itemsService.moveItemBetweenInventories(
      id,
      targetInventoryId,
      currentUser._id.toString(),
    );
    return this.toResponseDto(item);
  }

  private toResponseDto(item: any): ItemResponseDto {
    return {
      _id: item._id.toString(),
      name: item.name,
      brand: item.brand,
      serial: item.serial,
      price: item.price,
      retailPrice: item.retailPrice,
      inventoryId: item.inventoryId?.toString(),
      categories: item.categories?.map((c: any) => c.toString()) ?? [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
