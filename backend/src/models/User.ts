import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'teacher' | 'student';

export type Branch = 'CSE' | 'AIML' | 'Data Science' | 'IT' | 'EEE' | 'ECE';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch: Branch;
  // Student specific fields
  year?: number;
  section?: string;
  rollNumber?: string;
  // Teacher specific fields
  departments?: string[];
  branchesHandled?: Branch[];
  // Password reset fields
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  branch: {
    type: String,
    enum: ['CSE', 'AIML', 'Data Science', 'IT', 'EEE', 'ECE'],
    required: true
  },
  // Student specific fields
  year: {
    type: Number,
    min: 1,
    max: 4
  },
  section: {
    type: String
  },
  rollNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  // Teacher specific fields
  departments: [{
    type: String
  }],
  branchesHandled: [{
    type: String,
    enum: ['CSE', 'AIML', 'Data Science', 'IT', 'EEE', 'ECE']
  }],
  // Password reset fields
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function() {
  // Use function() instead of arrow function to preserve 'this' context
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);