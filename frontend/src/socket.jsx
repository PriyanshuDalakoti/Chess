import { io } from "socket.io-client";

// Dynamically determine the WebSocket URL
const getSocketUrl = () => {
  // Check if environment variable is set (from docker-compose)
  const envUrl = import.meta.env.VITE_WEBSOCKET_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback: use current window location
  const host = window.location.hostname;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // Use port 8181 for the backend WebSocket
  return `${protocol}//${host}:8181`;
};

// Initialize socket connection
const socket = io(getSocketUrl(), {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
});

// Add basic logging
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;