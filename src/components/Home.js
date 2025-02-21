import React, { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import { AnimatePresence } from 'framer-motion';  
import {
  Plus,
  Clock,
  CheckSquare,
  User,
  Search,
  Menu,
  X,
  MoreHorizontal,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchTasks, logoutUser, deleteTask,updateTask } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user')); // ✅ Retrieve user info from localStorage

  // ✅ Fetch tasks from API
  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        if (!user) {
          setError('Authentication required');
          navigate('/login');
          return;
        }

        const response = await fetchTasks();
        setTasks(Array.isArray(response?.data) ? response.data : []); // ✅ Ensure it's an array
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load tasks');
        setTasks([]); // ✅ Set empty array on failure
      } finally {
        setLoading(false);
      }
    };

    fetchUserTasks();
  }, [navigate, user]);

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleTaskToggle = async (task, completed) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => 
        t._id === task._id ? { ...t, completed } : t
      ));

      // Update in backend
      await updateTask(task._id, { completed });
    } catch (error) {
      // Revert on failure
      setTasks(tasks.map(t => 
        t._id === task._id ? { ...t, completed: !completed } : t
      ));
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskDelete = async (task) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      // Optimistic update
      setTasks(tasks.filter(t => t._id !== task._id));

      // Delete from backend
      await deleteTask(task._id);
    } catch (error) {
      // Revert on failure
      setTasks(prevTasks => [...prevTasks, task]);
      console.error('Failed to delete task:', error);
    }
  };

  // ✅ Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    const month = date.toLocaleString('default', { month: 'long' });
    return `${day}${suffix} ${month}`;
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-['Poppins'] relative">
      {/* ✅ Navigation Bar */}
      <nav className="bg-zinc-900 border-b border-zinc-800 fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          {/* ✅ Logout Button (Left Side) */}
          <button
            onClick={handleLogout}
            className="p-2 flex items-center space-x-2 text-red-400 hover:bg-red-600 hover:text-white rounded-full transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden md:inline">Logout</span>
          </button>

          {/* ✅ Logo */}
          <h1 className="font-['Milonga'] text-2xl mb-3 text-violet-400">feed</h1>

          {/* ✅ User & Menu Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-zinc-800 rounded-full">
              <Search className="h-5 w-5 text-zinc-400" />
            </button>
            <div className="h-8 w-8 bg-zinc-800 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6 text-zinc-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40">
          <div className="fixed inset-y-0 right-0 w-64 bg-zinc-900 shadow-lg p-4">
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Main Content */}
      <main className="pt-16 container mx-auto px-4 max-w-6xl">
        {/* ✅ Header Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 rounded-xl border border-zinc-800 mt-6 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-violet-600 to-violet-800 p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.username || 'User'}
            </h1>
            <p className="text-zinc-300">Stay productive today!</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-5 w-5" />
                <span>{formatDate(new Date().toISOString())}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <CheckSquare className="h-5 w-5" />
                <span>{tasks.filter(t => !t.completed).length} pending tasks</span>
              </div>
            </div>
          </div>
        </motion.section>

  {/* ✅ Tasks Section */}
  <section className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Today's Tasks</h2>
          <button
            className="bg-violet-600 text-white rounded-full p-3 hover:bg-violet-500 transition-colors"
            onClick={() => navigate('/new-task')}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-zinc-400"
          >
            Loading tasks...
          </motion.p>
        ) : error ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400"
          >
            {error}
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {tasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={handleTaskToggle}
                  onDelete={handleTaskDelete}
                />
              ))}
              {tasks.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-zinc-500 py-8"
                >
                  No tasks yet. Click the + button to add one!
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      </main>
    </div>
  );
};

export default Home;
