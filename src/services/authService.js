import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; // Replace with your backend URL

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Verify OTP
export const verifyOtp = async (otpData) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, otpData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Resend OTP
export const resendOtp = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get all users (protected route)
export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get user by ID (protected route)
export const getUserById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update user (protected route)
export const updateUser = async (id, userData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete user (protected route)
export const deleteUser = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};