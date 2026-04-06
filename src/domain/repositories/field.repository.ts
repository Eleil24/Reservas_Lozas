import { Field } from '../entities/field.entity';

export interface IFieldRepository {
  findById(id: string, tenantId: string): Promise<Field | null>;
  create(field: Omit<Field, 'id' | 'createdAt' | 'updatedAt'>): Promise<Field>;
  findAll(tenantId: string): Promise<Field[]>;
  update(
    id: string,
    tenantId: string,
    field: Partial<Field>,
  ): Promise<Field | null>;
  delete(id: string, tenantId: string): Promise<boolean>;
}

export const FIELD_REPOSITORY = 'FIELD_REPOSITORY';
