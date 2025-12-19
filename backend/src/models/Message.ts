import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  taskId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);