import { Reservation } from '../entities/reservation.entity';

export interface IReservationRepository {
  findById(id: string, tenantId: string): Promise<Reservation | null>;
  create(
    reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Reservation>;
  findAll(tenantId: string): Promise<Reservation[]>;
  findByUser(userId: string, tenantId: string): Promise<Reservation[]>;
  findByField(fieldId: string, tenantId: string): Promise<Reservation[]>;
  update(
    id: string,
    tenantId: string,
    reservation: Partial<Reservation>,
  ): Promise<Reservation | null>;
  delete(id: string, tenantId: string): Promise<boolean>;
}

export const RESERVATION_REPOSITORY = 'RESERVATION_REPOSITORY';
