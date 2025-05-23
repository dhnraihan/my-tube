import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../app/features/auth/authSlice';
import { RootState } from '../app/store';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear the error for this field when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password2: '',
    };
    let isValid = true;
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Validate first name
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
      isValid = false;
    }
    
    // Validate last name
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Validate password confirmation
    if (!formData.password2) {
      newErrors.password2 = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(register(formData) as any);
    }
  };
  
  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
        <p className="text-gray-600 dark:text-gray-400">Join MyTube and share your videos with the world</p>
        <p className="text-gray-600 dark:text-gray-400 bangla-text mt-1">মাইটিউবে যোগ দিন এবং বিশ্বের সাথে আপনার ভিডিও শেয়ার করুন</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="first_name" className="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                formErrors.first_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-500'
              }`}
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleChange}
            />
            {formErrors.first_name && <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>}
          </div>
          
          <div>
            <label htmlFor="last_name" className="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                formErrors.last_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-500'
              }`}
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleChange}
            />
            {formErrors.last_name && <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              formErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-500'
            }`}
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
          />
          {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-500'
            }`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              formErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-500'
            }`}
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />
          {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="password2" className="block text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
              formErrors.password2 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-500'
            }`}
            placeholder="Confirm your password"
            value={formData.password2}
            onChange={handleChange}
          />
          {formErrors.password2 && <p className="text-red-500 text-sm mt-1">{formErrors.password2}</p>}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6 flex items-center justify-center">
        <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
        <span className="mx-4 text-gray-500 dark:text-gray-400">Or sign up with</span>
        <div className="border-t border-gray-300 dark:border-gray-600 flex-grow"></div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
            />
          </svg>
          Google
        </button>
        
        <button className="flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#333"
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
          GitHub
        </button>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
