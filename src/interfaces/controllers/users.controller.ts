import { Controller, Get, Post, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/users/get-users.use-case';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../domain/value-objects/role';
import { CreateUserDto } from '../dtos/users/user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUsersUseCase: GetUsersUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a new user (Admins, Super Admins)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Cannot create users for other tenants unless Super Admin).' })
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateUserDto, @Req() req) {
    const isSuperAdmin = req.user.role === Role.SUPER_ADMIN;
    const userTenantId = req.user.tenantId;

    // Si no es Super Admin, validamos el tenantId
    if (!isSuperAdmin) {
      if (dto.tenantId && dto.tenantId !== userTenantId) {
        throw new ForbiddenException('You can only create users for your own site (tenant)');
      }
      // Aseguramos que tenga su tenantId asignado
      dto.tenantId = userTenantId;
    }
    
    return this.createUserUseCase.execute(dto);
  }

  @ApiOperation({ summary: 'Get list of users (Admins, Super Admins)' })
  @ApiResponse({ status: 200, description: 'Returns a list of users.' })
  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Req() req) {
    // Si es Super Admin, puede ver todo (pasando undefined)
    const tenantId = req.user.role === Role.SUPER_ADMIN ? undefined : req.user.tenantId;
    return this.getUsersUseCase.execute(tenantId);
  }
}
