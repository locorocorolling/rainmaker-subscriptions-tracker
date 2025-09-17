#!/usr/bin/env node

/**
 * Migration Script: Fix Legacy Currency Data
 *
 * This script converts legacy subscription cost data from dollars to cents.
 * Only affects subscriptions where cost.amount < 100 (assumed to be in dollars).
 *
 * Usage: node scripts/migrate-currency.js [--dry-run]
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/subscription_tracker?authSource=admin';

// Define subscription schema for migration
const subscriptionSchema = new mongoose.Schema({
  service: String,
  cost: {
    amount: Number,
    currency: String
  },
  updatedAt: Date
}, { collection: 'subscriptions' });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

async function migrateCurrencyData(dryRun = false) {
  console.log('🔄 Starting currency data migration...');
  console.log(`📋 Mode: ${dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find subscriptions with potential legacy data (cost < 100 = likely in dollars)
    const legacySubscriptions = await Subscription.find({
      'cost.amount': { $lt: 100, $type: 'number' }
    });

    console.log(`📊 Found ${legacySubscriptions.length} subscriptions with potential legacy currency data`);

    if (legacySubscriptions.length === 0) {
      console.log('✨ No legacy data found. Migration not needed.');
      return;
    }

    // Display what will be migrated
    console.log('\n📋 Legacy subscriptions to migrate:');
    legacySubscriptions.forEach(sub => {
      const newAmount = Math.round(sub.cost.amount * 100);
      console.log(`  • ${sub.service}: $${sub.cost.amount} → ${newAmount} cents (${sub.cost.currency})`);
    });

    if (dryRun) {
      console.log('\n🔍 DRY RUN: No changes made. Use without --dry-run to execute migration.');
      return;
    }

    // Perform migration
    console.log('\n🚀 Executing migration...');

    const bulkOps = legacySubscriptions.map(sub => ({
      updateOne: {
        filter: { _id: sub._id },
        update: {
          $set: {
            'cost.amount': Math.round(sub.cost.amount * 100),
            updatedAt: new Date()
          }
        }
      }
    }));

    const result = await Subscription.bulkWrite(bulkOps);

    console.log(`✅ Migration completed successfully!`);
    console.log(`   • ${result.modifiedCount} subscriptions updated`);
    console.log(`   • ${result.matchedCount} subscriptions matched`);

    // Verify migration
    const remainingLegacy = await Subscription.countDocuments({
      'cost.amount': { $lt: 100, $type: 'number' }
    });

    if (remainingLegacy === 0) {
      console.log('🎉 All legacy currency data successfully migrated!');
    } else {
      console.log(`⚠️  Warning: ${remainingLegacy} subscriptions still have legacy data`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Database connection closed');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run migration
migrateCurrencyData(dryRun)
  .then(() => {
    console.log('🏁 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });