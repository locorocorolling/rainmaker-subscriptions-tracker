import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    const user = await UserService.verifyToken(token);
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    req.user = { ...user.toObject(), userId: (user._id as string).toString() };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const user = await UserService.verifyToken(token);
    if (user) {
      req.user = { ...user.toObject(), userId: (user._id as string).toString() };
    }
    next();
  } catch (error) {
    next();
  }
};