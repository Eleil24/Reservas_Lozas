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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateReservationUseCase } from '../../application/use-cases/reservations/create-reservation.use-case';
import { GetReservationsUseCase } from '../../application/use-cases/reservations/get-reservations.use-case';
import { CancelReservationUseCase } from '../../application/use-cases/reservations/cancel-reservation.use-case';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../domain/value-objects/role';
import { CreateReservationDto } from '../dtos/reservations/reservation.dto';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(AuthGuard, RolesGuard)
export class ReservationsController {
  constructor(
    private createReservationUseCase: CreateReservationUseCase,
    private getReservationsUseCase: GetReservationsUseCase,
    private cancelReservationUseCase: CancelReservationUseCase,
  ) { }

  @ApiOperation({ 
    summary: 'Crear una nueva reserva',
    description: `
### Reglas para crear reservas:
1. **Cliente (CUSTOMER)**: Reserva para sí mismo. No debe enviar 'userId' ni 'tenantId'.
2. **Administrador de Sede (ADMIN)**: Puede reservar para otros usuarios de su misma sede enviando el 'userId'.
3. **Super Administrador (SUPER_ADMIN)**: Debe especificar 'tenantId' y 'userId' para realizar la reserva.`
  })
  @ApiBody({
    type: CreateReservationDto,
    examples: {
      cliente: {
        summary: 'Caso 1: Cliente reserva para sí mismo',
        description: 'Escenario estándar para un usuario final.',
        value: {
          fieldId: 'uuid-cancha-1',
          startTime: '2024-05-20T10:00:00Z',
          endTime: '2024-05-20T11:00:00Z'
        }
      },
      admin: {
        summary: 'Caso 2: Admin reserva para un cliente específico',
        description: 'Se requiere el userId del cliente.',
        value: {
          fieldId: 'uuid-cancha-1',
          startTime: '2024-05-20T15:00:00Z',
          endTime: '2024-05-20T16:00:00Z',
          userId: 'uuid-del-cliente'
        }
      },
      superadmin: {
        summary: 'Caso 3: Super Admin reserva en cualquier sede',
        description: 'Requiere especificar tanto la sede (tenantId) como el cliente (userId).',
        value: {
          fieldId: 'uuid-cancha-1',
          startTime: '2024-05-20T20:00:00Z',
          endTime: '2024-05-20T21:00:00Z',
          tenantId: 'uuid-de-la-sede',
          userId: 'uuid-del-cliente'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Reserva creada con éxito.' })
  @ApiResponse({ status: 400, description: 'Error en la petición (ej. fechas inválidas o falta tenantId para Super Admin).' })
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

  @ApiOperation({ summary: 'Get all reservations based on user role' })
  @ApiResponse({ status: 200, description: 'Returns a list of reservations.' })
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

  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled successfully.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @Delete(':id')
  async cancel(@Param('id') id: string, @Req() req) {
    return this.cancelReservationUseCase.execute(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }
}
