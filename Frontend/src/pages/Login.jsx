import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Eye, EyeOff, LogIn, Mail, Lock, Sparkles } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin/events');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData?.email, formData?.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    
    setLoading(false);
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@example.com', password: 'Admin@123' },
    { role: 'User', email: 'user@example.com', password: 'User@123' }
  ];

  const handleDemoLogin = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF] via-white to-[#F4F2FF]/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 hidden lg:block">
          <div className="w-72 h-72 bg-[#6B4EFF]/5 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-10 right-10 hidden lg:block">
          <div className="w-64 h-64 bg-[#FF8A65]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-[#E0E0E0]/50">
          {/* Header Section */}
          <div className="px-8 pt-10 pb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#6B4EFF] to-[#FF8A65] rounded-full blur opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-[#6B4EFF] to-[#FF8A65] p-3 rounded-2xl">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">
                Welcome Back
              </h1>
              <p className="text-[#6B6B6B]">
                Sign in to manage your events and RSVPs
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-[#E53935] px-4 py-3 rounded-xl text-sm animate-fadeIn">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-[#E53935] rounded-full mr-2"></div>
                  </div>
                  <div className="ml-2">{error}</div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-[#6B6B6B] mb-2">
                  Email Address
                </label>
                <div className={`relative transition-all duration-200 ${isFocused.email ? 'scale-[1.02]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${isFocused.email ? 'text-[#6B4EFF]' : 'text-[#6B6B6B]'} transition-colors`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    className={`block w-full pl-10 pr-4 py-3 rounded-xl border bg-[#FAFAFA] text-[#1F1F1F] placeholder-[#6B6B6B]/60 focus:outline-none transition-all ${
                      isFocused.email 
                        ? 'border-[#6B4EFF] ring-2 ring-[#6B4EFF]/20' 
                        : 'border-[#E0E0E0] hover:border-[#6B6B6B]'
                    }`}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-[#6B6B6B] mb-2">
                  Password
                </label>
                <div className={`relative transition-all duration-200 ${isFocused.password ? 'scale-[1.02]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${isFocused.password ? 'text-[#6B4EFF]' : 'text-[#6B6B6B]'} transition-colors`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    className={`block w-full pl-10 pr-12 py-3 rounded-xl border bg-[#FAFAFA] text-[#1F1F1F] placeholder-[#6B6B6B]/60 focus:outline-none transition-all ${
                      isFocused.password 
                        ? 'border-[#6B4EFF] ring-2 ring-[#6B4EFF]/20' 
                        : 'border-[#E0E0E0] hover:border-[#6B6B6B]'
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" />
                    )}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#6B4EFF] hover:text-opacity-80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#6B4EFF] to-[#FF8A65] text-white py-3.5 px-4 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-[#6B4EFF]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E0E0E0]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#6B6B6B]">Or try demo accounts</span>
              </div>
            </div>

            {/* Demo Accounts */}
            <div className="space-y-3 mb-6">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  className="w-full bg-[#F4F2FF] hover:bg-[#6B4EFF]/10 border border-[#E0E0E0] text-[#1F1F1F] py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:border-[#6B4EFF]/50 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 text-[#6B4EFF] mr-2 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-[#6B4EFF]">{account.role}:</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#6B6B6B] group-hover:text-[#1F1F1F]">
                        {account.email}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-[#6B6B6B]">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-[#6B4EFF] hover:text-opacity-80 transition-colors inline-flex items-center group"
                >
                  Create one now
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#FAFAFA] border-t border-[#E0E0E0] text-center">
            <p className="text-xs text-[#6B6B6B]">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-[#6B4EFF] hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#6B4EFF] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile Decorative Elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center text-xs text-[#6B6B6B]">
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full mr-2"></div>
            <span>Secure login with encrypted credentials</span>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #1F1F1F;
          -webkit-box-shadow: 0 0 0px 1000px #FAFAFA inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}

export default Login;