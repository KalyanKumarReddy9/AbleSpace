import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import Notification from '../models/Notification';
import { CreateTaskInput, UpdateTaskInput } from '../dtos/task.dto';

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData = req.body as CreateTaskInput;
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Set creator to logged in user
    const task = new Task({
      ...taskData,
      creatorId: req.user._id
    });
    
    await task.save();
    
    // Populate creator and assignedTo fields
    await task.populate([
      { path: 'creatorId', select: 'name email' },
      { path: 'assignedToId', select: 'name email' }
    ]);
    
    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    const { status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Filter by priority
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Filter by assigned tasks or created tasks
    const filterType = req.query.filterType as string;
    if (filterType === 'assigned') {
      filter.assignedToId = req.user._id;
    } else if (filterType === 'created') {
      filter.creatorId = req.user._id;
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const tasks = await Task.find(filter)
      .populate([
        { path: 'creatorId', select: 'name email' },
        { path: 'assignedToId', select: 'name email' }
      ])
      .sort(sort);
    
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get task by ID
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate([
        { path: 'creatorId', select: 'name email' },
        { path: 'assignedToId', select: 'name email' }
      ]);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const updates = req.body as UpdateTaskInput;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is creator or assigned user
    if (task.creatorId.toString() !== req.user._id.toString() && 
        task.assignedToId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    // Update task
    Object.assign(task, updates);
    await task.save();
    
    // Populate fields
    await task.populate([
      { path: 'creatorId', select: 'name email' },
      { path: 'assignedToId', select: 'name email' }
    ]);
    
    // If assignedToId was updated, create notification
    if (updates.assignedToId && updates.assignedToId !== task.assignedToId?.toString()) {
      const notification = new Notification({
        userId: updates.assignedToId,
        taskId: task._id,
        message: `You have been assigned to task: ${task.title}`
      });
      await notification.save();
      
      // Emit socket event for notification
      // This will be implemented in the socket service
    }
    
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is creator
    if (task.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    return res.json({ message: 'Task removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get overdue tasks
export const getOverdueTasks = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const now = new Date();
    
    const tasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: 'Completed' },
      $or: [
        { assignedToId: req.user._id },
        { creatorId: req.user._id }
      ]
    })
    .populate([
      { path: 'creatorId', select: 'name email' },
      { path: 'assignedToId', select: 'name email' }
    ])
    .sort({ dueDate: 1 });
    
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};