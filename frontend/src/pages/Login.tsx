import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AnimatedSticker from '../components/AnimatedSticker';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear form fields when navigating to this page
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed. Please check your credentials.');
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
          <AnimatedSticker type="cat" size="lg" />
        </div>
        <div className="absolute top-32 right-[20%] opacity-30">
          <AnimatedSticker type="star" size="md" />
        </div>
        <div className="absolute bottom-24 left-[10%] opacity-30">
          <AnimatedSticker type="book" size="md" />
        </div>
        <div className="absolute bottom-32 right-[15%] opacity-30">
          <AnimatedSticker type="rocket" size="lg" />
        </div>
        <div className="absolute top-1/2 left-[5%] opacity-20">
          <AnimatedSticker type="sparkle" size="sm" />
        </div>
        <div className="absolute top-1/3 right-[8%] opacity-20">
          <AnimatedSticker type="heart" size="sm" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0yNCAzNGgydjEyaC0yVjM0em0xMiAwaC0ydjEyaDJWMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 animate-fade-in-up">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">AbleSpace</h1>
              <p className="text-xl mb-2">Collaborative Task Management</p>
              <p className="opacity-80">Work smarter, achieve faster</p>
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

          {/* Login Form Section */}
          <div className="md:w-1/2 p-8 bg-white/5 backdrop-blur-lg">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back 👋</h2>
              <p className="text-purple-200">Sign in to your account</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
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
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-purple-200 text-left">🔒 Password</label>
                  <Link to="/forgot-password" className="text-sm text-purple-300 hover:text-white transition duration-300">Forgot?</Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-white/10 border-white/30 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-purple-200">
                  Remember me
                </label>
              </div>

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
                      Signing in...
                    </>
                  ) : '✨ Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-purple-200">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-white hover:text-purple-300 transition duration-300 underline underline-offset-4">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;