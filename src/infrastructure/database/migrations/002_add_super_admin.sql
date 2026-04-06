-- Add super_admin role to the existing enum
-- Note: ALTER TYPE ... ADD VALUE cannot be executed in a transaction in some Postgres versions.
-- However, our migration service and pg driver usually handle this.
ALTER TYPE role ADD VALUE IF NOT EXISTS 'super_admin';

-- Allow tenant_id to be NULL for system users (Super Admins)
ALTER TABLE users ALTER COLUMN tenant_id DROP NOT NULL;
