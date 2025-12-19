import express from 'express';
import { 
  createAcademicTask,
  getTeacherTasks,
  getStudentTasks,
  getAllStudents,
  assignTask,
  createTeam,
  joinTeam,
  getTaskTeams,
  sendMessage,
  getTaskMessages,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/academicTask.controller';
import { authenticate, requireTeacher, requireStudent } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createTaskSchema } from '../dtos/task.dto';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Teacher routes
router.post('/tasks', requireTeacher, validateRequest(createTaskSchema), createAcademicTask);
router.get('/tasks/teacher', requireTeacher, getTeacherTasks);
router.get('/students', requireTeacher, getAllStudents);
router.put('/tasks/:taskId/assign', requireTeacher, assignTask);
router.put('/tasks/:taskId', requireTeacher, updateTask);
router.delete('/tasks/:taskId', requireTeacher, deleteTask);

// Student routes
router.get('/tasks/student', requireStudent, getStudentTasks);
router.post('/teams', requireStudent, createTeam);
router.post('/teams/:teamId/join', requireStudent, joinTeam);
router.patch('/tasks/:taskId/status', requireStudent, updateTaskStatus);

// Shared routes (both teachers and students)
router.get('/tasks/:taskId/teams', getTaskTeams);
router.post('/messages', sendMessage);
router.get('/tasks/:taskId/messages', getTaskMessages);

export default router;