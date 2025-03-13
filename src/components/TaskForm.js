// ===== Imports & Initial Setup ===== //
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2, Sparkles, Plus, Check, Target, ChevronUp, ChevronDown, Calendar, Link } from 'lucide-react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/api';
import '../styles/theme.css';

// ===== Main Component Declaration ===== //
const TaskForm = () => {
  // ===== Routing Hooks ===== //
  const navigate = useNavigate();
  const { id } = useParams();
  // ===== Core State Management ===== //
  const [isEditing, setIsEditing] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    completed: false,
    steps: []
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [goalAiLoading, setGoalAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [newStep, setNewStep] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({ title: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  // ===== Constants & Configuration ===== //
  const categories = [
    { id: 'work', label: 'Work Project', icon: '💼' },
    { id: 'personal', label: 'Personal Goal', icon: '🎯' },
    { id: 'event', label: 'Event Planning', icon: '🎉' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'health', label: 'Health & Wellness', icon: '🏥' }
  ];
  // ===== Form Handlers ===== //
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const [priority, setPriority] = useState(task.priority || 'medium');

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setLoading(true);

      try {
        const loadTask = async () => {
          const response = await fetchTasks(id);
          const taskData = response.data;
          setTask(taskData);
          setPriority(taskData.priority || 'medium');
          if (taskData.dueDate) {
            setDueDate(taskData.dueDate);
          }
        };
        loadTask();
      } catch (error) {
        setError('Failed to load task: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
    setTask(prev => ({
      ...prev,
      priority: newPriority
    }));
  };

  const handleDateChange = (date) => {
    setDueDate(date);
    setTask(prev => ({
      ...prev,
      dueDate: date
    }));
  };
  const moveStep = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === task.steps.length - 1)) {
      return;
    }
    const newSteps = [...task.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setTask(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const toggleStepMandatory = (index) => {
    const newSteps = [...task.steps];
    newSteps[index] = {
      ...newSteps[index],
      mandatory: !newSteps[index].mandatory
    };
    setTask(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const deleteStep = (index) => {
    setTask(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const addStep = () => {
    if (!newStep.trim()) return;
    setTask(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          title: newStep.trim(),
          mandatory: true,
          timeframe: '',
          links: []
        }
      ]
    }));
    setNewStep('');
  };
  // ===== AI Integration Section ===== //
  const callGeminiAPI = async (prompt, category = '', purpose = 'steps') => {
    const API_KEY = 'AIzaSyAUATOXYxybxiAfTaU-4aoZ2jky2tJXUp4';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  let enhancedPrompt = '';
  if (purpose === 'steps') {
    enhancedPrompt = `Generate a concise, actionable step-by-step plan for this task:
    
Task Title: ${task.title}
Task Description: ${prompt}
${category ? `Category: ${category}` : ''}
  
Guidelines:
1. Provide 5-7 specific, actionable steps
2. Each step should be brief (10-20 words) and start with an action verb
3. Include relevant resources or links where appropriate (format as [Resource Name](URL))
4. Ensure steps are in logical sequential order
5. For each step, suggest a realistic timeframe (e.g., "15 minutes", "1 day")
  
Format each step as a single paragraph without numbering.`;
  } else if (purpose === 'improve') {
    enhancedPrompt = `Improve the following task title and description to be more specific, actionable, and clear:
    
Current Title: ${task.title}
Current Description: ${task.description}
  
Guidelines:
1. Make the title concise but descriptive (under 10 words)
2. Ensure the description includes context, goals, and constraints
3. Maintain the original intent but add clarity
4. Keep the description under 100 words
5. Use professional language
  
Return in this exact format:
TITLE: [improved title]
DESCRIPTION: [improved description]`;
  }
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: enhancedPrompt }]
        }]
      })
    });
  if (!response.ok) {
    throw new Error('Failed to generate content');
  }
  const data = await response.json();
  const responseText = data.candidates[0].content.parts[0].text;
  if (purpose === 'steps') {
    // Parse steps with potential links and timeframes
    const steps = responseText
      .split(/\n+/)
      .filter(step => step.trim() && !step.includes('Guidelines:') && !step.includes('Task Title:'))
      .map(step => {
        // Remove any numbering or bullet points
        const cleanStep = step.replace(/^(\d+\.|\*|\-)\s*/, '').trim();
  
        // Extract timeframe if present (in parentheses at the end)
        let timeframe = '';
        const timeframeMatch = cleanStep.match(/\(([^)]+)\)$/);
        if (timeframeMatch) {
          timeframe = timeframeMatch[1];
        }
  
        return {
          title: cleanStep.replace(/\([^)]+\)$/, '').trim(),
          mandatory: true,
          timeframe: timeframe,
          links: extractLinks(cleanStep)
        };
      });
  return { success: true, data: { steps } };
  } else if (purpose === 'improve') {
    // Parse improved title and description
    const titleMatch = responseText.match(/TITLE:\s*(.+)/i);
    const descMatch = responseText.match(/DESCRIPTION:\s*(.+(?:\n.+)*)/i);
  return {
    success: true,
    data: {
      title: titleMatch ? titleMatch[1].trim() : task.title,
      description: descMatch ? descMatch[1].trim() : task.description
    }
  };
  }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate content with AI');
  }
  };
  const extractLinks = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
  while ((match = linkRegex.exec(text)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }
  return links;
  };
  // Add this function after the improveTaskDetails function and before applyAISuggestions
