import express from 'express'
import { signUp, signIn } from '../controllers/authController.js';

const authRoutes = express.Router();

authRoutes.post('/signup', signUp);
authRoutes.post('/signin', signIn);

export default authRoutes
