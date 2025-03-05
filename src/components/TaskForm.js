import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2, Sparkles, Plus, Check, Target } from 'lucide-react';
import { fetchTask, createTask, updateTask, deleteTask, generateSteps, generateAISteps } from './api';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadTask(id);
    }
  }, [id]);

  const loadTask = async (taskId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetchTask(taskId);
      const taskData = response.data;

      if (!taskData) {
        throw new Error('Task data not found');
      }

      setTask({
        title: taskData.title || '',
        description: taskData.description || '',
        completed: taskData.completed || false,
        steps: taskData.steps || []
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask({
      ...task,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const generateStepsWithAI = async () => {
    if (!task.title || !task.description) {
      setError('Please enter a title and description first');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const data = await generateSteps({
        title: task.title,
        description: task.description
      });

      // Merge AI-generated steps with existing steps
      // Removing duplicates by title
      const existingTitles = new Set(task.steps.map(step => step.title.toLowerCase()));
      const newSteps = [...task.steps];

      data.steps.forEach(step => {
        if (!existingTitles.has(step.title.toLowerCase())) {
          newSteps.push({
            title: step.title,
            mandatory: step.mandatory || false
          });
        }
      });

      setTask({
        ...task,
        steps: newSteps
      });
    } catch (error) {
      setError('Error generating steps: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const generateStepsForGoal = async () => {
    if (!id) {
      setError('Please save the task first before generating goal-specific steps');
      return;
    }

    if (!goalInput.trim()) {
      setError('Please enter a specific goal');
      return;
    }

    setGoalAiLoading(true);
    setError('');

    try {
      const result = await generateAISteps(id, goalInput);

      if (result.success && result.data && Array.isArray(result.data.steps)) {
        // Add the new steps to the task
        const existingTitles = new Set(task.steps.map(step => step.title.toLowerCase()));
        const newSteps = [...task.steps];

        result.data.steps.forEach(stepItem => {
          if (!existingTitles.has(stepItem.description.toLowerCase())) {
            newSteps.push({
              title: stepItem.description,
              mandatory: true
            });
          }
        });

        setTask({
          ...task,
          steps: newSteps
        });

        // Reset goal input and hide the input field
        setGoalInput('');
        setShowGoalInput(false);
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      setError('Error generating goal steps: ' + error.message);
    } finally {
      setGoalAiLoading(false);
    }
  };

  const addStep = () => {
    if (newStep.trim()) {
      setTask({
        ...task,
        steps: [...task.steps, {
          title: newStep,
          mandatory: false
        }]
      });
      setNewStep('');
    }
  };

  const deleteStep = (index) => {
    const updatedSteps = [...task.steps];
    updatedSteps.splice(index, 1);
    setTask({
      ...task,
      steps: updatedSteps
    });
  };

  const toggleStepMandatory = (index) => {
    const updatedSteps = [...task.steps];
    updatedSteps[index].mandatory = !updatedSteps[index].mandatory;
    setTask({
      ...task,
      steps: updatedSteps
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task.title.trim() || !task.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const taskData = {
        title: task.title.trim(),
        description: task.description.trim(),
        completed: task.completed,
        steps: task.steps.map(step => ({
          title: step.title,
          mandatory: step.mandatory || false,
        })),
      };

      if (id) {
        await updateTask(id, taskData);
      } else {
        await createTask(taskData);
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
      await deleteTask(id);
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading && !task.title) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="animate-pulse">Loading task...</div>
        </div>
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
            What do you want to accomplish?
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={task.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="E.g., Plan a birthday party"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Tell me more about what you're trying to do
          </label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
            placeholder="E.g., I need to plan a surprise birthday party for my friend next month. I need to organize the venue, guest list, food, and decorations."
            required
          />
        </div>

        <div className="flex justify-center mb-6 gap-3 flex-wrap">
          <button
            type="button"
            onClick={generateStepsWithAI}
            disabled={aiLoading || !task.title || !task.description}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full shadow hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles size={18} />
            {aiLoading ? 'Generating steps...' : 'Generate steps with AI'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => setShowGoalInput(!showGoalInput)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition-colors"
            >
              <Target size={18} />
              {showGoalInput ? 'Hide goal input' : 'Add specific goal'}
            </button>
          )}
        </div>

        {showGoalInput && isEditing && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="mb-3">
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="goalInput">
                What specific goal do you want steps for?
              </label>
              <div className="flex gap-2">
                <input
                  id="goalInput"
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., Reduce project costs by 15%"
                />
                <button
                  type="button"
                  onClick={generateStepsForGoal}
                  disabled={goalAiLoading || !goalInput.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                >
                  <Sparkles size={16} />
                  {goalAiLoading ? 'Generating...' : 'Get Steps'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter a specific goal to get targeted steps using Gemini AI
              </p>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="mb-4 flex items-center">
            <input
              id="completed"
              name="completed"
              type="checkbox"
              checked={task.completed}
              onChange={handleInputChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="completed" className="text-gray-700">
              Mark as completed
            </label>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-medium">Steps to complete this task</label>
            <span className="text-sm text-gray-500">{task.steps.length} steps</span>
          </div>

          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {task.steps.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-dashed rounded text-center text-gray-500">
                {aiLoading || goalAiLoading
                  ? "Thinking of the best steps for your task..."
                  : "No steps yet. Add steps manually or use AI to generate them."}
              </div>
            ) : (
              task.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded bg-gray-50 hover:bg-gray-100 transition-colors">
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
                      className={`p-1 rounded ${step.mandatory ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100'}`}
                      title={step.mandatory ? "Mark as optional" : "Mark as required"}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteStep(index)}
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                      title="Delete step"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add your own step"
              onKeyPress={(e) => e.key === 'Enter' && newStep.trim() && (e.preventDefault(), addStep())}
            />
            <button
              type="button"
              onClick={addStep}
              disabled={!newStep.trim()}
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
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;