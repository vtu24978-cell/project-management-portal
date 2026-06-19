import React from 'react';
import { Calendar, Trash2, CheckCircle2, PlayCircle, Clock } from 'lucide-react';

const TaskCard = ({ task, onStatusChange, onDelete }) => {
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
  );
};

export default TaskCard;
