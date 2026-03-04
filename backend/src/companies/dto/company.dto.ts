import { IsString, IsOptional, IsNotEmpty, Matches, IsMongoId } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]+$/, {
    message: 'NIT must be uppercase alphanumeric characters only',
  })
  nit: string;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @Matches(/^[A-Z0-9]+$/, {
    message: 'NIT must be uppercase alphanumeric characters only',
  })
  nit?: string;
}

export class CompanyResponseDto {
  _id!: string;
  name!: string;
  logo?: string;
  nit!: string;
  users?: string[];
  inventories?: string[];
  createdAt!: Date;
  updatedAt!: Date;
}
