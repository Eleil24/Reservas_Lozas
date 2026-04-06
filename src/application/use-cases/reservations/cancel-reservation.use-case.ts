import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { RESERVATION_REPOSITORY } from '../../../domain/repositories/reservation.repository';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/value-objects/reservation-status';

@Injectable()
export class CancelReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private reservationRepository: IReservationRepository,
  ) {}

  async execute(
    id: string,
    tenantId: string,
    userId: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id, tenantId);
    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    const updated = await this.reservationRepository.update(id, tenantId, {
      status: ReservationStatus.CANCELLED,
    });

    if (!updated) {
      throw new BadRequestException('Failed to cancel reservation');
    }

    return updated;
  }
}
