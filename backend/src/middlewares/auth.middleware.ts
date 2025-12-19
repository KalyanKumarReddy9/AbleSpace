import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is a teacher
export const requireTeacher = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teachers only.' });
  }
  
  return next();
};

// Middleware to check if user is a student
export const requireStudent = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Students only.' });
  }
  
  return next();
};

// Middleware to check if user belongs to a specific branch
export const requireBranch = (branches: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!branches.includes(req.user.branch)) {
      return res.status(403).json({ message: 'Access denied. Invalid branch.' });
    }
    
    return next();
  };
};