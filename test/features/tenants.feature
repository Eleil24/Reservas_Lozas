# language: es
Característica: Gestión de Tenants
  Como super administrador
  Quiero poder gestionar los tenants (empresas) del sistema
  Para poder registrar nuevos clientes

  Antecedentes:
    Dado que el sistema de tenants está limpio

  Escenario: Un super administrador crea un tenant exitosamente
    Dado que estoy autenticado como super_admin de tenants
    Cuando envío una solicitud POST a "/tenants" con el nombre "Nuevo Tenant"
    Entonces el código de respuesta de tenants debe ser 201
    Y el cuerpo de la respuesta debe contener el nombre "Nuevo Tenant"

  Escenario: Un administrador normal no puede crear un tenant
    Dado que estoy autenticado con el rol "admin" de tenants
    Cuando envío una solicitud POST a "/tenants" con el nombre "Tenant Prohibido"
    Entonces el código de respuesta de tenants debe ser 403

  Escenario: Un super administrador puede listar todos los tenants
    Dado que existen los siguientes tenants en la base de datos:
      | name     |
      | Tenant A |
      | Tenant B |
    Y que estoy autenticado como super_admin de tenants
    Cuando envío una solicitud GET de tenants a "/tenants"
    Entonces el código de respuesta de tenants debe ser 200
    Y la respuesta debe contener una lista con 2 tenants
