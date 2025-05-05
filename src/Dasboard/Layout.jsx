import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  HomeIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CogIcon,
  CalendarIcon,
  ShoppingBagIcon, // Changed from ChartBarIcon to ShoppingBagIcon
  CakeIcon, // Alternative food icon
  TruckIcon // Another alternative
} from '@heroicons/react/24/outline';
import nedLogo from '../assets/NEDUET_logo.svg.png';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/' },
    { name: 'Users', icon: UserIcon, path: '/users' },
    { name: 'Departments', icon: AcademicCapIcon, path: '/departments' },
    { name: 'Enrollement', icon: BookOpenIcon, path: '/enrollement' },
    { name: 'Canteen', icon: ShoppingBagIcon, path: '/canteeninfo' }, // Changed icon here
    { name: 'Enroll', icon: UserIcon, path: '/enroll' },
    { name: 'Marks&Attendance', icon: BookOpenIcon, path: '/marks' },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white text-gray-800 border-r border-gray-200 transition-all duration-300 shadow-sm`}>
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
            {sidebarOpen ? '' : ''}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center p-3 rounded-lg
                    hover:bg-gray-100 transition-colors
                    ${location.pathname === item.path ? 'bg-gray-100 text-red-600' : 'text-gray-700'}
                  `}
                >
                  <item.icon className={`h-6 w-6 ${location.pathname === item.path ? 'text-red-600' : 'text-gray-500'}`} />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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