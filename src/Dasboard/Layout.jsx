import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  ShoppingBagIcon,
  ArrowLeftOnRectangleIcon // Correct icon name for logout
} from '@heroicons/react/24/outline';
import nedLogo from '../assets/NEDUET_logo.svg.png';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/admin' },
    { name: 'Users', icon: UserIcon, path: '/admin/users' },
    { name: 'Departments', icon: AcademicCapIcon, path: '/admin/departments' },
    { name: 'Enrollement', icon: BookOpenIcon, path: '/admin/enrollement' },
    { name: 'Canteen', icon: ShoppingBagIcon, path: '/admin/canteeninfo' },
    { name: 'Enroll', icon: UserIcon, path: '/admin/enroll' },
    { name: 'Marks&Attendance', icon: BookOpenIcon, path: '/admin/marks' },
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/admin' && location.pathname.startsWith(path));
  };

  const handleLogout = () => {
    // Clear all items from localStorage
    localStorage.clear();
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white text-gray-800 border-r border-gray-200 transition-all duration-300 shadow-sm flex flex-col`}>
        {/* Logo Section */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <img src={nedLogo} alt="NEDUET Logo" className="h-10 w-auto" />
              <h1 className="text-xl font-bold text-gray-800">NED Portal</h1>
            </div>
          ) : (
            <img src={nedLogo} alt="NEDUET Logo" className="h-10 w-auto mx-auto" />
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">

              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               
              </svg>
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-2 flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center p-3 rounded-lg
                    hover:bg-gray-100 transition-colors
                    ${isActive(item.path) ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'}
                  `}
                >
                  <item.icon className={`h-6 w-6 ${isActive(item.path) ? 'text-red-600' : 'text-gray-500'}`} />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center p-3 rounded-lg
              hover:bg-gray-100 transition-colors
              text-gray-700 hover:text-red-600
            `}
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 text-gray-500" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;