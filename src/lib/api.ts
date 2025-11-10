import axios from 'axios';
import { getApiBaseURL } from './env';
import { authStorage } from './auth';

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies, authorization headers with HTTPS
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Prefer the canonical authStorage token (cookie/session) if available,
    // fall back to legacy localStorage.sessionToken if present.
    let token = '';
    try {
      const stored = authStorage.getUser();
      token = stored?.token || '';
    } catch (e) {
      // ignore
    }
    if (!token) token = localStorage.getItem('sessionToken') || '';
    if (token) {
      // headers may be an AxiosHeaders instance; use a cast to assign safely
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Only redirect to /signin for 401 if NOT a login attempt and user has a session
    const isLoginRequest = originalRequest?.url?.includes('/signin') || originalRequest?.url?.includes('/login');
    const hasSession = !!localStorage.getItem('sessionToken');
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest && hasSession) {
      // Mark as retried to avoid loops
      originalRequest._retry = true;
      // Clear the local session token (legacy fallback). The app's AuthProvider
      // should observe the lack of a valid session (via cookies/server) and
      // perform any necessary navigation. Avoid forcing a hard redirect here
      // because background requests (e.g. when the user is on another tab)
      // should not unexpectedly navigate the current page.
      try {
        localStorage.removeItem('sessionToken');
      } catch (e) {
        // ignore storage errors
      }

      // Dispatch a custom event so application-level code can react and
      // perform navigation or show UI. This is safer than forcing
      // window.location.href from a low-level library file.
      try {
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: '401' } }));
      } catch (e) {
        // fallback: log the occurrence
        // eslint-disable-next-line no-console
        console.warn('[api] auth:logout dispatch failed');
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  login: '/api/auth/signin',
  register: '/api/auth/signup',
  logout: '/api/auth/signout',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
  verifyOTP: '/api/auth/verify-otp',

  // User
  profile: '/api/profile',
  changePassword: '/api/profile/change-password',

  // Products
  products: '/api/products',
  featuredProducts: '/api/products/featured',

  // Cart
  cart: '/api/cart',
  
  // Orders
  orders: '/api/orders',
  orderTracking: (id: string) => `/api/orders/${id}/tracking`,

  // Favorites
  favorites: '/api/favorites',

  // Courses
  courses: '/api/courses',
  
  // Testimonials
  testimonials: '/api/testimonials',

  // Blog
  blog: '/api/blog',

  // Others
  coupons: '/api/coupons/validate',
  deliveryOptions: '/api/delivery-options',
};

export default api;
