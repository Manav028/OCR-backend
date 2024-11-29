import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { sendVerificationLink } from '../utility/emailService.js';
import crypto from 'crypto';

const signUpSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const signUp = async (req, res) => {
  try {
    const { username, email, password } = signUpSchema.parse(req.body);

    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).json({
    //     error: { email: 'Email is already registered'},
    //   });
    // }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({ username, email, password,verificationToken });
    await user.save();

    await sendVerificationLink(email,verificationToken)

    const token = jwt.sign({ userId: user._id }, process.env.JWT_PASS);
    res.status(201).json({ message: 'User registered successfully. Please verify your email.', token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message; 
        return acc;
      }, {});
      return res.status(400).json({ error: formattedErrors });
    }
    res.status(500).json({ error: error.message });
  }
};


export const signIn = async (req, res) => {
  try {
    const { email, password } = signInSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        error: { email: 'Invalid email or password', password: 'Invalid email or password' },
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_PASS);
    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message; 
        return acc;
      }, {});
      return res.status(400).json({ error: formattedErrors });
    }
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req,res) => {
  const {veritoken} = req.query;
  
  try{
    const user = await User.findOne({ verificationToken: veritoken });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  }catch(error){
    res.status(500).json({ error: 'An error occurred. Please try again later.' });

  }

}

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = newToken;
    await user.save();

    await sendVerificationEmail(email, newToken);

    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};