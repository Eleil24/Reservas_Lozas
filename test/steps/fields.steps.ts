/**
 * ============================================================================
 * GUÍA RÁPIDA DE ORDEN DE EJECUCIÓN:
 * ============================================================================
 * Imagina que estamos montando un restaurante de juguete:
 * 
 * 1. DEFINICIÓN DEL MOCK (El Chef de mentira):
 *    Es solo un objeto que define "cómo responderá" cuando alguien le pregunte. 
 *    No hace nada todavía, es solo el manual de instrucciones del chef.
 * 
 * 2. CONFIGURACIÓN (BeforeAll - Abrir el restaurante):
 *    Se ejecuta UNA VEZ al principio. Aquí tomamos nuestra app real (AppModule)
 *    y le "cambiamos" las piezas reales por las de mentira (el Mock). 
 *    Es como abrir el restaurante y contratar al chef de mentira.
 * 
 * 3. PASOS / STEPS (Los clientes):
 *    Se ejecutan POR CADA ESCENARIO del archivo .feature. 
 *    - Given: El cliente dice quién es y qué quiere.
 *    - When: El cliente hace el pedido (POST / GET). 
 *            (Aquí es cuando la APP llama al MOCK definido en el punto 1).
 *    - Then: Comprobamos si el pedido llegó bien.
 * ============================================================================
 */

import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/infrastructure/database/database.service';
import { AuthGuard } from '../../src/interfaces/guards/auth.guard';
import { RolesGuard } from '../../src/interfaces/guards/roles.guard';
import { Role } from '../../src/domain/value-objects/role';

let app: INestApplication;
let response: any;

/**
 * currentUser: Almacena el usuario que está "logueado" actualmente en el test.
 * Cambiamos sus propiedades (role, tenantId) según lo que pida el escenario.
 */
let currentUser: any = { role: Role.ADMIN, tenantId: 'tenant-1' };

/**
 * mockFields: Es nuestra "Base de Datos en memoria" para los tests.
 * Como no usamos una base de datos real, guardamos las canchas aquí
 * para que cuando el controlador llame al repositorio, este devuelva
 * los datos que hemos preparado.
 */
let mockFields: any[] = [];

