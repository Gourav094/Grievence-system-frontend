
import axios from 'axios';
import Cookies from 'js-cookie';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authApi = {
  login: async (email: string, password: string, role?: any) => {
    try {
      console.log('Login API called with email:', email, 'and password:', password, role);
      
      const response = await api.post('/api/auth/login', { email, password, role });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/register', { username, email, password });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
};

// Grievance APIs
export const grievanceApi = {
  getAllGrievances: async (username) => {
    try {
      const response = await api.get(`/api/forum/grievances/filter?status=open&createdBy=${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grievances:', error);
      throw error;
    }
  },
  
  getGrievanceById: async (id: string) => {
    try {
      const response = await api.get(`/api/forum/grievances/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching grievance ${id}:`, error);
      throw error;
    }
  },
  
  createGrievance: async (grievanceData: any) => {
    try {
      const response = await api.post('/api/forum/grievances', grievanceData);
      return response.data;
    } catch (error) {
      console.error('Error creating grievance:', error);
      throw error;
    }
  },
  
  addComment: async (commentData: any) => {
    try {
      const response = await api.post('/api/forum/add-comment', commentData);
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
  
  searchGrievances: async (query: string) => {
    try {
      const response = await api.get(`/api/forum/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching grievances:', error);
      throw error;
    }
  },
  
  getSortedGrievances: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/api/forum/grievances/sorted?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sorted grievances:', error);
      throw error;
    }
  },
  
  filterGrievances: async (filters: { status?: string; createdBy?: string; assignedTo?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);
    if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
    
    try {
      const response = await api.get(`/api/forum/grievances/filter?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error filtering grievances:', error);
      throw error;
    }
  },
};

// Admin APIs
export const adminApi = {
  getAllUsers: async () => {
    try {
      const response = await api.post('/api/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
};

export default api;
