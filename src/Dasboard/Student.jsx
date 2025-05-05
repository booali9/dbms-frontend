import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaCalendarAlt, FaEnvelope, FaLock, FaIdCard, FaUserTag, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    email: '',
    password: '',
    id: '',
    role: '',
    fatherName: '',
    dateOfBirth: '',
    semester: ''
  });

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Configure axios instance with auth header
  const api = axios.create({
    baseURL: 'http://localhost:3000/api/admin',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/getalluser');
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        // Redirect to login if needed
      }
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter((user) => {
      return (
        (user.name && user.name.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.role && user.role.toLowerCase().includes(term)) ||
        (user.department && user.department.toLowerCase().includes(term))
      );
    });
    setFilteredUsers(filtered);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUserId) {
        // Update existing user
        await api.put(`/edituser/${editingUserId}`, formData);
        alert('User updated successfully!');
      } else {
        // Register new user
        await api.post('/register', formData);
        alert('User registered successfully!');
      }
      
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      department: user.department || '',
      year: user.year || '',
      email: user.email,
      password: '',
      id: user._id,
      role: user.role,
      fatherName: user.fatherName || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      semester: user.semester || ''
    });
    setEditingUserId(user._id);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/deleteuser/${userId}`);
        fetchUsers();
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      department: '',
      year: '',
      email: '',
      password: '',
      id: '',
      role: '',
      fatherName: '',
      dateOfBirth: '',
      semester: ''
    });
    setEditingUserId(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Registered User Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {editingUserId ? 'Edit User' : 'Register New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                  <FaUser className="mr-2 text-[#A1252E]" /> Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                  <FaEnvelope className="mr-2 text-[#A1252E]" /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                  required
                />
              </div>
              
              {!editingUserId && (
                <div className="space-y-2">
                  <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
                    <FaLock className="mr-2 text-[#A1252E]" /> Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                    required={!editingUserId}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="role" className="flex items-center text-sm font-medium text-gray-700">
                  <FaUserTag className="mr-2 text-[#A1252E]" /> Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                  required
                >
                  <option value="">Select role</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="undergrad">Undergraduate</option>
                  <option value="postgrad">Postgraduate</option>
                  <option value="canteen">Canteen</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="department" className="flex items-center text-sm font-medium text-gray-700">
                  <FaBuilding className="mr-2 text-[#A1252E]" /> Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  placeholder="Enter department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="year" className="flex items-center text-sm font-medium text-gray-700">
                  <FaCalendarAlt className="mr-2 text-[#A1252E]" /> Year
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  placeholder="Enter year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="semester" className="flex items-center text-sm font-medium text-gray-700">
                  <FaCalendarAlt className="mr-2 text-[#A1252E]" /> Semester
                </label>
                <input
                  type="number"
                  id="semester"
                  name="semester"
                  placeholder="Enter semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="fatherName" className="flex items-center text-sm font-medium text-gray-700">
                  <FaUser className="mr-2 text-[#A1252E]" /> Father's Name
                </label>
                <input
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  placeholder="Enter father's name"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="flex items-center text-sm font-medium text-gray-700">
                  <FaCalendarAlt className="mr-2 text-[#A1252E]" /> Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                type="submit" 
                className="flex-1 bg-[#A1252E] hover:bg-[#8a1e27] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                {editingUserId ? 'Update User' : 'Register'}
              </button>
              
              {editingUserId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Display Registered Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Registered Users</h2>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A1252E] focus:border-transparent"
              />
            </div>
          </div>
          
          {loading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.year || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-[#A1252E] hover:text-[#8a1e27]"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No users found{searchTerm ? ` matching "${searchTerm}"` : ''}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;