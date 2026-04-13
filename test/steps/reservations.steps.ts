import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/infrastructure/database/database.service';
import { AuthGuard } from '../../src/interfaces/guards/auth.guard';
import { Role } from '../../src/domain/value-objects/role';
import { ReservationStatus } from '../../src/domain/value-objects/reservation-status';

/**
 * ============================================================================
 * TEST DE RESERVAS
 * ============================================================================
 */

let app: INestApplication;
let response: any;
let currentUser: any = { userId: 'default-user', role: Role.CUSTOMER, tenantId: 'tenant-1' };
let mockReservations: any[] = [];

// ==========================================
// MOCK DEL DATABASE SERVICE
// ==========================================
const mockDatabaseService = {
  onModuleInit: async () => { },
  onModuleDestroy: async () => { },
  query: async () => { return { rowCount: 1 }; },

  execute: async (queryText: string, values?: any[]) => {
    if (typeof queryText === 'string' && queryText.includes('FROM reservations')) {
      let filtered = [...mockReservations];
      
      // Filtro por tenant_id (si existe en la query)
      if (queryText.includes('tenant_id = $1')) {
        filtered = filtered.filter(r => r.tenant_id === values?.[0]);
      }
      
      // Filtro por user_id (si existe en la query, ej: findByUser)
      if (queryText.includes('user_id = $1') || queryText.includes('user_id = $2')) {
        const userId = queryText.includes('user_id = $1') ? values?.[0] : values?.[1];
        filtered = filtered.filter(r => r.user_id === userId);
      }
      
      return filtered;
    }
    return [];
  },

  getOne: async (queryText: string, values: any[]) => {
    // IMPORTANTE: Simulamos obtención de Field (para que deje crear la reserva)
    if (typeof queryText === 'string' && queryText.includes('FROM fields')) {
      // Devolvemos un objeto que simule ser la cancha
      return { id: values[0], tenant_id: values[1], name: 'Cancha de prueba' };
    }

    // Simulamos creación de reserva (INSERT)
    if (typeof queryText === 'string' && queryText.includes('INSERT INTO reservations')) {
      return {
        id: 'uuid-' + Math.random().toString(36).substr(2, 9),
        user_id: values[0],
        field_id: values[1],
        tenant_id: values[2],
        start_time: values[3],
        end_time: values[4],
        status: values[5],
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    
    // Simulamos obtención por ID (SELECT findById)
    if (typeof queryText === 'string' && queryText.includes('SELECT * FROM reservations WHERE id = $1')) {
      const res = mockReservations.find(r => r.id === values[0]);
      if (res && queryText.includes('tenant_id = $2') && res.tenant_id !== values[1]) {
        return null;
      }
      return res || null;
    }

    // Simulamos actualización (UPDATE para cancelar)
    if (typeof queryText === 'string' && queryText.includes('UPDATE reservations')) {
      const id = values[values.length - 2]; // id está al final
      const resIndex = mockReservations.findIndex(r => r.id === id);
      if (resIndex !== -1) {
        mockReservations[resIndex].status = values[0]; // primer valor suele ser el status
        return mockReservations[resIndex];
      }
    }
    
    return null;
  },
};

// ==========================================
// CONFIGURACIÓN (SETUP)
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
// PASOS COMUNES
// ==========================================

Given('que el sistema de reservas está limpio', function () {
  mockReservations = [];
});

Given('que estoy autenticado como {string} con ID {string} y tenant {string} de reservas', function (role, userId, tenantId) {
  currentUser = { userId, role, tenantId };
});

Given('que estoy autenticado como {string} de reservas', function (role) {
  currentUser = { userId: 'admin-id', role, tenantId: 'any-tenant' };
});

Then('el código de respuesta de reservas debe ser {int}', function (status) {
  if (response.status !== status) {
    throw new Error(`Se esperaba código ${status} pero se obtuvo ${response.status}. Body: ${JSON.stringify(response.body)}`);
  }
});

// ==========================================
// PASOS PARA CREAR (POST)
// ==========================================

When('envío una solicitud POST de reservas a {string} con:', async function (path, dataTable) {
  const data = dataTable.hashes()[0];
  response = await request(app.getHttpServer())
    .post(path)
    .set('Accept', 'application/json')
    .send(data);
});

Then('la reserva devuelta debe pertenecer al usuario {string} y tenant {string}', function (userId, tenantId) {
  if (response.body.userId !== userId) {
    throw new Error(`Se esperaba userId ${userId} pero se obtuvo ${response.body.userId}`);
  }
  if (response.body.tenantId !== tenantId) {
    throw new Error(`Se esperaba tenantId ${tenantId} pero se obtuvo ${response.body.tenantId}`);
  }
});

// ==========================================
// PASOS PARA LISTAR (GET)
// ==========================================

Given('que existen las siguientes reservas:', function (dataTable) {
  mockReservations = dataTable.hashes().map((h: any) => ({
    id: h.id,
    user_id: h.userId,
    tenant_id: h.tenantId,
    field_id: h.fieldId,
    start_time: new Date(),
    end_time: new Date(),
    status: ReservationStatus.CONFIRMED,
    created_at: new Date(),
    updated_at: new Date()
  }));
});

When('envío una solicitud GET de reservas a {string}', async function (path) {
  response = await request(app.getHttpServer())
    .get(path)
    .set('Accept', 'application/json');
});

Then('la respuesta debe contener una lista con {int} reservas', function (count) {
  if (response.body.length !== count) {
    throw new Error(`Se esperaba ${count} reservas pero se obtuvo ${response.body.length}`);
  }
});

// ==========================================
// PASOS PARA CANCELAR (DELETE)
// ==========================================

When('envío una solicitud DELETE a {string}', async function (path) {
  response = await request(app.getHttpServer())
    .delete(path)
    .set('Accept', 'application/json');
});

Then('la reserva debe quedar con estado {string}', function (status) {
  if (response.body.status !== status) {
    throw new Error(`Se esperaba estado ${status} pero se obtuvo ${response.body.status}`);
  }
});
