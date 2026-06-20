import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import taskService from '../services/taskService';
import { ArrowLeft, Save, PlusCircle, User, Mail } from 'lucide-react';

const AddTask = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const tempErrors = {};
    if (!title.trim()) {
      tempErrors.title = 'Task title is required';
    }
    if (description.trim().length < 20) {
      tempErrors.description = 'Description must be at least 20 characters long';
    }
    if (assigneeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assigneeEmail)) {
      tempErrors.assigneeEmail = 'Please enter a valid email address';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await taskService.createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: dueDate || null,
        assigneeName: assigneeName.trim() || null,
        assigneeEmail: assigneeEmail.trim() || null
      });
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) {
        // Map backend validation errors
        const backendErrs = {};
        err.response.data.errors.forEach((e) => {
          backendErrs[e.field] = e.message;
        });
        setErrors(backendErrs);
      } else {
        setError(err.response?.data?.message || 'Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '40px 0',
      background: 'radial-gradient(circle at top left, rgba(129, 140, 248, 0.05), transparent 45%)',
      minHeight: 'calc(100vh - 70px)'
    }}>
      <div className="container animate-fade-in" style={{ maxWidth: '650px' }}>
        {/* Back Link */}
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '25px',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Card Panel */}
        <div className="glass" style={{
          padding: '40px 30px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '30px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlusCircle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create New Task</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Add details to start tracking this task</p>
            </div>
          </div>

          {/* Error message banner */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">Task Title</label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="e.g. Design Dashboard Prototypes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Status Option */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="status">Initial Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
                {errors.status && <span className="form-error">{errors.status}</span>}
              </div>

              {/* Due Date Option */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="due-date">Due Date (Optional)</label>
                <input
                  id="due-date"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                  ({description.length} / min 20 characters)
                </span>
              </label>
              <textarea
                id="description"
                className="form-input"
                placeholder="Describe what needs to be done. Please write at least 20 characters to fulfill validation rules."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                style={{ resize: 'vertical', lineHeight: '1.6' }}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Assignee Section */}
            <div style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)',
              backgroundColor: 'rgba(99, 102, 241, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--accent-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Mail size={14} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Email Notification (Optional)</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>An email alert will be sent to the assignee when this task is created.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Assignee Name */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="assignee-name">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <User size={13} /> Assignee Name
                    </span>
                  </label>
                  <input
                    id="assignee-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                  />
                  {errors.assigneeName && <span className="form-error">{errors.assigneeName}</span>}
                </div>

                {/* Assignee Email */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="assignee-email">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={13} /> Assignee Email
                    </span>
                  </label>
                  <input
                    id="assignee-email"
                    type="email"
                    className="form-input"
                    placeholder="e.g. john@example.com"
                    value={assigneeEmail}
                    onChange={(e) => setAssigneeEmail(e.target.value)}
                  />
                  {errors.assigneeEmail && <span className="form-error">{errors.assigneeEmail}</span>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '15px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)'
            }}>
              <Link to="/" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: '130px' }}
              >
                {loading ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Save size={18} />
                    Save Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
