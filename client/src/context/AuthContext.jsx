import { createContext, useState, useEffect } from 'react';
import { isAuth, login as loginApi, register as registerApi, logout as logoutApi, getUserData, googleLogin as googleLoginApi } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isAuth();
        if (authStatus && authStatus.isAuthenticated) {
            // If authenticated, fetch user data
            try {
                const userData = await getUserData();
                setUser(userData.user);
                setIsAuthenticated(true);
            } catch (err) {
                console.error("Failed to fetch user data", err);
                 // Fallback if getUserData fails but isAuth is true (shouldn't happen ideally)
                 setIsAuthenticated(false);
                 setUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginApi(credentials);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Successfully logged in!');
      return data;
    } catch (err) {
      setError(err);
      toast.error(err.toString());
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await registerApi(userData);
      toast.success('Registration successful! Please login.');
      return data;
    } catch (err) {
      setError(err);
      toast.error(err.toString());
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const googleLogin = async (credential) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await googleLoginApi(credential);
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        return data; // Return full data for redirection logic
      } else {
        setError(data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.toString());
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error("Logout failed", err);
      toast.error('Logout failed');
    }
  };

    // Update local user state (e.g., after profile update)
    const updateUser = (updatedUserData) => {
        setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
    };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        googleLogin,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
