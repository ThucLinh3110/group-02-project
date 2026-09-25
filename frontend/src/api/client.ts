import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const role = localStorage.getItem('user_role') || 'EMPLOYEE';
    config.headers['X-Role'] = role;
    return config;
});

// For multipart/form-data
export const uploadClient = axios.create({
    baseURL: API_URL,
});

uploadClient.interceptors.request.use((config) => {
    const role = localStorage.getItem('user_role') || 'EMPLOYEE';
    config.headers['X-Role'] = role;
    return config;
});
