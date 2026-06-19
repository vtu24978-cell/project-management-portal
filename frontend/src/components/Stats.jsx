import React from 'react';
import { ListTodo, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

const Stats = ({ stats = { total: 0, pending: 0, inProgress: 0, completed: 0 } }) => {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: <ListTodo size={24} />,
      color: 'var(--accent-color)',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Clock size={24} />,
      color: 'var(--color-pending)',
      bgColor: 'var(--color-pending-bg)'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: <PlayCircle size={24} />,
      color: 'var(--color-progress)',
      bgColor: 'var(--color-progress-bg)'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 size={24} />,
      color: 'var(--color-completed)',
      bgColor: 'var(--color-completed-bg)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="glass animate-fade-in"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animationDelay: `${index * 0.1}s`,
            transition: 'transform var(--transition-fast), border-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = card.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
          }}
        >
          <div>
            <span style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {card.title}
            </span>
            <span style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)'
            }}>
              {card.value}
            </span>
          </div>

          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: card.bgColor,
            color: card.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 12px rgba(255, 255, 255, 0.05)'
          }}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
