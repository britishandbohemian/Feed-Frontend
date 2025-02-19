import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Plus,
  ChevronLeft,
  Clock,
  Calendar,
  CheckSquare,
  User,
  Settings,
  Search,
  Menu,
  X,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getTasks } from '../services/taskService';

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const { data } = await getTasks(token);
        setTasks(data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Date formatting functions
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
      {/* Navigation Bar */}
      <nav className="bg-zinc-900 border-b border-zinc-800 fixed w-full top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="font-['Milonga'] text-2xl mb-3 text-violet-400">feed</h1>
            </div>



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
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40">
          <div className="fixed inset-y-0 right-0 w-64 bg-zinc-900 shadow-lg p-4">
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6 text-zinc-400" />
              </button>
            </div>
            <nav className="space-y-4">
              <button className="block w-full text-left p-2 hover:bg-zinc-800 rounded text-zinc-400">
                Todo
              </button>
              <button className="block w-full text-left p-2 hover:bg-zinc-800 rounded text-zinc-400">
                Projects
              </button>
              <button className="block w-full text-left p-2 hover:bg-zinc-800 rounded text-zinc-400">
                Calendar
              </button>
              <button className="block w-full text-left p-2 hover:bg-zinc-800 rounded text-zinc-400">
                Settings
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16 container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
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

        {/* Tasks Section */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Today's Tasks</h2>
            <button className="bg-violet-600 text-white rounded-full p-3 hover:bg-violet-500 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map(task => (
              <motion.div
                key={task._id}
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-violet-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="mt-1.5 h-4 w-4 rounded border-zinc-600 bg-zinc-800"
                    />
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-zinc-500 mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-violet-500/10 text-violet-400">
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                        <span className="text-sm text-zinc-500">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-zinc-800 rounded-full">
                    <MoreHorizontal className="h-5 w-5 text-zinc-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6 flex items-center space-x-4">
          <button className="bg-violet-600 text-white rounded-full p-4 shadow-lg hover:bg-violet-500 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
          onClick={() => navigate('/NewTask')}
        </div>
      </main>
    </div>
  );
};

export default Home;