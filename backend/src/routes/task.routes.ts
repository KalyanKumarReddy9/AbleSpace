import express from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask,
  getOverdueTasks
} from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
  .post(authenticate, createTask)
  .get(authenticate, getTasks);

router.route('/overdue')
  .get(authenticate, getOverdueTasks);

router.route('/:id')
  .get(authenticate, getTaskById)
  .put(authenticate, updateTask)
  .delete(authenticate, deleteTask);

export default router;