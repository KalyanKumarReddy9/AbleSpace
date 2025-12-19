import React, { useState, useEffect } from 'react';

interface Student {
  _id: string;
  name: string;
  email: string;
  branch: string;
  year?: number;
  section?: string;
  rollNumber?: string;
}

interface TaskData {
  _id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  assignmentType?: string;
  assignedToId?: string;
  assignedStudentName?: string;
  assignedStudentRoll?: string;
  assignedToBranch?: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  teamMembers?: Array<{id: string; name: string; rollNumber?: string; email: string}>;
}

interface TaskCreationFormProps {
  onSubmit: (taskData: any) => void;
  onCancel: () => void;
  students?: Student[];
  initialData?: TaskData | null;
  isEditing?: boolean;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({ onSubmit, onCancel, students = [], initialData = null, isEditing = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignmentType, setAssignmentType] = useState('individual'); // 'individual', 'branch', or 'team'
  const [assignedToId, setAssignedToId] = useState('');
  const [assignedToBranch, setAssignedToBranch] = useState('');
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Roll number based selection
  const [rollNumberSearch, setRollNumberSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Team creation from same department
  const [teamDepartment, setTeamDepartment] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Student[]>([]);
  const [teamMemberSearch, setTeamMemberSearch] = useState('');

  // Initialize form with existing data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : '');
      setPriority(initialData.priority || 'Medium');
      setAssignmentType(initialData.assignmentType || 'individual');
      setMinTeamSize(initialData.minTeamSize || 1);
      setMaxTeamSize(initialData.maxTeamSize || 1);
      
      if (initialData.assignmentType === 'individual' && initialData.assignedToId) {
        setAssignedToId(initialData.assignedToId);
        const student = students.find(s => s._id === initialData.assignedToId);
        if (student) {
          setSelectedStudent(student);
        } else if (initialData.assignedStudentName) {
          // If student not in list, create a partial object
          setSelectedStudent({
            _id: initialData.assignedToId,
            name: initialData.assignedStudentName,
            rollNumber: initialData.assignedStudentRoll,
            email: '',
            branch: ''
          });
        }
      } else if (initialData.assignmentType === 'branch') {
        setAssignedToBranch(initialData.assignedToBranch || '');
      } else if (initialData.assignmentType === 'team') {
        setTeamDepartment(initialData.assignedToBranch || '');
        if (initialData.teamMembers) {
          const members = initialData.teamMembers.map(m => 
            students.find(s => s._id === m.id) || {
              _id: m.id,
              name: m.name,
              rollNumber: m.rollNumber,
              email: m.email,
              branch: initialData.assignedToBranch || ''
            }
          );
          setSelectedTeamMembers(members);
        }
      }
    }
  }, [initialData, isEditing, students]);

  // Get unique branches from students
  const uniqueBranches = Array.from(new Set(students.map(s => s.branch))).filter(Boolean);

  // Filter students by roll number for individual assignment
  const filteredStudentsByRoll = students.filter(student => 
    student.rollNumber?.toLowerCase().includes(rollNumberSearch.toLowerCase()) ||
    student.name.toLowerCase().includes(rollNumberSearch.toLowerCase())
  );

  // Filter students by department for team creation
  const studentsInDepartment = students.filter(student => 
    student.branch === teamDepartment &&
    !selectedTeamMembers.find(m => m._id === student._id)
  );

  const filteredTeamStudents = studentsInDepartment.filter(student =>
    student.rollNumber?.toLowerCase().includes(teamMemberSearch.toLowerCase()) ||
    student.name.toLowerCase().includes(teamMemberSearch.toLowerCase())
  );

  // Handle student selection by roll number
  const handleSelectStudentByRoll = (student: Student) => {
    setSelectedStudent(student);
    setAssignedToId(student._id);
    setRollNumberSearch('');
  };

  // Handle team member addition
  const handleAddTeamMember = (student: Student) => {
    if (selectedTeamMembers.length < maxTeamSize) {
      setSelectedTeamMembers(prev => [...prev, student]);
      setTeamMemberSearch('');
    }
  };

  // Handle team member removal
  const handleRemoveTeamMember = (studentId: string) => {
    setSelectedTeamMembers(prev => prev.filter(m => m._id !== studentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (assignmentType === 'individual' && !assignedToId) {
      alert('Please select a student to assign this task to');
      return;
    }

    if (assignmentType === 'branch' && !assignedToBranch) {
      alert('Please select a branch to assign this task to');
      return;
    }

    if (assignmentType === 'team') {
      if (!teamDepartment) {
        alert('Please select a department for the team');
        return;
      }
      if (selectedTeamMembers.length < minTeamSize) {
        alert(`Please select at least ${minTeamSize} team members`);
        return;
      }
    }

    if (minTeamSize > maxTeamSize) {
      alert('Minimum team size cannot be greater than maximum team size');
      return;
    }

    if (minTeamSize < 1 || maxTeamSize < 1) {
      alert('Team size must be at least 1');
      return;
    }

    setLoading(true);

    try {
      const taskData: any = {
        title: title.trim(),
        description: description.trim(),
        priority,
        minTeamSize,
        maxTeamSize,
        assignmentType
      };

      if (dueDate) {
        taskData.dueDate = dueDate;
      }

      if (assignmentType === 'individual') {
        taskData.assignedToId = assignedToId;
        taskData.assignedStudentName = selectedStudent?.name;
        taskData.assignedStudentRoll = selectedStudent?.rollNumber;
      } else if (assignmentType === 'branch') {
        taskData.assignedToBranch = assignedToBranch;
      } else if (assignmentType === 'team') {
        taskData.assignedToBranch = teamDepartment;
        taskData.teamMembers = selectedTeamMembers.map(m => ({
          id: m._id,
          name: m.name,
          rollNumber: m.rollNumber,
          email: m.email
        }));
      }

      await onSubmit(taskData);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-indigo-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-200 to-indigo-200 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg mr-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-gray-500 text-sm">{isEditing ? 'Update task details' : 'Assign tasks to students or teams'}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="group">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Task Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300"
              placeholder="Enter an engaging task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              📋 Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 resize-none"
              placeholder="Describe the task in detail..."
            />
          </div>

          {/* Due Date & Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                🎯 Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300"
              >
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🟠 High</option>
                <option value="Urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Assignment Type */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              👥 Assignment Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setAssignmentType('individual');
                  setSelectedTeamMembers([]);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center ${
                  assignmentType === 'individual'
                    ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg transform scale-105'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow'
                }`}
              >
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Individual</span>
                <span className={`text-xs ${assignmentType === 'individual' ? 'text-indigo-200' : 'text-gray-500'}`}>
                  By Roll Number
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setAssignmentType('team');
                  setSelectedStudent(null);
                  setAssignedToId('');
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center ${
                  assignmentType === 'team'
                    ? 'border-purple-500 bg-purple-500 text-white shadow-lg transform scale-105'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow'
                }`}
              >
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">Team</span>
                <span className={`text-xs ${assignmentType === 'team' ? 'text-purple-200' : 'text-gray-500'}`}>
                  Same Department
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setAssignmentType('branch');
                  setSelectedStudent(null);
                  setAssignedToId('');
                  setSelectedTeamMembers([]);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center ${
                  assignmentType === 'branch'
                    ? 'border-pink-500 bg-pink-500 text-white shadow-lg transform scale-105'
                    : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow'
                }`}
              >
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">Entire Branch</span>
                <span className={`text-xs ${assignmentType === 'branch' ? 'text-pink-200' : 'text-gray-500'}`}>
                  All Students
                </span>
              </button>
            </div>
          </div>

          {/* Individual Assignment - Roll Number Based */}
          {assignmentType === 'individual' && (
            <div className="bg-white p-6 rounded-xl border-2 border-indigo-100 shadow-sm animate-fade-in-up">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔍 Search by Roll Number or Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={rollNumberSearch}
                  onChange={(e) => setRollNumberSearch(e.target.value)}
                  placeholder="Enter roll number or student name..."
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {rollNumberSearch && filteredStudentsByRoll.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-xl shadow-inner">
                  {filteredStudentsByRoll.slice(0, 10).map(student => (
                    <button
                      key={student._id}
                      type="button"
                      onClick={() => handleSelectStudentByRoll(student)}
                      className="w-full px-4 py-3 flex items-center hover:bg-indigo-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {student.name.charAt(0)}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-800">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          Roll: {student.rollNumber || 'N/A'} • {student.branch} • Year {student.year}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {selectedStudent && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{selectedStudent.name}</div>
                      <div className="text-sm text-gray-600">
                        Roll: {selectedStudent.rollNumber} • {selectedStudent.branch} • {selectedStudent.email}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      setAssignedToId('');
                    }}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Team Assignment - Same Department */}
          {assignmentType === 'team' && (
            <div className="bg-white p-6 rounded-xl border-2 border-purple-100 shadow-sm animate-fade-in-up">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Select Department
                </label>
                <select
                  value={teamDepartment}
                  onChange={(e) => {
                    setTeamDepartment(e.target.value);
                    setSelectedTeamMembers([]);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select a department</option>
                  {uniqueBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              {teamDepartment && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔍 Search & Add Team Members (Roll Number)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={teamMemberSearch}
                        onChange={(e) => setTeamMemberSearch(e.target.value)}
                        placeholder="Search by roll number or name..."
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {teamMemberSearch && filteredTeamStudents.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-xl">
                        {filteredTeamStudents.slice(0, 8).map(student => (
                          <button
                            key={student._id}
                            type="button"
                            onClick={() => handleAddTeamMember(student)}
                            disabled={selectedTeamMembers.length >= maxTeamSize}
                            className="w-full px-4 py-2 flex items-center hover:bg-purple-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 disabled:opacity-50"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                              {student.name.charAt(0)}
                            </div>
                            <div className="text-left flex-1">
                              <div className="font-medium text-gray-800 text-sm">{student.name}</div>
                              <div className="text-xs text-gray-500">Roll: {student.rollNumber || 'N/A'}</div>
                            </div>
                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Team Members */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        👥 Team Members ({selectedTeamMembers.length}/{maxTeamSize})
                      </label>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedTeamMembers.length >= minTeamSize 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        Min: {minTeamSize} required
                      </span>
                    </div>
                    
                    {selectedTeamMembers.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>Search and add team members above</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedTeamMembers.map(member => (
                          <div key={member._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 text-sm">{member.name}</div>
                                <div className="text-xs text-gray-500">Roll: {member.rollNumber}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamMember(member._id)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Branch Assignment */}
          {assignmentType === 'branch' && (
            <div className="bg-white p-6 rounded-xl border-2 border-pink-100 shadow-sm animate-fade-in-up">
              <label htmlFor="assignedToBranch" className="block text-sm font-semibold text-gray-700 mb-2">
                🏛️ Assign to Branch
              </label>
              <select
                id="assignedToBranch"
                value={assignedToBranch}
                onChange={(e) => setAssignedToBranch(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Select a branch</option>
                {uniqueBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              
              {assignedToBranch && (
                <div className="mt-4 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg mr-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{assignedToBranch} Branch</div>
                      <div className="text-sm text-gray-600">
                        {students.filter(s => s.branch === assignedToBranch).length} students will receive this task
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team Size */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="minTeamSize" className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Min Team Size
              </label>
              <input
                type="number"
                id="minTeamSize"
                min="1"
                max="20"
                value={minTeamSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setMinTeamSize(Math.max(1, val));
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="maxTeamSize" className="block text-sm font-semibold text-gray-700 mb-2">
                👥 Max Team Size
              </label>
              <input
                type="number"
                id="maxTeamSize"
                min="1"
                max="20"
                value={maxTeamSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setMaxTeamSize(Math.max(1, val));
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditing ? '💾 Update Task' : '✨ Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreationForm;