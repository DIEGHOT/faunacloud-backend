const express = require('express');
const router = express.Router();
const { 
  listarServicios, 
  crearServicio, 
  actualizarServicio, 
  eliminarServicio 
} = require('../controllers/servicioController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', listarServicios);
router.post('/', verificarToken, verificarRol(['admin']), crearServicio);
router.put('/:id', verificarToken, verificarRol(['admin']), actualizarServicio);
router.delete('/:id', verificarToken, verificarRol(['admin']), eliminarServicio);

module.exports = router;