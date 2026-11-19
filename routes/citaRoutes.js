const express = require('express');
const router = express.Router();
const { agendarCita, listarCitas, cancelarCita } = require('../controllers/citaController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, agendarCita);
router.get('/', verificarToken, listarCitas);
router.put('/:id/cancelar', verificarToken, cancelarCita);

module.exports = router;