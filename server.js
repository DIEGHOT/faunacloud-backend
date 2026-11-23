const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const pool = require('./config/db'); 

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const citaRoutes = require('./routes/citaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/citas', citaRoutes);

// Configuración de Swagger
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FaunaCloud API',
    version: '1.0.0',
    description: 'Documentación de la API de FaunaCloud para la gestión de servicios veterinarios.'
  },
  servers: [
    { url: `http://localhost:${PORT}` }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registra un nuevo usuario (Rol cliente por defecto)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'cliente@faunacloud.cl' },
                  password: { type: 'string', example: 'Cliente123!' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuario registrado exitosamente' },
          500: { description: 'Error al registrar el usuario' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Inicia sesión y devuelve un JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@faunacloud.cl' },
                  password: { type: 'string', example: 'Admin123!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login exitoso' },
          401: { description: 'Credenciales incorrectas' }
        }
      }
    },
    '/api/usuarios': {
      get: {
        tags: ['Usuarios (Admin)'],
        summary: 'Obtiene la lista de usuarios (Solo Administrador)',
        security: [ { bearerAuth: [] } ],
        responses: {
          200: { description: 'Lista de usuarios obtenida' },
          401: { description: 'No autorizado' },
          403: { description: 'Acceso denegado (Rol insuficiente)' }
        }
      }
    },
    '/api/usuarios/{id}': {
      put: {
        tags: ['Usuarios (Admin)'],
        summary: 'Modifica el email o rol de un usuario (Solo Administrador)',
        security: [ { bearerAuth: [] } ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del usuario a modificar'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'nuevo@faunacloud.cl' },
                  rol: { type: 'string', enum: ['admin', 'cliente'], example: 'admin' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Usuario modificado exitosamente' },
          400: { description: 'Rol inválido' },
          401: { description: 'No autorizado' },
          403: { description: 'Acceso denegado (Rol insuficiente)' },
          404: { description: 'Usuario no encontrado' }
        }
      },
      delete: {
        tags: ['Usuarios (Admin)'],
        summary: 'Elimina un usuario (Solo Administrador)',
        security: [ { bearerAuth: [] } ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del usuario a eliminar'
          }
        ],
        responses: {
          200: { description: 'Usuario eliminado correctamente' },
          401: { description: 'No autorizado' },
          403: { description: 'Acceso denegado (Rol insuficiente)' },
          404: { description: 'Usuario no encontrado' }
        }
      }
    },
    '/api/servicios': {
      get: {
        tags: ['Catálogo de Servicios'],
        summary: 'Lista todos los servicios veterinarios disponibles (Público)',
        responses: {
          200: { description: 'Catálogo de servicios obtenido' }
        }
      },
      post: {
        tags: ['Catálogo de Servicios'],
        summary: 'Crea un nuevo servicio en el catálogo (Solo Administrador)',
        security: [ { bearerAuth: [] } ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Ecografía Abdominal' },
                  descripcion: { type: 'string', example: 'Diagnóstico por imagen de órganos abdominales.' },
                  precio: { type: 'number', example: 35000 },
                  duracion_minutos: { type: 'integer', example: 40 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Servicio creado exitosamente' },
          400: { description: 'Faltan campos obligatorios' },
          403: { description: 'Acceso denegado (Rol insuficiente)' }
        }
      }
    },
    '/api/citas': {
      get: {
        tags: ['Gestión de Citas'],
        summary: 'Lista citas (Admin ve todas; Cliente ve solo las suyas)',
        security: [ { bearerAuth: [] } ],
        responses: {
          200: { description: 'Lista de citas obtenida' },
          401: { description: 'No autorizado' }
        }
      },
      post: {
        tags: ['Gestión de Citas'],
        summary: 'Agenda una nueva cita (Valida choque de horario 409 Conflict)',
        security: [ { bearerAuth: [] } ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  servicio_id: { type: 'integer', example: 1 },
                  nombre_mascota: { type: 'string', example: 'Firulais' },
                  fecha: { type: 'string', format: 'date', example: '2026-11-25' },
                  hora: { type: 'string', example: '10:30' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Cita agendada exitosamente' },
          400: { description: 'Faltan campos obligatorios' },
          401: { description: 'No autorizado' },
          409: { description: 'Conflicto de horario: Ya existe una cita agendada para esa fecha y hora' }
        }
      }
    },
    '/api/citas/{id}/cancelar': {
      put: {
        tags: ['Gestión de Citas'],
        summary: 'Cancela una cita existente y libera el horario',
        security: [ { bearerAuth: [] } ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la cita a cancelar'
          }
        ],
        responses: {
          200: { description: 'Cita cancelada exitosamente' },
          403: { description: 'No tienes permiso para cancelar esta cita' },
          404: { description: 'Cita no encontrada' }
        }
      }
    }
  }
};

// Activar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta Principal (Root)
app.get('/', (req, res) => {
  res.send('API de FaunaCloud funcionando correctamente. Visita /api-docs para ver la documentación.');
});

// Ruta de Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API FaunaCloud funcionando' });
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});