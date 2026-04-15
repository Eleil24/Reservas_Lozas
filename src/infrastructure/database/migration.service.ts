import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(private db: DatabaseService) {}

  async onModuleInit() {
    try {
      console.log('--- Database Migrations ---');
      
      // Ensure migrations history table exists
      await this.ensureMigrationTable();

      // Get applied migrations from history
      const appliedMigrations = await this.getAppliedMigrations();
      console.log(`Already applied: ${appliedMigrations.length} migrations`);

      // Handle both development (src/) and production (dist/) paths
      let migrationsPath = path.join(__dirname, 'migrations');

      if (!fs.existsSync(migrationsPath)) {
        // En Lambda, NestJS pone los assets en dist/infrastructure/... al compilar
        const prodPath = path.join(process.cwd(), 'dist', 'infrastructure', 'database', 'migrations');
        if (fs.existsSync(prodPath)) {
          migrationsPath = prodPath;
        } else {
          // Fallback para desarrollo local
          migrationsPath = path.join(
            process.cwd(),
            'src',
            'infrastructure',
            'database',
            'migrations',
          );
        }
      }

      // Get all .sql files sorted by name
      const files = fs
        .readdirSync(migrationsPath)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      let executedCount = 0;

      for (const file of files) {
        // Skip if already applied
        if (appliedMigrations.includes(file)) {
          continue;
        }

        console.log(`Applying migration: ${file}...`);
        
        try {
          const filePath = path.join(migrationsPath, file);
          const sql = fs.readFileSync(filePath, 'utf-8');

          // Execute the entire SQL file at once
          // This allows using blocks like DO $$ ... END $$ with internal semicolons
          await this.db.query(sql);

          // Record as applied
          await this.recordMigration(file);
          console.log(`✓ ${file} applied successfully`);
          executedCount++;
        } catch (error: any) {
          // If it's a first run with existing tables, we might want to still record it
          // OR we let it fail and show warning. For now, let's show warning.
          console.error(`✖ Error applying ${file}:`, error.message);
          throw error; // Stop if a new migration fails
        }
      }

      if (executedCount === 0) {
        console.log('✓ Everything is up to date.');
      } else {
        console.log(`✓ Migration process finished (${executedCount} new migration(s) applied).`);
      }
    } catch (error) {
      console.warn('⚠ Migration service skipped or failed:', error instanceof Error ? error.message : String(error));
    }
  }

  private async ensureMigrationTable() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS migrations_history (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async getAppliedMigrations(): Promise<string[]> {
    const rows = await this.db.execute<{ filename: string }>(
      'SELECT filename FROM migrations_history ORDER BY id ASC'
    );
    return rows.map(r => r.filename);
  }

  private async recordMigration(filename: string) {
    await this.db.query(
      'INSERT INTO migrations_history (filename) VALUES ($1)',
      [filename]
    );
  }
}
