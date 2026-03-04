import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { OrderType, OrderStatus } from '../schemas/order-request.schema';

export class CreateStandardOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  sourceInventoryId: string;

  @IsMongoId()
  @IsNotEmpty()
  targetInventoryId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  items: string[];
}

export class CreateDevolutionOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  sourceInventoryId: string;

  @IsMongoId()
  @IsNotEmpty()
  targetInventoryId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  items: string[];

  @IsString()
  @IsNotEmpty()
  devolutionReason: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class OrderResponseDto {
  _id!: string;
  orderType!: OrderType;
  status!: OrderStatus;
  creator!: string;
  companyId!: string;
  sourceInventoryId!: string;
  targetInventoryId!: string;
  rejectionReason?: string;
  devolutionReason?: string;
  items!: string[];
  approvedBy?: string;
  approvedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
