import React, { useState, useEffect } from 'react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
}

interface Team {
  _id: string;
  taskId: string;
  members: TeamMember[];
  teamName?: string;
}

interface TeamFormationProps {
  taskId: string;
  currentUser: { _id: string; name: string; email: string };
  onBack: () => void;
}

const TeamFormation: React.FC<TeamFormationProps> = ({ taskId, currentUser, onBack }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Fetch teams for this task
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/academic/tasks/${taskId}/teams`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }

        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [taskId]);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    try {
      const response = await fetch('/api/academic/teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId,
          teamName: teamName.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      const newTeam = await response.json();
      setTeams(prev => [...prev, newTeam]);
      setTeamName('');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  const handleJoinTeam = async () => {
    if (!selectedTeam) {
      alert('Please select a team to join');
      return;
    }

    try {
      const response = await fetch(`/api/academic/teams/${selectedTeam}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to join team');
      }

      const updatedTeam = await response.json();
      
      // Update the teams list with the updated team
      setTeams(prev => 
        prev.map(team => team._id === updatedTeam._id ? updatedTeam : team)
      );
      
      setSelectedTeam('');
    } catch (error) {
      console.error('Error joining team:', error);
      alert('Failed to join team. Please try again.');
    }
  };

  const isUserInTeam = (team: Team) => {
    return team.members.some(member => member._id === currentUser._id);
  };

  const getUserTeam = () => {
    return teams.find(team => isUserInTeam(team));
  };

  const userTeam = getUserTeam();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Formation</h2>
        <button 
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {userTeam ? (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-medium text-green-800 mb-2">You are in a team!</h3>
          <p className="text-green-700">
            Team Name: <strong>{userTeam.teamName || `Team ${userTeam._id.substring(0, 8)}`}</strong>
          </p>
          <p className="text-green-700 mt-1">
            Members: {userTeam.members.length}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {userTeam.members.map(member => (
              <span 
                key={member._id} 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member._id === currentUser._id 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {member.name} {member._id === currentUser._id && '(You)'}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">You are not in a team yet</h3>
          <p className="text-yellow-700">
            Create a new team or join an existing one to collaborate on this task.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Team Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Team</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter team name"
                />
              </div>
              <button
                onClick={handleCreateTeam}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Team
              </button>
            </div>
          </div>

          {/* Join Team Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Join Existing Team</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="teamSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Team
                </label>
                <select
                  id="teamSelect"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a team</option>
                  {teams
                    .filter(team => !isUserInTeam(team))
                    .map(team => (
                      <option key={team._id} value={team._id}>
                        {team.teamName || `Team ${team._id.substring(0, 8)}`} ({team.members.length} members)
                      </option>
                    ))}
                </select>
              </div>
              <button
                onClick={handleJoinTeam}
                disabled={!selectedTeam}
                className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${selectedTeam ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Join Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Teams List */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Teams</h3>
        {teams.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teams yet</h3>
            <p className="mt-1 text-sm text-gray-500">Be the first to create a team for this task.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div 
                key={team._id} 
                className={`border rounded-lg p-4 ${
                  isUserInTeam(team) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <h4 className="font-medium text-gray-900">
                  {team.teamName || `Team ${team._id.substring(0, 8)}`}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {team.members.slice(0, 3).map(member => (
                    <span 
                      key={member._id} 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {member.name}
                    </span>
                  ))}
                  {team.members.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      +{team.members.length - 3}
                    </span>
                  )}
                </div>
                {isUserInTeam(team) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                    Your Team
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamFormation;