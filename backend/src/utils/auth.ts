import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (user: any): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};