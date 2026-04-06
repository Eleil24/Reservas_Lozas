import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private db: DatabaseService) {}

  async findById(id: string, tenantId?: string): Promise<User | null> {
    let query = `SELECT * FROM users WHERE id = $1`;
    const params: any[] = [id];
    
    if (tenantId) {
      query += ` AND tenant_id = $2`;
      params.push(tenantId);
    } else {
      query += ` AND tenant_id IS NULL`;
    }

    const result = await this.db.getOne<any>(query, params);
    return result ? this.mapToDomain(result) : null;
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    let query = `SELECT * FROM users WHERE email = $1`;
    const params: any[] = [email];
    
    if (tenantId) {
      query += ` AND tenant_id = $2`;
      params.push(tenantId);
    } else {
      query += ` AND tenant_id IS NULL`;
    }

    const result = await this.db.getOne<any>(query, params);
    return result ? this.mapToDomain(result) : null;
  }

  async create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const result = await this.db.getOne<any>(
      `INSERT INTO users (name, email, password, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.name, user.email, user.password, user.role, user.tenantId],
    );
    return this.mapToDomain(result);
  }

  async findAll(tenantId?: string): Promise<User[]> {
    let query = `SELECT * FROM users`;
    const params: any[] = [];
    
    if (tenantId) {
      query += ` WHERE tenant_id = $1`;
      params.push(tenantId);
    }

    query += ` ORDER BY created_at DESC`;
    const results = await this.db.execute<any>(query, params);
    return results.map(this.mapToDomain);
  }

  async update(
    id: string,
    tenantId: string | undefined,
    user: Partial<User>,
  ): Promise<User | null> {
    const fieldsText: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (user.name) {
      fieldsText.push(`name = $${paramCount++}`);
      values.push(user.name);
    }
    if (user.email) {
      fieldsText.push(`email = $${paramCount++}`);
      values.push(user.email);
    }
    if (user.password) {
      fieldsText.push(`password = $${paramCount++}`);
      values.push(user.password);
    }
    if (user.role) {
      fieldsText.push(`role = $${paramCount++}`);
      values.push(user.role);
    }

    if (fieldsText.length === 0) return null;

    fieldsText.push(`updated_at = NOW()`);
    
    let query = `UPDATE users SET ${fieldsText.join(', ')} WHERE id = $${paramCount++}`;
    values.push(id);

    if (tenantId) {
      query += ` AND tenant_id = $${paramCount++}`;
      values.push(tenantId);
    } else {
      query += ` AND tenant_id IS NULL`;
    }

    query += ` RETURNING *`;

    const result = await this.db.getOne<any>(query, values);
    return result ? this.mapToDomain(result) : null;
  }

  async delete(id: string, tenantId?: string): Promise<boolean> {
    let query = `DELETE FROM users WHERE id = $1`;
    const params: any[] = [id];

    if (tenantId) {
      query += ` AND tenant_id = $2`;
      params.push(tenantId);
    } else {
      query += ` AND tenant_id IS NULL`;
    }

    const result = await this.db.query(query, params);
    return result.rowCount! > 0;
  }

  private mapToDomain(row: any): User {
    return new User(
      row.id,
      row.name,
      row.email,
      row.password,
      row.role,
      row.tenant_id,
      row.created_at,
      row.updated_at,
    );
  }
}
