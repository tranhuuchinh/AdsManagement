const express = require('express');
const authController = require('../controllers/authController');
const emailController = require('../controllers/emailController');
const validationCreateAccount = require('../middlewares/validation/validationCreateAccount.middleware');
const router = express.Router();

router.post('/send_otp', emailController.createOTP);
router.patch('/forgot_password', authController.forgotPassword);
router.post('/create', validationCreateAccount.validationCreate, authController.createAccount);
router.post('/login', authController.login);

module.exports = router;
