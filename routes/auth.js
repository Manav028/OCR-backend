import express from 'express'
import { signUp, signIn , verifyEmail , resendVerificationEmail } from '../controllers/authController.js';

const authRoutes = express.Router();

authRoutes.post('/signup', signUp);
authRoutes.post('/signin', signIn);
authRoutes.get('/verify-email', verifyEmail);
authRoutes.get('/resend-verify-email', resendVerificationEmail);

export default authRoutes
