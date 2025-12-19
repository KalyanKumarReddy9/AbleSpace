import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';
import notificationRoutes from './routes/notification.routes';
import academicTaskRoutes from './routes/academicTask.routes';
import SocketService from './socket/socket.service';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Determine allowed frontend origins for both HTTP CORS and socket.io
// Support comma-separated origins in FRONTEND_URL env var
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
const envOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : [];

const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

console.log('Allowed CORS origins:', allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Initialize Socket Service
const socketService = new SocketService(io);

// Middleware
// Configure CORS to allow requests from frontend
// `allowedOrigins` is defined above and used for both HTTP CORS and socket.io
const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (eg. mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/academic', academicTaskRoutes);

app.get('/', (req, res) => {
  res.send('Task Management API is running...');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});