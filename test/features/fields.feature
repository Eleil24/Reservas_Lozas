# language: es
Característica: Gestión de Canchas (Fields)
  Como administrador o super administrador
  Quiero poder gestionar las canchas de fútbol
  Para que los usuarios puedan realizar sus reservas adecuadamente

  Antecedentes:
    Dado que el sistema de canchas está limpio

  Escenario: Un administrador crea una cancha y se le asigna su tenantId automáticamente
    Dado que estoy autenticado con el rol "admin" del tenant "tenant-1"
    Cuando envío una solicitud POST de canchas a "/fields" con:
      | name               | description     |
      | Cancha Central     | Grass sintético |
    Entonces el código de respuesta de canchas debe ser 201
    Y la cancha devuelta debe tener el nombre "Cancha Central"
    Y la cancha devuelta debe pertenecer al tenant "tenant-1"

  Escenario: Un super administrador crea una cancha para un tenant específico
    Dado que estoy autenticado con el rol "super_admin" del tenant "otro-tenant"
    Cuando envío una solicitud POST de canchas a "/fields" con:
      | name               | description     | tenantId |
      | Cancha Super       | Nivel Pro       | tenant-2 |
    Entonces el código de respuesta de canchas debe ser 201
    Y la cancha devuelta debe pertenecer al tenant "tenant-2"

  Escenario: Un administrador solo puede ver las canchas de su propio tenant
    Dado que existen las siguientes canchas en la base de datos:
      | name     | tenantId |
      | Cancha A | tenant-1 |
      | Cancha B | tenant-1 |
      | Cancha C | tenant-2 |
    Y que estoy autenticado con el rol "admin" del tenant "tenant-1"
    Cuando envío una solicitud GET de canchas a "/fields"
    Entonces el código de respuesta de canchas debe ser 200
    Y la respuesta debe contener una lista con 2 canchas
    Y todas las canchas en la lista deben pertenecer al tenant "tenant-1"

  Escenario: Un super administrador puede ver todas las canchas de todos los tenants
    Dado que existen las siguientes canchas en la base de datos:
      | name     | tenantId |
      | Cancha A | tenant-1 |
      | Cancha B | tenant-2 |
      | Cancha C | tenant-3 |
    Y que estoy autenticado como super_admin de canchas
    Cuando envío una solicitud GET de canchas a "/fields"
    Entonces el código de respuesta de canchas debe ser 200
    Y la respuesta debe contener una lista con 3 canchas

  Escenario: Un usuario (customer) solo puede ver las canchas de su propio tenant
    Dado que existen las siguientes canchas en la base de datos:
      | name           | tenantId |
      | Cancha Local   | tenant-1 |
      | Cancha Remota  | tenant-2 |
    Y que estoy autenticado con el rol "customer" del tenant "tenant-1"
    Cuando envío una solicitud GET de canchas a "/fields"
    Entonces el código de respuesta de canchas debe ser 200
    Y la respuesta debe contener una lista con 1 canchas
    Y todas las canchas en la lista deben pertenecer al tenant "tenant-1"

  Escenario: Un usuario sin rol de administrador no puede crear una cancha
    Dado que estoy autenticado con el rol "customer" del tenant "tenant-1"
    Cuando envío una solicitud POST de canchas a "/fields" con:
      | name               | description     |
      | Cancha Prohibida   | No debería      |
    Entonces el código de respuesta de canchas debe ser 403
