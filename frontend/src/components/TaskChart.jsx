import React from 'react';

const TaskChart = ({ stats = { total: 0, pending: 0, inProgress: 0, completed: 0 } }) => {
  const { total, pending, inProgress, completed } = stats;
  
  // Calculate completion percentage
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // SVG Ring calculation
  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div
      className="glass animate-fade-in"
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '260px'
      }}
    >
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '20px',
        width: '100%',
        textAlign: 'left',
        letterSpacing: '0.3px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '10px'
      }}>
        Completion Progress
      </h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* SVG Progress Ring */}
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg
            height="120"
            width="120"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          >
            {/* Background Track */}
            <circle
              stroke="var(--bg-tertiary)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx="60"
              cy="60"
            />
            {/* Animated Progress Circle */}
            <circle
              stroke={completionRate === 100 ? 'var(--color-completed)' : 'var(--accent-color)'}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 0.8s ease-in-out',
                strokeLinecap: 'round'
              }}
              r={normalizedRadius}
              cx="60"
              cy="60"
            />
          </svg>
          
          {/* Centered Percentage Text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              lineHeight: 1
            }}>
              {completionRate}%
            </span>
            <span style={{
              fontSize: '0.65rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: '4px'
            }}>
              Done
            </span>
          </div>
        </div>

        {/* Legend / Metrics */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-completed)'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {completed} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>tasks</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-progress)'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In Progress</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {inProgress} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>tasks</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-pending)'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {pending} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>tasks</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskChart;
