import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaBuilding, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaLock, 
  FaIdCard, 
  FaUserTag, 
  FaSearch, 
  FaEdit, 
  FaTrash 
} from 'react-icons/fa';
import axios from 'axios';
import { notification, Spin, Table, Input, Button, Form, Select, DatePicker } from 'antd';
import { SmileOutlined, FrownOutlined } from '@ant-design/icons';

const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Notification configuration
  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      icon: type === 'success' ? <SmileOutlined style={{ color: '#A1252E' }} /> : <FrownOutlined style={{ color: '#A1252E' }} />,
    });
  };

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
        openNotification('error', 'Session Expired', 'Please login again.');
      } else {
        openNotification('error', 'Error', 'Failed to fetch users. Please try again.');
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

  const handleSubmit = async (values) => {
    try {
      if (editingUserId) {
        // Update existing user
        await api.put(`/edituser/${editingUserId}`, values);
        openNotification('success', 'Success', 'User updated successfully!');
      } else {
        // Register new user
        await api.post('/register', values);
        openNotification('success', 'Success', 'User registered successfully!');
      }
      
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      openNotification('error', 'Error', error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const handleEdit = (user) => {
    form.setFieldsValue({
      ...user,
      dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null
    });
    setEditingUserId(user._id);
  };

  const handleDelete = async (userId) => {
    notification.warning({
      message: 'Confirm Delete',
      description: 'Are you sure you want to delete this user?',
      btn: [
        {
          text: 'Yes',
          style: { background: '#A1252E', color: 'white' },
          async onClick() {
            try {
              await api.delete(`/deleteuser/${userId}`);
              fetchUsers();
              openNotification('success', 'Success', 'User deleted successfully!');
            } catch (error) {
              console.error('Failed to delete user:', error);
              openNotification('error', 'Error', error.response?.data?.message || 'Failed to delete user');
            }
          },
        },
        {
          text: 'No',
          onClick: () => {},
        },
      ],
    });
  };

  const resetForm = () => {
    form.resetFields();
    setEditingUserId(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="text-gray-900">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text) => <span className="capitalize text-gray-500">{text}</span>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <span className="text-gray-500">{text || '-'}</span>,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      render: (text) => <span className="text-gray-500">{text || '-'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => handleEdit(record)}
            type="text"
            icon={<FaEdit className="text-[#A1252E]" />}
          />
          <Button
            onClick={() => handleDelete(record._id)}
            type="text"
            icon={<FaTrash className="text-red-600" />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Registered User Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {editingUserId ? 'Edit User' : 'Register New User'}
          </h2>
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="name"
                label={
                  <span className="flex items-center text-sm font-medium text-gray-700">
                    <FaUser className="mr-2 text-[#A1252E]" /> Name
                  </span>
                }
                rules={[{ required: true, message: 'Please input the name!' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label={
                  <span className="flex items-center text-sm font-medium text-gray-700">
                    <FaEnvelope className="mr-2 text-[#A1252E]" /> Email
                  </span>
                }
                rules={[
                  { required: true, message: 'Please input the email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
              
              {!editingUserId && (
                <Form.Item
                  name="password"
                  label={
                    <span className="flex items-center text-sm font-medium text-gray-700">
                      <FaLock className="mr-2 text-[#A1252E]" /> Password
                    </span>
                  }
                  rules={[{ required: true, message: 'Please input the password!' }]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
              )}
              
              <Form.Item
                name="role"
                label={
                  <span className="flex items-center text-sm font-medium text-gray-700">
                    <FaUserTag className="mr-2 text-[#A1252E]" /> Role
                  </span>
                }
                rules={[{ required: true, message: 'Please select a role!' }]}
              >
                <Select placeholder="Select role">
                  <Option value="superadmin">Super Admin</Option>
                  <Option value="teacher">Teacher</Option>
                  <Option value="undergrad">Undergraduate</Option>
                  <Option value="postgrad">Postgraduate</Option>
                  <Option value="canteen">Canteen</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="department"
                label={
                  <span className="flex items-center text-sm font-medium text-gray-700">
                    <FaBuilding className="mr-2 text-[#A1252E]" /> Department
                  </span>
                }
              >
                <Input placeholder="Enter department" />
              </Form.Item>
              
              <Form.Item
                name="year"
                label={
                  <span className="flex items-center text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="mr-2 text-[#A1252E]" /> Year
                  </span>
                }
              >
                <Input type="number" placeholder="Enter year" />
              </Form.Item>
              
              <Form.Item
                name="semester"
                label={
                  <span className="flex items-center text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="mr-2 text-[#A1252E]" /> Semester
                  </span>
                }
              >
                <Input type="number" placeholder="Enter semester" />
              </Form.Item>
              
              <Form.Item
                name="fatherName"
                label={
                  <span className="flex items-center text-sm font-medium text-gray-700">
                    <FaUser className="mr-2 text-[#A1252E]" /> Father's Name
                  </span>
                }
              >
                <Input placeholder="Enter father's name" />
              </Form.Item>
              
              <Form.Item
                name="dateOfBirth"
                label={
                  <span className="flex items-center text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="mr-2 text-[#A1252E]" /> Date of Birth
                  </span>
                }
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                type="primary"
                htmlType="submit"
                className="flex-1 bg-[#A1252E] hover:bg-[#8a1e27] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 border-[#A1252E]"
              >
                {editingUserId ? 'Update User' : 'Register'}
              </Button>
              
              {editingUserId && (
                <Button 
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </div>

        {/* Display Registered Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Registered Users</h2>
            <Input
              placeholder="Search users..."
              prefix={<FaSearch className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <Spin size="large" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              className="custom-antd-table"
            />
          ) : (
            <p className="text-gray-500">No users found{searchTerm ? ` matching "${searchTerm}"` : ''}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;