import React from 'react';
import { Calendar, Trash2, CheckCircle2, PlayCircle, Clock, Edit3, AlertCircle, User, Mail } from 'lucide-react';

const TaskCard = ({ task, onStatusChange, onDelete, onEdit }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return {
          color: 'var(--color-pending)',
          bgColor: 'var(--color-pending-bg)',
          icon: <Clock size={14} />
        };
      case 'In Progress':
        return {
          color: 'var(--color-progress)',
          bgColor: 'var(--color-progress-bg)',
          icon: <PlayCircle size={14} />
        };
      case 'Completed':
        return {
          color: 'var(--color-completed)',
          bgColor: 'var(--color-completed-bg)',
          icon: <CheckCircle2 size={14} />
        };
      default:
        return {
          color: 'var(--text-secondary)',
          bgColor: 'var(--bg-tertiary)',
          icon: <Clock size={14} />
        };
    }
  };

  const statusStyle = getStatusStyle(task.status);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDueDateBadge = (dueDateString) => {
    if (!dueDateString) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let text = '';
    let color = '';
    let bgColor = '';
    let isOverdue = false;
    
    if (diffDays < 0) {
      text = `Overdue: ${formatDate(dueDateString)}`;
      color = '#ef4444';
      bgColor = 'rgba(239, 68, 68, 0.1)';
      isOverdue = true;
    } else if (diffDays === 0) {
      text = 'Due: Today';
      color = '#f97316';
      bgColor = 'rgba(249, 115, 22, 0.1)';
    } else if (diffDays === 1) {
      text = 'Due: Tomorrow';
      color = '#eab308';
      bgColor = 'rgba(234, 179, 8, 0.1)';
    } else {
      text = `Due: ${formatDate(dueDateString)}`;
      color = 'var(--text-secondary)';
      bgColor = 'var(--bg-tertiary)';
    }
    
    return { text, color, bgColor, isOverdue };
  };

  return (
    <div
      className="glass animate-fade-in"
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '220px',
        border: '1px solid var(--glass-border)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--card-hover-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
      }}
    >
      <div>
        {/* Header with Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            color: statusStyle.color,
            backgroundColor: statusStyle.bgColor
          }}>
            {statusStyle.icon}
            {task.status}
          </span>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-tertiary)'
          }}>
            <Calendar size={14} />
            {formatDate(task.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          marginBottom: '10px',
          color: 'var(--text-primary)',
          lineHeight: '1.4',
          wordBreak: 'break-word',
          textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
          opacity: task.status === 'Completed' ? 0.6 : 1,
          transition: 'all var(--transition-fast)'
        }}>
          {task.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '20px',
          wordBreak: 'break-word',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          opacity: task.status === 'Completed' ? 0.5 : 0.9,
          transition: 'all var(--transition-fast)'
        }}>
          {task.description}
        </p>

        {/* Due Date Indicator */}
        {task.dueDate && (() => {
          const badge = getDueDateBadge(task.dueDate);
          if (!badge) return null;
          return (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              color: badge.color,
              backgroundColor: badge.bgColor,
              marginBottom: '15px',
              border: badge.isOverdue ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)'
            }}>
              {badge.isOverdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
              {badge.text}
            </div>
          );
        })()}

        {/* Assignee Badge */}
        {task.assigneeEmail && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 500,
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(16, 185, 129, 0.07)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <User size={12} style={{ color: '#10b981', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {task.assigneeName
                ? <><strong style={{ color: 'var(--text-primary)' }}>{task.assigneeName}</strong> &mdash; {task.assigneeEmail}</>
                : task.assigneeEmail
              }
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-color)'
      }}>
        {/* Status Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {task.status !== 'Completed' && (
            <>
              {task.status === 'Pending' && (
                <button
                  onClick={() => onStatusChange(task.id, 'In Progress')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                >
                  Start Task
                </button>
              )}
              <button
                onClick={() => onStatusChange(task.id, 'Completed')}
                className="btn btn-primary btn-sm"
                style={{
                  fontSize: '0.75rem',
                  padding: '6px 10px',
                  background: 'var(--color-completed)',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-completed)'}
              >
                Complete
              </button>
            </>
          )}

          {task.status === 'Completed' && (
            <button
              onClick={() => onStatusChange(task.id, 'Pending')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              Reopen
            </button>
          )}
        </div>

        {/* Right side Actions (Edit & Delete) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Edit Action */}
          <button
            onClick={() => onEdit(task)}
            className="btn btn-secondary btn-sm"
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
            aria-label="Edit Task"
          >
            <Edit3 size={15} />
          </button>

          {/* Delete Action */}
          <button
            onClick={() => onDelete(task.id)}
            className="btn btn-danger btn-sm"
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
            aria-label="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
