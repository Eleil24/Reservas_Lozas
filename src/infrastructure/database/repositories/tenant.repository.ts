import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { ITenantRepository } from '../../../domain/repositories/tenant.repository';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(private db: DatabaseService) {}

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.db.getOne<any>(
      `SELECT * FROM tenants WHERE id = $1`,
      [id],
    );
    return result ? this.mapToDomain(result) : null;
  }

  async create(
    tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Tenant> {
    const result = await this.db.getOne<any>(
      `INSERT INTO tenants (name) VALUES ($1) RETURNING *`,
      [tenant.name],
    );
    return this.mapToDomain(result);
  }

  async findAll(): Promise<Tenant[]> {
    const results = await this.db.execute<any>(
      `SELECT * FROM tenants ORDER BY created_at DESC`,
    );
    return results.map(this.mapToDomain);
  }

  private mapToDomain(row: any): Tenant {
    return new Tenant(
      row.id,
      row.name,
      row.created_at,
      row.updated_at,
    );
  }
}
