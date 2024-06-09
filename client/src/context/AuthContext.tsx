import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface AuthContextType {
  userId: string | null;
  sessionId: string | null; // Rename stripeId to sessionId
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, selectedProduct: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('sessionId'));

  useEffect(() => {
    console.log('Saving to localStorage:');
    console.log('userId:', userId);
    console.log('sessionId:', sessionId);

    localStorage.setItem('userId', userId || '');
    localStorage.setItem('sessionId', sessionId || '');
  }, [userId, sessionId]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/login', { email, password });
      const { _id, sessionId } = response.data;
      console.log('Login response data:', response.data);

      setUserId(_id);
      setSessionId(sessionId);
      console.log('User ID:', _id);
      console.log('Session ID:', sessionId);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, selectedProduct: any) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/register', { email, password, firstName, lastName, selectedProduct });
      const { _id, sessionId } = response.data;
      console.log('Register response data:', response.data);

      setUserId(_id);
      setSessionId(sessionId);
      console.log('User ID:', _id);
      console.log('Session ID:', sessionId);
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  const logout = () => {
    setUserId(null);
    setSessionId(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionId');
  };

  return (
    <AuthContext.Provider value={{ userId, sessionId, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
