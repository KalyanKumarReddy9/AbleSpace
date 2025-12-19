import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-20 bg-white/5 rotate-12 blur-xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 mr-3 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                AbleSpace
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {user && !isAuthPage && (
                <Link 
                  to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} 
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  <span className="mr-2">📊</span>
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info - Desktop */}
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-purple-200 text-xs capitalize">{user.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
                
                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              !isAuthPage && (
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-white/20 hover:bg-white/30 border border-white/30 transition-all duration-300"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Sign up
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in-up">
            <div className="space-y-2 pt-2">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold mr-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{user.name}</div>
                  <div className="text-purple-200 text-xs">{user.email}</div>
                </div>
              </div>
              
              <Link 
                to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} 
                className="block px-4 py-3 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-2">📊</span> Dashboard
              </Link>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;