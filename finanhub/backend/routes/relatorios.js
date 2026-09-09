const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const controller = require('../controllers/relatoriosController');

router.use(autenticar);
router.get('/resumo', controller.resumo);
router.get('/comparar', controller.comparar);

module.exports = router;
