import { apiService, User } from '@/services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define the context type
type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, onboardingData?: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateUser: () => {},
  verifyEmail: async () => ({ success: false }),
  refreshUserProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        
        // Always validate token on app start
        try {
          await validateToken();
        } catch (error) {
          console.log('Token validation failed, using stored data');
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (): Promise<void> => {
    try {
      const response = await apiService.getUserProfile();
      if (response.status === 'OK' && response.data) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      // Don't clear auth data immediately - let user try to use the app
    }
  };

  const saveAuthData = async (userData: User, authToken: string): Promise<void> => {
    try {
      await AsyncStorage.setItem('auth_token', authToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const clearAuthData = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.status === 'OK' && response.data) {
        await saveAuthData(response.data.user, response.data.token);
        
        if (response.data.user.isEmailVerified) {
          router.replace('/(tabs)');
        } else {
          router.push('/onboarding/verify-email');
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Network error. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name: string, email: string, password: string, onboardingData?: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.register(
        name, 
        email, 
        password,
        onboardingData?.selectedLanguage,
        onboardingData?.selectedProficiency
      );
      
      if (response.status === 'Created') {
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Network error. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const verifyEmail = async (email: string, verificationCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.verifyEmail(email, verificationCode);
      
      if (response.status === 'OK') {
        if (user) {
          const updatedUser = { ...user, isEmailVerified: true };
          setUser(updatedUser);
          await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
          router.replace('/(tabs)');
        }
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Verification failed' };
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      const errorMessage = error.message || 'Network error. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    try {
      const response = await apiService.getUserProfile();
      if (response.status === 'OK' && response.data) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const logout = async (): Promise<void> => {
    await clearAuthData();
    await AsyncStorage.removeItem('onboarding_data');
    router.replace('/');
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    verifyEmail,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};