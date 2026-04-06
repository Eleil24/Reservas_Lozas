import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { RESERVATION_REPOSITORY } from '../../../domain/repositories/reservation.repository';
import { FIELD_REPOSITORY } from '../../../domain/repositories/field.repository';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import type { IFieldRepository } from '../../../domain/repositories/field.repository';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/value-objects/reservation-status';

export interface CreateReservationDto {
  fieldId: string;
  startTime: Date;
  endTime: Date;
  tenantId: string;
  userId: string;
}

@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private reservationRepository: IReservationRepository,
    @Inject(FIELD_REPOSITORY) private fieldRepository: IFieldRepository,
  ) {}

  async execute(dto: CreateReservationDto): Promise<Reservation> {
    // Check if field exists
    const field = await this.fieldRepository.findById(
      dto.fieldId,
      dto.tenantId,
    );
    if (!field) {
      throw new BadRequestException('Field not found');
    }

    // Check for conflicts
    const existingReservations = await this.reservationRepository.findByField(
      dto.fieldId,
      dto.tenantId,
    );
    const conflict = existingReservations.some(
      (res) =>
        dto.startTime < res.endTime &&
        dto.endTime > res.startTime &&
        res.status !== ReservationStatus.CANCELLED,
    );
    if (conflict) {
      throw new BadRequestException('Time slot is already reserved');
    }

    return this.reservationRepository.create({
      userId: dto.userId,
      fieldId: dto.fieldId,
      tenantId: dto.tenantId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: ReservationStatus.PENDING,
    });
  }
}
