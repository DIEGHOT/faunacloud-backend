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

// PUT /api/servicios/:id - Actualizar un servicio existente (Solo Admin)
const actualizarServicio = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, duracion_minutos } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }

  try {
    const result = await pool.query(
      'UPDATE servicios SET nombre = $1, descripcion = $2, precio = $3, duracion_minutos = $4 WHERE id = $5 RETURNING *',
      [nombre, descripcion || '', precio, duracion_minutos || 30, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Servicio actualizado exitosamente',
      servicio: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ error: 'Error interno al actualizar el servicio' });
  }
};

// DELETE /api/servicios/:id - Eliminar un servicio (Solo Admin)
const eliminarServicio = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM servicios WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Servicio eliminado exitosamente',
      servicio: result.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ error: 'Error interno al eliminar el servicio' });
  }
};

module.exports = {
  listarServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio
};