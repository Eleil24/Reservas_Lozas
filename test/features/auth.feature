# language: es
Característica: Autenticación de Usuarios

  Escenario: Registro de usuario exitoso
    Dado que tengo los datos de registro:
      | name  | email             | password | role     | tenantId |
      | Maria | maria@example.com | 123456   | customer | tenant-1 |
    Cuando envío una solicitud POST de registro a "/auth/register"
    Entonces el estado de la autenticación debe ser 201
    Y el cuerpo debe incluir un mensaje de éxito

  Escenario: Inicio de sesión exitoso
    Dado que existe un usuario con email "test@test.com" y password "123456"
    Cuando envío mis credenciales de acceso a "/auth/login"
    Entonces el estado de la autenticación debe ser 200
    Y la respuesta debe incluir un "token"
