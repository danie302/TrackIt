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
} from '@nestjs/common';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import {
  CreateUserDto as CreateUserValidationDto,
  UpdateUserDto as UpdateUserValidationDto,
  UserResponseDto,
  ChangePasswordDto,
} from './dto/user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async create(
    @Body() createUserDto: CreateUserValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    // COMPANY_ADMIN can only create users in their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (!createUserDto.companyId) {
        createUserDto.companyId = currentUser.companyId;
      } else if (createUserDto.companyId !== currentUser.companyId?.toString()) {
        throw new Error('You can only create users in your own company');
      }
    }

    // Check role hierarchy
    if (!this.usersService.checkRoleHierarchy(currentUser.role, createUserDto.role)) {
      throw new Error('Cannot create a user with higher or equal role');
    }

    const user = await this.usersService.createUser(
      createUserDto as any,
      currentUser._id.toString(),
    );
    return this.toResponseDto(user);
  }

  @Get('profile')
  async getProfile(@CurrentUser() currentUser: any): Promise<UserResponseDto> {
    return this.toResponseDto(currentUser);
  }

  @Patch('profile')
  async updateProfile(
    @Body() updateUserDto: UpdateUserValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateUser(
      currentUser._id.toString(),
      updateUserDto,
      currentUser._id.toString(),
    );
    return this.toResponseDto(user);
  }

  @Patch('profile/password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    const isPasswordValid = await (currentUser as any).comparePassword(
      changePasswordDto.currentPassword,
    );
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersService.updatePassword(currentUser._id.toString(), hashedPassword);
  }

  @Get()
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @CurrentUser() currentUser: any,
  ): Promise<any> {
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      return this.usersService.getUsersByCompany(
        currentUser.companyId.toString(),
        page,
        limit,
      );
    }
    // MASTER_ADMIN can see all users (we need to implement getAllUsers)
    // For now, return empty result
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    // Users can only see their own profile unless they are MASTER_ADMIN or COMPANY_ADMIN
    if (currentUser.role !== UserRole.MASTER_ADMIN && currentUser.role !== UserRole.COMPANY_ADMIN) {
      if (currentUser._id.toString() !== id) {
        throw new Error('You can only view your own profile');
      }
    }

    // COMPANY_ADMIN can only see users in their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      if (currentUser.companyId?.toString() !== id) {
        throw new Error('You can only view users in your own company');
      }
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.toResponseDto(user);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserValidationDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    // COMPANY_ADMIN can only update users in their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      const user = await this.usersService.findById(id);
      if (!user || user.companyId?.toString() !== currentUser.companyId?.toString()) {
        throw new Error('You can only update users in your own company');
      }
    }

    // Check role hierarchy if changing role
    if (updateUserDto.role) {
      if (!this.usersService.checkRoleHierarchy(currentUser.role, updateUserDto.role)) {
        throw new Error('Cannot assign a higher or equal role');
      }
    }

    const user = await this.usersService.updateUser(
      id,
      updateUserDto,
      currentUser._id.toString(),
    );
    return this.toResponseDto(user);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    // COMPANY_ADMIN can only deactivate users in their own company
    if (currentUser.role === UserRole.COMPANY_ADMIN) {
      const user = await this.usersService.findById(id);
      if (!user || user.companyId?.toString() !== currentUser.companyId?.toString()) {
        throw new Error('You can only deactivate users in your own company');
      }
    }

    // Check role hierarchy
    const targetUser = await this.usersService.findById(id);
    if (targetUser && !this.usersService.checkRoleHierarchy(currentUser.role, targetUser.role)) {
      throw new Error('Cannot deactivate a user with higher or equal role');
    }

    const user = await this.usersService.deactivateUser(
      id,
      currentUser._id.toString(),
    );
    return this.toResponseDto(user);
  }

  private toResponseDto(user: any): UserResponseDto {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      cel: user.cel,
      dni: user.dni,
      typeOfDni: user.typeOfDni,
      role: user.role,
      companyId: user.companyId?.toString(),
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
