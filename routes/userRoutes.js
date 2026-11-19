const express = require('express');
const router = express.Router();

// Importamos listarUsuarios (que ya tenías) y las dos funciones nuevas que creamos
const { listarUsuarios } = require('../controllers/userController');
const { modificarUsuario, eliminarUsuario } = require('../controllers/authController'); 
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios (Solo Administradores)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito
 *       401:
 *         description: No autorizado (Token faltante o inválido)
 *       403:
 *         description: Acceso denegado (Rol insuficiente)
 */
router.get('/', verificarToken, verificarRol(['admin']), listarUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Modifica el email o rol de un usuario (Solo Administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a modificar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [admin, cliente]
 *     responses:
 *       200:
 *         description: Usuario modificado exitosamente
 *       400:
 *         description: Rol inválido
 *       403:
 *         description: Acceso denegado (Rol insuficiente)
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', verificarToken, verificarRol(['admin']), modificarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario de la base de datos (Solo Administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: Acceso denegado (Rol insuficiente)
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', verificarToken, verificarRol(['admin']), eliminarUsuario);

module.exports = router;