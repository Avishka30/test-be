import { Schema, model, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

// 1. Define the Interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Define the Schema
const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// 3. Pre-save hook (Hash Password)
// FIX: Removed 'next'. In modern Mongoose with async functions, 
// simply await logic or throw errors. No next() needed.
UserSchema.pre('save', async function () {
  // If password is not modified, just return (replaces next())
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Function finishes successfully here (replaces next())
  } catch (err: any) {
    throw err; // Throwing error stops the save (replaces next(err))
  }
});

// 4. Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', UserSchema);