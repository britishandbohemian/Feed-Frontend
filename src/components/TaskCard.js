import React, { useState } from 'react';
import { Clock, MoreHorizontal, Circle, ChevronDown, ChevronUp, AlertCircle, Edit } from 'lucide-react';


const TaskCard = ({ task, onToggle, onDelete, onClick, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { title, description, steps = [], dueDate, completed } = task;

    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString))) return 'No due date';
        return new Date(dateString).toLocaleDateString();
    };

    const isOverdue = (date) => date && new Date(date) < new Date();

    return (
        <div
            className={`task-card ${isOverdue(dueDate) ? 'overdue' : ''}`}
            onClick={onClick}
        >
            <div className="card-header">
                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggle?.(task, e.target.checked);
                        }}
                    />
                </div>

                <div className="task-main">
                    <div className="task-header">
                        <h3 className={`task-title ${completed ? 'completed' : ''}`}>
                            {title || 'Untitled Task'}
                            {isOverdue(dueDate) && !completed && <AlertCircle className="alert-icon" />}
                        </h3>
                        {steps.length > 0 && (
                            <button
                                className="expand-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                            >
                                {isExpanded ? <ChevronUp /> : <ChevronDown />}
                            </button>
                        )}
                    </div>

                    {description && <p className="task-description">{description}</p>}

                    <div className={`steps-container ${isExpanded ? 'expanded' : ''}`}>
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="step-item"
                                style={{ transitionDelay: `${index * 0.1}s` }}
                            >
                                <Circle className={`step-icon ${step.mandatory ? 'mandatory' : ''}`} />
                                <span className="step-title">{step.title || 'Untitled Step'}</span>
                                {step.mandatory && <span className="mandatory-badge">Required</span>}
                                {step.deadline && <span className="step-deadline">Due: {formatDate(step.deadline)}</span>}
                            </div>
                        ))}
                    </div>

                    <div className="due-date">
                        <Clock className={`due-icon ${isOverdue(dueDate) ? 'overdue' : ''}`} />
                        <span>{formatDate(dueDate)}</span>
                    </div>
                </div>

                <div className="task-actions">
                    <button
                        className="edit-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(task);
                        }}
                    >
                        <Edit />
                    </button>
                    <button
                        className="delete-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(task);
                        }}
                    >
                        <MoreHorizontal />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;