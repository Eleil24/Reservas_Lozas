import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Delete,
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
  ) {}

  @Post()
  async create(@Body() dto: CreateReservationDto, @Req() req) {
    return this.createReservationUseCase.execute({
      fieldId: dto.fieldId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      tenantId: req.user.tenantId,
      userId: req.user.userId,
    });
  }

  @Get()
  async findAll(@Req() req) {
    return this.getReservationsUseCase.execute(
      req.user.tenantId,
      req.user.role === Role.ADMIN ? undefined : req.user.userId,
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
