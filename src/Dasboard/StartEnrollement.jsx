import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const EnrollmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    semester: '',
    startDate: new Date(),
    endDate: null
  });
  const [stopFormData, setStopFormData] = useState({
    department: '',
    semester: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [stopValidationErrors, setStopValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [activeEnrollments, setActiveEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create axios instance with base URL and auth header
  const api = axios.create({
    baseURL: 'http://localhost:3000/api/admin',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
 // Add this new function to fetch all enrollments
 const fetchAllEnrollments = async () => {
  try {
    setEnrollmentsLoading(true);
    const response = await axios.get('http://localhost:3000/api/student/getenrollment');
    setAllEnrollments(response.data.courses || []);
  } catch (error) {
    console.error('Error fetching all enrollments:', error);
    toast.error(error.response?.data?.message || 'Failed to load enrollments');
  } finally {
    setEnrollmentsLoading(false);
  }
};

  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const response = await api.get('/departments');
      
      let departmentsData = [];
      
      if (Array.isArray(response.data)) {
        departmentsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        departmentsData = response.data.data;
      } else if (response.data.departments && Array.isArray(response.data.departments)) {
        departmentsData = response.data.departments;
      }
      
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Department fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load departments');
      
      if (process.env.NODE_ENV === 'development') {
        setDepartments([
          { 
            _id: '67dad4ef19da63edd6e020d6', 
            departmentName: 'Software Engineering' 
          }
        ]);
      }
    } finally {
      setDeptLoading(false);
    }
  };

  const fetchActiveEnrollments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/active-enrollments');
      setActiveEnrollments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching active enrollments:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        // Redirect to login or handle token refresh
      } else {
        toast.error(error.response?.data?.message || 'Failed to load active enrollments');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchActiveEnrollments();
    fetchAllEnrollments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleStopChange = (e) => {
    const { name, value } = e.target;
    setStopFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (stopValidationErrors[name]) {
      setStopValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const validateStartForm = () => {
    const errors = {};
    
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    
    if (!formData.semester) {
      errors.semester = 'Semester is required';
    } else if (isNaN(formData.semester)) {
      errors.semester = 'Semester must be a number';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStopForm = () => {
    const errors = {};
    
    if (!stopFormData.department) {
      errors.department = 'Department is required';
    }
    
    if (!stopFormData.semester) {
      errors.semester = 'Semester is required';
    }
    
    setStopValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStartForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        department: formData.department,
        semester: parseInt(formData.semester),
        startDate: formData.startDate,
        endDate: formData.endDate
      };
      
      const response = await api.post('/startenrollment', payload);
      
      toast.success(response.data.message || 'Enrollment period started successfully');
      setFormData({
        department: '',
        semester: '',
        startDate: new Date(),
        endDate: null
      });
      fetchActiveEnrollments();
    } catch (error) {
      console.error('Error starting enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to start enrollment period');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStopForm()) return;
    
    setIsStopping(true);
    
    try {
      const response = await api.post('/stopenrollement', stopFormData);
      
      toast.success(response.data.message || 'Enrollment period stopped successfully');
      setStopFormData({
        department: '',
        semester: ''
      });
      fetchActiveEnrollments();
    } catch (error) {
      console.error('Error stopping enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to stop enrollment period');
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Enrollment Management</h1>
          <p className="text-gray-600 mt-2">Manage enrollment periods for departments</p>
        </div>

        {/* Start Enrollment Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-8 border-red-500 transform hover:scale-[1.005] transition-transform duration-200">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-5">
            <h1 className="text-2xl font-bold text-white">Start New Enrollment</h1>
          </div>
          
          <form onSubmit={handleStartSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    validationErrors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={deptLoading}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                  ))}
                </select>
                {validationErrors.department && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.department}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="semester"
                  name="semester"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    validationErrors.semester ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter semester (1-8)"
                />
                {validationErrors.semester && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.semester}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    validationErrors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.startDate && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.startDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  minDate={formData.startDate}
                  isClearable
                  placeholderText="No end date (open indefinitely)"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </span>
                ) : 'Start Enrollment'}
              </button>
            </div>
          </form>
        </div>

        {/* Stop Enrollment Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-8 border-red-500 transform hover:scale-[1.005] transition-transform duration-200">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-5">
            <h1 className="text-2xl font-bold text-white">Stop Enrollment</h1>
          </div>
          
          <form onSubmit={handleStopSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stop-department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="stop-department"
                  name="department"
                  value={stopFormData.department}
                  onChange={handleStopChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    stopValidationErrors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={deptLoading}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                  ))}
                </select>
                {stopValidationErrors.department && (
                  <p className="mt-2 text-sm text-red-600">{stopValidationErrors.department}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="stop-semester" className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stop-semester"
                  name="semester"
                  min="1"
                  max="8"
                  value={stopFormData.semester}
                  onChange={handleStopChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    stopValidationErrors.semester ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter semester (1-8)"
                />
                {stopValidationErrors.semester && (
                  <p className="mt-2 text-sm text-red-600">{stopValidationErrors.semester}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isStopping}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isStopping ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Stopping...
                  </span>
                ) : 'Stop Enrollment'}
              </button>
            </div>
          </form>
        </div>

        {/* Active Enrollments Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.005] transition-transform duration-200">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-5">
            <h1 className="text-2xl font-bold text-white">Active Enrollment Periods</h1>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : activeEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No active enrollments</h3>
                <p className="mt-1 text-gray-500">There are currently no active enrollment periods.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeEnrollments.map(enrollment => (
                      <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-medium">{enrollment.department?.departmentName?.charAt(0) || 'D'}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{enrollment.department?.departmentName || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Semester {enrollment.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(enrollment.startDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.endDate ? new Date(enrollment.endDate).toLocaleString() : 'Open-ended'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

         {/* All Enrollments Section */}
         <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-8 border-blue-500">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5">
            <h1 className="text-2xl font-bold text-white">All Course Enrollments</h1>
          </div>
          
          <div className="p-6">
            {enrollmentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : allEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No enrollments found</h3>
                <p className="mt-1 text-gray-500">There are currently no enrollments in the system.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {allEnrollments.map(course => (
                  <div key={course.courseId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {course.courseName || 'Unnamed Course'}
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {course.students.map(student => (
                        <div key={student.studentId} className="px-4 py-3 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.studentName}</p>
                            <p className="text-sm text-gray-500">{student.studentEmail}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Semester {student.semester}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManagement;