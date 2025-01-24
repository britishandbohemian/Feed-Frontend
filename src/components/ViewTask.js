import React, { useState } from 'react';
import { ChevronLeft, Pencil, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import {  useNavigate } from 'react-router-dom';

const ViewTask = () => {
  const navigate = useNavigate();
  
  const [task] = useState({
    id: 1,
    title: 'Computer Science',
    daysLeft: 10,
    status: 'Start',
    description: 'Complete the first part of the assignment',
    progress: 70,
    steps: [
      {
        id: 1,
        name: 'Research Phase',
        dueDate: '1 day From Now',
        status: 'pending'
      },
      {
        id: 2,
        name: 'Initial Draft',
        dueDate: 'Completed',
        status: 'completed'
      }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-['Milonga'] text-xl">feed</h1>
            <div className="px-4 py-2 bg-black text-white rounded-full">
              Important
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
        >
          {/* Task Header */}
          <div className="relative h-64 bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-90" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
                  <p className="text-white opacity-90">{task.description}</p>
                </div>
                <button 
                  className="p-3 bg-black bg-opacity-30 rounded-full text-white hover:bg-opacity-40 transition-colors"
                >
                  <Pencil size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Progress</span>
                <span className="text-sm font-medium">{task.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-800"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {task.steps.map((step) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{step.name}</h3>
                    <p className="text-sm text-gray-600">Due {step.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {step.status === 'completed' ? (
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <Check className="text-white" size={20} />
                      </div>
                    ) : (
                      <button className="w-10 h-10 border-2 border-black rounded-full hover:bg-gray-100 transition-colors">
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ViewTask;