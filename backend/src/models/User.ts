import { Schema, model, Document } from 'mongoose';

// Interface for Mongoose document
export interface IUserDocument extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    currency: string;
    timezone: string;
    notifications: {
      email: boolean;
      renewalReminders: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User preferences schema
const PreferencesSchema = new Schema({
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    validate: {
      validator: function(v: string) {
        return /^[A-Z]{3}$/.test(v);
      },
      message: 'Currency must be a valid ISO 4217 code (e.g., USD, EUR)'
    }
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    renewalReminders: {
      type: Boolean,
      default: true
    }
  }
}, { _id: false });

// Main user schema
const UserSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    type: PreferencesSchema,
    default: () => ({})
  }

}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      // Use object spread to omit properties
      const { _id, __v, password, ...result } = ret;
      return result;
    }
  }
});

// Indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const bcryptjs = await import('bcryptjs');
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const bcryptjs = await import('bcryptjs');
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Static methods
UserSchema.statics.findByEmail = function(email: string): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase() }).select('+password').exec();
};

UserSchema.statics.findActiveById = function(id: string): Promise<IUserDocument | null> {
  return this.findOne({ _id: id, isActive: true }).exec();
};

UserSchema.statics.updateLastLogin = function(id: string): Promise<IUserDocument | null> {
  return this.findByIdAndUpdate(
    id,
    { lastLogin: new Date() },
    { new: true }
  ).exec();
};

export const UserModel = model<IUserDocument>('User', UserSchema);