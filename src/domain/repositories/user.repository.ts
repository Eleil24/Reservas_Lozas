import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string, tenantId?: string): Promise<User | null>;
  findByEmail(email: string, tenantId?: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findAll(tenantId?: string): Promise<User[]>;
  update(
    id: string,
    tenantId: string | undefined,
    user: Partial<User>,
  ): Promise<User | null>;
  delete(id: string, tenantId?: string): Promise<boolean>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
