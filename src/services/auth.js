// src/services/auth.js
import api from './api';

export const signup = async (userData) => {
  try {
    const response = await api.post('/admin/signup', userData);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/admin/signin', credentials);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};