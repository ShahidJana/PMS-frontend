import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL, withCredentials: true });

// Flags to manage token refresh and avoid loops
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = () => {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Normalize path for robust checking
            const path = window.location.pathname.toLowerCase().replace(/\/$/, "") || "/";
            const authPages = ['/login', '/register', '/forgot'];
            const isAuthPage = authPages.includes(path);

            // If we are already on an auth page, just clear and reject
            if (isAuthPage) {
                localStorage.removeItem('auth_user');
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => {
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh token (refresh token is in HTTP-only cookie)
                // Use fundamental axios to avoid interceptor loop
                const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

                isRefreshing = false;
                if (res.status === 200) {
                    onRefreshed();
                    return api(originalRequest);
                }
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = []; // Clear queue on failure

                console.error('Session expired or refresh failed', refreshError);
                localStorage.removeItem('auth_user');

                // Only redirect if not already on an auth page
                if (!isAuthPage) {
                    // Use a more reliable way to prevent multiple redirects
                    window.location.href = '/login?expired=true';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
