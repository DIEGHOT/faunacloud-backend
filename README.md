
# FaunaCloud - Backend API

## Identificación y Alcance
* **Proyecto:** FaunaCloud
* **Sección:** [Tu Sección]
* **Integrantes:** [Nombres de los integrantes]
* **Enlace al Frontend:** [Pega aquí el link del repo de React]

## Decisiones Técnicas
* **Framework:** Node.js con Express.
* **Infraestructura:** Amazon EC2. Justificación: Mantener un servidor tradicional nos permite gestionar de forma más eficiente el *pool* de conexiones a la base de datos en comparación con los "cold starts" de Lambda.
* **Base de Datos:** PostgreSQL en Amazon RDS. Elegimos RDS por ser un servicio administrado que nos libera de la mantención del motor.
* **Seguridad y Contraseñas:** 
  * Para proteger las contraseñas utilizaremos el algoritmo **Bcrypt** (mediante la librería `bcryptjs`), ya que es un estándar de la industria que incorpora "salting" automático, previniendo ataques de fuerza bruta y de diccionario. 
  * Para la autorización, usaremos **JWT (JSON Web Tokens)**.

## Diseño de Datos (Diagrama ER)
* **Enlace al Diagrama ER:** [Pega aquí el link a tu Drive con el diagrama]
* *Justificación de relaciones:* Un usuario puede tener múltiples mascotas/reservas. Los servicios son entidades independientes que se asocian a las reservas.

## Estado del Trabajo (Checklist de la Guía 19)
- [x] Repositorio backend creado y enlazado al frontend.
- [x] Decisiones tecnológicas y de infraestructura justificadas.
- [ ] Diagrama de base de datos finalizado y enlazado.
- [ ] Documentación viva (Swagger/OpenAPI) configurada.
- [ ] Flujo JWT diseñado y documentado.
- [ ] Primeros endpoints (Login/Registro) implementados.
