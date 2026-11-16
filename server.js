const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const pool = require('./config/db'); 
const authRoutes = require('./routes/authRoutes'); // <-- Agregada la ruta de autenticación

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 
app.use('/api/auth', authRoutes); // <-- Conectado el endpoint a Express

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
  paths: {
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
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API FaunaCloud funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación en http://localhost:${PORT}/api-docs`);
});