import { Injectable, Inject } from '@nestjs/common';
import { FIELD_REPOSITORY } from '../../../domain/repositories/field.repository';
import type { IFieldRepository } from '../../../domain/repositories/field.repository';
import { Field } from '../../../domain/entities/field.entity';

@Injectable()
export class GetFieldsUseCase {
  constructor(
    @Inject(FIELD_REPOSITORY) private fieldRepository: IFieldRepository,
  ) {}

  async execute(tenantId: string): Promise<Field[]> {
    return this.fieldRepository.findAll(tenantId);
  }
}
