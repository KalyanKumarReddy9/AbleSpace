import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  taskId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[]; // Array of student IDs
  teamName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  teamName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ITeam>('Team', TeamSchema);