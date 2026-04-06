# Football Reservations API

A multi-tenant backend API for managing football field reservations built with NestJS, DDD, and Hexagonal Architecture.

## Features

- **Multi-tenancy**: Secure tenant isolation with `tenant_id` in all entities
- **Authentication**: JWT-based auth with user roles (customer, admin)
- **Authorization**: Role-based access control
- **Domain-Driven Design**: Clean architecture with domain, application, and infrastructure layers
- **PostgreSQL**: Robust database with native pg driver
- **Redis**: Caching for field availability
- **Docker**: Containerized deployment

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **Database Driver**: Native PostgreSQL (pg)
- **Cache**: Redis
- **Auth**: JWT
- **Validation**: class-validator
- **Documentation**: Swagger

## Architecture

### Layers
- **Domain**: Entities, Value Objects, Repositories
- **Application**: Use Cases, Services
- **Infrastructure**: Database, Cache, External Services
- **Interfaces**: Controllers, DTOs, Guards, Interceptors

### Multi-tenancy Implementation
- All queries filtered by `tenant_id`
- JWT payload includes `userId`, `tenantId`, `role`
- Guards ensure tenant isolation
- No data leakage between tenants

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Clone and Install
```bash
cd football-reservations
npm install
```

### 2. Environment Setup
Copy `.env` and update values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/football_reservations?schema=public"
JWT_SECRET="your-secret-key"
REDIS_URL="redis://localhost:6379"
```

### 3. Start with Docker
```bash
docker-compose up --build
```

This will:
- Start PostgreSQL and Redis
- Run database migrations
- Seed initial data
- Start the NestJS app on port 3000

### 4. Access
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Fields (Admin only)
- `POST /fields` - Create field
- `GET /fields` - List fields

### Reservations
- `POST /reservations` - Create reservation
- `GET /reservations` - List reservations
- `DELETE /reservations/:id` - Cancel reservation

### Users (Admin only)
- `POST /users` - Create user
- `GET /users` - List users

## Database Schema

### Tenants
- id, name, createdAt, updatedAt

### Users
- id, name, email, password, role, tenantId, createdAt, updatedAt

### Fields
- id, name, description, tenantId, createdAt, updatedAt

### Reservations
- id, userId, fieldId, tenantId, startTime, endTime, status, createdAt, updatedAt

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Deployment to AWS

### ECS with Docker
1. Build and push Docker image to ECR
2. Create ECS cluster with Fargate
3. Configure environment variables
4. Set up RDS PostgreSQL and ElastiCache Redis
5. Deploy service

### Lambda + API Gateway
1. Use serverless framework
2. Configure `serverless.yml`
3. Deploy to Lambda
4. Use Aurora Serverless for DB
5. ElastiCache for Redis

## Security

- JWT authentication
- Role-based authorization
- Input validation with class-validator
- Tenant data isolation
- Password hashing with bcrypt

## Development

```bash
# Start in dev mode
npm run start:dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## Seed Data

Default tenant with admin and customer users:
- Admin: admin@tenant.com / admin123
- Customer: customer@tenant.com / customer123

## License

UNLICENSED
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
