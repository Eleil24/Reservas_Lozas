import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './infrastructure/database/database.service';
import { MigrationService } from './infrastructure/database/migration.service';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { FIELD_REPOSITORY } from './domain/repositories/field.repository';
import { RESERVATION_REPOSITORY } from './domain/repositories/reservation.repository';
import { TENANT_REPOSITORY } from './domain/repositories/tenant.repository';
import { UserRepository } from './infrastructure/database/repositories/user.repository';
import { FieldRepository } from './infrastructure/database/repositories/field.repository';
import { ReservationRepository } from './infrastructure/database/repositories/reservation.repository';
import { TenantRepository } from './infrastructure/database/repositories/tenant.repository';
import { RedisService } from './infrastructure/cache/redis.service';
import { AuthService } from './application/services/auth.service';
import { RegisterUseCase } from './application/use-cases/auth/register.use-case';
import { LoginUseCase } from './application/use-cases/auth/login.use-case';
import { CreateFieldUseCase } from './application/use-cases/fields/create-field.use-case';
import { GetFieldsUseCase } from './application/use-cases/fields/get-fields.use-case';
import { CreateReservationUseCase } from './application/use-cases/reservations/create-reservation.use-case';
import { GetReservationsUseCase } from './application/use-cases/reservations/get-reservations.use-case';
import { CancelReservationUseCase } from './application/use-cases/reservations/cancel-reservation.use-case';
import { CreateUserUseCase } from './application/use-cases/users/create-user.use-case';
import { GetUsersUseCase } from './application/use-cases/users/get-users.use-case';
import { AuthController } from './interfaces/controllers/auth.controller';
import { FieldsController } from './interfaces/controllers/fields.controller';
import { ReservationsController } from './interfaces/controllers/reservations.controller';
import { UsersController } from './interfaces/controllers/users.controller';
import { JwtStrategy } from './interfaces/guards/jwt.strategy';
import { CreateTenantUseCase } from './application/use-cases/tenants/create-tenant.use-case';
import { GetTenantsUseCase } from './application/use-cases/tenants/get-tenants.use-case';
import { TenantsController } from './interfaces/controllers/tenants.controller';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 60 segundos
    }),
  ],
  controllers: [
    AuthController,
    FieldsController,
    ReservationsController,
    UsersController,
    TenantsController,
  ],

  providers: [
    DatabaseService,
    MigrationService,
    RedisService,
    AuthService,
    JwtStrategy,
    // Repositories
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: FIELD_REPOSITORY,
      useClass: FieldRepository,
    },
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationRepository,
    },
    {
      provide: TENANT_REPOSITORY,
      useClass: TenantRepository,
    },
    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    CreateFieldUseCase,
    GetFieldsUseCase,
    CreateReservationUseCase,
    GetReservationsUseCase,
    CancelReservationUseCase,
    CreateUserUseCase,
    GetUsersUseCase,
    CreateTenantUseCase,
    GetTenantsUseCase,
  ],

})
export class AppModule {}
