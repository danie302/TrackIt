import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsBoolean,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  companyId: string;

  @IsOptional()
  @IsMongoId()
  resellerId?: string;

  @IsOptional()
  @IsBoolean()
  isResellerInventory?: boolean;

  @IsOptional()
  @IsArray()
  categories?: string[];
}

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsMongoId()
  resellerId?: string;

  @IsOptional()
  @IsBoolean()
  isResellerInventory?: boolean;

  @IsOptional()
  @IsArray()
  categories?: string[];
}

export class InventoryResponseDto {
  _id!: string;
  name!: string;
  companyId!: string;
  resellerId?: string;
  isResellerInventory!: boolean;
  categories!: string[];
  whitelist!: string[];
  items?: string[];
  createdAt!: Date;
  updatedAt!: Date;
}

export class AddToWhitelistDto {
  @IsMongoId()
  @IsNotEmpty()
  resellerId: string;
}

export class RemoveFromWhitelistDto {
  @IsMongoId()
  @IsNotEmpty()
  resellerId: string;
}
