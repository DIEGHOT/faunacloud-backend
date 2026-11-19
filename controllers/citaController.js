const pool = require('../config/db');

// POST /api/citas - Agendar una nueva cita (Validando 409 Conflict)
const agendarCita = async (req, res) => {
  const { servicio_id, nombre_mascota, fecha, hora } = req.body;
  const usuario_id = req.usuario.id; // Extraído del token JWT

  if (!servicio_id || !nombre_mascota || !fecha || !hora) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios (servicio_id, nombre_mascota, fecha, hora)' });
  }

  try {
    // 1. Validar si ya existe una cita activa en esa fecha y hora
    const choqueHorario = await pool.query(
      `SELECT id FROM citas 
       WHERE fecha = $1 AND hora = $2 AND estado != 'cancelada'`,
      [fecha, hora]
    );

    if (choqueHorario.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflicto de horario: Ya existe una cita agendada para esa fecha y hora.'
      });
    }

    // 2. Si el horario está libre, insertar la cita
    const nuevaCita = await pool.query(
      `INSERT INTO citas (usuario_id, servicio_id, nombre_mascota, fecha, hora) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [usuario_id, servicio_id, nombre_mascota, fecha, hora]
    );

    res.status(201).json({
      mensaje: 'Cita agendada exitosamente',
      cita: nuevaCita.rows[0]
    });
  } catch (error) {
    console.error('Error al agendar cita:', error);
    res.status(500).json({ 
      error: 'Error interno al agendar la cita',
      detalle: error.message 
    });
  }
};

// GET /api/citas - Listar citas (Admin ve todas; Cliente ve solo las suyas)
const listarCitas = async (req, res) => {
  const { id, rol } = req.usuario;

  try {
    let query;
    let params = [];

    if (rol === 'admin') {
      query = `
        SELECT c.id, c.nombre_mascota, c.fecha, c.hora, c.estado, 
               u.email AS cliente_email, s.nombre AS servicio_nombre, s.precio
        FROM citas c
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN servicios s ON c.servicio_id = s.id
        ORDER BY c.fecha ASC, c.hora ASC
      `;
    } else {
      query = `
        SELECT c.id, c.nombre_mascota, c.fecha, c.hora, c.estado, 
               s.nombre AS servicio_nombre, s.precio
        FROM citas c
        JOIN servicios s ON c.servicio_id = s.id
        WHERE c.usuario_id = $1
        ORDER BY c.fecha ASC, c.hora ASC
      `;
      params = [id];
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al listar citas:', error);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
};

// PUT /api/citas/:id/cancelar - Cancelar una cita (Libera el horario)
const cancelarCita = async (req, res) => {
  const { id } = req.params;
  const { id: usuario_id, rol } = req.usuario;

  try {
    // Verificar que la cita exista y pertenezca al usuario (o sea admin)
    const citaResult = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);

    if (citaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const cita = citaResult.rows[0];
    if (rol !== 'admin' && cita.usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta cita' });
    }

    const actualizada = await pool.query(
      "UPDATE citas SET estado = 'cancelada' WHERE id = $1 RETURNING *",
      [id]
    );

    res.status(200).json({
      mensaje: 'Cita cancelada. El horario ahora está disponible.',
      cita: actualizada.rows[0]
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ error: 'Error interno al cancelar la cita' });
  }
};

module.exports = { agendarCita, listarCitas, cancelarCita };