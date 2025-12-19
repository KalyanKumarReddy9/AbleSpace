import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Completed']).optional().default('To Do'),
  assignedToId: z.string().optional(),
  assignedToBranch: z.enum(['CSE', 'AIML', 'Data Science', 'IT', 'EEE', 'ECE']).optional(),
  assignmentType: z.enum(['individual', 'branch', 'team']).optional(),
  assignedStudentName: z.string().optional(),
  assignedStudentRoll: z.string().optional(),
  teamMembers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rollNumber: z.string().optional(),
    email: z.string().optional()
  })).optional(),
  minTeamSize: z.number().optional().default(1),
  maxTeamSize: z.number().optional().default(1)
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Completed']).optional(),
  assignedToId: z.string().optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;