import { Injectable, Inject } from '@nestjs/common';
import { FIELD_REPOSITORY } from '../../../domain/repositories/field.repository';
import type { IFieldRepository } from '../../../domain/repositories/field.repository';
import { Field } from '../../../domain/entities/field.entity';

export interface CreateFieldDto {
  name: string;
  description?: string;
  tenantId: string;
}

@Injectable()
export class CreateFieldUseCase {
  constructor(
    @Inject(FIELD_REPOSITORY) private fieldRepository: IFieldRepository,
  ) {}

  async execute(dto: CreateFieldDto): Promise<Field> {
    return this.fieldRepository.create({
      name: dto.name,
      description: dto.description,
      tenantId: dto.tenantId,
    });
  }
}
