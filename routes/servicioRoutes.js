const express = require('express');
const router = express.Router();
const { listarServicios, crearServicio } = require('../controllers/servicioController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', listarServicios);
router.post('/', verificarToken, verificarRol(['admin']), crearServicio);

module.exports = router;