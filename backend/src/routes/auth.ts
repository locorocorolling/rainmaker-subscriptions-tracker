import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken, hashPassword, comparePassword, validatePassword, validateEmail } from '../utils/auth';
import Joi from 'joi';

const router: Router = Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const { name, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = new UserModel({
      firstName: name,
      lastName: '',
      email,
      password: hashedPassword
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
router.post('/logout', async (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await UserModel.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

export default router;