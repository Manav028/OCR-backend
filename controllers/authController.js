const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { sendVerificationLink } = require('../utility/emailService'); 
const crypto = require('crypto');


const signUpSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const signUp = async (req, res) => {
  try {
    const { username, email, password } = signUpSchema.parse(req.body);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: { email: 'Email is already registered' },
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiryAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({ username, email, password, verificationCode, verificationCodeExpiryAt });
    await user.save();

    await sendVerificationLink(email, verificationCode);

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

const signIn = async (req, res) => {
  try {
    const { email, password } = signInSchema.parse(req.body);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: { email: 'User not found' },
      });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        error: { email: 'Invalid email or password', password: 'Invalid email or password' },
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        error: { email: 'Email is not verified' },
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

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already Verified' });
    }

    if (user.verificationCode !== otp || user.verificationCodeExpiryAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiryAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });

  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = otp;
    user.verificationCodeExpiryAt = otpExpiresAt;
    await user.save();

    await sendVerificationLink(email, otp);

    res.status(200).json({ message: 'New OTP sent successfully' });

  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};

module.exports = {
  signUp,
  signIn,
  verifyOTP,
  resendOTP,
};
