import mongoose, { Document, Schema } from 'mongoose';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type Status = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface ITeamMember {
  id: string;
  name: string;
  rollNumber?: string;
  email?: string;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  status: Status;
  creatorId: mongoose.Types.ObjectId; // Teacher who created the task
  assignedToId?: mongoose.Types.ObjectId; // Individual student (if assigned to one)
  assignedToBranch?: string; // Branch (if assigned to entire branch)
  assignmentType?: 'individual' | 'branch' | 'team';
  assignedStudentName?: string;
  assignedStudentRoll?: string;
  teamMembers?: ITeamMember[];
  minTeamSize?: number;
  maxTeamSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Review', 'Completed'],
    default: 'To Do'
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedToId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToBranch: {
    type: String,
    enum: ['CSE', 'AIML', 'Data Science', 'IT', 'EEE', 'ECE']
  },
  assignmentType: {
    type: String,
    enum: ['individual', 'branch', 'team']
  },
  assignedStudentName: {
    type: String
  },
  assignedStudentRoll: {
    type: String
  },
  teamMembers: [{
    id: String,
    name: String,
    rollNumber: String,
    email: String
  }],
  minTeamSize: {
    type: Number,
    default: 1,
    min: 1
  },
  maxTeamSize: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true
});

export default mongoose.model<ITask>('Task', TaskSchema);