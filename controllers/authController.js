import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: { email: 'Email is already registered'},
      });
    }
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_PASS);
    res.status(201).json({ message: 'User registered successfully', token });
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
