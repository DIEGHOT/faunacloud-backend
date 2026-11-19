const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrarUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar en la base de datos (El servidor asigna el rol "cliente" por defecto)
    const result = await pool.query(
      'INSERT INTO usuarios (email, password, rol) VALUES ($1, $2, $3) RETURNING id, email, rol',
      [email, hashedPassword, 'cliente']
    );
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el usuario. Puede que el email ya exista.' });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario en la BD
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];

    // Comparar la contraseña ingresada con la encriptada
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar el token JWT
    const token = jwt.sign({ email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });
    
    res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
  }
};

// NUEVO: Modificar un usuario
const modificarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, rol } = req.body;

        if (rol && !['admin', 'cliente'].includes(rol)) {
            return res.status(400).json({ error: 'Rol inválido. Debe ser admin o cliente.' });
        }

        const result = await pool.query(
            'UPDATE usuarios SET email = COALESCE($1, email), rol = COALESCE($2, rol) WHERE id = $3 RETURNING id, email, rol',
            [email, rol, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario actualizado exitosamente', usuario: result.rows[0] });
    } catch (error) {
        console.error("Error al modificar usuario:", error);
        res.status(500).json({ error: 'Error en el servidor al modificar usuario' });
    }
};

// NUEVO: Eliminar un usuario
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id, email', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario eliminado correctamente', usuario: result.rows[0] });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: 'Error en el servidor al eliminar usuario' });
    }
};

// Actualizamos el exports para incluir las dos funciones nuevas
module.exports = { registrarUsuario, loginUsuario, modificarUsuario, eliminarUsuario };