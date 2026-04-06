import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: IUserRepository,
  ) {}

  async execute(tenantId?: string): Promise<User[]> {
    return this.userRepository.findAll(tenantId);
  }
}
