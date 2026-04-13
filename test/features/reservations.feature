# language: es
Característica: Gestión de Reservas
  Como usuario del sistema
  Quiero poder realizar reservas de canchas y gestionarlas
  Para poder jugar al fútbol

  Antecedentes:
    Dado que el sistema de reservas está limpio

  Escenario: Un cliente crea una reserva y se usa su ID y Tenant automáticamente
    Dado que estoy autenticado como "customer" con ID "user-1" y tenant "tenant-A" de reservas
    Cuando envío una solicitud POST de reservas a "/reservations" con:
      | fieldId | startTime           | endTime             |
      | field-1 | 2026-05-20T10:00:00Z | 2026-05-20T11:00:00Z |
    Entonces el código de respuesta de reservas debe ser 201
    Y la reserva devuelta debe pertenecer al usuario "user-1" y tenant "tenant-A"

  Escenario: Un administrador crea una reserva para un cliente específico
    Dado que estoy autenticado como "admin" con ID "admin-1" y tenant "tenant-A" de reservas
    Cuando envío una solicitud POST de reservas a "/reservations" con:
      | fieldId | startTime           | endTime             | userId |
      | field-1 | 2026-05-20T12:00:00Z | 2026-05-20T13:00:00Z | user-1 |
    Entonces el código de respuesta de reservas debe ser 201
    Y la reserva devuelta debe pertenecer al usuario "user-1" y tenant "tenant-A"

  Escenario: Un super administrador crea una reserva en cualquier sucursal (tenant)
    Dado que estoy autenticado como "super_admin" de reservas
    Cuando envío una solicitud POST de reservas a "/reservations" con:
      | fieldId | startTime           | endTime             | userId | tenantId |
      | field-1 | 2026-05-20T14:00:00Z | 2026-05-20T15:00:00Z | user-1 | tenant-B |
    Entonces el código de respuesta de reservas debe ser 201
    Y la reserva devuelta debe pertenecer al usuario "user-1" y tenant "tenant-B"

  Escenario: Un cliente solo ve sus propias reservas
    Dado que existen las siguientes reservas:
      | id | userId | tenantId | fieldId |
      | 1  | user-1 | tenant-A | field-1 |
      | 2  | user-2 | tenant-A | field-1 |
    Y que estoy autenticado como "customer" con ID "user-1" y tenant "tenant-A" de reservas
    Cuando envío una solicitud GET de reservas a "/reservations"
    Entonces el código de respuesta de reservas debe ser 200
    Y la respuesta debe contener una lista con 1 reservas

  Escenario: Un administrador ve todas las reservas de su sucursal
    Dado que existen las siguientes reservas:
      | id | userId | tenantId | fieldId |
      | 1  | user-1 | tenant-A | field-1 |
      | 2  | user-2 | tenant-A | field-1 |
      | 3  | user-1 | tenant-B | field-2 |
    Y que estoy autenticado como "admin" con ID "admin-1" y tenant "tenant-A" de reservas
    Cuando envío una solicitud GET de reservas a "/reservations"
    Entonces el código de respuesta de reservas debe ser 200
    Y la respuesta debe contener una lista con 2 reservas

  Escenario: Un super administrador ve todas las reservas de todas las sucursales
    Dado que existen las siguientes reservas:
      | id | userId | tenantId | fieldId |
      | 1  | user-1 | tenant-A | field-1 |
      | 2  | user-2 | tenant-B | field-2 |
    Y que estoy autenticado como "super_admin" de reservas
    Cuando envío una solicitud GET de reservas a "/reservations"
    Entonces el código de respuesta de reservas debe ser 200
    Y la respuesta debe contener una lista con 2 reservas

  Escenario: Un cliente cancela su propia reserva
    Dado que existen las siguientes reservas:
      | id | userId | tenantId | fieldId |
      | 1  | user-1 | tenant-A | field-1 |
    Y que estoy autenticado como "customer" con ID "user-1" y tenant "tenant-A" de reservas
    Cuando envío una solicitud DELETE a "/reservations/1"
    Entonces el código de respuesta de reservas debe ser 200
    Y la reserva debe quedar con estado "cancelled"
