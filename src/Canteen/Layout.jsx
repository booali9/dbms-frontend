import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon, // For Menu
  CurrencyDollarIcon, // For Bill
  ArrowLeftOnRectangleIcon // For Logout
} from '@heroicons/react/24/outline';
import nedLogo from '../assets/NEDUET_logo.svg.png';

const LayoutCanteen = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Menu', icon: ClipboardDocumentListIcon, path: '/canteen/menu' },
    { name: 'Bill', icon: CurrencyDollarIcon, path: '/canteen/bill' },
  ];

  // Function to check if the current path matches or starts with the nav item path
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    // Clear any user data from localStorage/sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Or clear all storage
    // localStorage.clear();
    
    // Redirect to login page
    navigate('/login');
    
    // Optional: Reload the page to reset the application state
    // window.location.reload();
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
              <h1 className="text-xl font-bold text-gray-800">Canteen</h1>
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
                    ${isActive(item.path) ? 'bg-red-100 text-red-600 font-medium border-l-4 border-red-600' : 'text-gray-700'}
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

export default LayoutCanteen;