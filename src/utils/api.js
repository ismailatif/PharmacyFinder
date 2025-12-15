import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Fix: Check if validation failed (401) AND it wasn't already a retry AND it wasn't the refresh token call itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh-token')
        ) {
            originalRequest._retry = true;

            try {
                const { data } = await api.post('/auth/refresh-token');
                const newAccessToken = data.accessToken;

                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, reject to let the app handle logout
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    googleLogin: (tokenId) => api.post('/auth/google', { tokenId }),
    forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
    resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
    updateProfile: (name, email) => api.put('/auth/updateprofile', { name, email }),
    updatePassword: (currentPassword, newPassword) => api.put('/auth/updatepassword', { currentPassword, newPassword }),
    getPreferences: () => api.get('/auth/preferences'),
    updatePreferences: (preferences) => api.put('/auth/preferences', preferences),
    toggleSavedPharmacy: (id) => api.put(`/auth/saved-pharmacies/${id}`),
    getSavedPharmacies: () => api.get('/auth/saved-pharmacies')
};

export const medicationApi = {
    getMedication: (code) => api.get(`/medications/${code}`),
    search: (query) => api.get(`/medications/search?q=${query}`)
};

export default api;