const generateStepsForGoal = async () => {
  if (!goalInput.trim()) {
    setError('Please enter a specific goal first');
    return;
  }
  setGoalAiLoading(true);
  setError('');
  try {
    const response = await callGeminiAPI(goalInput, selectedCategory, 'steps');
    if (response?.success) {
      setTask(prev => ({...prev, steps: response.data.steps}));
      setShowGoalInput(false);
    }
  } catch (error) {
    setError('Error generating steps for goal: ' + error.message);
  } finally {
    setGoalAiLoading(false);
  }
};
  const improveTaskDetails = async () => {
    if (!task.title || !task.description) {
      setError('Please enter a title and description first');
      return;
    }
  setAiLoading(true);
  setError('');
  try {
    const response = await callGeminiAPI('', '', 'improve');
  if (response.success) {
    setAiSuggestions({
      title: response.data.title,
      description: response.data.description
    });
    setShowAISuggestions(true);
  }
  } catch (error) {
    setError('Error improving task details: ' + error.message);
  } finally {
    setAiLoading(false);
  }
  };
  const applyAISuggestions = () => {
    setTask(prev => ({
      ...prev,
      title: aiSuggestions.title,
      description: aiSuggestions.description
    }));
    setShowAISuggestions(false);
  };
  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <div className="animate-pulse text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/home')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-center text-gray-800">
              {isEditing ? 'Edit Task' : 'New Task'}
            </h1>
            {isEditing && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={task.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={task.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task description"
                required
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                value={task.dueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={task.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this task?')) return;
  try {
    await deleteTask(id);
    navigate('/home');
  } catch (error) {
    setError(error.message);
  }
  };
  // ===== UI Rendering Section ===== //
  if (loading && !task.title) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="animate-pulse">Loading task...</div>
        </div>
      </div>
    );
  }
  // In the return statement, let's restructure the form
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {/* Header Section remains unchanged */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
        {/* Core Details Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Core Details</h2>
          
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">
              Task Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={task.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a clear, specific title"
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Task Description
            </label>
            <textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Describe what needs to be done and why"
            />
          </div>

          {/* Due Date and Category sections remain unchanged */}
        </div>

        {/* Steps Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Task Steps</h2>
          {/* Existing steps rendering remains unchanged */}
        </div>

        {/* AI Assistance Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Tools</h2>
          {/* AI buttons and inputs remain unchanged */}
        </div>

        {/* Submission Section */}
        <div className="p-6">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Remove duplicate state and categories definitions
// These are already defined at the top of the component

export default TaskForm;

const priorities = [
  { id: 'high', label: 'High Priority' },
  { id: 'medium', label: 'Medium Priority' },
  { id: 'low', label: 'Low Priority' }
];

// Remove duplicate handleSubmit function from bottom of file
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const taskData = {
      ...task,
      dueDate: task.dueDate || null
    };

    if (isEditing) {
      await updateTask(id, taskData);
    } else {
      await createTask(taskData);
    }

    navigate('/home');
  } catch (error) {
    setError(error.message || 'Failed to save task');
  } finally {
    setLoading(false);
  }
};

// Remove duplicate handleDelete function from bottom of file

const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };
