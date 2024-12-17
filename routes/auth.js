const express = require('express');
const { signUp, signIn, verifyOTP, resendOTP } = require('../controllers/authController');

const authRoutes = express.Router();

authRoutes.post('/signup', signUp);
authRoutes.post('/signin', signIn);
authRoutes.post('/verifyOTP', verifyOTP);
authRoutes.post('/resendOTP', resendOTP);

module.exports = authRoutes;
