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
import { CategoriesService, CreateCategoryDto, UpdateCategoryDto } from './categories.service';
import {
  CreateCategoryDto as CreateCategoryValidationDto,
  UpdateCategoryDto as UpdateCategoryValidationDto,
  CategoryResponseDto,
} from './dto/category.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('categories')
@UseGuards(RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async create(
    @Body() createCategoryDto: CreateCategoryValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<CategoryResponseDto> {
    // COMPANY_ADMIN can only create categories in their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (createCategoryDto.companyId !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only create categories in your own company');
      }
    }

    const category = await this.categoriesService.createCategory(
      createCategoryDto as any,
      currentUser._id.toString(),
    );
    return this.toResponseDto(category);
  }

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @CurrentUser() currentUser?: any,
  ): Promise<any> {
    let finalCompanyId: string;

    if (!companyId) {
      if (currentUser?.role === UserRole.COMPANY_ADMIN) {
        const userCompanyId = currentUser.companyId?.toString();
        if (!userCompanyId) {
          throw new BadRequestException('Company ID is required');
        }
        finalCompanyId = userCompanyId;
      } else {
        throw new BadRequestException('Company ID is required');
      }
    } else {
      finalCompanyId = companyId;
    }

    // COMPANY_ADMIN can only view categories in their own company
    if (currentUser?.role === UserRole.COMPANY_ADMIN) {
      if (finalCompanyId !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only view categories in your own company');
      }
    }

    return this.categoriesService.getCategoriesByCompany(
      finalCompanyId,
      page ?? 1,
      limit ?? 10,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.getCategoryById(id);

    // COMPANY_ADMIN can only view categories in their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (category.companyId.toString() !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only view categories in your own company');
      }
    }

    return this.toResponseDto(category);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.getCategoryById(id);

    // COMPANY_ADMIN can only update categories in their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (category.companyId.toString() !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only update categories in your own company');
      }
    }

    const updated = await this.categoriesService.updateCategory(
      id,
      updateCategoryDto as any,
      currentUser._id.toString(),
    );
    return this.toResponseDto(updated);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const category = await this.categoriesService.getCategoryById(id);

    // COMPANY_ADMIN can only delete categories in their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (category.companyId.toString() !== currentUser.companyId?.toString()) {
        throw new ForbiddenException('You can only delete categories in your own company');
      }
    }

    await this.categoriesService.deleteCategory(id, currentUser._id.toString());
  }

  private toResponseDto(category: any): CategoryResponseDto {
    return {
      _id: category._id.toString(),
      name: category.name,
      companyId: category.companyId?.toString(),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
