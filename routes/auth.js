import express from 'express'
import { signUp, signIn , verifyOTP,resendOTP} from '../controllers/authController.js';

const authRoutes = express.Router();

authRoutes.post('/signup', signUp);
authRoutes.post('/signin', signIn);
authRoutes.post('/verifyOTP',verifyOTP);
authRoutes.post('/resendOTP',resendOTP);

export default authRoutes
