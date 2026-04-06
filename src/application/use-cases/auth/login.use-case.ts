import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { AuthService } from '../../services/auth.service';
import { User } from '../../../domain/entities/user.entity';

export interface LoginDto {
  email: string;
  password: string;
  tenantId?: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: IUserRepository,
    private authService: AuthService,
  ) {}

  async execute(dto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(dto.email, dto.tenantId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.authService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.authService.generateToken(user);

    return { user, token };
  }
}
