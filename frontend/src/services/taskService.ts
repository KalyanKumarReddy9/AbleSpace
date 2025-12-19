import api from './api';

export interface Task {
  _id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  creatorId?: string;
  assignedToId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const taskService = {
  // Get all tasks
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  createTask: async (task: Omit<Task, '_id' | 'creatorId' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  // Update a task
  updateTask: async (id: string, task: Partial<Task>) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Get overdue tasks
  getOverdueTasks: async () => {
    const response = await api.get('/tasks/overdue');
    return response.data;
  }
};