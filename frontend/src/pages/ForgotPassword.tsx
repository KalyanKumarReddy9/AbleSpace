import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/users/forgot-password', { email });
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/users/reset-password', { email, otp, password: newPassword });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
        
        {/* Anime-style decorative elements */}
        <div className="absolute top-32 left-1/4 opacity-20 animate-float">
          <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e7.svg" alt="" className="w-16 h-16" />
        </div>
        <div className="absolute top-48 right-1/3 opacity-20 animate-float animation-delay-2000">
          <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f512.svg" alt="" className="w-14 h-14" />
        </div>
        <div className="absolute bottom-32 left-20 opacity-20 animate-float animation-delay-4000">
          <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2728.svg" alt="" className="w-12 h-12" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0yNCAzNGgydjEyaC0yVjM0em0xMiAwaC0ydjEyaDJWMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-fade-in-up">
          <div className="p-8">
            {/* Step 1: Enter Email */}
            {step === 'email' && (
              <>
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg animate-float">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Forgot Password? 🔐</h2>
                  <p className="text-purple-200">No worries! Enter your email and we'll send you a reset OTP.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                      📧 Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      '📨 Send OTP'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: Enter OTP and New Password */}
            {step === 'otp' && (
              <>
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg animate-float">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Enter OTP 🔢</h2>
                  <p className="text-purple-200">
                    We've sent a 6-digit OTP to <span className="text-white font-semibold">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-purple-200 mb-2">
                      🔢 Enter OTP
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-widest placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                      placeholder="000000"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-purple-200 mb-2">
                      🔒 New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                      🔒 Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting Password...
                      </>
                    ) : (
                      '🔓 Reset Password'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('email'); setError(''); }}
                    className="w-full text-purple-300 hover:text-white transition-colors text-sm"
                  >
                    ← Use different email
                  </button>
                </form>
              </>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Password Reset! 🎉</h2>
                <p className="text-purple-200 mb-8">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 font-semibold"
                >
                  🚀 Go to Login
                </button>
              </div>
            )}

            {step !== 'success' && (
              <div className="mt-8 text-center">
                <Link to="/login" className="text-sm text-purple-200 hover:text-white transition duration-300">
                  ← Back to Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
