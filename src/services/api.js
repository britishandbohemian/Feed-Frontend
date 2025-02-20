import axios from 'axios';

const API_BASE_URL = 'https://orange-parakeet-wg447765vj6h5qp7-5000.app.github.dev';

// ✅ Function to get the auth token
const getAuthToken = () => localStorage.getItem('token');

// ✅ Create Axios instance (No token attached by default)
const apiClient = axios.create({ baseURL: API_BASE_URL });

// ✅ List of public routes that do NOT require a token
const publicRoutes = ['/users/register', '/users/login', '/users/verify-otp', '/users/send-otp'];

// ✅ Attach token ONLY for protected routes
apiClient.interceptors.request.use(
    (config) => {
        // Check if the request is to a public route (use `some()` for flexible checking)
        const isPublicRoute = publicRoutes.some(route => config.url.includes(route));

        if (!isPublicRoute) {
            const token = getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Handle unauthorized (401) responses
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized, clearing session...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (!['/login', '/signup', '/verify-otp'].includes(window.location.pathname)) {
                window.location.href = "/login"; // Redirect to login
            }
        }
        return Promise.reject(error);
    }
);

// ✅ PUBLIC ROUTES (No Token Needed)
export const registerUser = async (userData) => apiClient.post('/users/register', userData);
export const loginUser = async (credentials) => {
    const response = await apiClient.post('/users/login', credentials);
    if (response.data?.token) {
        localStorage.setItem('token', response.data.token); // ✅ Save token after login
        localStorage.setItem('user', JSON.stringify(response.data.user)); // ✅ Save user info
    }
    return response;
};

export const verifyEmailOtp = async (otpData) => {
    const response = await apiClient.post('/users/verify-otp', otpData);
    if (response.data?.token) {
        localStorage.setItem('token', response.data.token); // ✅ Save token after OTP verification
        localStorage.setItem('user', JSON.stringify(response.data.user)); // ✅ Save user info
    }
    return response;
};

export const sendEmailOtp = async (emailData) => apiClient.post('/users/send-otp', emailData);

// ✅ PROTECTED ROUTES (Token Required)
export const logoutUser = async () => {
    try {
        const token = getAuthToken();
        if (!token) return; // ✅ Skip request if already logged out

        await apiClient.post('/users/logout');
    } catch (error) {
        console.warn("Logout failed, clearing session.");
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = "/login";
    }
};

// ✅ PROTECTED USER ROUTES
export const fetchUsers = async () => apiClient.get('/users');
export const getUserById = async (id) => apiClient.get(`/users/${id}`);
export const updateUser = async (id, data) => apiClient.put(`/users/${id}`, data);
export const deleteUser = async (id) => apiClient.delete(`/users/${id}`);

// ✅ PROTECTED TASK ROUTES
export const fetchTasks = async () => apiClient.get('/tasks');
export const createTask = async (taskData) => {
    const token = localStorage.getItem('token'); // ✅ Get auth token

    return apiClient.post('/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Attach token for auth
    });
};


export const updateTask = async (taskId, taskData) => apiClient.put(`/tasks/${taskId}`, taskData);
export const deleteTask = async (taskId) => apiClient.delete(`/tasks/${taskId}`);
