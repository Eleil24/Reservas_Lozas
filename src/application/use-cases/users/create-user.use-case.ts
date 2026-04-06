import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { AuthService } from '../../services/auth.service';
import { User } from '../../../domain/entities/user.entity';
import { Role } from '../../../domain/value-objects/role';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
  tenantId?: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: IUserRepository,
    private authService: AuthService,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      dto.email,
      dto.tenantId,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.authService.hashPassword(dto.password);

    return this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      tenantId: dto.tenantId,
    });
  }
}
