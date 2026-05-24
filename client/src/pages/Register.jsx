import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiBriefcase, FiArrowRight } from 'react-icons/fi';

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BDA',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = formData;

    // Check validation
    if (!name || !email || !password) {
      return toast.error('Please enter all required fields');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await registerUser(name, email, password, role);
      toast.success('Registration successful! Welcome to LeadFlow.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-900 p-8 rounded-2xl border border-gray-200 dark:border-dark-800 shadow-xl/5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create BDA Account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          Get started with LeadFlow CRM workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FiUser className="h-4 w-4" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. John Doe"
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FiMail className="h-4 w-4" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. john@leadflow.com"
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
            Workforce Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FiBriefcase className="h-4 w-4" />
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-600 dark:text-gray-300"
            >
              <option value="BDA">Business Development Associate (BDA)</option>
              <option value="Manager">Sales Manager</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FiLock className="h-4 w-4" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="Min. 6 characters"
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FiLock className="h-4 w-4" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Repeat password"
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 rounded-xl text-sm transition duration-200 shadow-md shadow-primary-500/10 cursor-pointer"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>Create Account</span>
              <FiArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Sign In here
        </Link>
      </p>
    </div>
  );
};

export default Register;
