import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('--- Seeding Database ---');

    // 1. Create Super Admin user
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      ['Super Admin', 'super@sistema.com', superAdminPassword, 'super_admin', null],
    );
    console.log('✓ Super Admin user check complete');

    // 2. Create or Get Default Tenant
    let tenantId: string;
    const existingTenant = await pool.query(
      `SELECT id FROM tenants WHERE name = $1`,
      ['Default Tenant'],
    );

    if (existingTenant.rows.length > 0) {
      tenantId = existingTenant.rows[0].id;
      console.log(`✓ Tenant already exists: ${tenantId}`);
    } else {
      const tenantResult = await pool.query(
        `INSERT INTO tenants (name) VALUES ($1) RETURNING id`,
        ['Default Tenant'],
      );
      tenantId = tenantResult.rows[0].id;
      console.log(`✓ Tenant created: ${tenantId}`);
    }

    // 3. Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      ['Admin User', 'admin@tenant.com', adminPassword, 'admin', tenantId],
    );
    console.log('✓ Admin user check complete');

    // 4. Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email, tenant_id) DO NOTHING`,
      ['Customer User', 'customer@tenant.com', customerPassword, 'customer', tenantId],
    );
    console.log('✓ Customer user check complete');

    // 5. Create fields
    const fieldsToCreate = [
      { name: 'Field 1', description: 'Main football field' },
      { name: 'Field 2', description: 'Secondary field' },
    ];

    for (const field of fieldsToCreate) {
      const existingField = await pool.query(
        `SELECT id FROM fields WHERE name = $1 AND tenant_id = $2`,
        [field.name, tenantId],
      );

      if (existingField.rows.length === 0) {
        await pool.query(
          `INSERT INTO fields (name, description, tenant_id)
           VALUES ($1, $2, $3)`,
          [field.name, field.description, tenantId],
        );
        console.log(`✓ Field ${field.name} created`);
      } else {
        console.log(`✓ Field ${field.name} already exists`);
      }
    }

    console.log('✓ Seed process finished successfully');
  } catch (error: any) {
    console.error('Seed error:', error.message);
  } finally {
    await pool.end();
  }
}

seed();