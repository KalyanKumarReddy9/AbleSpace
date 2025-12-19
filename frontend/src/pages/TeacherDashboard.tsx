import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import TaskCreationForm from '../components/TaskCreationForm';
import AnimatedSticker from '../components/AnimatedSticker';
import Chat from '../components/Chat';

interface Student {
  _id: string;
  name: string;
  email: string;
  branch: string;
  year?: number;
  section?: string;
  rollNumber?: string;
}

interface TeamMember {
  id: string;
  name: string;
  rollNumber?: string;
  email: string;
}

interface AcademicTask {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  creatorId: string;
  assignedToId?: string;
  assignedStudentName?: string;
  assignedStudentRoll?: string;
  assignedToBranch?: string;
  assignmentType?: 'individual' | 'branch' | 'team';
  teamMembers?: TeamMember[];
  minTeamSize?: number;
  maxTeamSize?: number;
  createdAt: string;
  updatedAt: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'tasks' | 'assignments' | 'completed'>('students');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<AcademicTask | null>(null);
  const [editingTask, setEditingTask] = useState<AcademicTask | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<AcademicTask | null>(null);
  const [chatTask, setChatTask] = useState<AcademicTask | null>(null);

  // Filter tasks by status
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  // Fetch students and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        const studentsResponse = await fetch('/api/academic/students', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students');
        }
        
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
        
        // Fetch tasks
        const tasksResponse = await fetch('/api/academic/tasks/teacher', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter students based on branch and year
  const filteredStudents = students.filter(student => {
    if (selectedBranch !== 'all' && student.branch !== selectedBranch) {
      return false;
    }
    
    if (selectedYear !== 'all' && student.year?.toString() !== selectedYear) {
      return false;
    }
    
    return true;
  });

  // Get unique branches and years for filters
  const uniqueBranches = Array.from(new Set(students.map(s => s.branch)));
  const uniqueYears = Array.from(new Set(students.map(s => s.year))).filter(Boolean) as number[];

  // Handle task creation
  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/academic/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks(prev => [newTask, ...prev]);
      setShowTaskForm(false);
      
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  // Handle task update
  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;
    
    try {
      const response = await fetch(`/api/academic/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      setEditingTask(null);
      setShowTaskForm(false);
      
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  // Handle task delete
  const handleDeleteTask = async (task: AcademicTask) => {
    try {
      const response = await fetch(`/api/academic/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prev => prev.filter(t => t._id !== task._id));
      setDeleteConfirmTask(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  // Get assignment info for a task
  const getAssignmentInfo = (task: AcademicTask) => {
    if (task.assignmentType === 'individual') {
      return {
        type: 'Individual',
        icon: '👤',
        color: 'indigo',
        detail: task.assignedStudentName ? `${task.assignedStudentName} (${task.assignedStudentRoll || 'N/A'})` : 'Individual Assignment'
      };
    } else if (task.assignmentType === 'team') {
      return {
        type: 'Team',
        icon: '👥',
        color: 'purple',
        detail: `${task.teamMembers?.length || 0} members - ${task.assignedToBranch}`
      };
    } else {
      return {
        type: 'Branch',
        icon: '🏛️',
        color: 'pink',
        detail: task.assignedToBranch || 'All Students'
      };
    }
  };

  // Priority colors
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Status colors
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Review': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        
        {/* Decorative Icons/Stickers */}
        {/* Anime-style Stickers */}
        <div className="absolute top-24 left-[15%] opacity-30">
          <AnimatedSticker type="book" size="lg" />
        </div>
        <div className="absolute top-32 right-[20%] opacity-30">
          <AnimatedSticker type="star" size="md" />
        </div>
        <div className="absolute bottom-24 left-[10%] opacity-30">
          <AnimatedSticker type="cat" size="lg" />
        </div>
        <div className="absolute bottom-32 right-[15%] opacity-30">
          <AnimatedSticker type="rocket" size="lg" />
        </div>
        <div className="absolute top-1/2 left-[5%] opacity-20">
          <AnimatedSticker type="sparkle" size="md" />
        </div>
        <div className="absolute top-1/3 right-[8%] opacity-20">
          <AnimatedSticker type="cloud" size="md" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0yNCAzNGgydjEyaC0yVjM0em0xMiAwaC0ydjEyaDJWMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30 mr-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
                <p className="mt-1 text-purple-200">Welcome back, {user?.name || 'Teacher'} 👋</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/10 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                {user?.branch} Branch
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <span className="text-purple-200 text-sm">📊</span>
                <span className="text-white text-sm font-medium">{students.length} Students</span>
                <span className="text-purple-300">•</span>
                <span className="text-white text-sm font-medium">{tasks.length} Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-white mt-1">{students.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="text-3xl">👨‍🎓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-white mt-1">{tasks.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="text-3xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 shadow-lg shadow-pink-500/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {tasks.filter(t => t.status === 'In Progress').length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-lg shadow-green-500/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {tasks.filter(t => t.status === 'Completed').length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/10 inline-flex">
            <button
              onClick={() => setActiveTab('students')}
              className={`${activeTab === 'students' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                : 'text-purple-200 hover:text-white hover:bg-white/10'} 
                px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center`}
            >
              <span className="mr-2">👨‍🎓</span> Student Management
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`${activeTab === 'tasks' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                : 'text-purple-200 hover:text-white hover:bg-white/10'} 
                px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center`}
            >
              <span className="mr-2">📝</span> Task Management
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`${activeTab === 'assignments' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                : 'text-purple-200 hover:text-white hover:bg-white/10'} 
                px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center`}
            >
              <span className="mr-2">📊</span> Assignment Tracking
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${activeTab === 'completed' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                : 'text-purple-200 hover:text-white hover:bg-white/10'} 
                px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center`}
            >
              <span className="mr-2">✅</span> Completed Tasks
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl mb-6 flex items-center animate-fade-in-up">
            <span className="text-2xl mr-3">⚠️</span>
            {error}
          </div>
        )}

        {/* Student Management Tab */}
        {activeTab === 'students' && !loading && (
          <div className="animate-fade-in-up">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                <label htmlFor="branch-filter" className="block text-sm font-medium text-purple-200 mb-2">
                  🏛️ Branch
                </label>
                <select
                  id="branch-filter"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
                >
                  <option value="all" className="bg-slate-800">All Branches</option>
                  {uniqueBranches.map(branch => (
                    <option key={branch} value={branch} className="bg-slate-800">{branch}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                <label htmlFor="year-filter" className="block text-sm font-medium text-purple-200 mb-2">
                  📅 Year
                </label>
                <select
                  id="year-filter"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
                >
                  <option value="all" className="bg-slate-800">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year.toString()} className="bg-slate-800">{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600/50 to-purple-600/50">
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Branch
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Year/Section
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Roll Number
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredStudents.map((student, index) => (
                      <tr key={student._id} className="hover:bg-white/5 transition-colors duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-white">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {student.branch}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                          {student.year && student.section 
                            ? `${student.year}/${student.section}` 
                            : student.year || student.section || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-lg">
                            {student.rollNumber || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white">No students found</h3>
                  <p className="mt-2 text-purple-300">Try adjusting your filters to see more results.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Task Management Tab */}
        {activeTab === 'tasks' && !loading && (
          <div className="animate-fade-in-up">
            {showTaskForm ? (
              <TaskCreationForm 
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                students={students}
                initialData={editingTask}
                isEditing={!!editingTask}
              />
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-indigo-600/30 to-purple-600/30">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <span className="mr-2">📋</span> Tasks Created
                    </h3>
                    <p className="text-purple-200 text-sm mt-1">Manage and track all your assigned tasks</p>
                  </div>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create New Task
                  </button>
                </div>
                
                <div className="divide-y divide-white/10">
                  {activeTasks.map((task, index) => {
                    const assignmentInfo = getAssignmentInfo(task);
                    return (
                      <div 
                        key={task._id} 
                        className="px-6 py-5 hover:bg-white/5 transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityStyle(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`w-3 h-3 rounded-full ${getStatusStyle(task.status)}`}></span>
                              <span className="text-sm text-purple-300">{task.status}</span>
                            </div>
                            <p className="text-purple-200 text-sm mb-3 line-clamp-2">{task.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {task.dueDate && (
                                <span className="flex items-center text-purple-300">
                                  <span className="mr-1">📅</span>
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              <span className="flex items-center text-purple-300">
                                <span className="mr-1">👥</span>
                                Team: {task.minTeamSize} - {task.maxTeamSize}
                              </span>
                              <span className={`flex items-center px-3 py-1 rounded-lg bg-${assignmentInfo.color}-500/20 text-${assignmentInfo.color}-300 border border-${assignmentInfo.color}-500/30`}>
                                <span className="mr-1">{assignmentInfo.icon}</span>
                                {assignmentInfo.type}: {assignmentInfo.detail}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedTask(task)}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all duration-200"
                            >
                              <span className="mr-1">👁️</span> View
                            </button>
                            {task.assignmentType === 'individual' && (
                              <button 
                                onClick={() => setChatTask(task)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all duration-200"
                              >
                                <span className="mr-1">💬</span> Chat
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setEditingTask(task);
                                setShowTaskForm(true);
                              }}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all duration-200"
                            >
                              <span className="mr-1">✏️</span> Edit
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmTask(task)}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-red-300 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
                            >
                              <span className="mr-1">🗑️</span> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {activeTasks.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-white">No active tasks</h3>
                    <p className="mt-2 text-purple-300 mb-6">Create a new task or check completed tasks!</p>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create New Task
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Assignment Tracking Tab */}
        {activeTab === 'assignments' && !loading && (
          <div className="animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-indigo-600/30 to-purple-600/30">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">📊</span> Assignment Tracking
                </h3>
                <p className="text-purple-200 text-sm mt-1">Track active tasks and communicate with students</p>
              </div>
              
              {activeTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-white">No active assignments to track</h3>
                  <p className="mt-2 text-purple-300">Create tasks first or check completed tasks.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {activeTasks.map((task, index) => {
                    const assignmentInfo = getAssignmentInfo(task);
                    return (
                      <div 
                        key={task._id} 
                        className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${assignmentInfo.color}-400 to-${assignmentInfo.color}-600 flex items-center justify-center text-2xl shadow-lg`}>
                                {assignmentInfo.icon}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                                <span className={`text-sm ${getPriorityStyle(task.priority)} px-2 py-0.5 rounded-full`}>
                                  {task.priority} Priority
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-4 mt-3">
                              <div className="flex items-center mb-2">
                                <span className="text-purple-300 text-sm font-medium">Assignment Type:</span>
                                <span className="ml-2 text-white font-semibold">{assignmentInfo.type}</span>
                              </div>
                              
                              {task.assignmentType === 'individual' && (
                                <div className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30 mt-2">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                      {task.assignedStudentName?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                      <div className="text-white font-medium">{task.assignedStudentName || 'Unknown'}</div>
                                      <div className="text-indigo-300 text-sm">Roll: {task.assignedStudentRoll || 'N/A'}</div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setChatTask(task)}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all duration-200"
                                  >
                                    <span className="mr-1">💬</span> Chat
                                  </button>
                                </div>
                              )}
                              
                              {task.assignmentType === 'team' && task.teamMembers && (
                                <div className="mt-2">
                                  <div className="text-purple-300 text-sm mb-2">Team Members ({task.teamMembers.length}):</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {task.teamMembers.map((member, idx) => (
                                      <div key={idx} className="flex items-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                                          {member.name.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="text-white text-sm font-medium">{member.name}</div>
                                          <div className="text-purple-300 text-xs">Roll: {member.rollNumber || 'N/A'}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {task.assignmentType === 'branch' && (
                                <div className="flex items-center p-3 bg-pink-500/10 rounded-lg border border-pink-500/30 mt-2">
                                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl mr-3">
                                    🏛️
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">{task.assignedToBranch} Branch</div>
                                    <div className="text-pink-300 text-sm">
                                      {students.filter(s => s.branch === task.assignedToBranch).length} students assigned
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center ${
                              task.status === 'Completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                              task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              task.status === 'Review' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                              'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              <span className={`w-2 h-2 rounded-full mr-2 ${getStatusStyle(task.status)}`}></span>
                              {task.status}
                            </div>
                            {task.dueDate && (
                              <div className="text-purple-300 text-sm flex items-center">
                                <span className="mr-1">📅</span>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completed Tasks Tab */}
        {activeTab === 'completed' && !loading && (
          <div className="animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-green-600/30 to-teal-600/30">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">✅</span> Completed Tasks
                </h3>
                <p className="text-green-200 text-sm mt-1">View all completed assignments</p>
              </div>
              
              {completedTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-white">No completed tasks yet</h3>
                  <p className="mt-2 text-green-200">Tasks will appear here once students mark them as completed.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {completedTasks.map((task, index) => {
                    const assignmentInfo = getAssignmentInfo(task);
                    return (
                      <div 
                        key={task._id} 
                        className="bg-white/5 rounded-xl p-5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-2xl shadow-lg">
                                ✅
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                                <span className="text-sm bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
                                  Completed
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-green-100/70 text-sm mb-3">{task.description}</p>
                            
                            <div className="bg-white/5 rounded-lg p-4 mt-3">
                              <div className="flex items-center mb-2">
                                <span className="text-green-200 text-sm font-medium">Assignment Type:</span>
                                <span className="ml-2 text-white font-semibold">{assignmentInfo.type}</span>
                              </div>
                              
                              {task.assignmentType === 'individual' && (
                                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30 mt-2">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                      {task.assignedStudentName?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                      <div className="text-white font-medium">{task.assignedStudentName || 'Unknown'}</div>
                                      <div className="text-green-300 text-sm">Roll: {task.assignedStudentRoll || 'N/A'}</div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setChatTask(task)}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all duration-200"
                                  >
                                    <span className="mr-1">💬</span> View Chat
                                  </button>
                                </div>
                              )}
                              
                              {task.assignmentType === 'team' && task.teamMembers && (
                                <div className="mt-2">
                                  <div className="text-green-200 text-sm mb-2">Team Members ({task.teamMembers.length}):</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {task.teamMembers.map((member, idx) => (
                                      <div key={idx} className="flex items-center p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                                          {member.name.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="text-white text-sm font-medium">{member.name}</div>
                                          <div className="text-green-300 text-xs">Roll: {member.rollNumber || 'N/A'}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {task.assignmentType === 'branch' && (
                                <div className="flex items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30 mt-2">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xl mr-3">
                                    🏛️
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">{task.assignedToBranch} Branch</div>
                                    <div className="text-green-300 text-sm">
                                      {students.filter(s => s.branch === task.assignedToBranch).length} students
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {task.dueDate && (
                              <div className="text-green-200 text-sm flex items-center">
                                <span className="mr-1">📅</span>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            <div className="text-green-300 text-xs">
                              Completed on: {new Date(task.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">{selectedTask.title}</h3>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-purple-300 text-sm">Description</label>
                <p className="text-white mt-1">{selectedTask.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-purple-300 text-sm">Priority</label>
                  <p className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityStyle(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </p>
                </div>
                <div>
                  <label className="text-purple-300 text-sm">Status</label>
                  <p className="text-white mt-1 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${getStatusStyle(selectedTask.status)}`}></span>
                    {selectedTask.status}
                  </p>
                </div>
                <div>
                  <label className="text-purple-300 text-sm">Due Date</label>
                  <p className="text-white mt-1">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <label className="text-purple-300 text-sm">Team Size</label>
                  <p className="text-white mt-1">{selectedTask.minTeamSize} - {selectedTask.maxTeamSize} members</p>
                </div>
              </div>
              <div>
                <label className="text-purple-300 text-sm">Assignment</label>
                <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/10">
                  {getAssignmentInfo(selectedTask).type}: {getAssignmentInfo(selectedTask).detail}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmTask(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete Task</h3>
              <p className="text-purple-200 text-center mb-6">
                Are you sure you want to delete "<span className="text-white font-medium">{deleteConfirmTask.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmTask(null)}
                  className="flex-1 px-4 py-3 text-sm font-medium rounded-xl text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTask(deleteConfirmTask)}
                  className="flex-1 px-4 py-3 text-sm font-medium rounded-xl text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal for Individual Tasks */}
      {chatTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setChatTask(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {chatTask.assignedStudentName?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Chat with {chatTask.assignedStudentName || 'Student'}</h3>
                  <p className="text-purple-200 text-sm">Task: {chatTask.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setChatTask(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[500px]">
              <Chat 
                taskId={chatTask._id}
                currentUser={{
                  _id: user?._id || '',
                  name: user?.name || '',
                  email: user?.email || ''
                }}
                onBack={() => setChatTask(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;