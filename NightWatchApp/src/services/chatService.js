import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Event listeners
    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });

    this.socket.on('typing', (data) => {
      this.emit('typing', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Chat methods
  sendMessage(data) {
    this.socket.emit('send_message', data);
  }

  markAsRead(data) {
    this.socket.emit('mark_as_read', data);
  }

  sendTyping(data) {
    this.socket.emit('typing', data);
  }
}

export const socketService = new SocketService();

export const chatService = {
  getConversations: async () => {
    const response = await fetch(`${process.env.API_URL}/chat/conversations`);
    return response.json();
  },

  getMessages: async (conversationId) => {
    const response = await fetch(`${process.env.API_URL}/chat/messages/${conversationId}`);
    return response.json();
  },

  createConversation: async (participants) => {
    const response = await fetch(`${process.env.API_URL}/chat/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participants }),
    });
    return response.json();
  },
};