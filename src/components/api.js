// api-config.js
const API_URL = 'http://localhost:5000/api';
const API_KEY = 'AIzaSyAUATOXYxybxiAfTaU-4aoZ2jky2tJXUp4'; // Replace this with your actual API key

// Helper function to create headers with both token and API key
export const createHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to handle API responses
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }

  return response.json();
};

// API request functions
export const fetchTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: createHeaders()
  });

  return handleApiResponse(response);
};

export const fetchTask = async (taskId) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    headers: createHeaders()
  });

  return handleApiResponse(response);
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(taskData)
  });

  return handleApiResponse(response);
};

export const updateTask = async (taskId, taskData) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(taskData)
  });

  return handleApiResponse(response);
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: createHeaders()
  });

  return handleApiResponse(response);
};

export const generateSteps = async (data) => {
  const response = await fetch(`${API_URL}/generate-steps`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(data)
  });

  return handleApiResponse(response);
};