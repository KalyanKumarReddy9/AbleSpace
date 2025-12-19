import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createUserSchema, loginUserSchema, updateUserSchema } from '../dtos/user.dto';

const router = express.Router();

router.post('/register', validateRequest(createUserSchema), registerUser);
router.post('/login', validateRequest(loginUserSchema), loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

export default router;