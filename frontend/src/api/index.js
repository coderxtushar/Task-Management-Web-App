import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to attach the auth token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.data && error.response.data.msg) {
            const msg = error.response.data.msg;
            // Suppress specific annoying notifications from bubbling up globally
            if (msg !== 'Invalid project ID format') {
                import('react-hot-toast').then(module => {
                    module.default.error(msg);
                });
            }
        }
        return Promise.reject(error);
    }
);

export default API;
