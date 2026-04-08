import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { CreateReservationUseCase } from '../../application/use-cases/reservations/create-reservation.use-case';
import { GetReservationsUseCase } from '../../application/use-cases/reservations/get-reservations.use-case';
import { CancelReservationUseCase } from '../../application/use-cases/reservations/cancel-reservation.use-case';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../domain/value-objects/role';
import { CreateReservationDto } from '../dtos/reservations/reservation.dto';

@Controller('reservations')
@UseGuards(AuthGuard, RolesGuard)
export class ReservationsController {
  constructor(
    private createReservationUseCase: CreateReservationUseCase,
    private getReservationsUseCase: GetReservationsUseCase,
    private cancelReservationUseCase: CancelReservationUseCase,
  ) { }

  @Post()
  async create(@Body() dto: CreateReservationDto, @Req() req) {
    const userRole = req.user.role;
    let finalTenantId = req.user.tenantId;
    let finalUserId = req.user.userId;

    // Logic for tenantId
    if (userRole === Role.SUPER_ADMIN) {
      if (!dto.tenantId) {
        throw new BadRequestException('tenantId is required for Super Admin');
      }
      finalTenantId = dto.tenantId;
    }

    // Logic for userId
    if (userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN) {
      if (dto.userId) {
        finalUserId = dto.userId;
      }
    } else {
      // Customers can only create reservations for themselves
      finalUserId = req.user.userId;
    }

    return this.createReservationUseCase.execute({
      fieldId: dto.fieldId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      tenantId: finalTenantId,
      userId: finalUserId,
    });
  }

  @Get()
  async findAll(@Req() req) {
    const userRole = req.user.role;

    // Super Admin can see all reservations from all tenants
    if (userRole === Role.SUPER_ADMIN) {
      return this.getReservationsUseCase.execute(undefined, undefined);
    }

    return this.getReservationsUseCase.execute(
      req.user.tenantId,
      userRole === Role.ADMIN ? undefined : req.user.userId,
    );
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Req() req) {
    return this.cancelReservationUseCase.execute(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }
}
