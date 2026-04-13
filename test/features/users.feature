# language: es
Característica: Gestión de Usuarios

  Escenario: Registrar un nuevo usuario exitosamente
    Dado que envío los datos de un nuevo usuario:
      | name  | email          | password | tenantId   |
      | Mateo | mateo@test.com | 123456   | uuid-1234  |
    Cuando realizo una petición POST a "/auth/register"
    Entonces la respuesta debe tener un código de estado 201
    Y el cuerpo de la respuesta debe incluir el email "mateo@test.com"

  Escenario: Obtener el listado de usuarios
    Dado que existen usuarios en el sistema
    Cuando realizo una petición GET a "/users"
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe contener una lista de usuarios
