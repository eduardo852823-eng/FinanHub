const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const controller = require('../controllers/instituicoesController');

router.use(autenticar);
router.get('/', controller.listar);
router.post('/conectar', controller.conectar);
router.post('/desconectar', controller.desconectar);

module.exports = router;
