import { UserModel, IUserDocument } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';

interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    currency?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      renewalReminders?: boolean;
      reminderDays?: number;
    };
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}

export class UserService {
  /**
   * Create a new user account
   */
  static async createUser(input: CreateUserInput): Promise<IUserDocument> {
    const user = new UserModel({
      email: input.email.toLowerCase(),
      password: input.password, // Will be hashed by pre-save middleware
      firstName: input.firstName,
      lastName: input.lastName || ''
    });

    return user.save();
  }

  /**
   * Find user by email (with password for authentication)
   */
  static async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  /**
   * Find active user by ID (without password)
   */
  static async findActiveById(id: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ _id: id, isActive: true }).exec();
  }

  /**
   * Check if user exists by email
   */
  static async userExists(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).exec();
    return !!user;
  }

  /**
   * Authenticate user and return login result
   */
  static async authenticateUser(credentials: LoginCredentials): Promise<LoginResult | null> {
    const user = await this.findByEmail(credentials.email);
    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    await this.updateLastLogin((user._id as string).toString());

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: (user._id as string).toString(),
        name: user.firstName,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(id: string): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    ).exec();
  }

  /**
   * Update user profile
   */
  static async updateUser(
    id: string,
    updates: UpdateUserInput
  ): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    id: string,
    preferences: UpdateUserInput['preferences']
  ): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Deactivate user account (soft delete)
   */
  static async deactivateUser(id: string): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();
  }

  /**
   * Change user password
   */
  static async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await UserModel.findById(id).select('+password').exec();
    if (!user) {
      return false;
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return false;
    }

    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();
    return true;
  }

  /**
   * Verify JWT token and return user
   */
  static async verifyToken(token: string): Promise<IUserDocument | null> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      return this.findActiveById(decoded.userId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(id: string) {
    const user = await this.findActiveById(id);
    if (!user) {
      return null;
    }

    // Could add subscription counts, spending stats, etc.
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      preferences: user.preferences
    };
  }
}