import React, { useState, useEffect } from 'react';
import StepGenerator from './StepGenerator';
import {
  Check, Brain, Plus,
  Calendar, ChevronLeft, ChevronRight, X, Save,
  ArrowUp, ArrowDown, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../services/api';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCppG9ocImc1e3HBsDeCZJWaL9IDm9wg2Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// StepsSection Component
const StepsSection = ({ title, description, timeframe, steps, setSteps, onStepsConfirmed }) => {
  const handleAIGeneratedSteps = (generatedSteps) => {
    setSteps(generatedSteps);
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

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-100">Steps</h2>
        {title && description && (
          <StepGenerator
            description={description}
            timeframe={timeframe}
            onStepsGenerated={handleAIGeneratedSteps}
          />
        )}
      </div>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-start space-x-4 p-4 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center text-sm font-medium text-violet-400">
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-zinc-100">{step.title}</h3>
              <div className="flex items-center mt-2 space-x-3 text-sm text-zinc-400">
                <span>{step.deadline}</span>
                {step.mandatory && (
                  <span className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full text-xs">
                    Required
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => moveStep(step.id, 'up')}
                className="p-2 hover:bg-zinc-700 rounded-full"
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4 text-violet-400" />
              </button>
              <button
                onClick={() => moveStep(step.id, 'down')}
                className="p-2 hover:bg-zinc-700 rounded-full"
                disabled={index === steps.length - 1}
              >
                <ArrowDown className="w-4 h-4 text-violet-400" />
              </button>
              <button
                onClick={() => deleteStep(step.id)}
                className="p-2 hover:bg-red-600/20 rounded-full"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {steps.length > 0 && (
        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStepsConfirmed}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Check className="w-5 h-5 mr-2" />
            Confirm Steps
          </motion.button>
        </div>
      )}
    </div>
  );
};

// CalendarPicker Component
const CalendarPicker = ({ isMobile, selectedDate, setSelectedDate, setShowCalendar }) => {
  const daysInMonth = 31;
  const daySize = isMobile ? 40 : 32;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-zinc-900 rounded-xl border border-zinc-800 ${isMobile ? 'fixed inset-0 z-50' : ''}`}
    >
      <div className="bg-violet-600 text-white p-4 flex justify-between items-center">
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
            <div key={index} className="text-center text-xs text-zinc-400 font-medium">
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
                ${selectedDate.getDate() === i + 1 ? 'bg-violet-600 text-white' : 'hover:bg-zinc-800 text-zinc-400'}
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
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => setShowCalendar(false)}
            className="w-full py-3 bg-violet-600 text-white rounded-lg font-medium"
          >
            Confirm Date
          </button>
        </div>
      )}
    </motion.div>
  );
};

// FeedPage Component
const FeedPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRequiredField, setShowRequiredField] = useState(false);
  const [steps, setSteps] = useState([]);
  const [aiTypingSuggestion, setAiTypingSuggestion] = useState('');
  const [stepsConfirmed, setStepsConfirmed] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const generateAIInsights = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Given the task titled "${title}" with description "${description}", and the following steps: ${steps.map(s => s.title).join(', ')}, provide 3 concise recommendations to help achieve this goal effectively. Format each recommendation as a short sentence without numbering.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const insights = text.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, ''));
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiInsights(['Failed to generate insights. Please try again.']);
    }
  };

  const cleanupDescription = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Rewrite the following description to make it more descriptive and professional: "${description}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setDescription(text);
    } catch (error) {
      console.error('Error cleaning up description:', error);
    }
  };

  const handleStepsConfirmed = async () => {
    setStepsConfirmed(true);
    await generateAIInsights();

    // Save task and navigate home
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      console.error("User not found, unable to create task");
      return;
    }

    const formattedSteps = steps.map(({ title, deadline, mandatory }) => ({
      title: title.trim(),
      deadline: deadline.trim() || "N/A",
      mandatory,
    }));

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      dueDate: selectedDate.toISOString(),
      steps: formattedSteps,
      owner: user.id,
    };

    try {
      const response = await createTask(taskData);
      if (response?.data?.success) {
        console.log('Task created successfully:', response.data);
        navigate('/home');
      } else {
        console.error('Error creating task:', response.data?.message);
      }
    } catch (error) {
      console.error('Error:', error?.response?.data?.message || error.message);
    }
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-['Poppins']">
      {/* Full Width Header */}
      <header className="w-full flex items-center py-6 border-b border-zinc-800 bg-zinc-900 px-4 sm:px-6 lg:px-8">
        <button onClick={goBack} className="p-2 hover:bg-zinc-800 rounded-full">
          <ChevronLeft size={24} className="text-zinc-400" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-semibold text-zinc-100">New Task</h1>
        <button
          onClick={cleanupDescription}
          className="p-2 hover:bg-zinc-800 rounded-full"
        >
          <Brain className="w-6 h-6 text-violet-400" />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            {/* Title & Description */}
            <div className="space-y-6 mb-8">
              <div className="relative">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="What do you want to achieve?"
                />
                {aiTypingSuggestion && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400 mt-8">
                    {aiTypingSuggestion}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setShowRequiredField(false);
                  }}
                  className={`
                  w-full px-4 py-3 rounded-lg border 
                  ${showRequiredField ? 'border-red-400 ring-1 ring-red-400' : 'border-zinc-800'} 
                  bg-zinc-950 text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent h-32
                `}
                  placeholder="Describe your task (required)"
                />
                {showRequiredField && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-red-400"
                  >
                    Please provide at least a brief description
                  </motion.p>
                )}
              </div>
            </div>

            {/* Steps Section */}
            <StepsSection
              title={title}
              description={description}
              timeframe={timeframe}
              steps={steps}
              setSteps={setSteps}
              onStepsConfirmed={handleStepsConfirmed}
            />
          </div>

          {/* Right Column - AI Suggestions & Calendar */}
          <div className="lg:col-span-4 space-y-6">
            {!isMobile && (
              <CalendarPicker
                isMobile={false}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                setShowCalendar={setShowCalendar}
              />
            )}

            {/* AI Insights */}
            <AnimatePresence>
              {stepsConfirmed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"
                >
                  <div className="flex items-center mb-4">
                    <Brain className="w-6 h-6 text-violet-400 mr-2" />
                    <h2 className="text-lg font-semibold text-zinc-100">AI Insights</h2>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                      Based on your task and confirmed steps, here are our recommendations:
                    </p>
                    <ul className="space-y-3">
                      {aiInsights.map((insight, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <span className="w-2 h-2 bg-violet-400 rounded-full" />
                          <span className="text-zinc-400">{insight.replace(/\*/g, '').trim()}</span>
                        </li>
                      ))}
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
              <CalendarPicker
                isMobile={true}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                setShowCalendar={setShowCalendar}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 bg-violet-600 text-white p-4 rounded-full shadow-lg hover:bg-violet-500 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStepsConfirmed}
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
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600/20 border border-red-600 text-red-400 px-6 py-3 rounded-lg shadow-lg"
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
            className="fixed top-4 right-4 bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span className="text-sm">AI is suggesting completion...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPage;