import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressionStatus, setProgressionStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [attendanceData, setAttendanceData] = useState([]);
  const [marksData, setMarksData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [coursesRes, progressionRes, availableRes, attendanceRes, marksRes] = await Promise.all([
          axios.get('http://localhost:3000/api/student/getstudentcourse', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/api/student/progression', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/api/student/getavailablecourses', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/api/student/attendance', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/api/student/marks', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setCourses(coursesRes.data?.courses || []);
        setProgressionStatus(progressionRes.data || null);
        setAvailableCourses(availableRes.data?.courses || []);
        setAttendanceData(attendanceRes.data?.attendance || []);
        setMarksData(marksRes.data?.marks || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        setCourses([]);
        setAvailableCourses([]);
        setAttendanceData([]);
        setMarksData([]);
      }
    };

    fetchData();
  }, []);

  const handleSemesterUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/student/update-semester',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(response.data.message);
      setProgressionStatus(prev => ({
        ...prev,
        canProgress: false,
        currentSemester: response.data.newSemester
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update semester');
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/student/enroll',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Enrolled in course successfully');
      
      // Refresh data
      const [coursesRes, availableRes] = await Promise.all([
        axios.get('http://localhost:3000/api/student/getstudentcourse', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/student/getavailablecourses', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setCourses(coursesRes.data?.courses || []);
      setAvailableCourses(availableRes.data?.courses || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    }
  };

  const getCourseAttendance = (courseId) => {
    return attendanceData.filter(item => item.course?._id === courseId);
  };

  const getCourseMarks = (courseId) => {
    return marksData.find(item => item.course?._id === courseId);
  };

  const calculateAttendancePercentage = (attendanceRecords) => {
    if (!attendanceRecords || attendanceRecords.length === 0) return 0;
    const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
    return Math.round((presentCount / attendanceRecords.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-red-700">Student Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your courses and academic progress</p>
        </div>
        
        {/* Semester Progression Card */}
        <div className="bg-red-50 border-l-4 border-red-600 rounded-md p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-medium text-red-800">Semester Progression</h3>
          {progressionStatus && (
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Current Semester:</span> {progressionStatus.currentSemester}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Passed Courses:</span> {progressionStatus.passedCourses}/{progressionStatus.totalCourses}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${progressionStatus.canProgress ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {progressionStatus.canProgress ? 'Eligible to Progress' : 'Not Eligible'}
                </span>
              </p>
              
              {progressionStatus.canProgress && (
                <button 
                  onClick={handleSemesterUpdate}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Progress to Semester {progressionStatus.currentSemester + 1}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Courses Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'enrolled' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('enrolled')}
            >
              My Courses
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'available' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('available')}
            >
              Available Courses
            </button>
          </nav>
        </div>

        {/* Enrolled Courses */}
        {activeTab === 'enrolled' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">My Enrolled Courses</h2>
            {courses.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-500">No courses enrolled yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => {
                  const courseAttendance = getCourseAttendance(course._id);
                  const courseMarks = getCourseMarks(course._id);
                  const attendancePercentage = calculateAttendancePercentage(courseAttendance);
                  
                  return (
                    <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-red-700">{course.courseName}</h3>
                        <p className="text-gray-600 mt-1">Department: {course.department?.departmentName || 'N/A'}</p>
                        <p className="text-gray-600">Semester: {course.semester}</p>
                        <p className="text-gray-600">Credit Hours: {course.creditHours || 'N/A'}</p>
                        
                        {/* Simplified Marks Section */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="font-medium text-red-700">Marks</h4>
                          {courseMarks ? (
                            <div className="mt-2">
                              <p className="text-gray-700">
                                <span className="font-medium">Obtained Marks:</span> 
                                <span className={`ml-2 ${courseMarks.marksObtained >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                  {courseMarks.marksObtained || 'N/A'}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 mt-1">No marks recorded yet</p>
                          )}
                        </div>
                        
                        {/* Attendance Section */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="font-medium text-red-700">Attendance</h4>
                          {courseAttendance.length > 0 ? (
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-700 font-medium">Percentage:</span>
                                <span className={`font-medium ${
                                  attendancePercentage >= 75 ? 'text-green-600' : 
                                  attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {attendancePercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    attendancePercentage >= 75 ? 'bg-green-600' : 
                                    attendancePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${attendancePercentage}%` }}
                                ></div>
                              </div>
                              <p className="text-gray-700 mt-2">
                                <span className="font-medium">Classes Attended:</span> {courseAttendance.filter(a => a.status === 'present').length} / {courseAttendance.length}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 mt-1">No attendance recorded yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Available Courses */}
        {activeTab === 'available' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Courses</h2>
            {availableCourses.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-500">No available courses at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map(course => (
                  <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-red-700">{course.courseName}</h3>
                      <p className="text-gray-600 mt-1">Department: {course.department?.departmentName || 'N/A'}</p>
                      <p className="text-gray-600">Semester: {course.semester}</p>
                      <p className="text-gray-600">Credit Hours: {course.creditHours || 'N/A'}</p>
                      <p className="text-gray-600 mt-2">{course.description || 'No description available'}</p>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => enrollInCourse(course._id)}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Enroll in Course
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;