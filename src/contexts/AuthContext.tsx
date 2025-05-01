
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, LoginCredentials } from '../types';
import { toast } from "sonner";
import { connectWallet, getUserRole } from '../blockchain/utils';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loginWithWallet: () => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user was logged in previously
    const storedUser = localStorage.getItem('grainlink-user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('grainlink-user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('grainlink-user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would call your backend API
      // For now, we'll simulate a successful login with mock credentials
      if (credentials.email === 'admin@grainlink.com' && credentials.password === 'password') {
        setUser({
          id: '1',
          name: 'Admin User',
          email: credentials.email,
          role: 'admin',
          isAuthenticated: true
        });
        toast.success('Welcome, Admin!');
        return true;
      }
      
      if (credentials.email === 'distributor@grainlink.com' && credentials.password === 'password') {
        setUser({
          id: '2',
          name: 'Distributor User',
          email: credentials.email,
          role: 'distributor',
          isAuthenticated: true
        });
        toast.success('Welcome, Distributor!');
        return true;
      }
      
      if (credentials.email === 'beneficiary@grainlink.com' && credentials.password === 'password') {
        setUser({
          id: '3',
          name: 'Beneficiary User',
          email: credentials.email,
          role: 'beneficiary',
          isAuthenticated: true
        });
        toast.success('Welcome, Beneficiary!');
        return true;
      }
      
      toast.error('Invalid email or password');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!window.ethereum) {
        toast.error("MetaMask or an Ethereum wallet is required");
        return false;
      }
      
      // Connect wallet and get address
      const address = await connectWallet();
      
      if (!address) {
        toast.error("Failed to connect wallet");
        return false;
      }
      
      // Determine role from blockchain
      const role = await getUserRole(address) as UserRole;
      
      // Create user object
      const walletUser: User = {
        id: address,
        walletAddress: address,
        role: role || 'guest',
        isAuthenticated: true
      };
      
      setUser(walletUser);
      
      toast.success(`Connected as ${role || 'guest'}`);
      return true;
    } catch (error) {
      console.error('Wallet login error:', error);
      toast.error('An error occurred during wallet login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('grainlink-user');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithWallet, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