// ==========================================
// MOCK DEL DATABASE SERVICE
// ==========================================
// Simulamos el comportamiento de DatabaseService para no necesitar Postgres
const mockDatabaseService = {
  /**
   * onModuleInit y onModuleDestroy:
   * Son métodos de ciclo de vida de NestJS. El servicio real los usa para conectarse
   * a la base de datos Postgres. En el mock los dejamos vacíos para que el test
   * no intente realizar una conexión real.
   */
  onModuleInit: async () => { },
  onModuleDestroy: async () => { },

  /**
   * query: Se usa para operaciones directas como DELETE o UPDATE simples.
   * Devolvemos rowCount: 1 para simular que 1 fila fue afectada (éxito),
   * ya que los repositorios suelen verificar esto para confirmar que la operación funcionó.
   */
  query: async () => { return { rowCount: 1 }; },

  /**
   * execute: Se usa principalmente para SELECT (obtener múltiples registros).
   * 
   * ¿De dónde vienen 'queryText' y 'values'? 
   * Vienen directamente de tus REPOSITORIOS (ej: FieldRepository). 
   * Cuando el repositorio hace: "this.db.execute('SELECT...', [id])", 
   * esos argumentos llegan aquí.
   */
  execute: async (queryText: string, values?: any[]) => {
    if (typeof queryText === 'string' && queryText.includes('FROM fields')) {
      // Si la query tiene un filtro de tenant_id ($1), filtramos el array
      if (queryText.includes('WHERE tenant_id = $1')) {
        const tenantId = values?.[0];
        return mockFields.filter(f => f.tenant_id === tenantId);
      }
      // Si no hay filtro (Super Admin), devolvemos todo
      return mockFields;
    }
    return [];
  },

  /**
   * getOne: Se usa para INSERT o SELECT de un solo registro.
   * 
   * AQUÍ ES DONDE SE GENERA EL CONTENIDO QUE LUEGO VERÁS EN 'response.body':
   * Cuando el controlador termina su trabajo, devuelve este objeto que creamos aquí abajo.
   */
  getOne: async (queryText: string, values: any[]) => {
    // Si la consulta es un INSERT, simulamos que la base de datos guardó la cancha y nos la devolvió.
    if (typeof queryText === 'string' && queryText.includes('INSERT INTO fields')) {
      /**
       * Construimos un objeto "Cancha" de mentira.
       * Usamos los 'values' que nos pasó el repositorio (nombre, descripción, tenantId).
       */
      return {
        id: 'uuid-' + Math.random().toString(36).substr(2, 9),
        name: values[0],        // Esto es lo que pusiste en el .feature
        description: values[1],
        tenant_id: values[2],   // ¡OJO! Este es el tenantId que el Controlador decidió asignar.
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    return null;
  },
};

// ==========================================
// CONFIGURACIÓN DEL ENTORNO DE PRUEBA
// ==========================================
/**
 * BeforeAll: Se ejecuta una sola vez antes de que empiecen todos los escenarios de este archivo.
 * Aquí preparamos el "NestJS Testing Module", que es una versión controlada de nuestra app.
 */
BeforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    // Importamos el módulo principal de la app
    imports: [AppModule],
  })
    /**
     * overrideProvider: Aquí le decimos a NestJS: 
     * "No uses el DatabaseService real, usa mi versión de mentira (mockDatabaseService)".
     */
    .overrideProvider(DatabaseService)
    .useValue(mockDatabaseService)
    
    /**
     * overrideGuard: Esta es la pieza clave para la seguridad en los tests.
     * El AuthGuard real intentaría buscar un Header "Authorization: Bearer <TOKEN>",
     * validarlo con el secreto de JWT y denegar el acceso si el token no es válido.
     */
    .overrideGuard(AuthGuard)
    .useValue({
      /**
       * canActivate: Este es el método que NestJS llama automáticamente 
       * antes de entrar a cualquier controlador protegido con @UseGuards(AuthGuard).
       */
      canActivate: (context: any) => {
        // 1. Obtenemos el objeto 'request' de HTTP (como si fuera Express)
        const req = context.switchToHttp().getRequest();

        /**
         * 2. MANUALMENTE "logueamos" al usuario.
         * En lugar de leer un token, pegamos nuestra variable 'currentUser' directamente
         * en req.user. Así, el controlador (FieldsController) creerá que el usuario
         * ya se autenticó y podrá leer 'req.user.role' y 'req.user.tenantId'.
         */
        req.user = currentUser;

        // 3. Devolvemos true para decir: "Acceso Permitido, no pidas token"
        return true;
      },
    })
    .compile();

  /**
   * Creamos e inicializamos la aplicación para que esté lista para 
   * recibir peticiones HTTP mediante supertest.
   */
  app = moduleFixture.createNestApplication();
  await app.init();
});

/**
 * AfterAll: Se ejecuta al terminar todos los tests para cerrar la app
 * y liberar memoria/procesos.
 */
AfterAll(async () => {
  await app.close();
});

// ==========================================
// PASOS COMUNES / CONFIGURACIÓN
// ==========================================

Given('que el sistema de canchas está limpio', function () {
  // Limpiamos nuestra "base de datos" falsa antes de cada prueba
  mockFields = [];
});

Given('que estoy autenticado con el rol {string} del tenant {string}', function (role, tenantId) {
  // Configuramos qué usuario está haciendo la petición
  currentUser = { role, tenantId };
});

Given('que estoy autenticado como super_admin de canchas', function () {
  // Configuración rápida para Super Admin (que no suele estar atado a un tenant específico)
  currentUser = { role: Role.SUPER_ADMIN, tenantId: null };
});

// ==========================================
// PASOS PARA CREAR CANCHAS (POST)
// ==========================================

/**
 * Esta función se ejecuta cuando Cucumber encuentra: "Cuando envío una solicitud POST a '/fields' con:"
 * @param path: Contiene el endpoint, ej: "/fields" (sacado del texto entre comillas)
 * @param dataTable: Contiene la tabla de datos que pusiste debajo del 'Cuando' en el .feature
 */
When('envío una solicitud POST de canchas a {string} con:', async function (path, dataTable) {
  // 1. dataTable.hashes()[0] convierte la tabla del feature en un objeto JSON.
  // Ejemplo: { name: 'Cancha Central', description: 'Grass sintético' }
  const data = dataTable.hashes()[0];

  // 2. Usamos 'supertest' para simular que un cliente (Postman) ataca nuestra app en memoria.
  response = await request(app.getHttpServer()) // app.getHttpServer() es la "dirección" de nuestra app de pruebas
    .post(path)                                // Especificamos que es un método POST a la ruta recibida (ej: /fields)
    .set('Accept', 'application/json')          // Le decimos al servidor que esperamos la respuesta en formato JSON
    .send(data);                               // Enviamos el objeto 'data' como el cuerpo (BODY) de la petición
});

