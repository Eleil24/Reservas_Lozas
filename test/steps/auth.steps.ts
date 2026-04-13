import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
const bcrypt = require('bcrypt');
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/infrastructure/database/database.service';

let app: INestApplication;
let registerData: any;
let response: any;

const mockDatabaseService = {
    onModuleInit: async () => { },
    onModuleDestroy: async () => { },
    query: async () => ({ rowCount: 1 }),

    execute: async (queryText: string) => {
        // Para el registro suele chequear si el tenant existe
        if (queryText.includes('FROM tenants')) {
            return [{ id: 'tenant-1', name: 'Tenant 1' }];
        }
        return [];
    },

    getOne: async (queryText: string, values: any[]) => {
        // Mock para verificar si el usuario ya existe (Register) 
        // o para obtenerlo (Login)
        if (queryText.includes('FROM users WHERE email = $1')) {
            // Si el email es el que usamos en el login, devolvemos un usuario con password hasheada
            if (values[0] === 'test@test.com') {
                return {
                    id: 1,
                    name: 'Test User',
                    email: 'test@test.com',
                    password: await bcrypt.hash('123456', 10),
                    role: 'customer',
                    tenant_id: 'tenant-1'
                };
            }
            return null; // El usuario no existe (bueno para el registro)
        }

        // Mock para la inserción del usuario (Register)
        if (queryText.includes('INSERT INTO users')) {
            return {
                id: 100,
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

BeforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(DatabaseService)
        .useValue(mockDatabaseService)
        .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
});

AfterAll(async () => {
    await app.close();
});

// --- PASOS DE REGISTRO ---

Given('que tengo los datos de registro:', function (dataTable) {
    registerData = dataTable.hashes()[0];
});

When('envío una solicitud POST de registro a {string}', async function (path) {
    response = await request(app.getHttpServer())
        .post(path)
        .send(registerData);
});

Then('el cuerpo debe incluir un mensaje de éxito', function () {
    // Ajusta esto según lo que devuelva tu RegisterUseCase
    // Normalmente devuelve el usuario o un mensaje. 
    // Aquí verificamos que no sea un error.
    if (response.body.error) {
        throw new Error(`Error en el registro: ${response.body.message}`);
    }
});

// --- PASOS DE LOGIN ---

Given('que existe un usuario con email {string} y password {string}', function (email, password) {
    // El mockDatabaseService ya está configurado para manejar 'test@test.com'
});

When('envío mis credenciales de acceso a {string}', async function (path) {
    response = await request(app.getHttpServer())
        .post(path)
        .send({ email: 'test@test.com', password: '123456' });
});

Then('la respuesta debe incluir un {string}', function (key) {
    if (!response.body[key]) {
        throw new Error(`Se esperaba encontrar la propiedad ${key} en ${JSON.stringify(response.body)}`);
    }
});

Then('el estado de la autenticación debe ser {int}', function (status) {
    if (response.status !== status) {
        throw new Error(`Esperado: ${status}, Obtenido: ${response.status}. Msg: ${JSON.stringify(response.body)}`);
    }
});
