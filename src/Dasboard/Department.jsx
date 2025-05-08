import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DepartmentCourseManagement() {
  // State for departments
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState(null);
  const [editDepartmentName, setEditDepartmentName] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptFormLoading, setDeptFormLoading] = useState(false);

  // State for courses
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [editCourseId, setEditCourseId] = useState(null);
  const [editCourseData, setEditCourseData] = useState({
    courseName: '',
    department: '',
    semester: '',
    section: ''
  });
  const [courseSearch, setCourseSearch] = useState('');
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseFormLoading, setCourseFormLoading] = useState(false);

  // Teacher assignment state
  const [teachers, setTeachers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditAssignModal, setShowEditAssignModal] = useState(false);
  const [selectedCourseForAssign, setSelectedCourseForAssign] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('departments');

  // Create axios instance with base config
  const api = axios.create({
    baseURL: 'https://dbms-project-iota.vercel.app/api/admin',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  // Add response interceptor for error handling
  api.interceptors.response.use(
    response => {
      console.log('API Response:', response);
      return response;
    },
    error => {
      console.error('API Error:', error.response);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'An error occurred';
      toast.error(errorMessage);
      return Promise.reject(error);
    }
  );

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const response = await api.get('/departments');
      console.log('Departments response:', response.data);
      
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

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setCourseLoading(true);
      const response = await api.get('/courses');
      
      if (response.data.success) {
        setCourses(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load courses');
      }
    } catch (error) {
      console.error('Course fetch error:', error);
      toast.error(error.message);
      
      if (process.env.NODE_ENV === 'development') {
        setCourses([
          { 
            _id: '67dadacf716d600bc4a6aca5',
            courseName: 'Updated Course Name',
            department: {
              _id: '67dad4ef19da63edd6e020d6',
              departmentName: 'Software Engineering'
            },
            semester: 7,
            section: 'A',
            teacher: {
              _id: '67dae1008f3da28241ee9670',
              name: 'John Doe',
              email: 'johnde@example.com'
            },
            enrolledStudents: []
          }
        ]);
      }
    } finally {
      setCourseLoading(false);
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const response = await api.get('/getalluser');
      const teachersData = response.data.users.filter(user => user.role === 'teacher');
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    }
  };

  // Assign teacher to course
// Assign teacher to course
// Assign teacher to course
const assignTeacherToCourse = async () => {
  try {
    setAssignmentLoading(true);
    const response = await api.post('/assign-course', {
      courseId: selectedCourseForAssign, // Changed from 'course' to 'courseId'
      teacher: selectedTeacher
    });
    
    if (response.data.success) {
      toast.success('Teacher assigned successfully');
      setShowAssignModal(false);
      fetchCourses();
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Assignment error:', error);
    toast.error(error.response?.data?.message || 'Failed to assign teacher');
  } finally {
    setAssignmentLoading(false);
  }
};

// Edit assigned teacher
const editAssignedTeacher = async () => {
  try {
    setAssignmentLoading(true);
    const response = await api.put(`/editAssignedCourse/${selectedCourseForAssign}`, {
      teacher: selectedTeacher
    });
    
    if (response.data.success) {
      toast.success('Assignment updated successfully');
      setShowEditAssignModal(false);
      fetchCourses();
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Edit assignment error:', error);
    toast.error(error.response?.data?.message || 'Failed to update assignment');
  } finally {
    setAssignmentLoading(false);
  }
};
  // Department CRUD operations
  const createDepartment = async (e) => {
    e.preventDefault();
    try {
      setDeptFormLoading(true);
      const response = await api.post('/createdepartment', { departmentName });
      toast.success('Department created successfully');
      setDepartmentName('');
      fetchDepartments();
    } catch (error) {
      console.error('Create department error:', error);
    } finally {
      setDeptFormLoading(false);
    }
  };

  const updateDepartment = async (e) => {
    e.preventDefault();
    try {
      setDeptFormLoading(true);
      const response = await api.put(`/editdepartment/${editDepartmentId}`, { departmentName: editDepartmentName });
      toast.success('Department updated successfully');
      setEditDepartmentId(null);
      setEditDepartmentName('');
      fetchDepartments();
    } catch (error) {
      console.error('Update department error:', error);
    } finally {
      setDeptFormLoading(false);
    }
  };

  // Course CRUD operations
  const createCourse = async (e) => {
    e.preventDefault();
    try {
      setCourseFormLoading(true);
      const response = await api.post('/createcourse', {
        courseName,
        department: selectedDepartment,
        semester,
        section
      });
      toast.success('Course created successfully');
      setCourseName('');
      setSelectedDepartment('');
      setSemester('');
      setSection('');
      fetchCourses();
    } catch (error) {
      console.error('Create course error:', error);
    } finally {
      setCourseFormLoading(false);
    }
  };

  const updateCourse = async (e) => {
    e.preventDefault();
    try {
      setCourseFormLoading(true);
      const response = await api.put(`/editcourse/${editCourseId}`, {
        courseName: editCourseData.courseName,
        department: editCourseData.department,
        semester: editCourseData.semester,
        section: editCourseData.section
      });
      toast.success('Course updated successfully');
      setEditCourseId(null);
      setEditCourseData({
        courseName: '',
        department: '',
        semester: '',
        section: ''
      });
      fetchCourses();
    } catch (error) {
      console.error('Update course error:', error);
    } finally {
      setCourseFormLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
    fetchTeachers();
  }, []);

  // Filtered data
  const filteredDepartments = departments.filter(dept =>
    dept.departmentName?.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  const filteredCourses = courses.filter(course =>
    course.courseName?.toLowerCase().includes(courseSearch.toLowerCase()) ||
    (course.department?.departmentName?.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-red-700 mb-8">Academic Management</h1>
        
        {/* Debugging buttons */}
        <div className="mb-4 flex space-x-2">
          <button 
            onClick={() => console.log('Departments:', departments)} 
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
          >
            Log Departments
          </button>
          <button 
            onClick={() => console.log('Courses:', courses)} 
            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
          >
            Log Courses
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'departments' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'courses' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </button>
        </div>

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-4">Department Management</h2>
            
            {/* Department Form */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {editDepartmentId ? 'Edit Department' : 'Create New Department'}
              </h3>
              <form onSubmit={editDepartmentId ? updateDepartment : createDepartment}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                    <input
                      type="text"
                      value={editDepartmentId ? editDepartmentName : departmentName}
                      onChange={(e) => editDepartmentId ? setEditDepartmentName(e.target.value) : setDepartmentName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  {editDepartmentId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditDepartmentId(null);
                        setEditDepartmentName('');
                      }}
                      className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={deptFormLoading}
                  >
                    {deptFormLoading ? 'Processing...' : editDepartmentId ? 'Update Department' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Department List */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Department List</h3>
                <div className="w-64">
                  <input
                    type="text"
                    placeholder="Search departments..."
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              {deptLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Department Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDepartments.map((department) => (
                        <tr key={department._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {department.departmentName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditDepartmentId(department._id);
                                setEditDepartmentName(department.departmentName || '');
                              }}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-4">Course Management</h2>
            
            {/* Course Form */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {editCourseId ? 'Edit Course' : 'Create New Course'}
              </h3>
              <form onSubmit={editCourseId ? updateCourse : createCourse}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      value={editCourseId ? editCourseData.courseName : courseName}
                      onChange={(e) => 
                        editCourseId 
                          ? setEditCourseData({...editCourseData, courseName: e.target.value}) 
                          : setCourseName(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={editCourseId ? editCourseData.department : selectedDepartment}
                      onChange={(e) => 
                        editCourseId 
                          ? setEditCourseData({...editCourseData, department: e.target.value}) 
                          : setSelectedDepartment(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.departmentName || 'Unnamed Department'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <input
                      type="text"
                      value={editCourseId ? editCourseData.semester : semester}
                      onChange={(e) => 
                        editCourseId 
                          ? setEditCourseData({...editCourseData, semester: e.target.value}) 
                          : setSemester(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <input
                      type="text"
                      value={editCourseId ? editCourseData.section : section}
                      onChange={(e) => 
                        editCourseId 
                          ? setEditCourseData({...editCourseData, section: e.target.value}) 
                          : setSection(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  {editCourseId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditCourseId(null);
                        setEditCourseData({
                          courseName: '',
                          department: '',
                          semester: '',
                          section: ''
                        });
                      }}
                      className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={courseFormLoading}
                  >
                    {courseFormLoading ? 'Processing...' : editCourseId ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Course List */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Course List</h3>
                <div className="w-64">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              {courseLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Semester</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Section</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCourses.map((course) => (
                        <tr key={course._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {course.courseName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.department?.departmentName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.semester}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.section}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.teacher ? `${course.teacher.name} (${course.teacher.email})` : 'Not assigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedCourseForAssign(course._id);
                                setSelectedTeacher(course.teacher?._id || '');
                                course.teacher 
                                  ? setShowEditAssignModal(true)
                                  : setShowAssignModal(true);
                              }}
                              className={`text-blue-600 hover:text-blue-900 mr-3 ${
                                course.teacher ? 'bg-yellow-100 px-2 py-1 rounded' : 'bg-green-100 px-2 py-1 rounded'
                              }`}
                            >
                              {course.teacher ? 'Change Teacher' : 'Assign Teacher'}
                            </button>
                            <button
                              onClick={() => {
                                setEditCourseId(course._id);
                                setEditCourseData({
                                  courseName: course.courseName,
                                  department: course.department?._id || '',
                                  semester: course.semester,
                                  section: course.section
                                });
                              }}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assign Teacher Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Assign Teacher to Course</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={assignTeacherToCourse}
                  disabled={assignmentLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  {assignmentLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Change Assigned Teacher</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditAssignModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={editAssignedTeacher}
                  disabled={assignmentLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  {assignmentLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentCourseManagement;