import { Inject, Injectable } from '@nestjs/common';
import type { ITenantRepository } from '../../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../../domain/repositories/tenant.repository';
import { Tenant } from '../../../domain/entities/tenant.entity';

@Injectable()
export class GetTenantsUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }
}
