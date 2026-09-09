const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/cadastro', authController.cadastrar);
router.post('/login', authController.login);
router.post('/google', authController.loginGoogle);

module.exports = router;
