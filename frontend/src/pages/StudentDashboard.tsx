import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import TeamFormation from '../components/TeamFormation';
import Chat from '../components/Chat';
import AnimatedSticker from '../components/AnimatedSticker';

interface AcademicTask {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  creatorId: string;
  assignedToId?: string;
  assignedToBranch?: string;
  assignmentType?: 'individual' | 'branch' | 'team';
  minTeamSize?: number;
  maxTeamSize?: number;
  createdAt: string;
  updatedAt: string;
}

interface Team {
  _id: string;
  taskId: string;
  members: Array<{_id: string, name: string, email: string}>;
  teamName?: string;
  createdAt: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'teams' | 'completed'>('tasks');
  const [view, setView] = useState<'list' | 'teamFormation' | 'chat'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Fetch tasks and teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tasks
        const tasksResponse = await fetch('/api/academic/tasks/student', {
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
        
        // Fetch teams (simplified - in a real app, you'd fetch teams for specific tasks)
        setTeams([]);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter tasks by status
  const completedTasks = tasks.filter(task => task.status === 'Completed');
  const activeTasks = tasks.filter(task => task.status !== 'Completed');
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'
  );
  
  // Separate individual tasks from team/branch tasks (active only)
  const individualTasks = activeTasks.filter(task => task.assignmentType === 'individual');
  const teamBranchTasks = activeTasks.filter(task => task.assignmentType === 'team' || task.assignmentType === 'branch');
  
  // Completed tasks separated by type
  const completedIndividualTasks = completedTasks.filter(task => task.assignmentType === 'individual');
  const completedTeamBranchTasks = completedTasks.filter(task => task.assignmentType === 'team' || task.assignmentType === 'branch');

  // Handle task status update
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/academic/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
    }
  };

  // Priority colors
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-300 border-green-500/30';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        
        {/* Anime-style Stickers */}
        <div className="absolute top-24 left-[15%] opacity-30">
          <AnimatedSticker type="star" size="lg" />
        </div>
        <div className="absolute top-32 right-[20%] opacity-30">
          <AnimatedSticker type="heart" size="md" />
        </div>
        <div className="absolute bottom-24 left-[10%] opacity-30">
          <AnimatedSticker type="music" size="lg" />
        </div>
        <div className="absolute bottom-32 right-[15%] opacity-30">
          <AnimatedSticker type="flower" size="lg" />
        </div>
        <div className="absolute top-1/2 left-[5%] opacity-20">
          <AnimatedSticker type="book" size="md" />
        </div>
        <div className="absolute top-1/3 right-[8%] opacity-20">
          <AnimatedSticker type="cat" size="md" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0yNCAzNGgydjEyaC0yVjM0em0xMiAwaC0ydjEyaDJWMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-2xl shadow-lg shadow-cyan-500/30 mr-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
                <p className="mt-1 text-blue-200">Welcome back, {user?.name || 'Student'} 👋</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/10 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                {user?.branch} Branch
              </div>
              {user?.year && user?.section && (
                <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                  Year {user.year}, Section {user.section}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">My Tasks</p>
                <p className="text-3xl font-bold text-white mt-1">{individualTasks.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="text-3xl">👤</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Team Tasks</p>
                <p className="text-3xl font-bold text-white mt-1">{teamBranchTasks.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="text-3xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-lg shadow-green-500/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">{completedTasks.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 shadow-lg shadow-red-500/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Overdue</p>
                <p className="text-3xl font-bold text-white mt-1">{overdueTasks.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/10 inline-flex">
            <button
              onClick={() => { setActiveTab('tasks'); setView('list'); }}
              className={`${activeTab === 'tasks' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                : 'text-blue-200 hover:text-white hover:bg-white/10'} 
                px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center`}
            >
              <span className="mr-2">📝</span> My Tasks
            </button>
            <button
              onClick={() => { setActiveTab('teams'); setView('list'); }}
              className={`${activeTab === 'teams' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                : 'text-blue-200 hover:text-white hover:bg-white/10'} 
                px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center`}
            >
              <span className="mr-2">👥</span> My Teams
            </button>
            <button
              onClick={() => { setActiveTab('completed'); setView('list'); }}
              className={`${activeTab === 'completed' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                : 'text-blue-200 hover:text-white hover:bg-white/10'} 
                px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center`}
            >
              <span className="mr-2">✅</span> Completed ({completedTasks.length})
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">📖</span>
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

        {/* Tasks Tab */}
        {activeTab === 'tasks' && !loading && view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {individualTasks.map((task, index) => (
              <div 
                key={task._id} 
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                          👤 Individual
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
                      <p className="text-blue-200 text-sm line-clamp-2">{task.description}</p>
                    </div>
                    <span className={`ml-2 w-3 h-3 rounded-full ${getStatusStyle(task.status)} flex-shrink-0`}></span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'Completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      task.status === 'Review' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-blue-200 mb-4">
                    {task.dueDate && (
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedTaskId(task._id);
                        setView('chat');
                      }}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all duration-200"
                    >
                      <span className="mr-1">💬</span> Chat with Teacher
                    </button>
                    {task.status !== 'Completed' && (
                      <button 
                        onClick={() => handleUpdateTaskStatus(task._id, 'Completed')}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-green-300 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-all duration-200"
                      >
                        <span className="mr-1">✅</span> Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {individualTasks.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-white">No individual tasks assigned</h3>
                <p className="mt-2 text-blue-200">Check the Teams tab for group assignments!</p>
              </div>
            )}
          </div>
        )}

        {/* Team Formation View */}
        {view === 'teamFormation' && selectedTaskId && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setView('list')}
              className="mb-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Tasks
            </button>
            <TeamFormation 
              taskId={selectedTaskId}
              currentUser={{
                _id: user?._id || '',
                name: user?.name || '',
                email: user?.email || ''
              }}
              onBack={() => setView('list')}
            />
          </div>
        )}

        {/* Chat View */}
        {view === 'chat' && selectedTaskId && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setView('list')}
              className="mb-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Tasks
            </button>
            <Chat 
              taskId={selectedTaskId}
              currentUser={{
                _id: user?._id || '',
                name: user?.name || '',
                email: user?.email || ''
              }}
              onBack={() => setView('list')}
            />
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && !loading && view === 'list' && (
          <div className="animate-fade-in-up">
            {/* Team/Branch Tasks Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white flex items-center mb-4">
                <span className="mr-2">📋</span> Team & Branch Assignments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamBranchTasks.map((task, index) => (
                  <div 
                    key={task._id} 
                    className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              task.assignmentType === 'team' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                                : 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            }`}>
                              {task.assignmentType === 'team' ? '👥 Team' : '🏛️ Branch'}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
                          <p className="text-blue-200 text-sm line-clamp-2">{task.description}</p>
                        </div>
                        <span className={`ml-2 w-3 h-3 rounded-full ${getStatusStyle(task.status)} flex-shrink-0`}></span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'Completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          task.status === 'Review' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-blue-200 mb-4">
                        {task.dueDate && (
                          <div className="flex items-center">
                            <span className="mr-1">📅</span>
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <span className="mr-1">👥</span>
                          <span>Team: {task.minTeamSize}-{task.maxTeamSize}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTaskId(task._id);
                            setView('teamFormation');
                          }}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all duration-200"
                        >
                          <span className="mr-1">👥</span> Team
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedTaskId(task._id);
                            setView('chat');
                          }}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all duration-200"
                        >
                          <span className="mr-1">💬</span> Chat
                        </button>
                        {task.status !== 'Completed' && (
                          <button 
                            onClick={() => handleUpdateTaskStatus(task._id, 'Completed')}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-green-300 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-all duration-200"
                          >
                            <span>✅</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {teamBranchTasks.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-lg font-semibold text-white">No team or branch assignments</h3>
                    <p className="mt-1 text-blue-200 text-sm">Group assignments will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Teams Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-cyan-600/30 to-blue-600/30">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">👥</span> My Teams
                </h3>
                <p className="text-blue-200 text-sm mt-1">Collaborate with your teammates</p>
              </div>
              
              <div className="divide-y divide-white/10">
                {teams.map((team, index) => (
                  <div 
                    key={team._id} 
                    className="px-6 py-5 hover:bg-white/5 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-white">
                          {team.teamName || `Team for Task ${team.taskId.substring(0, 8)}`}
                        </h4>
                        <p className="mt-1 text-blue-200 text-sm">
                          Members: {team.members.length}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {team.members.slice(0, 3).map((member) => (
                            <span key={member._id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {member.name}
                            </span>
                          ))}
                          {team.members.length > 3 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                              +{team.members.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTaskId(team.taskId);
                            setView('teamFormation');
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all duration-200"
                        >
                          <span className="mr-1">⚙️</span> Manage
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedTaskId(team.taskId);
                            setView('chat');
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all duration-200"
                        >
                          <span className="mr-1">💬</span> Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {teams.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-white">No teams joined</h3>
                  <p className="mt-2 text-blue-200">Join a team from the assignments above to collaborate!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completed Tasks Tab */}
        {activeTab === 'completed' && !loading && view === 'list' && (
          <div className="animate-fade-in-up space-y-8">
            {/* Completed Individual Tasks */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-4">
                <span className="mr-2">👤</span> Completed Individual Tasks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedIndividualTasks.map((task, index) => (
                  <div 
                    key={task._id} 
                    className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-green-500/30 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                              ✅ Completed
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                              👤 Individual
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
                          <p className="text-blue-200 text-sm line-clamp-2">{task.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex items-center text-sm text-blue-200 mb-4">
                          <span className="mr-1">📅</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => {
                          setSelectedTaskId(task._id);
                          setView('chat');
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all duration-200"
                      >
                        <span className="mr-1">💬</span> View Chat History
                      </button>
                    </div>
                  </div>
                ))}
                
                {completedIndividualTasks.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-lg font-semibold text-white">No completed individual tasks</h3>
                    <p className="mt-1 text-blue-200 text-sm">Tasks you complete will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Team/Branch Tasks */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-4">
                <span className="mr-2">👥</span> Completed Team & Branch Tasks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTeamBranchTasks.map((task, index) => (
                  <div 
                    key={task._id} 
                    className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-green-500/30 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                              ✅ Completed
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              task.assignmentType === 'team' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                                : 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            }`}>
                              {task.assignmentType === 'team' ? '👥 Team' : '🏛️ Branch'}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
                          <p className="text-blue-200 text-sm line-clamp-2">{task.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex items-center text-sm text-blue-200 mb-4">
                          <span className="mr-1">📅</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => {
                          setSelectedTaskId(task._id);
                          setView('chat');
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all duration-200"
                      >
                        <span className="mr-1">💬</span> View Chat History
                      </button>
                    </div>
                  </div>
                ))}
                
                {completedTeamBranchTasks.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-lg font-semibold text-white">No completed team tasks</h3>
                    <p className="mt-1 text-blue-200 text-sm">Team tasks you complete will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
