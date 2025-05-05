import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon,
  AcademicCapIcon, // For Menu
  CurrencyDollarIcon,
   UserIcon, // For Bill
} from '@heroicons/react/24/outline';
import nedLogo from '../assets/NEDUET_logo.svg.png';
import { useLocation } from 'react-router-dom';

const LayoutStudent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Marks&Attendance', icon:  UserIcon, path: '/student/marks' },
    { name: 'Menu', icon: ClipboardDocumentListIcon, path: '/student/menu' },
    { name: 'Enrollement', icon: AcademicCapIcon, path: '/student/enrollement' },
 
    
 
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
              <h1 className="text-xl font-bold text-gray-800">Student</h1>
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
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
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

export default LayoutStudent;