import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  publicKey: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  verifyPhone: (phoneNumber: string) => Promise<void>;
  confirmPhone: (phoneNumber: string, code: string) => Promise<boolean>;
}

interface RegisterData {
  username: string;
  phoneNumber: string;
  password: string;
  isPhoneVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      verifyToken(storedToken);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('http://localhost:2225/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setToken(token);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await fetch('http://localhost:2225/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password })
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        toast.success('Logged in successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    toast.success('Logged out successfully');
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('http://localhost:2225/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Registration successful');
        await login(data.phoneNumber, data.password);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const verifyPhone = async (phoneNumber: string) => {
    try {
      const response = await fetch('http://localhost:2225/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send verification code');
      }
  
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to send verification code');
      }
  
      // Server prints verification code to console
      console.log('Check server console for verification code');
      return data;
    } catch (error: any) {
      console.error('Verification error:', error);
      throw error;
    }
  };

  const confirmPhone = async (phoneNumber: string, code: string) => {
    try {
      const response = await fetch('http://localhost:2225/confirm-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Phone number verified');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      login,
      logout,
      register,
      verifyPhone,
      confirmPhone
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};