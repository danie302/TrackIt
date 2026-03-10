import {
  Controller,
  Get,
  Post,
  Patch,
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
import { OrdersService, CreateStandardOrderDto, CreateDevolutionOrderDto } from './orders.service';
import {
  CreateStandardOrderDto as CreateStandardValidationDto,
  CreateDevolutionOrderDto as CreateDevolutionValidationDto,
  UpdateOrderStatusDto,
  OrderResponseDto,
} from './dto/order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('standard')
  @Roles(UserRole.RESELLER)
  async createStandard(
    @Body() createOrderDto: CreateStandardValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<OrderResponseDto> {
    // Verify inventories are whitelisted or user has access
    // TODO: Add proper access checks

    const order = await this.ordersService.createStandardOrder(
      {
        creatorId: currentUser._id.toString(),
        companyId: currentUser.companyId?.toString() || '',
        companyInventoryId: createOrderDto.sourceInventoryId,
        resellerInventoryId: createOrderDto.targetInventoryId,
        itemIds: createOrderDto.items,
      },
      currentUser._id.toString(),
    );
    return this.toResponseDto(order);
  }

  @Post('devolution')
  @Roles(UserRole.RESELLER)
  async createDevolution(
    @Body() createOrderDto: CreateDevolutionValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<OrderResponseDto> {
    // Verify inventories and access
    // TODO: Add proper access checks

    const order = await this.ordersService.createDevolutionOrder(
      {
        creatorId: currentUser._id.toString(),
        companyId: currentUser.companyId?.toString() || '',
        resellerInventoryId: createOrderDto.sourceInventoryId,
        companyInventoryId: createOrderDto.targetInventoryId,
        itemIds: createOrderDto.items,
        devolutionReason: createOrderDto.devolutionReason,
      },
      currentUser._id.toString(),
    );
    return this.toResponseDto(order);
  }

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('resellerId') resellerId?: string,
    @Query('status') status?: string,
    @Query('orderType') orderType?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @CurrentUser() currentUser?: any,
  ): Promise<any> {
    // MASTER_ADMIN can see all orders
    if (currentUser?.role === UserRole.MASTER_ADMIN) {
      if (companyId) {
        return this.ordersService.getOrdersByCompany(
          companyId,
          page ?? 1,
          limit ?? 10,
          status as any,
        );
      }
      if (resellerId) {
        return this.ordersService.getOrdersByReseller(
          resellerId,
          page ?? 1,
          limit ?? 10,
          status as any,
        );
      }
      throw new BadRequestException('Please specify companyId or resellerId');
    }

    // COMPANY_ADMIN and EMPLOYER can see orders for their company
    if (currentUser?.role === UserRole.COMPANY_ADMIN || currentUser?.role === UserRole.EMPLOYER) {
      const userCompanyId = currentUser.companyId?.toString();
      if (!userCompanyId) {
        throw new BadRequestException('User company not found');
      }
      return this.ordersService.getOrdersByCompany(
        userCompanyId,
        page ?? 1,
        limit ?? 10,
        status as any,
      );
    }

    // RESELLER can see their own orders
    if (currentUser?.role === UserRole.RESELLER) {
      return this.ordersService.getOrdersByReseller(
        currentUser._id.toString(),
        page ?? 1,
        limit ?? 10,
        status as any,
        orderType as any,
      );
    }

    throw new ForbiddenException('Unauthorized');
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<OrderResponseDto> {
    // TODO: Verify user has access to this order
    const order = await this.ordersService.getOrderById(id);

    // Check access based on user role
    if (currentUser.role === UserRole.RESELLER) {
      if (order.creator.toString() !== currentUser._id.toString()) {
        throw new ForbiddenException('You can only view your own orders');
      }
    }

    if (currentUser.role === UserRole.COMPANY_ADMIN || currentUser.role === UserRole.EMPLOYER) {
      if (order.companyId.toString() !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only view orders for your company');
      }
    }

    return this.toResponseDto(order);
  }

  @Patch(':id/approve')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYER)
  async approve(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<OrderResponseDto> {
    // COMPANY_ADMIN and EMPLOYER can only approve orders for their company
    const order = await this.ordersService.getOrderById(id);
    if (currentUser.role === UserRole.COMPANY_ADMIN || currentUser.role === UserRole.EMPLOYER) {
      if (order.companyId.toString() !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only approve orders for your company');
      }
    }

    const updated = await this.ordersService.approveOrder(
      id,
      currentUser._id.toString(),
    );
    return this.toResponseDto(updated);
  }

  @Patch(':id/reject')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYER)
  async reject(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
    @CurrentUser() currentUser: any,
  ): Promise<OrderResponseDto> {
    // COMPANY_ADMIN and EMPLOYER can only reject orders for their company
    const order = await this.ordersService.getOrderById(id);
    if (currentUser.role === UserRole.COMPANY_ADMIN || currentUser.role === UserRole.EMPLOYER) {
      if (order.companyId.toString() !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only reject orders for your company');
      }
    }

    const updated = await this.ordersService.rejectOrder(
      id,
      currentUser._id.toString(),
      rejectionReason,
    );
    return this.toResponseDto(updated);
  }

  private toResponseDto(order: any): OrderResponseDto {
    return {
      _id: order._id.toString(),
      orderType: order.orderType,
      status: order.status,
      creator: order.creator?.toString(),
      companyId: order.companyId?.toString(),
      sourceInventoryId: order.sourceInventoryId?.toString(),
      targetInventoryId: order.targetInventoryId?.toString(),
      rejectionReason: order.rejectionReason,
      devolutionReason: order.devolutionReason,
      items: order.items?.map((i: any) => i.toString()) ?? [],
      approvedBy: order.approvedBy?.toString(),
      approvedAt: order.approvedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
