import React, { useState, useEffect, useRef } from 'react';
import StepGenerator from './StepGenerator'
import {
   Check, Brain, Plus,
  Calendar, ChevronLeft, ChevronRight, X, Save,
  ArrowUp, ArrowDown, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';




const FeedPage = () => {
  // State Management
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRequiredField, setShowRequiredField] = useState(false);






  // Steps State
  const [steps, setSteps] = useState([
    { id: 1, title: "Break down task into smaller steps", deadline: "2 hours", mandatory: true },
    { id: 2, title: "Set up quick milestones", deadline: "30 mins", mandatory: false }
  ]);
  const [aiTypingSuggestion, setAiTypingSuggestion] = useState('');
  const [newStep, setNewStep] = useState({ title: '', deadline: '', mandatory: false });
  const [showNewStepForm, setShowNewStepForm] = useState(false);





  // Mobile Detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // AI Predictive Typing
  useEffect(() => {
    if (title.length > 3) {
      const suggestions = {
        "Create": " a new marketing strategy",
        "Build": " a website prototype",
        "Plan": " team meeting agenda"
      };

      Object.keys(suggestions).forEach(key => {
        if (title.startsWith(key) && !title.includes(suggestions[key])) {
          setAiTypingSuggestion(suggestions[key]);
          return;
        }
      });
    }
  }, [title]);



  // Step Management Functions
  const addNewStep = () => {
    if (newStep.title.trim()) {
      setSteps([...steps, {
        id: Date.now(),
        title: newStep.title,
        deadline: newStep.deadline || '1 hour',
        mandatory: newStep.mandatory
      }]);
      setNewStep({ title: '', deadline: '', mandatory: false });
      setShowNewStepForm(false);
    }
  };

  const deleteStep = (id) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const moveStep = (id, direction) => {
    const index = steps.findIndex(step => step.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < steps.length - 1)) {
      const newSteps = [...steps];
      const temp = newSteps[index];
      newSteps[index] = newSteps[index + (direction === 'up' ? -1 : 1)];
      newSteps[index + (direction === 'up' ? -1 : 1)] = temp;
      setSteps(newSteps);
    }
  };

  // Form Submission Handler
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const taskData = {
      title,
      description,
      selectedDate,
      timeframe,
      steps: steps.map(({ title, deadline, mandatory }) => ({
        title,
        deadline,
        mandatory,
      })),
      aiTypingSuggestion,
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        console.log('Task created successfully');
      } else {
        console.error('Error creating task:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Navigation Function
  const goBack = () => {
    navigate('/home');
  };

  // Subcomponents
  const StepsSection = () => {
    const handleAIGeneratedSteps = (generatedSteps) => {
      // Replace existing steps with AI-generated steps
      setSteps(generatedSteps);
    };

    return (
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Steps</h2>
            <div className="flex space-x-2">
              {title && description && (
                  <StepGenerator
                      description={description}
                      timeframe={timeframe}
                      onStepsGenerated={handleAIGeneratedSteps}
                  />
              )}
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewStepForm(true)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Add Step</span>
              </motion.button>
            </div>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
                <motion.div
                    key={step.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium">{step.title}</h3>
                    <div className="flex items-center mt-2 space-x-3 text-sm text-gray-500">
                      <span>{step.deadline}</span>
                      {step.mandatory && (
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                    Required
                  </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                        onClick={() => moveStep(step.id, 'up')}
                        className="p-2 hover:bg-blue-100 rounded-full"
                        disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        onClick={() => moveStep(step.id, 'down')}
                        className="p-2 hover:bg-blue-100 rounded-full"
                        disabled={index === steps.length - 1}
                    >
                      <ArrowDown className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        onClick={() => deleteStep(step.id)}
                        className="p-2 hover:bg-red-100 rounded-full"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
    );
  };

  const CalendarPicker = ({ isMobile }) => {
    const daysInMonth = 31; // Simplified for example
    const daySize = isMobile ? 40 : 32;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white rounded-xl shadow-lg ${isMobile ? 'fixed inset-0 z-50' : ''}`}
        >
          <div className="bg-black text-white p-4 flex justify-between items-center">
            {isMobile && (
                <button onClick={() => setShowCalendar(false)} className="text-white">
                  <X className="w-6 h-6" />
                </button>
            )}
            <div>
              <p className="text-xs opacity-80">2024</p>
              <p className="text-lg">January</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-1 hover:bg-white/10 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-center text-xs text-gray-500 font-medium">
                    {day}
                  </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: daysInMonth }, (_, i) => (
                  <motion.button
                      key={i}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                  flex items-center justify-center
                  ${isMobile ? 'h-10 w-10' : 'h-8 w-8'}
                  rounded-full text-sm
                  ${selectedDate.getDate() === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                `}
                      onClick={() => {
                        setSelectedDate(new Date(2024, 0, i + 1));
                        if (isMobile) setShowCalendar(false);
                      }}
                  >
                    {i + 1}
                  </motion.button>
              ))}
            </div>
          </div>

          {isMobile && (
              <div className="p-4 border-t">
                <button
                    onClick={() => setShowCalendar(false)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                >
                  Confirm Date
                </button>
              </div>
          )}
        </motion.div>
    );
  };


  // Render the Main Component
  return (
      <div className=" bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="flex items-center py-6 border-b border-gray-200 bg-white">
            <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} />
            </button>


            <h1 className="flex-1 text-center text-2xl font-semibold">New Task</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Save className="w-6 h-6" />
            </button>
          </header>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-8 bg-white rounded-xl p-6 shadow-sm">
              {/* Timeframe Selection */}
              <div className="flex space-x-4 mb-6">
                {['today', 'this week', 'long term'].map((option) => (
                    <motion.button
                        key={option}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTimeframe(option)}
                        className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  ${timeframe === option
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </motion.button>
                ))}
              </div>

              {/* Title & Description */}
              <div className="space-y-6 mb-8">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What do you want to achieve?"
                  />
                  {aiTypingSuggestion && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 mt-8">
                        {aiTypingSuggestion}
                      </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setShowRequiredField(false);
                      }}
                      className={`
                  w-full px-4 py-3 rounded-lg border 
                  ${showRequiredField ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200'} 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32
                `}
                      placeholder="Describe your task (required)"
                  />
                  {showRequiredField && (
                      <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 text-sm text-red-600"
                      >
                        Please provide at least a brief description
                      </motion.p>
                  )}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <button
                    onClick={() => setShowCalendar(true)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              <span>{selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}</span>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Steps Section */}
              <StepsSection />
            </div>

            {/* Right Column - AI Suggestions & Calendar */}
            <div className="lg:col-span-4 space-y-6">
              {!isMobile && <CalendarPicker isMobile={false} />}

              {/* AI Insights */}
              <AnimatePresence>
                {title && description && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
                    >
                      <div className="flex items-center mb-4">
                        <Brain className="w-6 h-6 text-blue-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-800">AI Insights</h2>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Based on your task description, here are some insights:
                        </p>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-2 text-sm">
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            <span>This task typically takes 3-5 days to complete</span>
                          </li>
                          <li className="flex items-center space-x-2 text-sm">
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            <span>Consider breaking it into smaller milestones</span>
                          </li>
                          <li className="flex items-center space-x-2 text-sm">
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            <span>Similar tasks often require team collaboration</span>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Calendar Modal */}
        <AnimatePresence>
          {showCalendar && isMobile && (
              <motion.div


                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
                  onClick={() => setShowCalendar(false)}
              >
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm mx-4"
                >
                  <CalendarPicker isMobile={true} />
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.button
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!description.trim()) {
                setShowRequiredField(true);
                return;
              }
              // Handle save logic here
            }}
        >
          <Check className="w-6 h-6" />
        </motion.button>

        {/* Required Field Popup */}
        <AnimatePresence>
          {showRequiredField && (
              <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-800 px-6 py-3 rounded-lg shadow-lg"
              >
                Please fill in the required description field
              </motion.div>
          )}
        </AnimatePresence>

        {/* AI Typing Suggestion Tooltip */}
        <AnimatePresence>
          {aiTypingSuggestion && (
              <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-4 right-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">AI is suggesting completion...</span>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions Menu */}
        <div className="fixed bottom-24 right-6 space-y-3">
          <AnimatePresence>
            {title && description && (
                <motion.button
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <Brain className="w-6 h-6 text-blue-600" />
                </motion.button>
            )}
          </AnimatePresence>
          <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>
      </div>
  );
};

export default FeedPage;