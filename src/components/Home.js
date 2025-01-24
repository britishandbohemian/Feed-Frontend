// Home.js
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Plus, ChevronLeft, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.js';

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Replace this with an empty array initially
  const [tasks, setTasks] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found, user not authenticated');
          return;
        }

        // Adjust the endpoint to your actual tasks URL
        const response = await fetch('http://localhost:5000/api/tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // typical Bearer token usage
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch tasks:', response.statusText);
          return;
        }

        const data = await response.json();
        // Suppose your backend returns an array of tasks like:
        // { success: true, tasks: [...] }
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Functions for date/time formatting
  const formatDate = (date) => {
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    const month = date.toLocaleString('default', { month: 'long' });
    return `${day}${suffix} ${month}`;
  };

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // If you need local expansion/progress logic, keep them:
  const toggleTaskExpansion = (taskId) => {
    setTasks(tasks.map(task =>
        task._id === taskId
            ? { ...task, isExpanded: !task.isExpanded }
            : task
    ));
  };

  const updateTaskProgress = (taskId, diff) => {
    setTasks(tasks.map(task =>
        task._id === taskId
            ? {
              ...task,
              progress: Math.min(100, Math.max(0, (task.progress || 0) + diff))
            }
            : task
    ));
  };

  const exit = () => {
    navigate('/');
  };

  // If tasks have a "dueToday" property from the backend, filter them
  const dueTodayTasks = tasks.filter(task => task.dueToday);

  return (
      <div className="min-h-screen bg-gray-50 font-['Poppins'] relative">
        {/* Mobile Menu Overlay */}
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
            onClick={() => setIsMenuOpen(false)}
        >
          <div
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300"
              onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <button onClick={() => setIsMenuOpen(false)} className="mb-4">
                <ChevronLeft size={24} />
              </button>
              <nav className="space-y-4">
                <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                  Dashboard
                </a>
                <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                  Tasks
                </a>
                <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="border-b border-gray-200 p-4 sticky top-0 bg-white z-30 shadow-sm">
          <div className="container mx-auto flex justify-between items-center max-w-6xl">
            <h2 className="text-base sm:text-lg">{formatDate(new Date())}</h2>
            <h1 className="font-['Milonga'] text-xl sm:text-2xl">feed</h1>
            <button
                onClick={exit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowUpRight size={24} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto max-w-6xl">

          <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-red-600 to-red-800 relative">
                {/* Example placeholder image */}
                <img
                    src="/api/placeholder/800/400"
                    alt=""
                    className="w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute bottom-4 left-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.username || 'Guest'}
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>{formatTime(new Date())}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Due Today
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {dueTodayTasks.map((task) => (
                        <span
                            key={task._id}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                        >
                      {task.title}
                    </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Goals Section */}
          <section className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Goals</h2>
              <div className="w-1/3 h-1 bg-black"></div>
            </div>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                  <motion.div
                      key={task._id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-red-600"
                      onClick={() => toggleTaskExpansion(task._id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{task.title}</h3>
                        <p className="text-lg font-medium mb-2">{task.daysLeft} days left</p>
                        <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                        {task.status}
                      </span>
                        </div>
                      </div>
                      <button
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // maybe open a detailed view or modal
                          }}
                      >
                        <ArrowUpRight size={24} />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4">{task.description}</p>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-red-600 to-red-800"
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress || 0}%` }}
                            transition={{ duration: 0.5 }}
                        />
                      </div>

                      {/* Expandable controls */}
                      {task.isExpanded && (
                          <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 space-y-2"
                          >
                            <div className="flex justify-between text-sm">
                              <span>Progress: {task.progress || 0}%</span>
                              <div className="space-x-2">
                                <button
                                    className="px-3 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskProgress(task._id, -10);
                                    }}
                                >
                                  -10%
                                </button>
                                <button
                                    className="px-3 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskProgress(task._id, 10);
                                    }}
                                >
                                  +10%
                                </button>
                              </div>
                            </div>
                          </motion.div>
                      )}
                    </div>
                  </motion.div>
              ))}
            </div>
          </section>

          {/* More Section */}
          <motion.section
              className="p-4 mt-4 mb-20 sm:mb-8"
              animate={showMore ? { height: 'auto' } : { height: 'auto' }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">More</h2>
                <div className="w-16 sm:w-24 h-1 bg-black"></div>
              </div>
              <button
                  onClick={() => setShowMore(!showMore)}
                  className="bg-black text-white rounded-full p-4 hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus
                    size={24}
                    className={`transform transition-transform ${showMore ? 'rotate-45' : 'rotate-0'}`}
                />
              </button>
            </div>

            {showMore && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {/* Additional goals/tasks could go here */}
                </motion.div>
            )}
          </motion.section>
        </main>
      </div>
  );
};

export default Home;
