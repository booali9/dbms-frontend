import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './Dasboard/Layout';
import Dashboard from './Dasboard/Dahboard';
import Register from './Dasboard/Student';
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

// Assuming you have an auth store or context
// If not, you'll need to implement authentication logic
function useAuthStore() {
  // This is a placeholder - replace with your actual auth logic
  return { user: localStorage.getItem('token') ? { /* user data */ } : null };
}

function PrivateRoute({ children }) {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
        
              <Layout />
            
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


        <Route path="/canteen" element={<LayoutCanteen />}>
        <Route index element={<Menu />} />
        <Route path="menu" element={<Menu />} />
        
        <Route path="bill" element={<BILLS/>} />
        
      </Route>
        <Route path="/student" element={<LayoutStudent/>}>
        <Route index element={<MenuStudent/>} />
        <Route path="menu" element={<MenuStudent/>} />
        <Route path="enrollement" element={<Student/>} />
        <Route path="marks" element={<Marksat/>} />
        
        
        
      </Route>
      
        <Route path="/teacher" element={<LayoutTeacher/>}>
        <Route index element={<MenuTeacher/>} />
        <Route path="menu" element={<MenuTeacher/>} />
        <Route path="enrollement" element={<TeacherDashboard/>} />
        
        
        
        
      </Route>
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;