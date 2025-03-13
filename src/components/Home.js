import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { fetchTasks, deleteTask, updateTask, logoutUser } from '../services/api';
import '../styles/theme.css';

const Home = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Get user profile from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserProfile(user);

    const getTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const response = await fetchTasks();
        const tasksData = response.data.data;
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (err) {
        setError(err.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, [refresh, navigate]);

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(taskId);
      setRefresh(prev => !prev);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      await updateTask(taskId, { completed: !currentStatus });
      setRefresh(prev => !prev);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Generate days for the calendar
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      days.push({
        dayName: dayNames[i],
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        fullDate: date
      });
    }
    
    return days;
  };

  // Filter tasks for the selected date
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-0 overflow-hidden">
      {activeTab === 'tasks' ? (
        // Tasks View
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              {userProfile && userProfile.profilePic ? (
                <img 
                  src={userProfile.profilePic} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full mr-2"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                  {userProfile && userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-full bg-gray-100 mr-2">
                <NotificationsIcon className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="px-4 py-2 flex space-x-2 overflow-x-auto">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <span className="text-sm font-medium">In review</span>
              <span className="ml-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <span className="text-sm font-medium">In progress</span>
              <span className="ml-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <span className="text-sm font-medium">On</span>
            </div>
          </div>

          {/* Task Cards */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">Loading tasks...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-4">No tasks found. Create a new task!</div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task._id} 
                  className="bg-gray-900 rounded-xl p-4 shadow-sm"
                  onClick={() => navigate(`/task/${task._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{task.title || 'Untitled Task'}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">
                          {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'} - 
                          {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-700 text-white text-xs px-2 py-1 rounded">
                      High Priority
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-900 flex items-center justify-center text-xs text-white">
                          {i}
                        </div>
                      ))}
                    </div>
                    <div className="text-gray-400 text-sm">
                      <span className="mr-1">3</span>
                      <span>In team</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mt-2">
                    <div className="bg-green-200 text-green-800 text-xs inline-block px-3 py-1 rounded-full">
                      Work In Progress
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Calendar View
        <div className="h-full flex flex-col">
          {/* Calendar Header */}
          <div className="p-4 flex justify-between items-center">
            <button 
              className="p-2 rounded-full bg-gray-100"
              onClick={() => setActiveTab('tasks')}
            >
              <ArrowBackIcon className="text-gray-600" />
            </button>
            <h1 className="text-lg font-medium">Task schedule</h1>
            <button className="p-2 rounded-full bg-gray-100">
              <NotificationsIcon className="text-gray-600" />
            </button>
          </div>

          {/* Calendar Type Toggle */}
          <div className="px-4 py-2 flex justify-end">
            <div className="bg-gray-100 rounded-full p-1">
              <button className="px-4 py-1 rounded-full bg-white shadow-sm">
                Calendar
              </button>
            </div>
          </div>

          {/* Calendar Days */}
          <div className="px-4 py-2">
            <div className="grid grid-cols-7 gap-2 text-center">
              {generateCalendarDays().map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">{day.dayName}</span>
                  <button 
                    className={`w-8 h-8 rounded-full mt-1 flex items-center justify-center text-sm ${day.isToday ? 'bg-green-200' : ''}`}
                    onClick={() => setSelectedDate(day.fullDate)}
                  >
                    {day.date}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Time Schedule */}
          <div className="flex-1 p-4 overflow-y-auto">
            {Array.from({ length: 12 }).map((_, index) => {
              const hour = index + 8; // Start from 8 AM
              const hourLabel = hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
              const tasksAtHour = getTasksForDate(selectedDate).filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return taskDate.getHours() === hour;
              });

              return (
                <div key={index} className="flex items-center mb-4">
                  <div className="w-16 text-right pr-4 text-gray-500">{hourLabel}</div>
                  <div className="flex-1 bg-gray-100 rounded-lg p-2">
                    {tasksAtHour.length > 0 ? (
                      tasksAtHour.map(task => (
                        <div key={task._id} className="bg-white p-2 rounded-lg shadow-sm mb-2">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-xs text-gray-500">{task.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400">No tasks</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-full p-4 shadow-lg mb-4">
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={() => navigate('/new-task')}
            className="flex items-center justify-center bg-violet-600 text-white p-3 rounded-full hover:bg-violet-500 transition-all duration-200"
          >
            <AddIcon />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center text-zinc-400 hover:text-zinc-300 p-3 rounded-full hover:bg-zinc-800/50 transition-all duration-200"
          >
            <LogoutIcon />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Home;
