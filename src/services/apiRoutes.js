const API_BASE_URL = process.env.API_BASE_URL || "https://feedapi.vercel.app/api";

const apiRoutes = {
    // Authentication Routes
    auth: {
        register: `${API_BASE_URL}/users/auth/register`,
        login: `${API_BASE_URL}/users/auth/login`,
        logout: `${API_BASE_URL}/users/auth/logout`,
        verifyEmail: `${API_BASE_URL}/users/auth/verify-email`,
        resendOtp: `${API_BASE_URL}/users/auth/resend-otp`,
        requestPasswordReset: `${API_BASE_URL}/users/auth/request-password-reset`,
        resetPassword: `${API_BASE_URL}/users/auth/reset-password`,
    },

    // User Management Routes
    users: {
        getAll: `${API_BASE_URL}/users`,
        getById: (userId) => `${API_BASE_URL}/users/${userId}`,
        update: (userId) => `${API_BASE_URL}/users/${userId}`,
        delete: (userId) => `${API_BASE_URL}/users/${userId}`,
        restore: (userId) => `${API_BASE_URL}/users/${userId}/restore`,
        changeRole: (userId) => `${API_BASE_URL}/users/${userId}/role`,
    },

    // Task Management Routes
    tasks: {
        create: `${API_BASE_URL}/tasks`,
        getAll: `${API_BASE_URL}/tasks`,
        getById: (taskId) => `${API_BASE_URL}/tasks/${taskId}`,
        update: (taskId) => `${API_BASE_URL}/tasks/${taskId}`,
        delete: (taskId) => `${API_BASE_URL}/tasks/${taskId}`,
        getOverdue: `${API_BASE_URL}/tasks/overdue`,
    },
};

export default apiRoutes;
