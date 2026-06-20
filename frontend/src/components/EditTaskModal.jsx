import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, User, Mail } from 'lucide-react';
import taskService from '../services/taskService';

const EditTaskModal = ({ task, isOpen, onClose, onUpdateSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'Pending');
      setDueDate(task.dueDate || '');
      setAssigneeName(task.assigneeName || '');
      setAssigneeEmail(task.assigneeEmail || '');
      setError('');
      setErrors({});
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

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
      await taskService.updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: dueDate || null,
        assigneeName: assigneeName.trim() || null,
        assigneeEmail: assigneeEmail.trim() || null
      });
      onUpdateSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrs = {};
        err.response.data.errors.forEach((e) => {
          backendErrs[e.field] = e.message;
        });
        setErrors(backendErrs);
      } else {
        setError(err.response?.data?.message || 'Failed to update task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '600px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            padding: '20px 25px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Edit Task</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>ID: {task.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '50%',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '25px', backgroundColor: 'var(--bg-primary)' }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="edit-title">Task Title</label>
            <input
              id="edit-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* Status Option */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {errors.status && <span className="form-error">{errors.status}</span>}
            </div>

            {/* Due Date Option */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="edit-due-date">Due Date (Optional)</label>
              <input
                id="edit-due-date"
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="edit-description">
              Description{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                ({description.length} / min 20 characters)
              </span>
            </label>
            <textarea
              id="edit-description"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{ resize: 'vertical', lineHeight: '1.6' }}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Assignee Section */}
          <div style={{
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
            backgroundColor: 'rgba(99, 102, 241, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--accent-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Mail size={13} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Assignee / Notification</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Update recipient details for this task.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Assignee Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="edit-assignee-name">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={12} /> Assignee Name
                  </span>
                </label>
                <input
                  id="edit-assignee-name"
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
                <label className="form-label" htmlFor="edit-assignee-email">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={12} /> Assignee Email
                  </span>
                </label>
                <input
                  id="edit-assignee-email"
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

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '10px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '110px' }}
            >
              {loading ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
