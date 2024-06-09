import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: string;
  level: string;
  startDate: Date;
  endDate: Date;
  nextBillingDate: Date;
  sessionId: string; // Replace stripeId with sessionId
}

const SubscriptionSchema: Schema<ISubscription> = new Schema({
  userId: { type: String, required: true },
  level: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  nextBillingDate: { type: Date, required: true },
  sessionId: { type: String, required: true }, // Use sessionId instead of stripeId
}, {
  timestamps: true,
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
