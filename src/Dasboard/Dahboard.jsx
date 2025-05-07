import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  // Sample data
  const stats = [
    { name: 'Total Students', value: '4,562', icon: UserGroupIcon, change: '+12%', changeType: 'increase' },
    { name: 'Active Courses', value: '128', icon: BookOpenIcon, change: '+3', changeType: 'increase' },
    { name: 'Departments', value: '16', icon: AcademicCapIcon, change: '0', changeType: 'neutral' },
    { name: 'Attendance Rate', value: '89%', icon: ChartBarIcon, change: '+2%', changeType: 'increase' },
  ];

  const announcements = [
    { id: 1, title: 'Semester Registration Open', date: 'May 15, 2023', content: 'Register for Fall 2023 semester before June 30th.' },
    { id: 2, title: 'Exam Schedule Published', date: 'May 10, 2023', content: 'Final exam schedule is now available in the portal.' },
    { id: 3, title: 'Campus Maintenance', date: 'May 5, 2023', content: 'Library will be closed on May 20th for maintenance work.' },
  ];

  const upcomingEvents = [
    { id: 1, name: 'Orientation Day', date: 'June 5, 2023', time: '9:00 AM' },
    { id: 2, name: 'Career Fair', date: 'June 15, 2023', time: '10:00 AM' },
    { id: 3, name: 'Research Symposium', date: 'June 25, 2023', time: '2:00 PM' },
  ];

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-800">Dashboard</h1>
          <p className="text-red-600">Welcome back to NED University Portal</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100">
            <BellIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-medium">
              AM
            </div>
            <span className="font-medium text-red-800">Admin</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Red Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6 border border-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">{stat.name}</p>
                <p className="text-2xl font-bold mt-1 text-red-800">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change} {stat.changeType !== 'neutral' && 'from last month'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <stat.icon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 border border-red-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-800">Announcements</h2>
            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {announcements.map((item) => (
              <div key={item.id} className="border-b border-red-50 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-red-800">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                  </div>
                  <span className="text-xs text-red-400 whitespace-nowrap">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow p-6 border border-red-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-800">Upcoming Events</h2>
            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
              View Calendar
            </button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-red-50">
                  <CalendarIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-red-800">{event.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.date} • {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions - Red Theme */}
      <div className="bg-white rounded-lg shadow p-6 border border-red-50">
        <h2 className="text-xl font-bold text-red-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-red-100 hover:bg-red-50">
            <div className="p-3 rounded-full bg-red-50 mb-2">
              <BookOpenIcon className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-800">Manage Courses</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-red-100 hover:bg-red-50">
            <div className="p-3 rounded-full bg-red-50 mb-2">
              <UserGroupIcon className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-800">Student Records</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-red-100 hover:bg-red-50">
            <div className="p-3 rounded-full bg-red-50 mb-2">
              <AcademicCapIcon className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-800">Faculty</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-red-100 hover:bg-red-50">
            <div className="p-3 rounded-full bg-red-50 mb-2">
              <ClockIcon className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-800">Attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
}