const { Pool } = require('pg');
require('dotenv').config();

// Configuración del Pool de conexiones
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Comprobar la conexión al iniciar
pool.connect()
  .then(client => {
    console.log('📦 Conexión exitosa a la base de datos PostgreSQL');
    client.release(); // Liberar el cliente después de probar
  })
  .catch(err => {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  });

module.exports = pool;