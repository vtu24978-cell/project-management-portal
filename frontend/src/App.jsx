import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import authService from './services/authService';

// Wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Wrapper for auth routes (login/register) to redirect home if already logged in
const AuthRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />

          {/* Protected Main Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-task"
            element={
              <ProtectedRoute>
                <AddTask />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
