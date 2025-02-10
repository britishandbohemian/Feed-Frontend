import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks'; // Replace with your backend URL

// Create a new task (protected route)
export const createTask = async (taskData, token) => {
  try {
    const response = await axios.post(API_URL, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get all tasks (protected route)
export const getTasks = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get a single task by ID (protected route)
export const getTaskById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update a task (protected route)
export const updateTask = async (id, taskData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete a task (protected route)
export const deleteTask = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};