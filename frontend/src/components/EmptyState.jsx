import React from 'react';
import { Plus, CheckSquare, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ isFiltered = false, onClearFilters, userHasNoTasks = false }) => {
  return (
    <div
      className="glass animate-fade-in"
      style={{
        padding: '50px 30px',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '40px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}
    >
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-color)',
        marginBottom: '10px'
      }}>
        <CheckSquare size={36} />
      </div>

      <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
        {userHasNoTasks ? 'No Tasks Created Yet' : 'No Matching Tasks Found'}
      </h3>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
        lineHeight: '1.6',
        maxWidth: '350px'
      }}>
        {userHasNoTasks
          ? 'Get started by creating your very first task to track progress and complete your projects!'
          : 'We couldn\'t find any tasks matching your current filters, search terms, or page configurations.'}
      </p>

      {userHasNoTasks ? (
        <Link to="/add-task" className="btn btn-primary" style={{ marginTop: '10px' }}>
          <Plus size={18} />
          Create First Task
        </Link>
      ) : isFiltered ? (
        <button
          onClick={onClearFilters}
          className="btn btn-secondary"
          style={{ marginTop: '10px', display: 'inline-flex', gap: '8px' }}
        >
          <RefreshCw size={16} />
          Reset Filters
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;
