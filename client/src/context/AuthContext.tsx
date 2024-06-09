import { createContext, useContext, useState, ReactNode } from "react";
import { logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionId?: string;
  role: string;
  stripeId?: string;
}

interface IAuthContext {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  stripeId: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  return useContext(AuthContext);
};

  const login = (user: User) => {
    setUser(user);
    console.log("User logged in with stripeId:", user.stripeId);
  };

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

      if (response.status === 200) {
        setUser(null);
        console.log("User logged out");
        navigate("/");
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout error:", error);
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        stripeId: user?.stripeId || null,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
