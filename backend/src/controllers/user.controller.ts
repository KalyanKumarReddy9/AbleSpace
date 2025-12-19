import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User';
import { CreateUserInput, LoginUserInput, UpdateUserInput } from '../dtos/user.dto';

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

// Email transporter - created lazily to ensure env vars are loaded
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    console.log('Creating email transporter with user:', process.env.EMAIL_HOST_USER);
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD
      }
    });
  }
  return transporter;
};

// Forgot Password - OTP approach
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account exists with this email, you will receive a password reset OTP.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Save hashed OTP and expiry to user (10 minutes expiry)
    user.resetPasswordToken = otpHash;
    user.resetPasswordExpires = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: email,
      subject: '🔐 AbleSpace - Password Reset OTP',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 20px;">
          <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #667eea; margin: 0; font-size: 28px;">🎓 AbleSpace</h1>
              <p style="color: #666; margin-top: 5px;">Collaborative Task Management</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Password Reset OTP</h2>
            
            <p style="color: #555; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
            
            <p style="color: #555; line-height: 1.6;">
              We received a request to reset your password. Use the OTP below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 40px; border-radius: 16px; font-size: 32px; font-weight: bold; letter-spacing: 8px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);">
                ${otp}
              </div>
            </div>
            
            <p style="color: #888; font-size: 14px; line-height: 1.6; text-align: center;">
              This OTP will expire in <strong>10 minutes</strong>.<br>
              If you didn't request this, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              Do not share this OTP with anyone.
            </p>
          </div>
        </div>
      `
    };

    await getTransporter().sendMail(mailOptions);

    return res.json({ message: 'If an account exists with this email, you will receive a password reset OTP.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    console.error('Error details:', error.message);
    return res.status(500).json({ message: 'Error sending reset email. Please try again.' });
  }
};

// Reset Password with OTP
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    // Hash the OTP to compare with stored hash
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: otpHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body as CreateUserInput;

    console.log('Registration attempt:', { email: userData.email, name: userData.name, role: userData.role });

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('User already exists:', userData.email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role-specific fields
    if (userData.role === 'student') {
      // For students, rollNumber is required
      if (!userData.rollNumber) {
        return res.status(400).json({ message: 'Roll number is required for students' });
      }
      
      // Check if rollNumber already exists
      const existingRollNumber = await User.findOne({ rollNumber: userData.rollNumber });
      if (existingRollNumber) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }
    } else if (userData.role === 'teacher') {
      // For teachers, branchesHandled is required but departments is optional
      if (!userData.branchesHandled || userData.branchesHandled.length === 0) {
        return res.status(400).json({ message: 'Branches handled are required for teachers' });
      }
    }

    // Create user
    const user = new User(userData);
    await user.save();

    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id.toString());

    // Send response
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginUserInput;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Send response
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      token
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const updates = req.body as UpdateUserInput;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};