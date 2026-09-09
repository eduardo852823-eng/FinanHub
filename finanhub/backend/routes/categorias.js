const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const controller = require('../controllers/categoriasController');

router.use(autenticar);
router.get('/', controller.listar);
router.get('/resumo', controller.resumoPorCategoria);

module.exports = router;
