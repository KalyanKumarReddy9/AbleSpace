import { io, Socket } from 'socket.io-client';

// In production, connect to same origin; in dev, use env var or localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:5005');

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('Connected to socket server');
        // Join room with user ID
        this.socket?.emit('join', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      this.socket.on('taskUpdated', (task) => {
        console.log('Task updated:', task);
        // Handle task update
      });

      this.socket.on('notification', (notification) => {
        console.log('New notification:', notification);
        // Handle notification
      });

      this.socket.on('receiveMessage', (message) => {
        console.log('New message received:', message);
        // Handle incoming message
      });

      this.socket.on('messageSent', (message) => {
        console.log('Message sent confirmation:', message);
        // Handle message sent confirmation
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitTaskUpdate(task: any) {
    this.socket?.emit('taskUpdated', task);
  }

  onTaskUpdate(callback: (task: any) => void) {
    this.socket?.on('taskUpdated', callback);
  }

  offTaskUpdate(callback: (task: any) => void) {
    this.socket?.off('taskUpdated', callback);
  }

  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  offNotification(callback: (notification: any) => void) {
    this.socket?.off('notification', callback);
  }

  joinTaskRoom(taskId: string) {
    this.socket?.emit('joinTaskRoom', taskId);
  }

  leaveTaskRoom(taskId: string) {
    this.socket?.emit('leaveTaskRoom', taskId);
  }

  sendMessage(messageData: any) {
    this.socket?.emit('sendMessage', messageData);
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.socket?.on('receiveMessage', callback);
  }

  offReceiveMessage(callback: (message: any) => void) {
    this.socket?.off('receiveMessage', callback);
  }

  onMessageSent(callback: (message: any) => void) {
    this.socket?.on('messageSent', callback);
  }

  offMessageSent(callback: (message: any) => void) {
    this.socket?.off('messageSent', callback);
  }
}

export default new SocketService();