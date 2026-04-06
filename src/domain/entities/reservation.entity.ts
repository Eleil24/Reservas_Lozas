import { ReservationStatus } from '../value-objects/reservation-status';

export class Reservation {
  constructor(
    public id: string,
    public userId: string,
    public fieldId: string,
    public tenantId: string,
    public startTime: Date,
    public endTime: Date,
    public status: ReservationStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
