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

    // Generar el token JWT (Aproveché de incluir el rol en el token, es una buena práctica)
    const token = jwt.sign({ email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });
    
    res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
  }
};

module.exports = { registrarUsuario, loginUsuario };