import React, { useState, useEffect, useRef } from 'react';
import TaskCard from '../components/TaskCard';
import { AnimatePresence } from 'framer-motion';
import { Plus, Clock, CheckSquare, User, Search, Menu, X, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const searchInputRef = useRef(null);

  // Update the useEffect for fetching tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('https://feed-api-7rj8.onrender.com/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to fetch tasks');
        }

        // Validate and normalize task data
        const validatedTasks = responseData.data.map(task => ({
          _id: task._id,
          title: task.title || 'Untitled Task',
          description: task.description || '',
          steps: task.steps?.map(step => ({
            title: step.title || 'Untitled Step',
            mandatory: step.mandatory || false,
            deadline: step.deadline || null
          })) || [],
          dueDate: task.dueDate || null,
          completed: task.completed || false,
          owner: task.owner || {}
        }));

        setTasks(validatedTasks);
        setFilteredTasks(validatedTasks);
        setError('');

      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
        setTasks([]);
        setFilteredTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate, user]);

  // Define handleTaskToggle
  const handleTaskToggle = async (task, completed) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://feed-api-7rj8.onrender.com/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setTasks(tasks.map(t =>
        t._id === task._id ? { ...t, completed } : t
      ));
      setFilteredTasks(filteredTasks.map(t =>
        t._id === task._id ? { ...t, completed } : t
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Define handleTaskDelete
  const handleTaskDelete = async (task) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://feed-api-7rj8.onrender.com/api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(t => t._id !== task._id));
      setFilteredTasks(filteredTasks.filter(t => t._id !== task._id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Define handleTaskClick
  const handleTaskClick = (task) => {
    navigate(`/task/${task._id}`);
  };

  // Define handleSearchChange
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description ? task.description.toLowerCase().includes(query) : false) ||
      (task.owner?.username ? task.owner.username.toLowerCase().includes(query) : false)
    );
    setFilteredTasks(filtered);
  };

  // Define handleLogout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Define formatDate
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'No due date';
    }
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    const month = date.toLocaleString('default', { month: 'long' });
    return `${day}${suffix} ${month}`;
  };

  // Define getDaySuffix
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
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <button
            onClick={handleLogout}
            className="p-2 flex items-center space-x-2 text-red-400 hover:bg-red-600 hover:text-white rounded-full transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden md:inline">Logout</span>
          </button>

          <h1 className="font-['Milonga'] text-2xl mb-3 text-violet-400">feed</h1>

          <div className="flex items-center space-x-4">
            <button
              className="p-2 hover:bg-zinc-800 rounded-full"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
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
// Update the tasks list rendering
        <AnimatePresence mode="popLayout">
          {filteredTasks.map(task => (
            <motion.div
              key={task._id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <TaskCard
                task={task}
                onToggle={handleTaskToggle}
                onDelete={handleTaskDelete}
                onClick={() => handleTaskClick(task)}
              />
            </motion.div>
          ))}
          {filteredTasks.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-zinc-500 py-8"
            >
              No tasks found. Click the + button to add one!
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

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

      <main className="pt-16 container mx-auto px-4 max-w-6xl">
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
                <span>{filteredTasks.filter(t => !t.completed).length} pending tasks</span>
              </div>
            </div>
          </div>
        </motion.section>

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-12"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
            </motion.div>
          ) : error ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-center py-8"
            >
              {error}
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <AnimatePresence mode="wait">
                {filteredTasks.map(task => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                  >
                    <TaskCard
                      task={task}
                      onToggle={handleTaskToggle}
                      onDelete={handleTaskDelete}
                      onClick={() => handleTaskClick(task)}
                    />
                  </motion.div>
                ))}
                {filteredTasks.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-zinc-500 py-8"
                  >
                    No tasks found. Click the + button to add one!
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