import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTenantUseCase } from '../../application/use-cases/tenants/create-tenant.use-case';
import { GetTenantsUseCase } from '../../application/use-cases/tenants/get-tenants.use-case';
import { CreateTenantDto } from '../dtos/tenants/create-tenant.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../domain/value-objects/role';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(AuthGuard, RolesGuard)
export class TenantsController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly getTenantsUseCase: GetTenantsUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a new tenant (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.createTenantUseCase.execute(createTenantDto.name);
  }

  @ApiOperation({ summary: 'Get list of all tenants (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns a list of tenants.' })
  @Get()
  @Roles(Role.SUPER_ADMIN)
  async findAll() {
    return this.getTenantsUseCase.execute();
  }
}
