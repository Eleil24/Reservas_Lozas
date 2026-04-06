import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/users/get-users.use-case';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../domain/value-objects/role';
import { CreateUserDto } from '../dtos/users/user.dto';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUsersUseCase: GetUsersUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateUserDto, @Req() req) {
    // Si no es Super Admin, forzamos su tenantId
    if (req.user.role !== Role.SUPER_ADMIN) {
      dto.tenantId = req.user.tenantId;
    }
    
    return this.createUserUseCase.execute(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Req() req) {
    // Si es Super Admin, puede ver todo (pasando undefined)
    const tenantId = req.user.role === Role.SUPER_ADMIN ? undefined : req.user.tenantId;
    return this.getUsersUseCase.execute(tenantId);
  }
}
