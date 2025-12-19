import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
  .get(authenticate, getNotifications);

router.route('/mark-all-read')
  .post(authenticate, markAllAsRead);

router.route('/:id/mark-read')
  .post(authenticate, markAsRead);

export default router;