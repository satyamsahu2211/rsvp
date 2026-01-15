import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Eye, EyeOff, UserPlus, User, Mail, Lock, Shield, Sparkles } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const {  ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  const passwordStrength = formData.password.length > 0 
    ? Math.min(Math.floor(formData.password.length / 6 * 100), 100)
    : 0;

  const getPasswordStrengthColor = () => {
    if (formData.password.length === 0) return 'bg-gray-200';
    if (formData.password.length < 6) return 'bg-[#E53935]';
    if (formData.password.length < 8) return 'bg-amber-500';
    return 'bg-[#4CAF50]';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF] via-white to-[#F4F2FF]/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 hidden lg:block">
          <div className="w-72 h-72 bg-[#6B4EFF]/5 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-10 left-10 hidden lg:block">
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
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">
                Join Our Community
              </h1>
              <p className="text-[#6B6B6B]">
                Create your account to start managing events
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

            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-[#6B6B6B] mb-2">
                  Full Name
                </label>
                <div className={`relative transition-all duration-200 ${isFocused.name ? 'scale-[1.02]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${isFocused.name ? 'text-[#6B4EFF]' : 'text-[#6B6B6B]'} transition-colors`} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    className={`block w-full pl-10 pr-4 py-3 rounded-xl border bg-[#FAFAFA] text-[#1F1F1F] placeholder-[#6B6B6B]/60 focus:outline-none transition-all ${
                      isFocused.name 
                        ? 'border-[#6B4EFF] ring-2 ring-[#6B4EFF]/20' 
                        : 'border-[#E0E0E0] hover:border-[#6B6B6B]'
                    }`}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>

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

              {/* Role Selection */}
              <div className="relative">
                <label htmlFor="role" className="block text-sm font-medium text-[#6B6B6B] mb-2">
                  Account Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-[#6B6B6B]" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all appearance-none"
                  >
                    <option value="user">User - Browse and RSVP to events</option>
                    <option value="admin">Admin - Create and manage events</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex items-start text-xs text-[#6B6B6B]">
                  <Sparkles className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span>
                    {formData.role === 'user' 
                      ? 'Choose "Admin" if you need to create and manage events'
                      : 'You will have full access to create, edit, and manage events'
                    }
                  </span>
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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
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
                
                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-[#6B6B6B] mb-1">
                      <span>Password strength</span>
                      <span className={formData.password.length < 6 ? 'text-[#E53935]' : 
                                      formData.password.length < 8 ? 'text-amber-600' : 
                                      'text-[#4CAF50]'}>
                        {formData.password.length < 6 ? 'Weak' : 
                         formData.password.length < 8 ? 'Medium' : 
                         'Strong'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#6B6B6B] mb-2">
                  Confirm Password
                </label>
                <div className={`relative transition-all duration-200 ${isFocused.confirmPassword ? 'scale-[1.02]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${isFocused.confirmPassword ? 'text-[#6B4EFF]' : 'text-[#6B6B6B]'} transition-colors`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`block w-full pl-10 pr-12 py-3 rounded-xl border bg-[#FAFAFA] text-[#1F1F1F] placeholder-[#6B6B6B]/60 focus:outline-none transition-all ${
                      isFocused.confirmPassword 
                        ? 'border-[#6B4EFF] ring-2 ring-[#6B4EFF]/20' 
                        : 'border-[#E0E0E0] hover:border-[#6B6B6B]'
                    }`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors" />
                    )}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword.length > 0 && (
                  <div className="mt-2">
                    <div className={`flex items-center text-xs ${
                      formData.password === formData.confirmPassword 
                        ? 'text-[#4CAF50]' 
                        : 'text-[#E53935]'
                    }`}>
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <div className="w-2 h-2 bg-[#4CAF50] rounded-full mr-2"></div>
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-[#E53935] rounded-full mr-2"></div>
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-[#6B4EFF] border-[#E0E0E0] rounded focus:ring-[#6B4EFF]"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-[#6B6B6B]">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#6B4EFF] hover:text-opacity-80">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-[#6B4EFF] hover:text-opacity-80">
                      Privacy Policy
                    </Link>
                  </label>
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#6B6B6B]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#6B4EFF] hover:text-opacity-80 transition-colors inline-flex items-center group"
                >
                  Sign in instead
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#FAFAFA] border-t border-[#E0E0E0] text-center">
            <p className="text-xs text-[#6B6B6B]">
              Your data is secured with industry-standard encryption
            </p>
          </div>
        </div>

        {/* Mobile Decorative Elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center text-xs text-[#6B6B6B]">
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full mr-2"></div>
            <span>Secure registration with encrypted credentials</span>
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
        
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        select:focus {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B4EFF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        }
      `}</style>
    </div>
  );
}

export default Register;