const pool = require('../config/db');

// GET /api/servicios - Listar todos los servicios (Público)
const listarServicios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servicios ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al listar servicios:', error);
    res.status(500).json({ error: 'Error al obtener el catálogo de servicios' });
  }
};

// POST /api/servicios - Crear un nuevo servicio (Solo Admin)
const crearServicio = async (req, res) => {
  const { nombre, descripcion, precio, duracion_minutos } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, precio, duracion_minutos) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion || '', precio, duracion_minutos || 30]
    );
    res.status(201).json({
      mensaje: 'Servicio creado exitosamente',
      servicio: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ error: 'Error interno al crear el servicio' });
  }
};

module.exports = { listarServicios, crearServicio };