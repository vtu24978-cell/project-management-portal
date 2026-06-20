import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import taskService from '../services/taskService';
import Stats from '../components/Stats';
import TaskChart from '../components/TaskChart';
import TaskCard from '../components/TaskCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import EditTaskModal from '../components/EditTaskModal';
import { Plus, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' means All
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Task Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setCurrentPage(1); // Reset page on new search
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchVal]);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 6,
        sortBy: sortBy,
        order: sortOrder
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const data = await taskService.getTasks(params);
      setTasks(data.tasks);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Global event listener for chatbot updates
  useEffect(() => {
    const handleTasksUpdated = () => {
      fetchTasks();
    };
    window.addEventListener('tasks-updated', handleTasksUpdated);
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, [fetchTasks]);

  // Handle task status transition
  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskService.updateTaskStatus(id, newStatus);
      // Reload tasks to get updated counts and cards
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status.');
      console.error(err);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        fetchTasks();
      } catch (err) {
        alert('Failed to delete task.');
        console.error(err);
      }
    }
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setSearchVal('');
    setStatusFilter('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setCurrentPage(1);
  };

  const isFiltered = !!(searchVal || statusFilter || sortBy !== 'createdAt' || sortOrder !== 'DESC');

  // Open Edit Task modal
  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  return (
    <div style={{
      padding: '40px 0',
      background: 'radial-gradient(circle at top left, rgba(129, 140, 248, 0.05), transparent 45%)',
      minHeight: 'calc(100vh - 70px)'
    }}>
      <div className="container animate-fade-in">
        {/* Header Block */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '35px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'var(--font-heading)',
              marginBottom: '5px'
            }}>
              Your Workspace
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Track, organize, and execute your project tasks
            </p>
          </div>

          <Link to="/add-task" className="btn btn-primary">
            <Plus size={20} />
            Create Task
          </Link>
        </div>

        {/* Dashboard Statistics & Analytics Charts */}
        <div className="dashboard-stats-layout">
          <Stats stats={stats} />
          <TaskChart stats={stats} />
        </div>

        {/* Control Bar (Search, Status Filter, Sorting) */}
        <div className="glass" style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '30px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '15px',
            alignItems: 'center'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search tasks by title or details..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                style={{ paddingLeft: '44px', width: '100%' }}
              />
              <Search size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)'
              }} />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            paddingTop: '15px',
            borderTop: '1px solid var(--border-color)'
          }}>
            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { name: 'All Tasks', value: '' },
                { name: 'Pending', value: 'Pending' },
                { name: 'In Progress', value: 'In Progress' },
                { name: 'Completed', value: 'Completed' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setCurrentPage(1);
                  }}
                  className={`btn btn-sm ${statusFilter === tab.value ? 'btn-primary' : 'btn-secondary'}`}
                  style={statusFilter === tab.value ? { boxShadow: 'none' } : {}}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'createdAt_DESC') {
                    setSortBy('createdAt');
                    setSortOrder('DESC');
                  } else if (val === 'createdAt_ASC') {
                    setSortBy('createdAt');
                    setSortOrder('ASC');
                  } else if (val === 'dueDate_ASC') {
                    setSortBy('dueDate');
                    setSortOrder('ASC');
                  } else if (val === 'dueDate_DESC') {
                    setSortBy('dueDate');
                    setSortOrder('DESC');
                  }
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  width: '160px',
                  height: '38px',
                  cursor: 'pointer'
                }}
              >
                <option value="createdAt_DESC">Newest Created</option>
                <option value="createdAt_ASC">Oldest Created</option>
                <option value="dueDate_ASC">Soonest Due</option>
                <option value="dueDate_DESC">Furthest Due</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            {error}
          </div>
        )}

        {/* Task Cards Grid */}
        {loading ? (
          <LoadingSkeleton count={3} />
        ) : tasks.length > 0 ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {tasks.map((task) => (
                <div key={task.id}>
                  <TaskCard
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Navigator */}
            {pagination.totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                marginTop: '40px'
              }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', padding: 0 }}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={20} />
                </button>

                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Page <strong style={{ color: 'var(--text-primary)' }}>{currentPage}</strong> of{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{pagination.totalPages}</strong>
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', padding: 0 }}
                  aria-label="Next Page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            isFiltered={isFiltered}
            onClearFilters={handleClearFilters}
            userHasNoTasks={!isFiltered && stats.total === 0}
          />
        )}
      </div>

      {/* Edit Task Modal */}
      {taskToEdit && (
        <EditTaskModal
          task={taskToEdit}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setTaskToEdit(null);
          }}
          onUpdateSuccess={fetchTasks}
        />
      )}
    </div>
  );
};

export default Dashboard;
