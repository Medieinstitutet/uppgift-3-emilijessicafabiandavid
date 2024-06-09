import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface AuthContextType {
  userId: string | null;
  stripeId: string | null;
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
  const [stripeId, setStripeId] = useState<string | null>(localStorage.getItem('stripeId'));

  useEffect(() => {
    console.log('Saving to localStorage:');
    console.log('userId:', userId);
    console.log('stripeId:', stripeId);

    localStorage.setItem('userId', userId || '');
    localStorage.setItem('stripeId', stripeId || '');
  }, [userId, stripeId]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/login', { email, password });
      const { _id, stripeId } = response.data;
      console.log('Login response data:', response.data);

      setUserId(_id);
      setStripeId(stripeId);
      console.log('User ID:', _id);
      console.log('Stripe ID:', stripeId);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, selectedProduct: any) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/register', { email, password, firstName, lastName, selectedProduct });
      const { _id, stripeId } = response.data;
      console.log('Register response data:', response.data);

      setUserId(_id);
      setStripeId(stripeId);
      console.log('User ID:', _id);
      console.log('Stripe ID:', stripeId);
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  const logout = () => {
    setUserId(null);
    setStripeId(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('stripeId');
  };

  return (
    <AuthContext.Provider value={{ userId, stripeId, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};



// import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// import { logoutUser } from '../services/api'; // Adjust the import path as necessary
// import { useNavigate } from 'react-router-dom';

// interface IAuthContext {
//   isAuthenticated: boolean;
//   userId: string | null;
//   login: (id: string) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<IAuthContext | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUserId = sessionStorage.getItem('userId');
//     if (storedUserId) {
//       setUserId(storedUserId);
//       setIsAuthenticated(true);
//     }
//   }, []);

//   const login = (id: string) => {
//     console.log('Setting user ID:', id);
//     setUserId(id);
//     setIsAuthenticated(true);
//     sessionStorage.setItem('userId', id);
//   };

//   const logout = async () => {
//     try {
//       const response = await logoutUser();

//       if (response.status === 200) {
//         setIsAuthenticated(false);
//         setUserId(null);
//         sessionStorage.removeItem('userId');
//         console.log('User logged out');
//         navigate("/");
//       } else {
//         console.error('Logout failed with status:', response.status);
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };






// import { createContext, useContext, useState, ReactNode } from 'react';
// import { logoutUser } from '../services/api';
// import { useNavigate } from 'react-router-dom';

// interface IAuthContext {
//   isAuthenticated: boolean;
//   login: () => void;
//   logout: () => void;
// }

// const AuthContext = createContext<IAuthContext | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const navigate = useNavigate();


//   const login = () => {
//     setIsAuthenticated(true);
//   };

//   const logout = async () => {
//     try {
//       const response = await logoutUser();

//       if (response.status === 200) {
//         setIsAuthenticated(false);
//         console.log('User logged out');
//         navigate("/");

//       } else {
//         console.error('Logout failed with status:', response.status);
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };
  

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
