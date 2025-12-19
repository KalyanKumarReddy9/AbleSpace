import { z } from 'zod';

// User DTOs
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['teacher', 'student'], {
    message: 'Role is required'
  }),
  branch: z.enum(['CSE', 'AIML', 'Data Science', 'IT', 'EEE', 'ECE'], {
    message: 'Branch is required'
  }),
  // Student specific fields
  year: z.number().optional(),
  section: z.string().optional(),
  rollNumber: z.string().optional(),
  // Teacher specific fields
  departments: z.array(z.string()).optional(),
  branchesHandled: z.array(z.enum(['CSE', 'AIML', 'Data Science', 'IT', 'EEE', 'ECE'])).optional().default([])
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;