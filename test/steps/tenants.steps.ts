import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/infrastructure/database/database.service';
import { AuthGuard } from '../../src/interfaces/guards/auth.guard';
import { Role } from '../../src/domain/value-objects/role';

/**
 * ============================================================================
 * TEST DE TENANTS (EMPRESAS)
 * ============================================================================
 */

let app: INestApplication;
let response: any;
let currentUser: any = { role: Role.SUPER_ADMIN };
let mockTenants: any[] = [];

// ==========================================
// MOCK DEL DATABASE SERVICE (Simulación de DB)
// ==========================================
const mockDatabaseService = {
  onModuleInit: async () => { },
  onModuleDestroy: async () => { },
  query: async () => { return { rowCount: 1 }; },

  execute: async (queryText: string) => {
    if (typeof queryText === 'string' && queryText.includes('FROM tenants')) {
      return mockTenants;
    }
    return [];
  },

  getOne: async (queryText: string, values: any[]) => {
    if (typeof queryText === 'string' && queryText.includes('INSERT INTO tenants')) {
      return {
        id: 'uuid-' + Math.random().toString(36).substr(2, 9),
        name: values[0],
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    return null;
  },
};

// ==========================================
// CONFIGURACIÓN (SETUP Inicial)
// ==========================================
BeforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DatabaseService)
    .useValue(mockDatabaseService)
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        req.user = currentUser;
        return true;
      },
    })
    .compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});

AfterAll(async () => {
  await app.close();
});

// ==========================================
// 1. PASOS COMUNES (Se usan en varios sitios)
// ==========================================

Given('que el sistema de tenants está limpio', function () {
  mockTenants = [];
});

Then('el código de respuesta de tenants debe ser {int}', function (status) {
  if (response.status !== status) {
    throw new Error(`Se esperaba código ${status} pero se obtuvo ${response.status}. Respuesta: ${JSON.stringify(response.body)}`);
  }
});

// ==========================================
// 2. PASOS ESPECÍFICOS PARA: CREAR (POST)
// ==========================================

Given('que estoy autenticado con el rol {string} de tenants', function (role) {
  currentUser = { role: role === 'super_admin' ? Role.SUPER_ADMIN : Role.ADMIN };
});

When('envío una solicitud POST a {string} con el nombre {string}', async function (path, name) {
  response = await request(app.getHttpServer())
    .post(path)
    .set('Accept', 'application/json')
    .send({ name });
});

Then('el cuerpo de la respuesta debe contener el nombre {string}', function (expectedName) {
  if (response.body.name !== expectedName) {
    throw new Error(`Se esperaba el nombre ${expectedName} pero se obtuvo ${response.body.name}`);
  }
});

// ==========================================
// 3. PASOS ESPECÍFICOS PARA: LISTAR (GET)
// ==========================================

Given('que estoy autenticado como super_admin de tenants', function () {
  currentUser = { role: Role.SUPER_ADMIN };
});

Given('que existen los siguientes tenants en la base de datos:', function (dataTable) {
  mockTenants = dataTable.hashes().map((h: any) => ({
    id: 'id-' + h.name,
    name: h.name,
    created_at: new Date(),
    updated_at: new Date()
  }));
});

When('envío una solicitud GET de tenants a {string}', async function (path) {
  response = await request(app.getHttpServer())
    .get(path)
    .set('Accept', 'application/json');
});

Then('la respuesta debe contener una lista con {int} tenants', function (count) {
  if (response.body.length !== count) {
    throw new Error(`Se esperaba ${count} tenants pero se obtuvo ${response.body.length}`);
  }
});
