import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AnimatedSticker from '../components/AnimatedSticker';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student' | ''>('');
  const [branch, setBranch] = useState('');
  // Student fields
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  // Teacher fields
  const [branchesHandled, setBranchesHandled] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear form fields when navigating to this page
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate role selection
    if (!role) {
      alert('Please select a role');
      return;
    }

    // Validate branch selection
    if (!branch) {
      alert('Please select a branch');
      return;
    }

    // Validate role-specific fields
    if (role === 'student') {
      if (!rollNumber) {
        alert('Roll number is required for students');
        return;
      }
    } else if (role === 'teacher') {
      if (branchesHandled.length === 0) {
        alert('Please select at least one branch you handle');
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData: any = {
        name,
        email,
        password,
        role,
        branch
      };

      // Add role-specific fields
      if (role === 'student') {
        registrationData.year = year ? parseInt(year) : undefined;
        registrationData.section = section || undefined;
        registrationData.rollNumber = rollNumber;
      } else if (role === 'teacher') {
        registrationData.branchesHandled = branchesHandled;
      }

      await register(registrationData);
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        
        {/* Anime-style Stickers */}
        <div className="absolute top-24 left-[15%] opacity-30">
          <AnimatedSticker type="flower" size="lg" />
        </div>
        <div className="absolute top-32 right-[20%] opacity-30">
          <AnimatedSticker type="cloud" size="md" />
        </div>
        <div className="absolute bottom-24 left-[10%] opacity-30">
          <AnimatedSticker type="heart" size="md" />
        </div>
        <div className="absolute bottom-32 right-[15%] opacity-30">
          <AnimatedSticker type="star" size="lg" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0yNCAzNGgydjEyaC0yVjM0em0xMiAwaC0ydjEyaDJWMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-white/20 animate-fade-in-up">
          {/* Banner Section */}
          <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-24 h-24 bg-white rounded-full animate-bounce"></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-ping"></div>
            </div>

            <div className="relative z-10 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg animate-float">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">AbleSpace</h1>
              <p className="text-xl mb-2">Join Our Community</p>
              <p className="opacity-80">Start managing tasks efficiently</p>
              <div className="mt-8 flex justify-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm">Tasks Managed</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm">Teams</div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form Section */}
          <div className="md:w-1/2 p-8 bg-white/5 backdrop-blur-lg max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account 🎉</h2>
              <p className="text-purple-200">Join us today to get started</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-2 text-left">👤 Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-purple-200 mb-2 text-left">🎭 Role</label>
                <select
                  id="role"
                  name="role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'teacher' | 'student')}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                >
                  <option value="" className="bg-slate-800">Select Role</option>
                  <option value="student" className="bg-slate-800">Student</option>
                  <option value="teacher" className="bg-slate-800">Teacher</option>
                </select>
              </div>

              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-purple-200 mb-2 text-left">🏢 Branch</label>
                <select
                  id="branch"
                  name="branch"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                >
                  <option value="" className="bg-slate-800">Select Branch</option>
                  <option value="CSE" className="bg-slate-800">CSE</option>
                  <option value="AIML" className="bg-slate-800">AIML</option>
                  <option value="Data Science" className="bg-slate-800">Data Science</option>
                  <option value="IT" className="bg-slate-800">IT</option>
                  <option value="EEE" className="bg-slate-800">EEE</option>
                  <option value="ECE" className="bg-slate-800">ECE</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2 text-left">📧 Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2 text-left">🔒 Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-purple-200 mb-2 text-left">🔒 Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                  placeholder="••••••••"
                />
              </div>

              {/* Student-specific fields */}
              {role === 'student' && (
                <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">📝 Student Details</h4>
                  <div>
                    <label htmlFor="rollNumber" className="block text-sm font-medium text-purple-200 mb-2 text-left">Roll Number</label>
                    <input
                      id="rollNumber"
                      name="rollNumber"
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                      placeholder="Enter your roll number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-purple-200 mb-2 text-left">Year</label>
                      <select
                        id="year"
                        name="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                      >
                        <option value="" className="bg-slate-800">Select Year</option>
                        <option value="1" className="bg-slate-800">1st Year</option>
                        <option value="2" className="bg-slate-800">2nd Year</option>
                        <option value="3" className="bg-slate-800">3rd Year</option>
                        <option value="4" className="bg-slate-800">4th Year</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="section" className="block text-sm font-medium text-purple-200 mb-2 text-left">Section</label>
                      <input
                        id="section"
                        name="section"
                        type="text"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                        placeholder="Section"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher-specific fields */}
              {role === 'teacher' && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">🏫 Branches Handled</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['CSE', 'AIML', 'Data Science', 'IT', 'EEE', 'ECE'].map((branchOption) => (
                      <div key={branchOption} className="flex items-center">
                        <input
                          id={`branch-${branchOption}`}
                          name="branchesHandled"
                          type="checkbox"
                          value={branchOption}
                          checked={branchesHandled.includes(branchOption)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBranchesHandled([...branchesHandled, branchOption]);
                            } else {
                              setBranchesHandled(branchesHandled.filter(b => b !== branchOption));
                            }
                          }}
                          className="h-4 w-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500"
                        />
                        <label htmlFor={`branch-${branchOption}`} className="ml-2 block text-sm text-purple-200">
                          {branchOption}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : '🚀 Sign up'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-purple-200">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-white hover:text-purple-300 transition duration-300 underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;