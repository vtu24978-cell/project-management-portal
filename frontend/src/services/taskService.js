import api from './api';

const getTasks = async (params = {}) => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

const updateTaskStatus = async (id, status) => {
  const response = await api.put(`/tasks/${id}`, { status });
  return response.data;
};

const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

const taskService = {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask
};

export default taskService;
