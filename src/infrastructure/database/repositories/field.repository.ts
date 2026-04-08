import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { Field } from '../../../domain/entities/field.entity';
import { IFieldRepository } from '../../../domain/repositories/field.repository';

@Injectable()
export class FieldRepository implements IFieldRepository {
  constructor(private db: DatabaseService) { }

  async findById(id: string, tenantId: string): Promise<Field | null> {
    const result = await this.db.getOne<any>(
      `SELECT * FROM fields WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId],
    );
    return result ? this.mapToDomain(result) : null;
  }

  async create(
    field: Omit<Field, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Field> {
    const result = await this.db.getOne<any>(
      `INSERT INTO fields (name, description, tenant_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [field.name, field.description, field.tenantId],
    );
    return this.mapToDomain(result);
  }

  async findAll(tenantId: string | null): Promise<Field[]> {
    if (!tenantId) {
      const results = await this.db.execute<any>(
        `SELECT * FROM fields ORDER BY created_at DESC`,
      );
      return results.map(this.mapToDomain);
    }
    const results = await this.db.execute<any>(
      `SELECT * FROM fields WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId],
    );
    return results.map(this.mapToDomain);
  }

  async update(
    id: string,
    tenantId: string,
    field: Partial<Field>,
  ): Promise<Field | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (field.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(field.name);
    }
    if (field.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(field.description);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id, tenantId);

    const result = await this.db.getOne<any>(
      `UPDATE fields SET ${fields.join(', ')} WHERE id = $${paramCount++} AND tenant_id = $${paramCount++} RETURNING *`,
      values,
    );
    return result ? this.mapToDomain(result) : null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM fields WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId],
    );
    return result.rowCount! > 0;
  }

  private mapToDomain(row: any): Field {
    return new Field(
      row.id,
      row.name,
      row.description,
      row.tenant_id,
      row.created_at,
      row.updated_at,
    );
  }
}
