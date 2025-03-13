import React, { useState } from 'react';
import { Clock, MoreHorizontal, Circle, ChevronDown, ChevronUp, AlertCircle, Edit } from 'lucide-react';

const TaskCard = ({ task, onToggle, onDelete, onClick, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { title, description, steps = [], dueDate, completed } = task;

    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString))) return 'No due date';
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (dateString) => {
        if (!dateString || isNaN(new Date(dateString))) return '';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isOverdue = (date) => date && new Date(date) < new Date();

    return (
        <div className="task-card">
            <div className="task-header">
                <div>
                    <h3 className="task-title">
                        {title || 'Untitled Task'}
                        {isOverdue(dueDate) && !completed && (
                            <AlertCircle className="inline-block ml-2 text-red-400" size={16} />
                        )}
                    </h3>
                    {description && <p className="task-description">{description}</p>}
                    
                    <div className="task-time">
                        <Clock size={14} />
                        <span>{formatTime(dueDate)} - {formatTime(dueDate)}</span>
                    </div>
                </div>
                
                <div className="task-priority">
                    High Priority
                </div>
            </div>
            
            {/* Team Members */}
            <div className="task-members">
                <div className="member-avatars">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="member-avatar">
                            {i}
                        </div>
                    ))}
                </div>
                <div className="member-count">
                    <span>3</span>
                    <span className="ml-1">In team</span>
                </div>
            </div>
            
            {/* Status Badge */}
            <div className="task-status">
                Work In Progress
            </div>

            {steps.length > 0 && (
                <div className="mt-3">
                    <button
                        className="flex items-center text-gray-400 text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp size={14} className="mr-1" /> Hide Steps
                            </>
                        ) : (
                            <>
                                <ChevronDown size={14} className="mr-1" /> Show Steps ({steps.length})
                            </>
                        )}
                    </button>
                    
                    {isExpanded && (
                        <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-700">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex items-start text-sm"
                                >
                                    <Circle className={`mr-2 ${step.mandatory ? 'text-violet-400' : 'text-gray-500'}`} size={14} />
                                    <div>
                                        <span className="text-gray-300">{step.title || 'Untitled Step'}</span>
                                        {step.mandatory && (
                                            <span className="ml-2 text-xs bg-violet-900 text-violet-300 px-1 rounded">Required</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="task-actions">
                <button
                    className="action-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(task);
                    }}
                >
                    <Edit size={16} />
                </button>
                <button
                    className="action-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(task);
                    }}
                >
                    <MoreHorizontal size={16} />
                </button>
            </div>
        </div>
    );
};

export default TaskCard;