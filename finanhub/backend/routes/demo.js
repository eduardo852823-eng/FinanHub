const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const controller = require('../controllers/demoController');

router.use(autenticar);
router.post('/ativar', controller.ativar);

module.exports = router;
