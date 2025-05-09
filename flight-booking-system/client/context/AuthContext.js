import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on page load
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/v1/auth/register', userData);
      
      if (res.data.success) {
        setUser(res.data.data);
        router.push('/dashboard');
      }
      
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Something went wrong'
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/v1/auth/login', { email, password });
      
      if (res.data.success) {
        setUser(res.data.data);
        
        // Redirect based on user role
        if (res.data.data.role === 'staff' || res.data.data.role === 'admin') {
          router.push('/staff/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
      
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('/api/v1/auth/logout');
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if user is logged in
  const checkUserLoggedIn = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me');
      
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
