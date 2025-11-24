import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.success) {
      const { user, tokens } = response.data;
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      return user;
    }
    throw new Error('Login failed');
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.success) {
      const { user, tokens } = response.data;
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      return user;
    }
    throw new Error('Registration failed');
  },

  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
    }
  }
};
