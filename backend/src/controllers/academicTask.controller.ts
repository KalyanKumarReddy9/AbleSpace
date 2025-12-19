import { Request, Response } from 'express';
import Task from '../models/Task';
import User from '../models/User';
import Team from '../models/Team';
import Message from '../models/Message';
import { CreateTaskInput } from '../dtos/task.dto';

// Create a new academic task (Teacher only)
export const createAcademicTask = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create tasks' });
    }

    const taskData = req.body as CreateTaskInput;
    
    // Set creator to logged in teacher
    const task = new Task({
      ...taskData,
      creatorId: req.user._id
    });
    
    await task.save();
    
    // Populate creator field
    await task.populate({ path: 'creatorId', select: 'name email' });
    
    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks for a teacher
export const getTeacherTasks = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ creatorId: req.user._id })
      .populate([
        { path: 'creatorId', select: 'name email' },
        { path: 'assignedToId', select: 'name email' }
      ])
      .sort({ createdAt: -1 });
    
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks for a student
export const getStudentTasks = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get tasks assigned to the student individually
    const individualTasks = await Task.find({ assignedToId: req.user._id })
      .populate({ path: 'creatorId', select: 'name email' });

    // Get tasks assigned to the student's branch
    const branchTasks = await Task.find({ assignedToBranch: req.user.branch })
      .populate({ path: 'creatorId', select: 'name email' });

    // Combine and deduplicate tasks
    const allTasks = [...individualTasks, ...branchTasks];
    const uniqueTasks = Array.from(new Map(allTasks.map(task => [task._id.toString(), task])).values());

    return res.json(uniqueTasks);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all students (Teacher only)
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get students from branches handled by the teacher
    const students = await User.find({ 
      role: 'student',
      branch: { $in: req.user.branchesHandled || [] }
    }).select('-password');

    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Assign task to student or branch (Teacher only)
export const assignTask = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { taskId } = req.params;
    const { assignedToId, assignedToBranch } = req.body;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Ensure the teacher owns the task
    if (task.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update assignment
    if (assignedToId) {
      task.assignedToId = assignedToId;
    }
    if (assignedToBranch) {
      task.assignedToBranch = assignedToBranch;
    }

    await task.save();

    // Populate fields
    await task.populate([
      { path: 'creatorId', select: 'name email' },
      { path: 'assignedToId', select: 'name email' }
    ]);

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a team for a task (Student only)
export const createTeam = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { taskId, teamName } = req.body;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if student is assigned to this task
    const isAssigned = task.assignedToId?.toString() === req.user._id.toString() || 
                     task.assignedToBranch === req.user.branch;
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    // Check if team already exists for this task and student
    const existingTeam = await Team.findOne({ 
      taskId: taskId, 
      members: req.user._id 
    });
    
    if (existingTeam) {
      return res.status(400).json({ message: 'You are already in a team for this task' });
    }

    // Create new team
    const team = new Team({
      taskId,
      teamName,
      members: [req.user._id]
    });

    await team.save();

    // Populate members
    await team.populate({ path: 'members', select: 'name email' });

    return res.status(201).json(team);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Join a team (Student only)
export const joinTeam = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { teamId } = req.params;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Find the task
    const task = await Task.findById(team.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if student is assigned to this task
    const isAssigned = task.assignedToId?.toString() === req.user._id.toString() || 
                     task.assignedToBranch === req.user.branch;
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    // Check team size constraints
    if (task.maxTeamSize && team.members.length >= task.maxTeamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    // Check if student is already in the team
    if (team.members.some(member => member.toString() === req.user!._id.toString())) {
      return res.status(400).json({ message: 'You are already in this team' });
    }

    // Add student to team
    team.members.push(req.user._id);
    await team.save();

    // Populate members
    await team.populate({ path: 'members', select: 'name email' });

    return res.json(team);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get teams for a task
export const getTaskTeams = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { taskId } = req.params;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to this task or is the creator
    const isAssigned = task.assignedToId?.toString() === req.user._id.toString() || 
                      task.assignedToBranch === req.user.branch ||
                      task.creatorId.toString() === req.user._id.toString();
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get teams for this task
    const teams = await Team.find({ taskId })
      .populate({ path: 'members', select: 'name email' });

    return res.json(teams);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Send a message (Real-time chat)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { taskId, content } = req.body;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to this task or is the creator
    const isAssigned = task.assignedToId?.toString() === req.user._id.toString() || 
                      task.assignedToBranch === req.user.branch ||
                      task.creatorId.toString() === req.user._id.toString();
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create message
    const message = new Message({
      taskId,
      senderId: req.user._id,
      content
    });

    await message.save();

    // Populate sender
    await message.populate({ path: 'senderId', select: 'name email' });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a task
export const getTaskMessages = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { taskId } = req.params;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to this task or is the creator
    const isAssigned = task.assignedToId?.toString() === req.user._id.toString() || 
                      task.assignedToBranch === req.user.branch ||
                      task.creatorId.toString() === req.user._id.toString();
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get messages for this task
    const messages = await Message.find({ taskId })
      .populate({ path: 'senderId', select: 'name email' })
      .sort({ timestamp: 1 });

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update a task (Teacher only)
export const updateTask = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can update tasks' });
    }

    const { taskId } = req.params;
    const updateData = req.body;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Ensure the teacher owns the task
    if (task.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task fields
    Object.assign(task, updateData);
    await task.save();

    // Populate fields
    await task.populate([
      { path: 'creatorId', select: 'name email' },
      { path: 'assignedToId', select: 'name email' }
    ]);

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a task (Teacher only)
export const deleteTask = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete tasks' });
    }

    const { taskId } = req.params;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Ensure the teacher owns the task
    if (task.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete associated teams and messages
    await Team.deleteMany({ taskId });
    await Message.deleteMany({ taskId });
    
    // Delete the task
    await Task.findByIdAndDelete(taskId);

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update task status (Student only - for marking as complete)
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Ensure user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can update task status' });
    }

    const { taskId } = req.params;
    const { status } = req.body;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if student is assigned to this task
    const isAssigned = task.assignedToId?.toString() === req.user._id.toString() || 
                      task.assignedToBranch === req.user.branch;
    
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    // Update status
    task.status = status;
    await task.save();

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};