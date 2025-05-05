import React, { useState, useEffect } from 'react';
import { Table, Input, DatePicker, Select, Button, Modal, Form, message, Tabs } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

// Configure axios instance with base URL and auth token
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Red theme styling
const redTheme = {
  primaryColor: '#ff4d4f',
  secondaryColor: '#fff2f0',
  textColor: '#000000',
  background: '#fff',
  cardBackground: '#fff',
  borderColor: '#ffccc7'
};

const Marksatte = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formType, setFormType] = useState('');
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    student: '',
    course: '',
    date: '',
    semester: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchAttendance();
    fetchMarks();
  }, []);

  // API functions
  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data?.students || []);
    } catch (err) {
      message.error('Failed to fetch students');
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      // Handle both response formats
      const coursesData = res.data?.data || res.data?.courses || [];
      setCourses(coursesData);
    } catch (err) {
      message.error('Failed to fetch courses');
    }
  };

  const fetchAttendance = async (params = {}) => {
    setLoading(true);
    try {
      const query = Object.entries(params)
        .filter(([_, v]) => v !== '')
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      
      const res = await api.get(`/admin/attendance${query ? `?${query}` : ''}`);
      setAttendance(res.data?.attendance || []);
    } catch (err) {
      message.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async (params = {}) => {
    setLoading(true);
    try {
      const query = Object.entries(params)
        .filter(([_, v]) => v !== '')
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      
      const res = await api.get(`/admin/marks${query ? `?${query}` : ''}`);
      setMarks(res.data?.marks || []);
    } catch (err) {
      message.error('Failed to fetch marks');
    } finally {
      setLoading(false);
    }
  };

  // Filter handlers
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    const params = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== '')
    );
    
    if (name === 'student' || name === 'course' || name === 'date') {
      fetchAttendance(params);
    } else {
      fetchMarks(params);
    }
  };

  // Modal handlers
  const showEditModal = (record, type) => {
    setCurrentRecord(record);
    setFormType(type);
    
    if (type === 'attendance') {
      form.setFieldsValue({
        status: record.status,
        classesTaken: record.classesTaken
      });
    } else {
      form.setFieldsValue({
        marksObtained: record.marksObtained,
        totalMarks: record.totalMarks
      });
    }
    
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (formType === 'attendance') {
        await api.put(`/admin/attendance/${currentRecord._id}`, values);
        message.success('Attendance updated successfully');
      } else {
        await api.put(`/admin/marks/${currentRecord._id}`, values);
        message.success('Marks updated successfully');
      }
      
      setModalOpen(false);
      formType === 'attendance' ? fetchAttendance() : fetchMarks();
    } catch (err) {
      message.error('Failed to update record');
    }
  };

  // Table columns configuration
  const attendanceColumns = [
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      key: 'student',
    },
    {
      title: 'Course',
      dataIndex: ['course', 'courseName'],
      key: 'course',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <span style={{ color: status === 'present' ? 'green' : redTheme.primaryColor }}>
          {status.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Classes',
      dataIndex: 'classesTaken',
      key: 'classesTaken',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => showEditModal(record, 'attendance')}
          style={{ color: redTheme.primaryColor }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const marksColumns = [
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      key: 'student',
    },
    {
      title: 'Course',
      dataIndex: ['course', 'courseName'],
      key: 'course',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_, record) => `${record.marksObtained} / ${record.totalMarks}`,
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_, record) => `${((record.marksObtained / record.totalMarks) * 100).toFixed(2)}%`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => showEditModal(record, 'marks')}
          style={{ color: redTheme.primaryColor }}
        >
          Edit
        </Button>
      ),
    },
  ];

  // Tabs configuration
  const tabItems = [
    {
      key: '1',
      label: 'Attendance',
      children: (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Select
              placeholder="Filter by Student"
              style={{ width: 200, marginRight: '10px' }}
              onChange={value => handleFilterChange('student', value)}
              allowClear
            >
              {students?.map(student => (
                <Option key={student._id} value={student._id}>
                  {student.name}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder="Filter by Course"
              style={{ width: 200, marginRight: '10px' }}
              onChange={value => handleFilterChange('course', value)}
              allowClear
            >
              {courses?.map(course => (
                <Option key={course._id} value={course._id}>
                  {course.courseName}
                </Option>
              ))}
            </Select>
            
            <DatePicker
              placeholder="Filter by Date"
              style={{ marginRight: '10px' }}
              onChange={(date, dateString) => handleFilterChange('date', dateString)}
            />
          </div>
          
          <Table
            columns={attendanceColumns}
            dataSource={attendance}
            rowKey="_id"
            loading={loading}
            scroll={{ x: true }}
          />
        </>
      ),
    },
    {
      key: '2',
      label: 'Marks',
      children: (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Select
              placeholder="Filter by Student"
              style={{ width: 200, marginRight: '10px' }}
              onChange={value => handleFilterChange('student', value)}
              allowClear
            >
              {students?.map(student => (
                <Option key={student._id} value={student._id}>
                  {student.name}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder="Filter by Course"
              style={{ width: 200, marginRight: '10px' }}
              onChange={value => handleFilterChange('course', value)}
              allowClear
            >
              {courses?.map(course => (
                <Option key={course._id} value={course._id}>
                  {course.courseName}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder="Filter by Semester"
              style={{ width: 120, marginRight: '10px' }}
              onChange={value => handleFilterChange('semester', value)}
              allowClear
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <Option key={sem} value={sem}>Sem {sem}</Option>
              ))}
            </Select>
          </div>
          
          <Table
            columns={marksColumns}
            dataSource={marks}
            rowKey="_id"
            loading={loading}
            scroll={{ x: true }}
          />
        </>
      ),
    },
  ];

  // Main component render with red theme
  return (
    <div style={{ 
      padding: '20px',
      background: redTheme.background,
      color: redTheme.textColor
    }}>
      <Tabs 
        defaultActiveKey="1" 
        items={tabItems}
        tabBarStyle={{ borderBottomColor: redTheme.borderColor }}
      />
      
      <Modal
        title={`Edit ${formType === 'attendance' ? 'Attendance' : 'Marks'}`}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okButtonProps={{ style: { background: redTheme.primaryColor, borderColor: redTheme.primaryColor } }}
      >
        <Form form={form} layout="vertical">
          {formType === 'attendance' ? (
            <>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="present">Present</Option>
                  <Option value="absent">Absent</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="classesTaken"
                label="Classes Taken"
                rules={[{ required: true, message: 'Please enter number of classes' }]}
              >
                <Input type="number" min={1} max={5} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="marksObtained"
                label="Marks Obtained"
                rules={[{ required: true, message: 'Please enter marks obtained' }]}
              >
                <Input type="number" />
              </Form.Item>
              
              <Form.Item
                name="totalMarks"
                label="Total Marks"
                rules={[{ required: true, message: 'Please enter total marks' }]}
              >
                <Input type="number" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Marksatte;