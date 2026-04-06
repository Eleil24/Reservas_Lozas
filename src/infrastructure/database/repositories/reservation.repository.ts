import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { IReservationRepository } from '../../../domain/repositories/reservation.repository';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(private db: DatabaseService) {}

  async findById(id: string, tenantId: string): Promise<Reservation | null> {
    const result = await this.db.getOne<any>(
      `SELECT * FROM reservations WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId],
    );
    return result ? this.mapToDomain(result) : null;
  }

  async create(
    reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Reservation> {
    const result = await this.db.getOne<any>(
      `INSERT INTO reservations (user_id, field_id, tenant_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        reservation.userId,
        reservation.fieldId,
        reservation.tenantId,
        reservation.startTime,
        reservation.endTime,
        reservation.status,
      ],
    );
    return this.mapToDomain(result);
  }

  async findAll(tenantId: string): Promise<Reservation[]> {
    const results = await this.db.execute<any>(
      `SELECT * FROM reservations WHERE tenant_id = $1 ORDER BY start_time DESC`,
      [tenantId],
    );
    return results.map(this.mapToDomain);
  }

  async findByUser(userId: string, tenantId: string): Promise<Reservation[]> {
    const results = await this.db.execute<any>(
      `SELECT * FROM reservations WHERE user_id = $1 AND tenant_id = $2 ORDER BY start_time DESC`,
      [userId, tenantId],
    );
    return results.map(this.mapToDomain);
  }

  async findByField(fieldId: string, tenantId: string): Promise<Reservation[]> {
    const results = await this.db.execute<any>(
      `SELECT * FROM reservations WHERE field_id = $1 AND tenant_id = $2 ORDER BY start_time ASC`,
      [fieldId, tenantId],
    );
    return results.map(this.mapToDomain);
  }

  async update(
    id: string,
    tenantId: string,
    reservation: Partial<Reservation>,
  ): Promise<Reservation | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (reservation.status) {
      fields.push(`status = $${paramCount++}`);
      values.push(reservation.status);
    }
    if (reservation.startTime) {
      fields.push(`start_time = $${paramCount++}`);
      values.push(reservation.startTime);
    }
    if (reservation.endTime) {
      fields.push(`end_time = $${paramCount++}`);
      values.push(reservation.endTime);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id, tenantId);

    const result = await this.db.getOne<any>(
      `UPDATE reservations SET ${fields.join(', ')} WHERE id = $${paramCount++} AND tenant_id = $${paramCount++} RETURNING *`,
      values,
    );
    return result ? this.mapToDomain(result) : null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM reservations WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId],
    );
    return result.rowCount! > 0;
  }

  private mapToDomain(row: any): Reservation {
    return new Reservation(
      row.id,
      row.user_id,
      row.field_id,
      row.tenant_id,
      row.start_time,
      row.end_time,
      row.status,
      row.created_at,
      row.updated_at,
    );
  }
}
