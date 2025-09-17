import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = UserModel.findById(decoded.userId).select('-password');

    user.then((user) => {
      if (!user) {
        res.status(401).json({ message: 'Invalid token' });
        return;
      }

      req.user = { ...user.toObject(), userId: user._id.toString() };
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = UserModel.findById(decoded.userId).select('-password');

    user.then((user) => {
      if (user) {
        req.user = { ...user.toObject(), userId: user._id.toString() };
      }

      next();
    });
  } catch (error) {
    next();
  }
};