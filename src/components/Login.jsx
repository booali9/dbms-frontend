import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaSyncAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import nedLogo from '../assets/NEDUET_logo.svg.png';
import backgroundImage from '../assets/backimage.jpg';

const Login = () => {
  const [activeTab, setActiveTab] = useState('undergraduate');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCaptcha(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (captchaInput !== captcha) {
      setError('Captcha does not match. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      const loginData = { email: id, password };

      switch (activeTab) {
        case 'undergraduate':
          endpoint = 'http://localhost:3000/api/user/login/undergrad';
          break;
        case 'postgraduate':
          endpoint = 'http://localhost:3000/api/user/login/postgrad';
          break;
        default:
          endpoint = 'http://localhost:3000/api/user/login/allother';
      }

      const response = await axios.post(endpoint, loginData);
      
      if (response.status === 200) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on user role
        if (response.data.user.role === 'undergrad' || response.data.user.role === 'postgrad') {
          navigate('/student');
        } else if (response.data.user.role === 'employee') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
        generateCaptcha();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div 
      className="flex justify-center items-center min-h-screen w-screen p-4 md:p-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <motion.div
        className="
          bg-white p-6 md:p-8
          rounded-xl shadow-lg
          w-full max-w-md
          mx-auto
        "
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <img 
            src={nedLogo} 
            alt="NED University Logo" 
            className="w-24 h-auto mx-auto mb-4"
          />
          <h1 className="text-xl md:text-2xl font-bold text-red-700 mb-1">
            NED University of Engineering & Technology
          </h1>
          <p className="text-gray-600">Welcome to the University Portal</p>
        </div>

        <div className="flex justify-between mb-6 border-b border-gray-200">
          {['undergraduate', 'postgraduate', 'employee'].map((tab) => (
            <motion.button
              key={tab}
              className={`
                px-4 py-2 font-medium text-sm md:text-base
                ${activeTab === tab 
                  ? 'text-red-700 border-b-2 border-red-700' 
                  : 'text-gray-500 hover:text-red-700'}
              `}
              onClick={() => handleTabClick(tab)}
              whileHover={{ scale: 1.05, backgroundColor: '#f5f5f5' }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Login
            </h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                className="space-y-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="id" className="flex items-center text-sm font-medium text-gray-700">
                  <FaUser className="mr-2 text-red-700" /> Email
                </label>
                <input
                  type="email"
                  id="id"
                  placeholder="Enter your email"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="
                    w-full p-3 border border-gray-300 rounded-lg
                    focus:border-red-500 focus:ring-1 focus:ring-red-500
                    focus:outline-none
                  "
                  required
                />
              </motion.div>

              <motion.div
                className="space-y-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
                  <FaLock className="mr-2 text-red-700" /> Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full p-3 border border-gray-300 rounded-lg
                    focus:border-red-500 focus:ring-1 focus:ring-red-500
                    focus:outline-none
                  "
                  required
                />
              </motion.div>

              <motion.div
                className="space-y-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">
                  Captcha
                </label>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="
                      flex-1 p-2 bg-gray-100 border border-gray-300 rounded-lg
                      font-mono font-bold text-center
                    "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {captcha}
                  </motion.div>
                  <motion.button
                    type="button"
                    onClick={generateCaptcha}
                    className="
                      p-2 bg-gray-100 rounded-lg text-red-700
                      hover:bg-gray-200
                    "
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaSyncAlt />
                  </motion.button>
                </div>
                <input
                  type="text"
                  id="captcha"
                  placeholder="Enter captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="
                    w-full p-3 mt-2 border border-gray-300 rounded-lg
                    focus:border-red-500 focus:ring-1 focus:ring-red-500
                    focus:outline-none
                  "
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                className="
                  w-full py-3 bg-red-700 text-white font-medium
                  rounded-lg hover:bg-red-800
                  disabled:opacity-70 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-red-500
                  focus:ring-offset-2
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;