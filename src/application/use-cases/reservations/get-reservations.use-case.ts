import { Injectable, Inject } from '@nestjs/common';
import { RESERVATION_REPOSITORY } from '../../../domain/repositories/reservation.repository';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { Reservation } from '../../../domain/entities/reservation.entity';

@Injectable()
export class GetReservationsUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private reservationRepository: IReservationRepository,
  ) {}

  async execute(tenantId: string, userId?: string): Promise<Reservation[]> {
    if (userId) {
      return this.reservationRepository.findByUser(userId, tenantId);
    }
    return this.reservationRepository.findAll(tenantId);
  }
}
