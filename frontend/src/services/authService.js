import api from './api';

const register = async (username, email, password) => {
  const response = await api.post('/auth/register', {
    username,
    email,
    password
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated
};

export default authService;
