import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Student = () => {
  const [user, setUser] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [feedback, setFeedback] = useState({ courseId: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }

    setUser(JSON.parse(userData));
    fetchAvailableCourses();
    fetchEnrollments();
  }, []);

  // Fetch available courses
  const fetchAvailableCourses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/student/getavailablecourses', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAvailableCourses(response.data?.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current enrollments
  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/student/getstudentcourse', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Enrollments data:', response.data); // Debug log
      setEnrollments(response.data?.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enrollments');
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  // Handle enrollment
  const handleEnroll = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/student/courseenroll', 
        { courseIds: selectedCourses },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setSuccess('Enrollment successful!');
      fetchEnrollments();
      setSelectedCourses([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/student/submitfeedback', 
        { courseId: feedback.courseId, feedback: feedback.text },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setSuccess('Feedback submitted successfully!');
      setFeedback({ courseId: '', text: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Feedback submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-red-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            {user && (
              <>
                <p className="text-sm">Welcome, {user.name}</p>
                <div className="text-xs mt-1">
                  <span>Department: {user.department}</span>
                  <span className="mx-2">|</span>
                  <span>Semester: {user.semester}</span>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="bg-white text-red-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
            <button onClick={() => setSuccess('')} className="float-right font-bold">&times;</button>
          </div>
        )}

        {/* Enrollment Section */}
        <section className="mb-8 p-4 border border-red-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Course Enrollment</h2>
          
          {isLoading ? (
            <p>Loading available courses...</p>
          ) : availableCourses && availableCourses.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="font-medium text-red-700">Available Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {availableCourses.map(course => (
                    <div key={course._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={course._id}
                        checked={selectedCourses.includes(course._id)}
                        onChange={() => handleCourseSelect(course._id)}
                        className="mr-2 h-4 w-4 text-red-600"
                      />
                      <label htmlFor={course._id}>
                        {course.courseName} ({course.courseCode}) - Semester {course.semester}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleEnroll}
                disabled={selectedCourses.length === 0 || isLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Enroll in Selected Courses'}
              </button>
            </>
          ) : (
            <p>No courses available for enrollment at this time.</p>
          )}
        </section>

        {/* Current Enrollments */}
        <section className="mb-8 p-4 border border-red-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Your Current Courses</h2>
          {enrollments && enrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-red-50">
                  <tr>
                    <th className="py-2 px-4 border-b border-red-200 text-left text-red-800">Course Code</th>
                    <th className="py-2 px-4 border-b border-red-200 text-left text-red-800">Course Name</th>
                    <th className="py-2 px-4 border-b border-red-200 text-left text-red-800">Semester</th>
                    <th className="py-2 px-4 border-b border-red-200 text-left text-red-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(enrollment => (
                    <tr key={enrollment._id} className="hover:bg-red-50">
                      <td className="py-2 px-4 border-b border-red-100">{enrollment.courseCode}</td>
                      <td className="py-2 px-4 border-b border-red-100">{enrollment.courseName}</td>
                      <td className="py-2 px-4 border-b border-red-100">{enrollment.semester}</td>
                      <td className="py-2 px-4 border-b border-red-100">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          enrollment.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {enrollment.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>You are not currently enrolled in any courses.</p>
          )}
        </section>

        {/* Feedback Section */}
        <section className="p-4 border border-red-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Submit Feedback</h2>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-red-700">Course</label>
              <select
                id="course"
                value={feedback.courseId}
                onChange={(e) => setFeedback({...feedback, courseId: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a course</option>
                {enrollments && enrollments.map(enrollment => (
                  <option key={enrollment._id} value={enrollment._id}>
                    {enrollment.courseName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-red-700">Feedback</label>
              <textarea
                id="feedback"
                rows={4}
                value={feedback.text}
                onChange={(e) => setFeedback({...feedback, text: e.target.value})}
                className="mt-1 block w-full border border-red-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your feedback here..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !feedback.courseId || !feedback.text}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Student;