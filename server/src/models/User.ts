import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ISubscription } from './Subscription'; // Make sure to import ISubscription correctly

export interface IUser extends Document {
  _id: string;
  subscriptionId: string;
  subscription: ISubscription;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  sessionId: string; // Rename stripeId to sessionId
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
  subscriptionId: { type: String },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  sessionId: { type: String }, // Use sessionId instead of stripeId
}, {
  timestamps: true,
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
