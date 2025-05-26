import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { users_ip } from "@/lib/config";

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  publicKey: string;
  role: 'USER' | 'VENDOR' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  verifyPhone: (phoneNumber: string) => Promise<void>;
  confirmPhone: (phoneNumber: string, code: string) => Promise<boolean>;
}

interface RegisterData {
  username: string;
  phoneNumber: string;
  password: string;
  isPhoneVerified: boolean;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    phoneNumber: string;
    publicKey: string;
    privateKey: string;
    token: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (!savedUser) return null;

      const parsedUser = JSON.parse(savedUser);
      
      // Validate that the stored user data has all required fields
      if (!parsedUser || !parsedUser.role || !parsedUser.id || !parsedUser.username || 
          !parsedUser.phoneNumber || !parsedUser.publicKey) {
        localStorage.removeItem('auth_user');
        return null;
      }

      return parsedUser;
    } catch (error) {
      localStorage.removeItem('auth_user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      verifyToken(storedToken);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${users_ip}/verify`, {
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
      const response = await fetch(`${users_ip}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Validate user data before storing
      if (!data.user || !data.user.role) {
        throw new Error('Invalid user data received');
      }

      // Ensure user object has all required fields
      const userData = {
        id: data.user.id,
        username: data.user.username,
        phoneNumber: data.user.phoneNumber,
        publicKey: data.user.publicKey,
        role: data.user.role
      };

      setUser(userData);
      setToken(data.token);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('private_key_active');
    localStorage.removeItem('private_key');
    toast.success('Logged out successfully');
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${users_ip}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        // Don't auto-login, wait for private key to be saved
        return result as RegisterResponse;
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
      const response = await fetch(`${users_ip}/verify-phone`, {
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
      const response = await fetch(`${users_ip}/confirm-phone`, {
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