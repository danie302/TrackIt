import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  companyId: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}

export class CategoryResponseDto {
  _id!: string;
  name!: string;
  companyId!: string;
  items?: string[];
  createdAt!: Date;
  updatedAt!: Date;
}
