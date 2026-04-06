import { Tenant } from '../entities/tenant.entity';

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  create(
    tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Tenant>;
  findAll(): Promise<Tenant[]>;
}

export const TENANT_REPOSITORY = 'TENANT_REPOSITORY';
