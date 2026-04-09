import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFieldUseCase } from '../../application/use-cases/fields/create-field.use-case';
import { GetFieldsUseCase } from '../../application/use-cases/fields/get-fields.use-case';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../domain/value-objects/role';
import { CreateFieldDto } from '../dtos/fields/field.dto';

@ApiTags('fields')
@ApiBearerAuth()
@Controller('fields')
@UseGuards(AuthGuard, RolesGuard)
export class FieldsController {
  constructor(
    private createFieldUseCase: CreateFieldUseCase,
    private getFieldsUseCase: GetFieldsUseCase,
  ) { }

  @ApiOperation({ summary: 'Create a new football field (Admins, Super Admins)' })
  @ApiResponse({ status: 201, description: 'Field created successfully.' })
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateFieldDto, @Req() req) {
    if (req.user.role !== Role.SUPER_ADMIN) {
      dto.tenantId = req.user.tenantId;
    }
    return this.createFieldUseCase.execute(dto);
  }

  @ApiOperation({ summary: 'Get list of football fields (Contextual to role)' })
  @ApiResponse({ status: 200, description: 'Returns a list of football fields.' })
  @Get()
  async findAll(@Req() req) {
    const tenantId = req.user.role == Role.SUPER_ADMIN ? null : req.user.tenantId;
    return this.getFieldsUseCase.execute(tenantId);
  }
}
