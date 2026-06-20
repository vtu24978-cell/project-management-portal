import api from './api';

const sendMessage = async (message) => {
  const response = await api.post('/chatbot', { message });
  return response.data;
};

const chatbotService = {
  sendMessage
};

export default chatbotService;
