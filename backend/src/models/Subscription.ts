import { Schema, model, Document } from 'mongoose';

// Local interfaces to avoid circular dependency with shared types
interface MoneyType {
  amount: number; // Integer minor units (cents, pence, etc.)
  currency: string; // ISO 4217 code
}

interface BillingCycleType {
  value: number;
  unit: 'day' | 'month' | 'year';
}

type SubscriptionStatusType = 'active' | 'paused' | 'cancelled' | 'expired';
type EndOfMonthStrategyType = 'last_day_of_month';

// Interface for Mongoose document
export interface ISubscriptionDocument extends Document {
  id: string;
  userId: string;
  service: string;
  description?: string;
  category?: string;
  cost: MoneyType;
  billingCycle: BillingCycleType;
  firstBillingDate: Date;
  nextRenewal: Date;
  lastRenewal?: Date;
  endOfMonthStrategy: EndOfMonthStrategyType;
  preservedBillingDay?: number;
  status: SubscriptionStatusType;
  metadata?: {
    color?: string;
    logoUrl?: string;
    url?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Money type schema
const MoneySchema = new Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v: number) {
        return Number.isInteger(v);
      },
      message: 'Amount must be an integer (minor units - cents for USD, pence for GBP, etc.)'
    }
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    validate: {
      validator: function(v: string) {
        return /^[A-Z]{3}$/.test(v);
      },
      message: 'Currency must be a valid ISO 4217 code (e.g., USD, EUR)'
    }
  }
}, { _id: false });

// Billing cycle schema
const BillingCycleSchema = new Schema({
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 365,
    validate: {
      validator: function(this: { unit: string }, v: number) {
        switch(this.unit) {
          case 'day': return v <= 365;
          case 'month': return v <= 12;
          case 'year': return v <= 5;
          default: return v <= 365;
        }
      },
      message: function(this: { unit: string }) {
        switch(this.unit) {
          case 'day': return 'Day value cannot exceed 365';
          case 'month': return 'Month value cannot exceed 12';
          case 'year': return 'Year value cannot exceed 5';
          default: return 'Value cannot exceed 365';
        }
      }
    }
  },
  unit: {
    type: String,
    required: true,
    enum: ['day', 'month', 'year']
  }
}, { _id: false });

// Metadata schema
const MetadataSchema = new Schema({
  color: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex code (e.g., #FF5733)'
    }
  },
  logoUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Logo URL must be a valid URL'
    }
  },
  url: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid URL'
    }
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, { _id: false });

// Main subscription schema
const SubscriptionSchema = new Schema<ISubscriptionDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },

  // Service details
  service: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50
  },

  // Billing information
  cost: {
    type: MoneySchema,
    required: true
  },
  billingCycle: {
    type: BillingCycleSchema,
    required: true
  },

  // Date handling
  firstBillingDate: {
    type: Date,
    required: true
  },
  nextRenewal: {
    type: Date,
    required: true,
    validate: {
      validator: function(v: Date) {
        return v >= this.firstBillingDate;
      },
      message: 'Next renewal date must be after first billing date'
    }
  },
  lastRenewal: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || (v >= this.firstBillingDate && v <= this.nextRenewal);
      },
      message: 'Last renewal date must be between first billing date and next renewal'
    }
  },

  // End-of-month edge case handling
  endOfMonthStrategy: {
    type: String,
    enum: ['last_day_of_month'],
    default: 'last_day_of_month'
  },
  preservedBillingDay: {
    type: Number,
    min: 1,
    max: 31,
    validate: {
      validator: function(v: number) {
        return !v || (v >= 1 && v <= 31);
      },
      message: 'Preserved billing day must be between 1 and 31'
    }
  },

  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  metadata: {
    type: MetadataSchema,
    default: {}
  }

}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      // Use object spread to omit properties
      const { _id, __v, ...result } = ret;
      return result;
    }
  }
});

// Indexes for better performance
SubscriptionSchema.index({ userId: 1, createdAt: -1 });
SubscriptionSchema.index({ status: 1, nextRenewal: 1 }); // Compound index for renewals and reminders
SubscriptionSchema.index({ category: 1 });
SubscriptionSchema.index({ userId: 1, status: 1 });

// Virtual for computed fields
SubscriptionSchema.virtual('daysUntilRenewal').get(function() {
  const now = new Date();
  const diffTime = this.nextRenewal.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate dates
SubscriptionSchema.pre('save', function(next) {
  if (this.isModified('nextRenewal') || this.isModified('firstBillingDate')) {
    if (this.nextRenewal < this.firstBillingDate) {
      this.invalidate('nextRenewal', 'Next renewal must be after first billing date');
    }
  }

  if (this.isModified('status') && this.status === 'cancelled') {
    this.nextRenewal = new Date();
  }

  next();
});

// Note: Business logic methods moved to SubscriptionService
// Keeping only basic database operations in the model

export const SubscriptionModel = model<ISubscriptionDocument>('Subscription', SubscriptionSchema);