/**
 * Comprueba el resultado de la última petición realizada.
 * @param status: El código HTTP esperado (ej: 201 para creado, 403 para prohibido)
 */
Then('el código de respuesta de canchas debe ser {int}', function (status) {
  // Verificamos si response.status (lo que devolvió NestJS) es igual al 'status' esperado.
  if (response.status !== status) {
    // Si falla, lanzamos error detallando qué falló y qué respondió la app para poder debugear.
    throw new Error(`Se esperaba código ${status} pero se obtuvo ${response.status}. Respuesta: ${JSON.stringify(response.body)}`);
  }
});

/**
 * Verifica que los datos devueltos por la API coincidan con lo enviado.
 * @param name: El nombre que esperamos que tenga la cancha devuelta.
 */
Then('la cancha devuelta debe tener el nombre {string}', function (name) {
  // response.body contiene el JSON que devolvió tu controlador (el objeto Field)
  if (response.body.name !== name) {
    throw new Error(`Se esperaba el nombre ${name} pero se obtuvo ${response.body.name}`);
  }
});

/**
 * Este paso es el MÁS IMPORTANTE para la seguridad por Tenant.
 * @param tenantId: El ID del tenant que esperamos que tenga la cancha.
 */
Then('la cancha devuelta debe pertenecer al tenant {string}', function (tenantId) {
  // El controlador debió asignar el tenantId según el rol del usuario que inyectamos en el AuthGuard.
  if (response.body.tenantId !== tenantId) {
    throw new Error(`¡FALLO DE TENANCY!: Se esperaba tenantId ${tenantId} pero se obtuvo ${response.body.tenantId}`);
  }
});

// ==========================================
// PASOS PARA VER CANCHAS (GET)
// ==========================================

/**
 * Se ejecuta para "poblar" el sistema antes de listar.
 * @param dataTable: Una lista de canchas con sus respectivos tenants.
 */
Given('que existen las siguientes canchas en la base de datos:', function (dataTable) {
  /**
   * RELLENADO DE MOCK: Aquí "engañamos" al sistema llenando nuestro array mockFields.
   * h.name y h.tenantId son las columnas de la tabla del .feature
   */
  mockFields = dataTable.hashes().map((h: any) => ({
    id: 'id-' + h.name,          // Generamos un ID falso basado en el nombre
    name: h.name,
    description: h.description || 'Sin descripción',
    tenant_id: h.tenantId,       // Importante: usamos tenant_id (con guion bajo) porque así lo espera el repositorio real
    created_at: new Date(),
    updated_at: new Date()
  }));
});

/**
 * Realiza una petición GET para obtener la lista de canchas.
 * @param path: El endpoint, ej: "/fields"
 */
When('envío una solicitud GET de canchas a {string}', async function (path) {
  // Ejecutamos la petición GET. Supertest se encarga de todo el flujo.
  response = await request(app.getHttpServer())
    .get(path)
    .set('Accept', 'application/json');
});

/**
 * Verifica que el filtro de la base de datos haya funcionado.
 * @param count: Cuántas canchas esperamos encontrar (ej: si hay 3 pero el usuario solo ve las de su tenant).
 */
Then('la respuesta debe contener una lista con {int} canchas', function (count) {
  // response.body debería ser un Array []
  if (!Array.isArray(response.body)) {
    throw new Error(`Se esperaba un array pero se obtuvo: ${typeof response.body}`);
  }
  // Comparamos el tamaño del array con el número 'count' que definimos en el feature.
  if (response.body.length !== count) {
    throw new Error(`Se esperaba encontrar ${count} canchas, pero la lista devolvió ${response.body.length} canchas.`);
  }
});

/**
 * Verificación final de seguridad: asegura que ningún dato de otro tenant se filtró.
 */
Then('todas las canchas en la lista deben pertenecer al tenant {string}', function (tenantId) {
  // Buscamos dentro de la lista devuelta si hay alguna que NO pertenezca al tenant indicado.
  const filtered = response.body.filter((f: any) => f.tenantId !== tenantId);
  
  if (filtered.length > 0) {
    // Si el filtro encuentra algo, lanzamos un error crítico de seguridad.
    throw new Error(`¡ERROR DE PRIVACIDAD!: Se encontraron ${filtered.length} canchas que no pertenecen al tenant ${tenantId}.`);
  }
});
