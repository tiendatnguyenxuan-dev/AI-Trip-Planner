import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8090'}/api/auth`;

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  async register(email: string, password: string, name: string): Promise<UserResponse> {
    const response = await axios.post(`${API_URL}/register`, { email, password, name });
    return response.data;
  },
};
