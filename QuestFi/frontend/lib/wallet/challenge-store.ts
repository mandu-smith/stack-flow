import crypto from 'crypto';
import mongoose from 'mongoose';
import { Challenge } from '@/lib/models/Challenge';

// Connect to MongoDB
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(process.env.MONGODB_URI);
}

export async function generateChallenge(
  address: string,
  type: 'connection' | 'payment' = 'connection',
  paymentId?: string,
  amount?: number
): Promise<{ challenge: string; expiresAt: Date }> {
  try {
    await connectToDatabase();

    // Generate a unique challenge like the reference design
    const challenge = `BitPay-${type}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Remove any existing challenge for this address
    await Challenge.deleteMany({ address });

    // Store challenge in database
    await Challenge.create({
      address,
      challenge,
      type,
      expiresAt,
      paymentId,
      amount,
    });

    console.log('🔑 Generated challenge for address:', address);
    console.log('📝 Challenge:', challenge);
    console.log('📝 Challenge type:', type);
    console.log('⏰ Expires at:', expiresAt.toISOString());
    console.log('💾 Challenge stored successfully in database');
    
    return {
      challenge,
      expiresAt,
    };
  } catch (error) {
    console.error('❌ Failed to generate challenge:', error);
    throw new Error('Failed to generate challenge');
  }
}

export async function validateChallenge(
  address: string,
  challengeMessage: string,
  consumeChallenge: boolean = false
): Promise<boolean> {
  try {
    await connectToDatabase();

    console.log('🔍 Validating challenge for address:', address);
    console.log('📝 Challenge message:', challengeMessage);
    console.log('🔄 Consume challenge:', consumeChallenge);

    const storedChallenge = await Challenge.findOne({ address });
    if (!storedChallenge) {
      console.log('❌ No challenge found for address');
      return false;
    }

    // Check if expired (MongoDB TTL should handle this, but double-check)
    if (storedChallenge.expiresAt < new Date()) {
      console.log('❌ Challenge expired for address:', address);
      await Challenge.deleteOne({ address });
      return false;
    }

    // Check if challenge matches
    if (storedChallenge.challenge !== challengeMessage) {
      console.log('❌ Challenge message does not match');
      console.log('Expected:', storedChallenge.challenge);
      console.log('Received:', challengeMessage);
      return false;
    }

    // Only remove challenge if consumeChallenge is true
    if (consumeChallenge) {
      await Challenge.deleteOne({ address });
      console.log('✅ Challenge validation successful and consumed');
    } else {
      console.log('✅ Challenge validation successful (not consumed)');
    }

    return true;

  } catch (error) {
    console.error('❌ Challenge validation error:', error);
    return false;
  }
}

export async function consumeChallenge(address: string): Promise<void> {
  try {
    await connectToDatabase();
    await Challenge.deleteOne({ address });
    console.log('🗑️ Challenge consumed for address:', address);
  } catch (error) {
    console.error('❌ Failed to consume challenge:', error);
  }
}

export async function getStoredChallenge(address: string) {
  try {
    await connectToDatabase();
    return await Challenge.findOne({ address });
  } catch (error) {
    console.error('❌ Failed to get stored challenge:', error);
    return null;
  }
}