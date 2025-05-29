import api from './api';

export const chatService = {
  // AI Chatbot
  sendMessageToAI: async (message, context = {}) => {
    try {
      const response = await api.post('/ai/chat', {
        message,
        context
      });
      return response.data;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },

  // Popüler konuları getir
  getPopularTopics: async () => {
    try {
      const response = await api.get('/ai/popular-topics');
      return response.data.topics;
    } catch (error) {
      console.error('Popular topics error:', error);
      throw error;
    }
  },

  // Konuşma listesi
  getConversations: async (type = null, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (type) params.append('type', type);
      
      const response = await api.get(`/conversations?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  },

  // Konuşma başlat
  startConversation: async (participantId, type, options = {}) => {
    try {
      const response = await api.post('/conversations/start', {
        participantId,
        type,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('Start conversation error:', error);
      throw error;
    }
  },

  // Konuşma mesajlarını getir
  getMessages: async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },

  // Mesaj gönder
  sendMessage: async (conversationId, content, messageType = 'text', options = {}) => {
    try {
      const response = await api.post('/messages', {
        conversationId,
        content,
        messageType,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Mesajı düzenle
  editMessage: async (messageId, content) => {
    try {
      const response = await api.patch(`/messages/${messageId}`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Edit message error:', error);
      throw error;
    }
  },

  // Mesajı sil
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  },

  // Mesajları okundu olarak işaretle
  markMessagesAsRead: async (conversationId) => {
    try {
      const response = await api.patch(`/messages/conversation/${conversationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }
}; 