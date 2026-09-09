const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const controller = require('../controllers/transacoesController');

router.use(autenticar);
router.get('/', controller.listar);
router.post('/', controller.criar);
router.patch('/:id/categoria', controller.atualizarCategoria);
router.delete('/:id', controller.excluir);

module.exports = router;
