// Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Edit, Trash2 } from 'lucide-react';
import { fetchTasks, deleteTask, updateTask } from './api';

const Home = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const result = await fetchTasks();
        setTasks(result.data || []);
      } catch (err) {
        setError(err.message);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <nav className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg">
        <h1 className="text-xl font-bold">Task Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/new-task')}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            <Plus size={16} /> New Task
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {loading ? (
        <div className="text-center p-4">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tasks found. Create a new task to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task._id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={() => handleToggleComplete(task._id, task.completed)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  <p className={`text-gray-600 mt-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.description}
                  </p>

                  {task.steps && task.steps.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Steps:</p>
                      <ul className="space-y-1">
                        {task.steps.map((step, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <span className="w-4 h-4 inline-flex items-center justify-center bg-gray-200 rounded-full text-xs">
                              {index + 1}
                            </span>
                            <span>{step.title}</span>
                            {step.mandatory && <span className="text-xs text-red-500">(Required)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;