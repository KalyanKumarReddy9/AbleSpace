import { useState, useEffect } from 'react';
import { taskService, Task } from '../services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<Task, '_id' | 'creatorId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await taskService.createTask(task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
      throw err;
    }
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    try {
      const updatedTask = await taskService.updateTask(id, task);
      setTasks(prev => prev.map(t => t._id === id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
};