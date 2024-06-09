import axios from 'axios';
import { User } from '../models/User';

const API_URL = 'http://localhost:3000';

export const registerUser = (user: User, selectedProduct: any) => {
  return axios.post(`${API_URL}/auth/register`, {
    ...user,
    selectedProduct,
  });
};

export const loginUser = (credentials: { email: string; password: string }) => {
  return axios.post(`${API_URL}/auth/login`, credentials);
};
