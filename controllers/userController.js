const pool = require('../config/db');

const listarUsuarios = async (req, res) => {
    try {
        // Seleccionamos todo menos el password
        const result = await pool.query('SELECT id, email, rol FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor al listar usuarios' });
    }
};

module.exports = { listarUsuarios };