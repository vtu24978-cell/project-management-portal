import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Sun, Moon, LogOut, LayoutGrid, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--nav-bg)',
      transition: 'background-color var(--transition-normal)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 800,
          fontSize: '1.3rem',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'var(--font-heading)'
        }}>
          <CheckSquare size={26} stroke="url(#primary-grad)" style={{ color: 'var(--accent-color)' }} />
          TaskFlow
        </Link>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}>
                Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user.username}</strong>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              aria-label="Toggle Theme"
              style={{
                borderRadius: 'var(--radius-full)',
                width: '40px',
                height: '40px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Logout Button */}
            {user && (
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={16} />
                <span className="nav-logout-text">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Fallback SVG gradient definition for the Lucide icon */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <linearGradient id="primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </svg>
    </nav>
  );
};

export default Navbar;
