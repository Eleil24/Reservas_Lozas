import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/infrastructure/database/database.service';
import { AuthGuard } from '../../src/interfaces/guards/auth.guard';
import { RolesGuard } from '../../src/interfaces/guards/roles.guard';

let app: INestApplication;
let userData: any;
let response: any;

// ==========================================
// MOCK DEL DATABASE SERVICE
// ==========================================
// Esto simula las respuestas de la base de datos sin conectarse a ella
const mockDatabaseService = {
  // onModuleInit y Destroy vacíos para que no intente conectar a PG
  onModuleInit: async () => {},
  onModuleDestroy: async () => {},
  query: async () => {},
  
  execute: async (queryText: any) => {
    // Si busca todos los tenants (en el RegisterUseCase chequea todos los tenants)
        if (typeof queryText === 'string' && queryText.includes('FROM tenants')) {
      return [{ id: 'uuid-1234', name: 'Tenant Prueba' }];
    }
    
    // Si busca todos los usuarios (en el GetUsersUseCase o UserRepository.findAll)
    if (typeof queryText === 'string' && queryText.includes('FROM users')) {
      return [
        { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin', tenant_id: '123' },
        { id: 2, name: 'Juan', email: 'juan@test.com', role: 'customer', tenant_id: '123' }
      ];
    }
    
    return [];
  },
  
  getOne: async (queryText: any, values: any) => {
    // Si busca un usuario para verificar que no exista (findByEmail) o por ID
    // Retornamos null simulando que el email está libre, excepto para un email/id específico mockeado.
    if (typeof queryText === 'string' && queryText.includes('FROM users') && queryText.includes('email = $1')) {
      if (values[0] === 'test@example.com') {
        return {
          id: 99,
          name: 'Juan',
          email: 'test@example.com',
          role: 'customer'
        };
      }
      return null;
    }
    
    // Búsqueda por ID (findById)
    if (typeof queryText === 'string' && queryText.includes('FROM users') && queryText.includes('id = $1')) {
      if (Number(values[0]) === 99 || values[0] === '99') {
        return {
          id: 99,
          name: 'Juan',
          email: 'test@example.com',
          role: 'customer',
          tenant_id: 'uuid-1234'
        };
      }
      return null;
    }
    
    // Si es una inserción (crear el usuario), simulamos el ID autogenerado que retornaría PG
    if (typeof queryText === 'string' && queryText.includes('INSERT INTO users')) {
      return {
        id: 99,
        name: values[0],
        email: values[1],
        password: values[2],
        role: values[3],
        tenant_id: values[4]
      };
    }
    return null;
  },
};

// ==========================================
// GANCHOS (HOOKS)
// ==========================================
BeforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    // Aquí es donde inyectamos el Mock en lugar del servicio real de Base de Datos
    .overrideProvider(DatabaseService)
    .useValue(mockDatabaseService)
    // Sobrescribimos el AuthGuard para simular el token JWT y pasar el tenantId
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        // Simulamos que el JWT fue desencriptado y tiene este contenido
        req.user = { id: 1, role: 'admin', tenantId: '123' };
        return true;
      },
    })
    // Sobrescribimos el RolesGuard para que siempre permita el acceso en la prueba
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});

AfterAll(async () => {
  await app.close();
});

// ==========================================
// PASOS DE CUCUMBER (STEPS)
// ==========================================
Given('que envío los datos de un nuevo usuario:', function (dataTable) {
  // dataTable.hashes()[0] convierte la tablita del .feature a un objeto JSON
  userData = dataTable.hashes()[0];
});

When('realizo una petición POST a {string}', async function (path) {
  // Hacemos el request usando Supertest (simulando que postman ataca la app)
  response = await request(app.getHttpServer())
    .post(path)
    .send(userData);
});

Then('la respuesta debe tener un código de estado {int}', function (status) {
  if (response.status !== status) {
    throw new Error(`Se esperaba código ${status} pero se obtuvo ${response.status}. Body: ${JSON.stringify(response.body)}`);
  }
});

Then('el cuerpo de la respuesta debe incluir el email {string}', function (expectedEmail) {
  // Ajustado para funcionar con respuestas donde el user está anidado (POST) o es la raíz (GET)
  const bodyEmail = response.body?.user ? response.body.user.email : response.body?.email;
  if (bodyEmail !== expectedEmail) {
    throw new Error(`Se esperaba el email ${expectedEmail} pero se obtuvo ${bodyEmail}. Body: ${JSON.stringify(response.body)}`);
  }
});

Given('que existen usuarios en el sistema', function () {
  // El mockDatabaseService de arriba en la función 'execute' ya se encarga de retornar
  // un array estático cuando se consulte 'FROM users'.
});

When('realizo una petición GET a {string}', async function (path) {
  // En caso de que el endpoint requiera un token de admin, podrías necesitar agregar un .set('Authorization', 'Bearer token...')
  // Por ahora hacemos la petición estándar.
  response = await request(app.getHttpServer()).get(path);
});

Then('la respuesta debe contener una lista de usuarios', function () {
  if (!Array.isArray(response.body)) {
    throw new Error(`Se esperaba que el body fuera un Array, pero se obtuvo: ${typeof response.body}. Contenido: ${JSON.stringify(response.body)}`);
  }
  if (response.body.length === 0) {
    throw new Error('Se obtuvo un arreglo pero estaba vacío.');
  }
});
