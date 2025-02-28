// TaskForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Trash2, Plus } from 'lucide-react';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newStepTitle, setNewStepTitle] = useState('');

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchTask(id);
    }
  }, [id]);

  const fetchTask = async (taskId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://feed-api-7rj8.onrender.com/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to load task');
      }

      const responseData = await response.json();
      const taskData = responseData.data; // Access the task data through the data property

      if (!taskData) {
        throw new Error('Task data not found');
      }

      setTitle(taskData.title || '');
      setDescription(taskData.description || '');
      setCompleted(taskData.completed || false);
      setSteps(taskData.steps || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    if (newStepTitle.trim()) {
      setSteps([...steps, {
        title: newStepTitle,
        mandatory: false
      }]);
      setNewStepTitle('');
    }
  };

  const deleteStep = (index) => {
    const updatedSteps = [...steps];
    updatedSteps.splice(index, 1);
    setSteps(updatedSteps);
  };

  const toggleStepMandatory = (index) => {
    const updatedSteps = [...steps];
    updatedSteps[index].mandatory = !updatedSteps[index].mandatory;
    setSteps(updatedSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = id
        ? `https://feed-api-7rj8.onrender.com/api/tasks/${id}`
        : 'https://feed-api-7rj8.onrender.com/api/tasks';

      const method = id ? 'PUT' : 'POST';

      const taskData = {
        title: title.trim(),
        description: description.trim(),
        completed,
        steps: steps.map(step => ({
          title: step.title,
          mandatory: step.mandatory || false,
        })),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save task');
      }

      navigate('/home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://feed-api-7rj8.onrender.com/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete task');

      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading && !title) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="flex items-center justify-between mb-6 bg-gray-100 p-4 rounded-lg">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Back</span>
        </button>
        <h1 className="text-xl font-bold">{isEditing ? 'Edit Task' : 'New Task'}</h1>
        {isEditing && (
          <button
            onClick={handleDelete}
            className="flex items-center text-red-500 hover:text-red-700"
          >
            <Trash2 size={20} />
          </button>
        )}
      </header>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task title"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
            placeholder="Task description"
            required
          />
        </div>

        {isEditing && (
          <div className="mb-4 flex items-center">
            <input
              id="completed"
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="completed" className="text-gray-700">
              Mark as completed
            </label>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700">Steps</label>
          </div>

          <div className="space-y-2 mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{step.title}</span>
                    {step.mandatory && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleStepMandatory(index)}
                    className={`p-1 rounded ${step.mandatory ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStep(index)}
                    className="p-1 rounded text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New step"
            />
            <button
              type="button"
              onClick={addStep}
              disabled={!newStepTitle.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;