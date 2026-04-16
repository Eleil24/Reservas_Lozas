import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool | null = null;

  async onModuleInit() {
    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.IS_OFFLINE ? false : {
          rejectUnauthorized: false
        }
      });

      await this.pool.query('SELECT NOW()');
      console.log('✓ Database connected');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        '⚠ Database connection failed, running in memory mode:',
        message,
      );
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query(text: string, values?: any[]): Promise<QueryResult<any>> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.query(text, values);
  }

  async execute<T = any>(text: string, values?: any[]): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    const result = await this.pool.query(text, values);
    return result.rows as T[];
  }

  async getOne<T = any>(text: string, values?: any[]): Promise<T | null> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    const result = await this.pool.query(text, values);
    return (result.rows[0] as T) || null;
  }
}
