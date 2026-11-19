const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const pool = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FaunaCloud API',
    version: '1.0.0',
    description: 'Documentación de la API de FaunaCloud'
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
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API FaunaCloud funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});