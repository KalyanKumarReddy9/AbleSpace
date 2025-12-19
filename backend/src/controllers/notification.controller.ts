import { Request, Response } from 'express';
import Notification from '../models/Notification';

// Get user notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const notifications = await Notification.find({ userId: req.user._id })
      .populate([
        { path: 'userId', select: 'name email' },
        { path: 'taskId', select: 'title' }
      ])
      .sort({ createdAt: -1 });
    
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};