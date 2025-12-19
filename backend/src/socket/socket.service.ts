import { Server, Socket } from 'socket.io';
import Task from '../models/Task';
import Notification from '../models/Notification';

interface IUser {
  userId: string;
  socketId: string;
}

class SocketService {
  private io: Server;
  private users: IUser[] = [];

  constructor(io: Server) {
    this.io = io;
    this.setupConnection();
  }

  private setupConnection() {
    this.io.on('connection', (socket: Socket) => {
      console.log('A user connected:', socket.id);

      // Handle user joining
      socket.on('join', (userId: string) => {
        this.addUser(userId, socket.id);
        console.log(`User ${userId} joined with socket ${socket.id}`);
      });

      // Handle task updates
      socket.on('taskUpdated', async (taskData: any) => {
        try {
          // Emit to all connected users
          this.io.emit('taskUpdated', taskData);
          
          // If assignedToId was updated, send notification
          if (taskData.assignedToId) {
            // Create notification in database
            const notification = new Notification({
              userId: taskData.assignedToId,
              taskId: taskData._id,
              message: `You have been assigned to task: ${taskData.title}`
            });
            await notification.save();
            
            // Emit notification to specific user
            const userSocket = this.getUserSocket(taskData.assignedToId);
            if (userSocket) {
              this.io.to(userSocket).emit('notification', {
                message: `You have been assigned to task: ${taskData.title}`,
                taskId: taskData._id
              });
            }
          }
        } catch (error) {
          console.error('Error handling task update:', error);
        }
      });

      // Handle chat messages
      socket.on('sendMessage', async (messageData: any) => {
        try {
          // Emit message to all users in the same task room
          socket.to(`task_${messageData.taskId}`).emit('receiveMessage', messageData);
          
          // Also emit to the sender for confirmation
          socket.emit('messageSent', messageData);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      // Handle joining a task room
      socket.on('joinTaskRoom', (taskId: string) => {
        socket.join(`task_${taskId}`);
        console.log(`User ${socket.id} joined task room ${taskId}`);
      });

      // Handle leaving a task room
      socket.on('leaveTaskRoom', (taskId: string) => {
        socket.leave(`task_${taskId}`);
        console.log(`User ${socket.id} left task room ${taskId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.removeUser(socket.id);
        console.log('User disconnected:', socket.id);
      });
    });
  }

  private addUser(userId: string, socketId: string) {
    // Remove existing connection for this user
    this.users = this.users.filter(user => user.userId !== userId);
    // Add new connection
    this.users.push({ userId, socketId });
  }

  private removeUser(socketId: string) {
    this.users = this.users.filter(user => user.socketId !== socketId);
  }

  private getUserSocket(userId: string): string | undefined {
    const user = this.users.find(user => user.userId === userId);
    return user?.socketId;
  }

  public emitTaskUpdate(task: any) {
    this.io.emit('taskUpdated', task);
  }

  public emitNotification(userId: string, notification: any) {
    const userSocket = this.getUserSocket(userId);
    if (userSocket) {
      this.io.to(userSocket).emit('notification', notification);
    }
  }
}

export default SocketService;