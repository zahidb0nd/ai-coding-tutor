import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth
export const registerUser = (data) => API.post('/api/auth/register', data);
export const loginUser = (data) => API.post('/api/auth/login', data);

// Challenges
export const getChallenges = (params) => API.get('/api/challenges', { params });
export const getChallenge = (id) => API.get(`/api/challenges/${id}`);
export const generateChallenge = (data) => API.post('/api/challenges/generate', data);
export const generateAdvancedChallenge = (data) => API.post('/api/challenges/generate-advanced', data);
export const getHint = (id, data) => API.post(`/api/challenges/${id}/hint`, data);

// Submissions
export const submitCode = (data) => API.post('/api/submissions', data);
export const getSubmissionHistory = () => API.get('/api/submissions/history');
export const getSubmissions = (userId) => API.get(`/api/submissions/${userId}`);

// Users
export const getUserProgress = (userId) => API.get(`/api/users/${userId}/progress`);
export const getLeaderboard = (params) => API.get('/api/users/leaderboard', { params });

// Instructor
export const getInstructorAnalytics = () => API.get('/api/instructor/analytics');
export const createInstructorChallenge = (data) => API.post('/api/instructor/challenges', data);

export default API;
