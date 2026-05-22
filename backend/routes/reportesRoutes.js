const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reportesController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

router.get('/productos',  verificarToken, soloAdmin, ctrl.ventasPorProducto);
router.get('/categorias', verificarToken, soloAdmin, ctrl.ventasPorCategoria);
router.get('/periodo',    verificarToken, soloAdmin, ctrl.ventasPorPeriodo);
router.get('/resumen',    verificarToken, soloAdmin, ctrl.resumenGeneral);
router.get('/dia',        verificarToken, soloAdmin, ctrl.ventasPorDia);

module.exports = router;