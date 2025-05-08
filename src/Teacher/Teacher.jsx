import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Teacherdashboard.css';

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [classesTaken, setClassesTaken] = useState(1);
  const [marksData, setMarksData] = useState({});
  const [activeTab, setActiveTab] = useState('students');
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);

    const fetchAssignedCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://dbms-project-iota.vercel.app/api/teacher/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data.courses || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchAssignedCourses();
  }, []);

  const handleCourseSelect = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const [attendanceRes, marksRes] = await Promise.all([
        axios.get(`https://dbms-project-iota.vercel.app/api/teacher/courses/${courseId}/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`https://dbms-project-iota.vercel.app/api/teacher/courses/${courseId}/marks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const course = courses.find(c => c._id === courseId);
      if (course) {
        // Initialize attendance status for each student
        const statusMap = {};
        course.enrolledStudents?.forEach(student => {
          statusMap[student._id] = 'present';
        });
        setAttendanceStatus(statusMap);
        
        setSelectedCourse({
          ...course,
          attendance: attendanceRes.data.attendance || [],
          marks: marksRes.data.marks || []
        });

        // Initialize marks data
        const marksMap = {};
        marksRes.data.marks?.forEach(mark => {
          marksMap[mark.student._id] = {
            marksObtained: mark.marksObtained,
            totalMarks: mark.totalMarks
          };
        });
        setMarksData(marksMap);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedCourse || !attendanceDate) return;
    
    try {
      const attendanceRecords = selectedCourse.enrolledStudents.map(student => ({
        studentId: student._id,
        status: attendanceStatus[student._id] || 'present'
      }));

      const token = localStorage.getItem('token');
      await axios.post('https://dbms-project-iota.vercel.app/api/teacher/attendance', {
        courseId: selectedCourse._id,
        date: attendanceDate,
        students: attendanceRecords,
        classesTaken: classesTaken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Attendance marked successfully');
      handleCourseSelect(selectedCourse._id);
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  const handleAssignMarks = async (studentId) => {
    if (!selectedCourse || !marksData[studentId]) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://dbms-project-iota.vercel.app/api/teacher/marks', {
        courseId: selectedCourse._id,
        studentId,
        semester: selectedCourse.semester,
        ...marksData[studentId]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Marks assigned successfully');
      handleCourseSelect(selectedCourse._id);
    } catch (error) {
      console.error('Error assigning marks:', error);
      alert('Failed to assign marks');
    }
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const filteredCourses = departmentFilter === 'all' 
    ? courses 
    : courses.filter(course => course.department?.departmentName === departmentFilter);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="login-prompt">Please log in to access the dashboard</div>;

  return (
    <div className="teacher-dashboard">
      <h1 className="dashboard-title">Welcome, {user.name}</h1>
      
      <div className="dashboard-container">
        <div className="course-list">
          <h2 className="section-title">Your Courses</h2>
          
          <div className="department-filter">
            <h3>Filter by Department</h3>
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {Array.from(new Set(courses.map(c => c.department?.departmentName))).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <ul className="course-items">
            {filteredCourses.map(course => (
              <li 
                key={course._id} 
                onClick={() => handleCourseSelect(course._id)}
                className={`course-item ${selectedCourse?._id === course._id ? 'active' : ''}`}
              >
                <h4>{course.courseName}</h4>
                <p>Department: {course.department?.departmentName || 'N/A'}</p>
                <p>Semester: {course.semester}, Section: {course.section}</p>
                <p>Students: {course.enrolledStudents?.length || 0}</p>
              </li>
            ))}
          </ul>
        </div>

        {selectedCourse && (
          <div className="course-details">
            <h2 className="course-title">{selectedCourse.courseName} - {selectedCourse.section}</h2>
            <p>Department: {selectedCourse.department?.departmentName || 'N/A'}</p>
            <p>Semester: {selectedCourse.semester}</p>

            <div className="tabs">
              <button 
                className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                Students
              </button>
              <button 
                className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveTab('attendance')}
              >
                Attendance
              </button>
              <button 
                className={`tab-button ${activeTab === 'marks' ? 'active' : ''}`}
                onClick={() => setActiveTab('marks')}
              >
                Marks
              </button>
            </div>

            {activeTab === 'students' && (
              <div className="tab-content">
                <h3 className="subtitle">Enrolled Students ({selectedCourse.enrolledStudents?.length || 0})</h3>
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCourse.enrolledStudents?.map(student => (
                      <tr key={student._id}>
                        <td>{student.studentId || 'N/A'}</td>
                        <td>{student.name || 'N/A'}</td>
                        <td>{student.email || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="tab-content">
                <div className="attendance-section">
                  <h3 className="subtitle">Mark Attendance</h3>
                  <div className="attendance-controls">
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="date-input"
                    />
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={classesTaken}
                      onChange={(e) => setClassesTaken(e.target.value)}
                      placeholder="Classes today"
                      className="classes-input"
                    />
                    <button 
                      onClick={handleMarkAttendance}
                      className="submit-button"
                    >
                      Mark Attendance
                    </button>
                  </div>

                  <h3 className="subtitle">Attendance Records</h3>
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Classes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCourse.attendance?.map(record => (
                        <tr key={`${record.student._id}-${record.date}`}>
                          <td>{record.student?.name || 'N/A'}</td>
                          <td className={record.status === 'present' ? 'present' : 'absent'}>
                            {record.status}
                          </td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.classesTaken || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {selectedCourse.enrolledStudents?.length > 0 && attendanceDate && (
                    <div className="current-attendance">
                      <h4>Mark Attendance for {new Date(attendanceDate).toLocaleDateString()}</h4>
                      <table className="attendance-marking">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCourse.enrolledStudents.map(student => (
                            <tr key={student._id}>
                              <td>{student.name}</td>
                              <td>
                                <select
                                  value={attendanceStatus[student._id] || 'present'}
                                  onChange={(e) => handleAttendanceStatusChange(student._id, e.target.value)}
                                  className="status-select"
                                >
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                </select>
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

            {activeTab === 'marks' && (
              <div className="tab-content">
                <div className="marks-section">
                  <h3 className="subtitle">Assign Marks</h3>
                  <table className="marks-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Marks Obtained</th>
                        <th>Total Marks</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCourse.enrolledStudents?.map(student => {
                        const studentMarks = marksData[student._id] || {};
                        return (
                          <tr key={student._id}>
                            <td>{student.name}</td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={studentMarks.marksObtained || ''}
                                onChange={(e) => setMarksData({
                                  ...marksData,
                                  [student._id]: {
                                    ...studentMarks,
                                    marksObtained: e.target.value
                                  }
                                })}
                                className="marks-input"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                value={studentMarks.totalMarks || 100}
                                onChange={(e) => setMarksData({
                                  ...marksData,
                                  [student._id]: {
                                    ...studentMarks,
                                    totalMarks: e.target.value
                                  }
                                })}
                                className="marks-input"
                              />
                            </td>
                            <td>
                              <button 
                                onClick={() => handleAssignMarks(student._id)}
                                className="save-button"
                                disabled={!studentMarks.marksObtained}
                              >
                                Save
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <h3 className="subtitle">Previous Marks</h3>
                  <table className="marks-history">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Marks</th>
                        <th>Semester</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCourse.marks?.map(mark => (
                        <tr key={`${mark.student._id}-${mark.semester}`}>
                          <td>{mark.student?.name || 'N/A'}</td>
                          <td>{mark.marksObtained || 0}/{mark.totalMarks || 100}</td>
                          <td>{mark.semester}</td>
                          <td>{new Date(mark.updatedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;