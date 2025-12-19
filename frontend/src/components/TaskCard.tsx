import React from 'react';

interface TaskCardProps {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  dueDate?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  title, 
  description, 
  priority, 
  status, 
  dueDate,
  onEdit,
  onDelete
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if task is overdue
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'Completed';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={onEdit}
            className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 transition-colors duration-300"
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-300"
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {description && (
        <p className="text-gray-600 mt-2 mb-4">{description}</p>
      )};
      
      <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)} transition-all duration-300`}>
            {priority}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} transition-all duration-300`}>
            {status}
          </span>
          {isOverdue && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
              Overdue
            </span>
          )}
        </div>
        
        {dueDate && (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;