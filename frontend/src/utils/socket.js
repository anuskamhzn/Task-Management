// src/utils/socket.js
import { io } from 'socket.io-client';

let socket;

export const initSocket = (token) => {
  if (!socket) {
    socket = io(process.env.REACT_APP_API, {
      auth: { token }, // Pass the auth token for backend authentication
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};