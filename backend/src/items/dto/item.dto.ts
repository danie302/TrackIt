import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  Min,
  IsArray,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  serial: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  retailPrice: number;

  @IsMongoId()
  @IsNotEmpty()
  inventoryId: string;

  @IsOptional()
  @IsArray()
  categories?: string[];
}

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  serial?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retailPrice?: number;

  @IsOptional()
  @IsArray()
  categories?: string[];
}

export class ItemResponseDto {
  _id!: string;
  name!: string;
  brand!: string;
  serial!: string;
  price!: number;
  retailPrice!: number;
  inventoryId!: string;
  categories!: string[];
  createdAt!: Date;
  updatedAt!: Date;
}
