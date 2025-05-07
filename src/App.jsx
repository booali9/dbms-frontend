import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './Dasboard/Layout';
import Dashboard from './Dasboard/Dahboard';
import UserManagement from './Dasboard/Student';
import DepartmentCourseManagement from './Dasboard/Department';
import StartEnrollement from './Dasboard/StartEnrollement';
import CanteenInfo from "./Dasboard/Canteen"
import LayoutCanteen from './Canteen/Layout';
import Menu from './Canteen/Menu';
import BILLS from './Canteen/BILLS';
import LayoutStudent from './Student/Layout';
import LayoutTeacher from './Teacher/Layout';
import MenuTeacher from './Teacher/Menu';
import MenuStudent from './Student/Menu';
import Student from './Student/Student';
import TeacherDashboard from './Teacher/Teacher';
import Enroll from './Dasboard/Enroll';
import Marksat from './Teacher/Marks&Ate';
import Marksatte from './Dasboard/Marks&atte';
import LocationTracker from './Student/location';
import LayoutPoint from './Point/Layout';
import LocationTrackerpoint from './Point/location';

const getUserRole = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).role : null;
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const userRole = getUserRole();
  
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to default route for their role
    switch(userRole) {
      case 'superadmin':
        return <Navigate to="/admin" replace />;
      case 'undergrad':
      case 'postgrad':
        return <Navigate to="/student" replace />;
      case 'teacher':
        return <Navigate to="/teacher" replace />;
      case 'canteen':
        return <Navigate to="/canteen" replace />;
      case 'point':
        return <Navigate to="/point" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin routes (superadmin only) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='Users' element={<UserManagement/>} />
          <Route path='Departments' element={<DepartmentCourseManagement/>} />
          <Route path='Enrollement' element={<StartEnrollement/>} />
          <Route path='canteeninfo' element={<CanteenInfo/>} />
          <Route path='enroll' element={<Enroll/>} />
          <Route path='marks' element={<Marksatte/>} />
        </Route>

        {/* Canteen routes (canteen only) */}
        <Route 
          path="/canteen" 
          element={
            <ProtectedRoute allowedRoles={['canteen']}>
              <LayoutCanteen />
            </ProtectedRoute>
          }
        >
          <Route index element={<Menu />} />
          <Route path="menu" element={<Menu />} />
          <Route path="bill" element={<BILLS/>} />
        </Route>

        {/* Student routes (undergrad/postgrad only) */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['undergrad', 'postgrad']}>
              <LayoutStudent/>
            </ProtectedRoute>
          }
        >
          <Route index element={<MenuStudent/>} />
          <Route path="menu" element={<MenuStudent/>} />
          <Route path="enrollement" element={<Student/>} />
          <Route path="marks" element={<Marksat/>} />
          <Route path="location" element={<LocationTracker/>} />
        </Route>
      
        {/* Teacher routes (teacher only) */}
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <LayoutTeacher/>
            </ProtectedRoute>
          }
        >
          <Route index element={<MenuTeacher/>} />
          <Route path="menu" element={<MenuTeacher/>} />
          <Route path="enrollement" element={<TeacherDashboard/>} />
        </Route>

        {/* Point routes (point only) */}
        <Route 
          path="/point" 
          element={
            <ProtectedRoute allowedRoles={['point']}>
              <LayoutPoint/>
            </ProtectedRoute>
          }
        >
          <Route index element={<LocationTrackerpoint/>} />
          <Route path="location" element={<LocationTrackerpoint/>} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;