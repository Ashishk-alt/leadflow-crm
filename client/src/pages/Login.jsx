import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      return toast.error('Please enter both email and password');
    }

    setLoading(true);
    try {
      await loginUser(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-900 p-8 rounded-2xl border border-gray-200 dark:border-dark-800 shadow-xl/5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          Sign in to access your manufacturing CRM dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
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
              <span>Sign In to LeadFlow</span>
              <FiArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Seeder Credentials Helper Tip */}
      <div className="mt-6 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-900/30 p-3 rounded-xl">
        <p className="text-[11px] font-semibold text-primary-800 dark:text-primary-400 uppercase tracking-wider mb-1">
          💡 Demo Credentials (Pre-seeded)
        </p>
        <p className="text-xs text-primary-600 dark:text-primary-300 leading-relaxed">
          Email: <span className="font-mono font-bold">john@leadflow.com</span> or <span className="font-mono font-bold">sarah@leadflow.com</span><br/>
          Password: <span className="font-mono font-bold">password123</span>
        </p>
      </div>

      {/* Register Redirect */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
