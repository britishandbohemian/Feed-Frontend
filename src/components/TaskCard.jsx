// src/components/TaskCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MoreHorizontal, Circle, ChevronDown, ChevronUp } from 'lucide-react';

const TaskCard = ({ task, onToggle, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { _id, title, description, steps = [], dueDate, completed } = task;

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const day = date.getDate();
    const getDateSuffix = (d) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    const suffix = getDateSuffix(day);
    const month = date.toLocaleString('default', { month: 'long' });
    return `${day}${suffix} ${month}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-violet-500/50 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="mt-1">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => onToggle?.(task, e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 checked:bg-violet-600 
                        transition-colors duration-200 cursor-pointer"
            />
          </div>
          
          <div className="flex-1">
            <div 
              className="cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${completed ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                  {title}
                </h3>
                {steps.length > 0 && (
                  <button className="p-1 hover:bg-zinc-800 rounded-full">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    )}
                  </button>
                )}
              </div>
              
              {description && (
                <p className="text-sm text-zinc-500 mt-1">{description}</p>
              )}
            </div>

            <AnimatePresence>
              {isExpanded && steps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-zinc-400"
                    >
                      <Circle className="w-3 h-3" />
                      <span className="text-sm">{step.title}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 mt-3 text-zinc-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatDate(dueDate)}</span>
              </div>
              {steps.length > 0 && (
                <span className="text-sm">
                  {steps.length} step{steps.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            className="p-1 hover:bg-zinc-800 rounded-full"
            onClick={() => onDelete?.(task)}
          >
            <MoreHorizontal className="h-5 w-5 text-zinc-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;