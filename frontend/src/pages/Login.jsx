import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, Lock, LogIn, CheckSquare } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, go to dashboard
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 70px)', // adjust for navbar height if present
      padding: '20px',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 40%)'
    }}>
      <div
        className="glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 30px',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)'
        }}
      >
        {/* Brand Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '35px'
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
            Welcome Back
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            Sign in to manage your tasks efficiently
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
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
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Redirect to Register */}
        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
