import { create } from 'zustand';

// Helper to decode JWT payload safely
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: localStorage.getItem('token') ? decodeJwt(localStorage.getItem('token')) : null,
  
  login: (token) => {
    localStorage.setItem('token', token);
    const userPayload = decodeJwt(token);
    set({ token, user: userPayload });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  }
}));
