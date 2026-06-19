import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { User, Mail, Lock, UserPlus, CheckSquare } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authService.register(username, email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) {
        // Map Sequelize validation errors if any
        const apiErrors = {};
        err.response.data.errors.forEach((e) => {
          apiErrors[e.field] = e.message;
        });
        setValidationErrors(apiErrors);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 70px)',
      padding: '20px',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 40%)'
    }}>
      <div
        className="glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 30px',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)'
        }}
      >
        {/* Brand Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            color: '#ffffff',
            marginBottom: '15px',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <CheckSquare size={28} />
          </div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: '8px',
            fontFamily: 'var(--font-heading)'
          }}>
            Create Account
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            Get started with TaskFlow today
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <User size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)'
              }} />
            </div>
            {validationErrors.username && (
              <span className="form-error">{validationErrors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <Mail size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)'
              }} />
            </div>
            {validationErrors.email && (
              <span className="form-error">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <Lock size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)'
              }} />
            </div>
            {validationErrors.password && (
              <span className="form-error">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <Lock size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)'
              }} />
            </div>
            {validationErrors.confirmPassword && (
              <span className="form-error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '14px',
              fontSize: '1rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? (
              <span className="animate-pulse">Creating Account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* Redirect to Login */}
        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
