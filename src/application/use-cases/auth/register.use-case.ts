import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import { TENANT_REPOSITORY } from '../../../domain/repositories/tenant.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { ITenantRepository } from '../../../domain/repositories/tenant.repository';
import { AuthService } from '../../services/auth.service';
import { User } from '../../../domain/entities/user.entity';
import { Role } from '../../../domain/value-objects/role';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  tenantName: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: IUserRepository,
    @Inject(TENANT_REPOSITORY) private tenantRepository: ITenantRepository,
    private authService: AuthService,
  ) {}

  async execute(dto: RegisterDto): Promise<{ user: User; token: string }> {
    // Check if tenant exists, if not create it
    let tenant = await this.tenantRepository
      .findAll()
      .then((tenants) => tenants.find((t) => t.name === dto.tenantName));

    if (!tenant) {
      tenant = await this.tenantRepository.create({ name: dto.tenantName });
    }

    // Check if user exists in tenant
    const existingUser = await this.userRepository.findByEmail(
      dto.email,
      tenant.id,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(dto.password);

    // Create user
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: Role.CUSTOMER, // default role
      tenantId: tenant.id,
    });

    // Generate token
    const token = this.authService.generateToken(user);

    return { user, token };
  }
}
