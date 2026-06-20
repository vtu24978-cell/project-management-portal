import api from './api';

const getTasks = async (params = {}) => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

const updateTaskStatus = async (id, status) => {
  return updateTask(id, { status });
};

const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

const taskService = {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};

export default taskService;
