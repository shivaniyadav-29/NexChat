import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// AUTH
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getAllUsers = () => API.get('/auth/users');

// ROOMS
export const getRooms = () => API.get('/rooms');
export const createRoom = (data) => API.post('/rooms', data);
export const joinRoom = (id) => API.put(`/rooms/${id}/join`);
export const leaveRoom = (id) => API.put(`/rooms/${id}/leave`);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

// MESSAGES
export const getRoomMessages = (roomId) => API.get(`/messages/room/${roomId}`);
export const getPrivateMessages = (userId) => API.get(`/messages/private/${userId}`);
export const sendMessage = (data) => API.post('/messages', data);
export const deleteMessage = (id) => API.delete(`/messages/${id}`);

export const uploadFile = (formData) => API.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
